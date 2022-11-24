import * as cocoSsd from "@tensorflow-models/coco-ssd";

import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

import { model, modelConfig, isModelReady, isLiveStream, showError, label, translation, guesses, } from "./ref"
import { video, ctx, canvas } from "./camera"

export const loadModel = () => {
  isModelReady.value = false;
  // if model already exists => dispose it and load a new one
  // model.value && model.value.dispose();
  // load model with the baseModel
  return cocoSsd
    .load({ base: modelConfig.value })
    .then((cocoModel) => {
      model.value = cocoModel;
      isModelReady.value = true;
      console.log("model loaded");
    })
    .catch((error) => {
      showError(`failed to load the model ${error}`)
    });
};

export const detectObjects = async (source) => {
  if (!isModelReady.value) return;

  try {
    const rawModel = toRaw(model.value);
    const predictions = await rawModel.detect(source);

    // renderPredictions(predictions);

    return predictions

    /* if (isLiveStream) {
      requestAnimationFrame(() => {
        detectObjects();
      });
    } */
  } catch (error) {
    showError(`failed to detect object ${error} `);
  }
};

/* const renderPredictions = (predictions) => {
  // get the context of canvas
  // clear the canvas
  const context = ctx.value
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  predictions.forEach((prediction) => {
    context.beginPath();
    context.rect(...prediction.bbox);
    context.lineWidth = 3;
    context.strokeStyle = "red";
    context.fillStyle = "red";
    context.stroke();
    context.shadowColor = "white";
    context.shadowBlur = 10;
    context.font = "24px Arial bold";
    context.fillText(
      `${(prediction.score * 100).toFixed(1)}% ${prediction.class}`,
      prediction.bbox[0],
      prediction.bbox[1] + 20
    );

  });
}; */
