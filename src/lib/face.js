// Reconhecimento facial no NAVEGADOR (client components apenas).
// Os modelos (~6 MB) são carregados uma única vez, de /face-models.

let loading = null;

async function loadFaceApi() {
  const faceapi = await import("@vladmandic/face-api");
  if (!loading) {
    loading = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/face-models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/face-models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/face-models"),
    ]);
  }
  await loading;
  return faceapi;
}

// Pré-carrega os modelos (~6 MB) assim que a tela de upload abre, para o
// primeiro envio não esperar o download na hora de extrair os rostos.
export async function warmupFaceModels() {
  try {
    await loadFaceApi();
  } catch {
    // sem rede/WebGL agora — a extração tenta de novo na hora do upload
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Retorna um descritor (array de 128 números) por rosto encontrado,
// ordenados do rosto maior para o menor.
export async function extractDescriptors(file) {
  const faceapi = await loadFaceApi();
  const img = await loadImage(file);
  try {
    const detections = await faceapi
      .detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.4,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections
      .sort(
        (a, b) =>
          b.detection.box.width * b.detection.box.height -
          a.detection.box.width * a.detection.box.height
      )
      .map((d) => Array.from(d.descriptor));
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
