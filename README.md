<h1 align="center">🤖 Facial Fair Access</h1>

<p align="center">
  <strong>Sistema de reconhecimento facial inclusivo com foco em acessibilidade, equidade algorítmica e conformidade com a LGPD.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Concluído-brightgreen?style=flat" />
  <img src="https://img.shields.io/badge/Linguagem-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/LGPD-Conforme-blue?style=flat" />
  <img src="https://img.shields.io/badge/Acessibilidade-NFC%20Fallback-purple?style=flat" />
  <img src="https://img.shields.io/badge/SENAI-SAGA%202025-red?style=flat" />
</p>

---

<p align="center">
  <img src="./assets/IMG_20251007_145503.jpg" width="80%" />
</p>

---

## 📌 Sobre o Projeto

O **Facial Fair Access** nasceu de uma demanda real apresentada no **SAGA SENAI** pela empresa **Ceará Mais Digital**: sistemas de reconhecimento facial têm apresentado viés algorítmico, discriminando pessoas por etnia, gênero ou idade — com consequências como erros de identificação, exclusão de acesso e reforço de estereótipos.

Em vez de desenvolver mais um sistema convencional, nossa equipe decidiu ir além: investigamos como esses algoritmos funcionam, entendemos a raiz do problema e criamos uma solução **inclusiva, acessível e de baixo custo** — respeitando os limites da LGPD.

O projeto foi desenvolvido como trabalho de conclusão do curso de **Aprendizagem em Programação Web no SENAI CTTI-MG**, apresentado à banca avaliadora em novembro de 2024, com apoio de especialistas do **SENAI 4.0**.

---

## 🧠 O Problema: Viés em Reconhecimento Facial

Sistemas de reconhecimento facial treinados com bases de dados não diversas apresentam:

- **Taxa de erro diferencial** — maior incidência de falhas em pessoas negras, mulheres e idosos
- **Exclusão de acesso** — dificuldade de identificar corretamente grupos minoritários
- **Reforço de estereótipos** — perpetuação de preconceitos via tecnologia

A diversidade étnica e cultural do Brasil torna esse problema especialmente crítico em projetos de cidades inteligentes e segurança pública.

---

## 💡 Nossa Solução

Em vez de treinar um modelo com risco de perpetuar vieses, utilizamos o **FaceMesh do MediaPipe** — que mapeia **468 pontos faciais (landmarks)** com precisão geométrica — e desenvolvemos uma lógica de reconhecimento baseada na **comparação direta de landmarks**, independente de tom de pele, gênero ou idade.

### Destaques técnicos:

- ✅ Mapeamento de **468 pontos faciais** via FaceMesh MediaPipe
- ✅ Reconhecimento por **comparação de landmarks** — sem viés de treinamento
- ✅ Mínimo de **4 amostras por usuário** para funcionamento preciso
- ✅ **Fallback com cartão NFC** para garantir acessibilidade total
- ✅ **Dashboard de monitoramento** com métricas por grupo demográfico, uso de fallback e controle de acesso
- ✅ Documentação completa: fluxogramas, diagramas de caso de uso e manuais técnicos
- ✅ Conformidade com a **LGPD**
- ✅ Desenvolvimento com metodologia **Scrum**

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Função |
|---|---|
| JavaScript | Linguagem principal |
| MediaPipe FaceMesh | Mapeamento de 468 landmarks faciais |
| Node.js | Back-end e lógica do servidor |
| HTML & CSS | Interface do sistema e dashboard |
| NFC | Fallback de acessibilidade |
| Git & GitHub | Versionamento do código |

---

## 📸 Registros do Projeto

<p align="center">
  <img src="./assets/IMG_20251007_145503.jpg" width="45%" />
  <!-- Adicione mais fotos abaixo no mesmo formato -->
  <!-- <img src="./assets/NOME_DA_FOTO.jpg" width="45%" /> -->
</p>

---

## 📽️ Demonstração em Vídeo

<!-- 💡 DICA: se tiver vídeo no YouTube ou Google Drive, cole o link abaixo -->
<!-- Exemplo: [![Assista ao vídeo](https://img.youtube.com/vi/SEU_ID_AQUI/0.jpg)](https://youtu.be/SEU_ID_AQUI) -->

> ⬆️ *Adicione aqui um link para o vídeo de demonstração*

---

## 🗂️ Estrutura do Projeto

```
SYS_RECONHECIMENTO_FACIAL_INCLUSIVO/
├── css/                     # Estilos das interfaces
├── js/                      # Lógica de reconhecimento facial (MediaPipe FaceMesh)
├── bd_sistema_faceid.sql    # Estrutura do banco de dados MySQL
├── dash.html                # Dashboard de monitoramento e métricas
├── db.js                    # Conexão e operações com o banco de dados
├── index.html               # Página principal do sistema
├── server.js                # Servidor back-end Node.js
├── telacadastro.html        # Tela de cadastro e captura de amostras faciais
├── telalogin.html           # Tela de autenticação facial
├── package.json             # Dependências do projeto
└── package-lock.json
```

---

## ▶️ Como Executar

```bash
# Clone o repositório
git clone https://github.com/dev-landim/SYS_RECONHECIMENTO_FACIAL_INCLUSIVO.git

# Acesse a pasta do projeto
cd SYS_RECONHECIMENTO_FACIAL_INCLUSIVO

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

> **Requisito:** Node.js instalado. Acesso à câmera necessário para o módulo de reconhecimento facial.

---

## 📊 Dashboard de Monitoramento

O sistema conta com um painel completo para acompanhamento em tempo real:

- 📈 Erros por grupo demográfico
- 🔄 Frequência de uso do fallback NFC
- 🔐 Log de controle de acesso
- 📋 Relatórios exportáveis

---

## 👥 Equipe

Projeto desenvolvido em equipe durante o programa **Jovem Aprendiz — Assistente de Programação Web** na **Stellantis** (parceria SENAI CTTI-MG), com orientação de especialistas do **SENAI 4.0**.

| Membro | GitHub |
|---|---|
| Ana Clara Landim Silva | [@dev-landim](https://github.com/dev-landim) |
| Marêssa Fernandes | — |
| Gustavo Avelino | — |
| Rodrigo Rangel | — |

---

## 🏆 Reconhecimento

Este projeto foi submetido ao **SAGA SENAI 2025** em resposta à demanda da empresa **Ceará Mais Digital** sobre mitigação de viés em sistemas de reconhecimento facial. Apresentado à banca avaliadora em **novembro de 2024**.

- 📅 Vigência da demanda: 20/02/2025 – 20/02/2027
- 🏫 Escola parceira: Centro de Formação Profissional Ana Amélia Bezerra de Menezes e Souza (CE)
- 🏢 Empresa demandante: Ceará Mais Digital
- 🗂️ Área: Tecnologia da Informação

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

<p align="center">
  Feito com 💜 por <a href="https://github.com/dev-landim">Ana Landim</a> e equipe
</p>
