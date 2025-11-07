// ===============================
// == CADASTRO E LOGIN DE USUÁRIO ==
// ===============================

// CADASTRO
const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formCadastro);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      alert(text);
    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      alert("Erro ao cadastrar usuário.");
    }
  });
}

// LOGIN
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formLogin);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      alert(text);
    } catch (erro) {
      console.error("Erro no login:", erro);
      alert("Erro ao efetuar login.");
    }
  });
}

// ===============================
// == CADASTRO DE USUÁRIOS CATRACA ==
// ===============================
const btnCreateUser = document.getElementById("btnCreateUser");
if (btnCreateUser) {
  btnCreateUser.addEventListener("click", async (e) => {
    //Impede que o formulário submeta após o clique, que é o que causa o reenvio (Duplicate Entry)
    if (e.preventDefault) {
      e.preventDefault();
    }

    // desabilita botão para evitar múltiplos cliques
    btnCreateUser.disabled = true;

    const usuario = {
      usuario_nome: document.getElementById("uNome").value,
      usuario_documento: document.getElementById("uDoc").value,
      usuario_genero: document.getElementById("uGender").value,
      usuario_etnia: document.getElementById("uEth").value,
      usuario_faixa_etaria: document.getElementById("uAge").value,
    };

    try {
      const res = await fetch("/cadastrar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const msg = await res.text();
      alert(msg);

      //Reabilitar apenas se quiser que o ADM cadastre outro imediatamente
      // Se você quer que ele vá para a próxima etapa (captura facial) e não cadastre mais nada,
      // é melhor manter desabilitado ou redirecionar.
      // Neste caso, vamos apenas reabilitar o botão:
      btnCreateUser.disabled = false;
    } catch (erro) {
      console.error("Erro ao cadastrar usuário da catraca:", erro);
      alert("Erro ao cadastrar usuário.");

      //Reabilitar o botão em caso de erro para que o ADM possa corrigir e tentar novamente
      btnCreateUser.disabled = false;
    }
  });
}

// ===============================
// == LEITURA FACIAL FACEMESH ==
// ===============================
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const statusText = document.getElementById("status");

const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

let ultimaAmostra = null;

faceMesh.onResults((results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const faceLandmarks = results.multiFaceLandmarks[0];
    statusText.textContent = "Rosto detectado ✅";
    drawConnectors(canvasCtx, faceLandmarks, FACEMESH_TESSELATION, {
      color: "#00FF00",
      lineWidth: 0.5,
    });
    drawLandmarks(canvasCtx, faceLandmarks, { color: "#FF0000", lineWidth: 1 });

    ultimaAmostra = faceLandmarks.map((p) => ({
      x: p.x.toFixed(5),
      y: p.y.toFixed(5),
      z: p.z.toFixed(5),
    }));
  } else {
    statusText.textContent = "Nenhum rosto detectado ❌";
    ultimaAmostra = null;
  }

  canvasCtx.restore();
});

const camera = new Camera(videoElement, {
  onFrame: async () => await faceMesh.send({ image: videoElement }),
  width: 480,
  height: 360,
});

document.getElementById("btnStartCam").addEventListener("click", async () => {
  statusText.textContent = "Iniciando câmera...";
  try {
    await camera.start();
    statusText.textContent = "Câmera ligada! Aguardando rosto...";
  } catch (err) {
    console.error("Erro ao iniciar câmera:", err);
    statusText.textContent = "Erro ao acessar a câmera 😢";
  }
});

// ===============================
// == FUNÇÃO PARA OBTER O ID DO USUÁRIO ==
// ===============================
async function getUserIdForSample() {
  // Pergunta ao administrador como associar a amostra
  const choice = prompt(
    "Como deseja associar esta amostra facial?\n\n" +
      "1. Usar o ID do último usuário cadastrado nesta sessão.\n" +
      "2. Digitar um ID de usuário existente."
  );

  if (choice === "1") {
    // Opção 1: Usar o último ID cadastrado na sessão (comportamento atual)
    try {
      const idRes = await fetch("/api/ultimo-id-cadastrado");

      if (!idRes.ok) {
        const idError = await idRes.json();
        alert("❌ " + (idError.erro || "Erro no servidor."));
        return null;
      }

      const idData = await idRes.json();
      return {
        id: idData.usuario_id,
        nome: idData.usuario_nome,
      };
    } catch (erro) {
      console.error("Erro ao buscar o ID de associação:", erro);
      alert("Erro de comunicação ao buscar o ID. Verifique o servidor.");
      return null;
    }
  } else if (choice === "2") {
    // Opção 2: Digitar um ID
    const userIdInput = prompt("Digite o ID do usuário (número):");
    const userId = parseInt(userIdInput);

    if (isNaN(userId) || userId <= 0) {
      alert("ID inválido.");
      return null;
    }

    // É altamente recomendado verificar se o ID existe e buscar o nome no backend.
    // Por simplificação no front, vamos apenas retornar o ID por enquanto,
    // mas o backend deve verificar a validade do ID!
    return {
      id: userId,
      nome: `ID: ${userId} (Verificar)`,
    };
  } else {
    alert("Opção inválida. Operação cancelada.");
    return null;
  }
}

// ===============================
// == BOTÃO PARA ADICIONAR AMOSTRAS ==
// ===============================
const btnAddSamples = document.getElementById("btnAddSamples");
if (btnAddSamples) {
  btnAddSamples.addEventListener("click", async () => {
    if (!ultimaAmostra) {
      alert(
        "Nenhuma amostra detectada! Certifique-se de que o rosto esteja visível na câmera."
      );
      return;
    } // 1. OBTÉM O ID E NOME ESCOLHIDOS PELO ADMINISTRADOR

    const userSelection = await getUserIdForSample();
    if (!userSelection) {
      return; // Sai se a seleção foi cancelada ou falhou
    }

    const usuario_id = userSelection.id;
    const usuario_nome = userSelection.nome;

    if (
      !confirm(
        `Confirma o cadastro da amostra facial para o Usuário: ${usuario_nome} (ID: ${usuario_id})?`
      )
    ) {
      return;
    } // 2. SALVA A AMOSTRA COM O ID OBTIDO

    try {
      const response = await fetch("/api/amostras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario_id,
          embedding: ultimaAmostra,
          comentario: `Amostra cadastrada por ADM para ${usuario_nome}`,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(
          `✅ Amostra salva com sucesso para ${usuario_nome} (ID: ${usuario_id})!`
        ); // 3. AQUI, SE TIVER USADO O ID DA SESSÃO, PODEMOS LIMPAR.

        // Mas se a intenção for cadastrar várias amostras, NÃO VAMOS LIMPAR.
        // A rota de limpeza deve ser chamada APENAS SE A OPÇÃO 1 FOR ESCOLHIDA.
        if (userSelection.nome !== `ID: ${usuario_id} (Verificar)`) {
          // Se usou a opção 'último ID', limpa a sessão para evitar uso indevido
          await fetch("/api/limpar-id-cadastrado", { method: "POST" });
        }
      } else {
        alert("❌ Erro ao salvar amostra: " + (result.erro || "Desconhecido"));
      }
    } catch (erro) {
      console.error("Erro ao enviar amostra:", erro);
      alert("Erro ao enviar amostra para o servidor.");
    }
  });
}

// ===============================
// == BOTÃO PARA TENTAR RECONHECIMENTO ==
// ===============================
const statusCatraca = document.getElementById("statusCatraca");
const btnCapturar = document.getElementById("btnCapturar");
if (btnCapturar) {
  btnCapturar.addEventListener("click", async () => {
    if (!ultimaAmostra) {
      alert("Nenhum rosto detectado. Tente novamente.");
      return;
    }

    statusText.textContent = "Analisando rosto...";

    try {
      const response = await fetch("/api/reconhecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedding: ultimaAmostra }),
      });

      const result = await response.json();

      //Consultando o resultado do servidor
      //console.log('🔍 Resposta do servidor:', result);

      if (response.ok) {
        if (
          result.reconhecido === true &&
          typeof result.similaridade === "number" &&
          result.similaridade <= 0.07
        ) {
          console.log(
            `✅ Reconhecido: ${result.usuario_nome} (distância: ${result.similaridade})`
          );

          const title = `Acesso Liberado!`;
          const message = `Bem-vindo(a), ${
            result.usuario_nome
          }! (Distância: ${result.similaridade.toFixed(4)})`;
          showWelcomeToast(title, message);

          statusCatraca.textContent = "Catraca Liberada";
          statusCatraca.classList.remove("catraca-bloqueada");
          statusCatraca.classList.add("catraca-liberada");

          //Volta a bloquear após 7s
          setTimeout(() => {
            statusCatraca.textContent = "Catraca Bloqueada";
            statusCatraca.classList.remove("catraca-liberada");
            statusCatraca.classList.add("catraca-bloqueada");
          }, 7000);
        } else {
          console.log(
            `❌ Rosto não reconhecido. Menor distância: ${result.similaridade}`
          );
          statusText.textContent = `❌ Rosto não reconhecido. Menor distância: ${result.similaridade}`;

          const failureTitle = `ACESSO NEGADO!`;
          const failureMessage = `Rosto não reconhecido. Menor distância: ${result.similaridade.toFixed(
            4
          )}`;
          showWelcomeToast(failureTitle, failureMessage, "failure"); // Status: failure

          statusCatraca.textContent = "Catraca Bloqueada";
          statusCatraca.classList.remove("catraca-liberada");
          statusCatraca.classList.add("catraca-bloqueada");
        }
      } else {
        console.error("Erro no servidor:", result.erro || "Desconhecido");
        statusText.textContent = "⚠️ Erro no servidor";

        statusCatraca.textContent = "Catraca Bloqueada";
        statusCatraca.classList.remove("catraca-liberada");
        statusCatraca.classList.add("catraca-bloqueada");
      }
    } catch (erro) {
      console.error("Erro no reconhecimento:", erro);
      statusText.textContent = "⚠️ Erro no reconhecimento.";
    }
  });
}

// Referências da Notificação Toast
const welcomeToast = document.getElementById("welcomeToast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");

let toastTimeout; // Variável para controlar o auto-fechamento

// script.js - Funções de controle da Notificação

// Variável global para controlar o listener
let transitionListenerAdded = false;

// Adiciona o listener de transição (chamado apenas uma vez)
if (welcomeToast && !transitionListenerAdded) {
  welcomeToast.addEventListener("transitionend", () => {
    // Esta função é chamada quando qualquer transição CSS no elemento termina.
    // Se a notificação não estiver mais "ativa" (sumiu), limpamos a cor.
    if (!welcomeToast.classList.contains("toast-active")) {
      welcomeToast.classList.remove("toast-failure");
    }
  });
  transitionListenerAdded = true;
}

// Função para mostrar a Notificação (Corrigida)
function showWelcomeToast(title, message, status = "success") {
  clearTimeout(toastTimeout);

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  // 1. Limpa QUALQUER classe de falha (antes de aplicar a nova cor)
  welcomeToast.classList.remove("toast-failure");

  // 2. Aplica a classe de cor (se for falha)
  if (status === "failure") {
    welcomeToast.classList.add("toast-failure");
  }

  // 3. Mostra a notificação
  welcomeToast.classList.add("toast-active");

  // 4. Agenda o desaparecimento após 5 segundos
  toastTimeout = setTimeout(() => {
    // APENAS remove o 'toast-active'. A remoção do 'toast-failure'
    // será tratada automaticamente pelo 'transitionend' após a animação.
    welcomeToast.classList.remove("toast-active");
  }, 6000);
}
