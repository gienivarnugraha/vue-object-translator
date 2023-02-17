import * as cocoSsd from "@tensorflow-models/coco-ssd";

import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

import { model, modelConfig, isModelReady } from "./ref"
import { showNotif, } from "./helpers"

export const loadModel = () => {
  isModelReady.value = false;
  // if model already exists => dispose it and load a new one
  model.value && model.value.dispose();
  // load model with the baseModel
  return cocoSsd
    .load({ base: modelConfig.value })
    .then((cocoModel) => {
      model.value = cocoModel;
      isModelReady.value = true;
      console.log("model loaded");
    })
    .catch((error) => {
      showNotif({ type: 'error', text: `failed to load the model ${error}` })
    });
};

export const detectObjects = async (source) => {
  if (!isModelReady.value) return;

  try {
    const rawModel = toRaw(model.value);
    return await rawModel.detect(source);
  } catch (error) {
    showNotif({ type: 'error', text: `failed to detect objects ${error}` })
  }
};
