// Reconhecimento facial no NAVEGADOR (client components apenas).
// Os modelos (~6 MB) são carregados uma única vez, de /modelos-face.

let carregando = null;

async function carregarFaceApi() {
  const faceapi = await import("@vladmandic/face-api");
  if (!carregando) {
    carregando = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/modelos-face"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/modelos-face"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/modelos-face"),
    ]);
  }
  await carregando;
  return faceapi;
}

function carregarImagem(arquivo) {
  return new Promise((resolver, rejeitar) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = rejeitar;
    img.src = URL.createObjectURL(arquivo);
  });
}

// Retorna um descritor (array de 128 números) por rosto encontrado,
// ordenados do rosto maior para o menor.
export async function extrairDescritores(arquivo) {
  const faceapi = await carregarFaceApi();
  const img = await carregarImagem(arquivo);
  try {
    const deteccoes = await faceapi
      .detectAllFaces(
        img,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.4,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    return deteccoes
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
