// camera.js
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

// Seleciona o vídeo da página
const videoElement = document.getElementById("video");

// Função para enviar dados para a API
async function enviarLandmarks(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log(`${url} response:`, result);
  } catch (err) {
    console.error(`Erro ao enviar para ${url}:`, err);
  }
}

// Inicializa o FaceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

// Evento quando landmarks forem detectados
faceMesh.onResults((results) => {
  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0].map((pt) => ({
      x: pt.x,
      y: pt.y,
      z: pt.z,
    }));

    // Envia para salvar
    enviarLandmarks("/api/salvar-landmarks", { landmarks });

    // Envia para reconhecimento
    enviarLandmarks("/api/reconhecer", { landmarks });
  }
});

// Inicializa a câmera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await faceMesh.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});

// Função para iniciar a câmera quando clicar
document.getElementById("iniciar-camera").addEventListener("click", async () => {
  try {
    await camera.start();
    console.log("Câmera iniciada!");
  } catch (err) {
    console.error("Erro ao iniciar a câmera:", err);
  }
});
