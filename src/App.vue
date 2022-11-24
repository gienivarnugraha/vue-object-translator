<template>
  <div id="app">
    <h3 v-if="!isVideoStreamReady && !initFailMessage">Initializing webcam stream ...</h3>
    <h3 v-if="!isModelReady && !initFailMessage">loading model ...</h3>
    <h3 v-if="initFailMessage">
      Failed to init stream and/or model - {{ initFailMessage }}
    </h3>

    <div class="resultFrame">
      <video ref="videoRef" autoplay></video>
      <canvas ref="canvas" :width="resultWidth" :height="resultHeight"></canvas>
    </div>

    <select v-model="modelConfig.base" @change="loadModelAndStartDetecting">
      <option v-for="modelName in selectableModels" :key="modelName" :value="modelName">
        {{ modelName }}
      </option>
    </select>
  </div>
</template>

<script setup>
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

// store the promises of initializations
let streamPromise = ref(null);
let modelPromise = ref(null);
let isVideoStreamReady = ref(false);
let isModelReady = ref(false);
let initFailMessage = ref("");

let videoRef = ref(null);
let canvas = ref(null);

// tfjs model related
let model = ref(null);
let modelConfig = ref({
  base: "lite_mobilenet_v2",
});
let selectableModels = ref(["lite_mobilenet_v2", "mobilenet_v1", "mobilenet_v2"]);

let videoRatio = ref(1);
let resultWidth = ref(0);
let resultHeight = ref(0);

const initWebcamStream = () => {
  // if the browser supports mediaDevices.getUserMedia API
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices
      .getUserMedia({
        audio: false, // don't capture audio
        video: { facingMode: "environment" }, // use the rear camera if there is
      })
      .then((stream) => {
        // set <video> source as the webcam input
        let video = videoRef.value;
        try {
          video.srcObject = stream;
        } catch (error) {
          // support older browsers
          video.src = URL.createObjectURL(stream);
        }

        /*
          model.detect uses tf.fromPixels to create tensors.
          tf.fromPixels api will get the <video> size from the width and height attributes,
            which means <video> width and height attributes needs to be set before called model.detect

          To make the <video> responsive, I get the initial video ratio when it's loaded (onloadedmetadata)
          Then addEventListener on resize, which will adjust the size but remain the ratio
          At last, resolve the Promise.
        */
        return new Promise((resolve, reject) => {
          // when video is loaded
          video.onloadedmetadata = () => {
            // calculate the video ratio
            videoRatio.value = video.offsetHeight / video.offsetWidth;
            // add event listener on resize to reset the <video> and <canvas> sizes
            window.addEventListener("resize", setResultSize.value);
            // set the initial size
            setResultSize();

            isVideoStreamReady.value = true;
            console.log("webcam stream initialized");
            resolve();
          };
        });
      })
      .catch((error) => {
        console.log("failed to initialize webcam stream", error);
        throw error;
      });
  } else {
    return Promise.reject(
      new Error("Your browser does not support mediaDevices.getUserMedia API")
    );
  }
};

const setResultSize = () => {
  // get the current browser window size
  const clientWidth = document.documentElement.clientWidth;

  // set max width as 600
  resultWidth.value = Math.min(600, clientWidth);
  // set the height according to the video ratio
  resultHeight.value = resultWidth.value * videoRatio.value;

  // set <video> width and height
  /*
    Doesn't use vue binding :width and :height,
      because the initial value of resultWidth and resultHeight
      will affect the ratio got from the initWebcamStream()
  */
  let video = videoRef.value;
  video.width = resultWidth.value;
  video.height = resultHeight.value;
};

const loadModel = () => {
  isModelReady.value = false;
  // if model already exists => dispose it and load a new one
  if (model.value) model.value.dispose();
  // load model with the baseModel
  return cocoSsd
    .load(modelConfig.value)
    .then((cocoModel) => {
      model.value = cocoModel;
      isModelReady.value = true;
      console.log("model loaded");
    })
    .catch((error) => {
      console.log("failed to load the model", error);
      throw error;
    });
};

const detectObjects = async () => {
  if (!isModelReady.value) return;

  try {
    //const coco = Object.freeze(videoRef.value);
    const rawModel = toRaw(model.value);
    const predictions = await rawModel.detect(videoRef.value);

    renderPredictions(predictions);
    requestAnimationFrame(() => {
      detectObjects();
    });
  } catch (error) {
    console.error(error);
  }
};

const loadModelAndStartDetecting = () => {
  modelPromise.value = loadModel();
  // wait for both stream and model promise finished
  // => start detecting objects
  Promise.all([streamPromise.value, modelPromise.value])
    .then(() => {
      detectObjects();
    })
    .catch((error) => {
      console.log("Failed to init stream and/or model");
      initFailMessage.value = error;
    });
};

const renderPredictions = (predictions) => {
  // get the context of canvas
  const ctx = canvas.value.getContext("2d");
  // clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  predictions.forEach((prediction) => {
    ctx.beginPath();
    ctx.rect(...prediction.bbox);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.stroke();
    ctx.shadowColor = "white";
    ctx.shadowBlur = 10;
    ctx.font = "24px Arial bold";
    ctx.fillText(
      `${(prediction.score * 100).toFixed(1)}% ${prediction.class}`,
      prediction.bbox[0],
      prediction.bbox[1] + 20
    );
  });
};

onMounted(() => {
  streamPromise.value = initWebcamStream();
  loadModelAndStartDetecting();
});
</script>

<style lang="css">
body {
  margin: 0;
}

.resultFrame {
  display: grid;
}

.resultFrame video {
  grid-area: 1 / 1 / 2 / 2;
}

.resultFrame canvas {
  grid-area: 1 / 1 / 2 / 2;
}
</style>
