// server.js - versão corrigida e compatível com mysql2/promise
const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db'); // <--- CORREÇÃO: db.js deve estar na raiz do projeto (não em ./public)

// Cria o app (servidor)
const app = express();
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'segredo_do_sistema',
  resave: false,
  saveUninitialized: true
}));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/telacadastro.html'));
});

// Servir arquivos estáticos (public)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

// === ROTAS DE PÁGINAS ===
app.get('/register', (req, res) => {
  res.redirect('/telacadastro.html');
});

app.get('/login', (req, res) => {
  res.redirect('/telalogin.html');
});

// === ROTA: CADASTRO DE ADMINISTRADOR ===
app.post('/register', async (req, res) => {
  try {
    const { usuario, email, senha_hash } = req.body;

    if (!usuario || !email || !senha_hash) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const hashedPassword = await bcrypt.hash(senha_hash, 10);

    const query = 'INSERT INTO cadastro_administrador (usuario, email, senha_hash) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [usuario, email, hashedPassword]);

    // redireciona para login após sucesso
    return res.redirect('/telalogin.html');
  } catch (err) {
    console.error('Erro /register:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).send('Usuário ou email já existe.');
    }
    return res.status(500).send('Erro no servidor.');
  }
});

// === ROTA: LOGIN DE ADMINISTRADOR ===
app.post('/login', async (req, res) => {
  try {
    const { email, senha_hash } = req.body;

    if (!email || !senha_hash) {
      return res.status(400).send('Todos os campos são obrigatórios.');
    }

    const select = 'SELECT * FROM cadastro_administrador WHERE email = ? LIMIT 1';
    const [rows] = await db.query(select, [email]);

    if (!rows || rows.length === 0) {
      return res.status(400).send('Email não encontrado.');
    }

    const user = rows[0];
    const match = await bcrypt.compare(senha_hash, user.senha_hash);
    if (!match) {
      return res.status(400).send('Senha incorreta.');
    }

    // armazena id da sessão
    req.session.userId = user.id;
    return res.redirect('/index.html');
  } catch (err) {
    console.error('Erro /login:', err);
    return res.status(500).send('Erro no servidor.');
  }
});

// === ROTA: CADASTRO DE USUÁRIOS DA CATRACA (front chama /cadastrar-usuario) ===
app.post('/cadastrar-usuario', async (req, res) => {
  try {
    const {
      usuario_nome,
      usuario_documento,
      usuario_genero,
      usuario_etnia,
      usuario_faixa_etaria
    } = req.body;

    if (!usuario_nome || !usuario_documento) {
      return res.status(400).send('Nome e documento são obrigatórios.');
    }

    const query = 'INSERT INTO usuarios_catraca (usuario_nome, usuario_documento, usuario_genero, usuario_etnia, usuario_faixa_etaria) VALUES (?, ?, ?, ?, ?)';

    const [result] = await db.query(query, [
      usuario_nome,
      usuario_documento,
      usuario_genero || null,
      usuario_etnia || null,
      usuario_faixa_etaria || null
    ]);

    // ADIÇÃO: Armazena o ID do usuário recém-criado na sessão do ADM
    req.session.last_user_id = result.insertId;
    req.session.last_user_name = usuario_nome; // Opcional, para feedback no front

    console.log('Usuário cadastrado com sucesso:', usuario_nome, 'ID:', result.insertId);
    return res.status(200).send(`Usuário cadastrado com sucesso! ID: ${result.insertId}`);
  } catch (err) {
    console.error('Erro /cadastrar-usuario:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).send('Documento já cadastrado.');
    }
    return res.status(500).send('Erro no servidor ao cadastrar usuário.');
  }
});


// === ROTA: RECUPERAR O ÚLTIMO ID CADASTRADO PELA SESSÃO ===
// O front chama esta rota antes de salvar a amostra facial.
app.get('/api/ultimo-id-cadastrado', (req, res) => {
  // Busca o ID armazenado na sessão.
  const lastId = req.session.last_user_id;
  const lastName = req.session.last_user_name || 'Desconhecido';

  if (lastId) {
    return res.json({
      success: true,
      usuario_id: lastId,
      usuario_nome: lastName
    });
  } else {
    // Se não houver ID na sessão (o ADM não cadastrou ninguém ainda)
    return res.status(404).json({
      success: false,
      erro: 'Nenhum usuário foi cadastrado nesta sessão de administrador.'
    });
  }
});


// === ROTA: LIMPAR ID APÓS SALVAR AMOSTRA ===
app.post('/api/limpar-id-cadastrado', (req, res) => {
  delete req.session.last_user_id;
  delete req.session.last_user_name;
  return res.status(200).send('ID de cadastro limpo da sessão.');
});

// === ROTA: SALVAR AMOSTRA FACIAL (/api/amostras) ===
app.post('/api/amostras', async (req, res) => {
  try {
    const { usuario_id, embedding, comentario } = req.body;

    if (!usuario_id || !embedding) {
      return res.status(400).json({ erro: 'Dados incompletos.' });
    }

    const query = `INSERT INTO amostra_face (usuario_id, embedding, comentario) VALUES (?, ?, ?)`;
    const [result] = await db.query(query, [usuario_id, JSON.stringify(embedding), comentario || null]);

    return res.json({ mensagem: 'Amostra salva com sucesso!', amostra_id: result.insertId });
  } catch (err) {
    console.error('Erro /api/amostras:', err);
    return res.status(500).json({ erro: 'Erro ao salvar amostra no banco.' });
  }
});

// === ROTA: RECONHECIMENTO FACIAL (/api/reconhecer) ===
app.post('/api/reconhecer', async (req, res) => {
  const { embedding } = req.body; // landmarks atuais (FaceMesh)
  const metodo = 'mediapipe-facemesh';
  const ipOrigem = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

  if (!embedding || !Array.isArray(embedding)) {
    return res.status(400).json({ reconhecido: false, erro: 'Embedding inválido' });
  }

  try {
    const embeddingNormalizado = normalizarLandmarks(embedding);

    const [amostras] = await db.query(`SELECT a.amostra_id, a.usuario_id, u.usuario_nome, a.embedding FROM amostra_face a JOIN usuarios_catraca u ON a.usuario_id = u.usuario_id`);

    let melhorUsuario = null;
    let menorDistancia = Infinity;
    const LIMIAR = 0.35; // distância máxima para reconhecer

    for (const amostra of amostras) {
      const embeddingBanco = JSON.parse(amostra.embedding);
      const embeddingBancoNormalizado = normalizarLandmarks(embeddingBanco);
      const distancia = calcularDistancia(embeddingNormalizado, embeddingBancoNormalizado);

      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        melhorUsuario = amostra;
      }
    }

    if (melhorUsuario && menorDistancia < LIMIAR) {
      await db.query(
        `INSERT INTO login_acesso (usuario_id, tentativa_nome, metodo, similaridade, resultado, ip_origem) VALUES (?, ?, ?, ?, 'sucesso', ?)`,
        [melhorUsuario.usuario_id, melhorUsuario.usuario_nome, metodo, menorDistancia, ipOrigem]
      );

      console.log(`✅ Reconhecido: ${melhorUsuario.usuario_nome} (distância: ${menorDistancia.toFixed(4)})`);
      return res.json({ reconhecido: true, usuario_nome: melhorUsuario.usuario_nome, similaridade: menorDistancia });
    } else {
      await db.query(
        `INSERT INTO login_acesso (tentativa_nome, metodo, similaridade, resultado, ip_origem) VALUES (?, ?, ?, 'falha', ?)`,
        ['Desconhecido', metodo, menorDistancia === Infinity ? null : menorDistancia, ipOrigem]
      );

      console.log(`❌ Rosto não reconhecido. Menor distância: ${isFinite(menorDistancia) ? menorDistancia.toFixed(4) : '—'}`);
      return res.json({ reconhecido: false, similaridade: isFinite(menorDistancia) ? menorDistancia : null });
    }
  } catch (err) {
    console.error('Erro ao processar reconhecimento:', err);
    return res.status(500).json({ reconhecido: false, erro: err.message });
  }
});

// === Funções utilitárias ===
function normalizarLandmarks(landmarks) {
  if (!landmarks || landmarks.length === 0) return [];

  // garante que os valores são números (alguns são strings com toFixed)
  const L = landmarks.map(p => ({ x: Number(p.x), y: Number(p.y), z: Number(p.z || 0) }));

  // usa ponto do nariz (índice 1) como centro, se não existir usa índice 0
  const nariz = L[1] || L[0];

  const centralizados = L.map(p => ({ x: p.x - nariz.x, y: p.y - nariz.y, z: p.z - nariz.z }));

  // olhos (fallback para nariz se índices não existirem)
  const olhoEsq = L[33] || nariz;
  const olhoDir = L[263] || nariz;

  const escala = Math.hypot(olhoDir.x - olhoEsq.x, olhoDir.y - olhoEsq.y, (olhoDir.z - olhoEsq.z)) || 1;

  return centralizados.map(p => ({ x: p.x / escala, y: p.y / escala, z: p.z / escala }));
}

function calcularDistancia(landmarks1, landmarks2) {
  if (!landmarks1 || !landmarks2) return Infinity;
  let soma = 0;
  const len = Math.min(landmarks1.length, landmarks2.length);
  for (let i = 0; i < len; i++) {
    const dx = landmarks1[i].x - landmarks2[i].x;
    const dy = landmarks1[i].y - landmarks2[i].y;
    const dz = (landmarks1[i].z || 0) - (landmarks2[i].z || 0);
    soma += dx * dx + dy * dy + dz * dz;
  }
  return Math.sqrt(soma / len);
}

// Inicia o servidor (sempre por último)
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
