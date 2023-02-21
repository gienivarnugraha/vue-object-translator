
import { isSnapping, firstTime, performance, label, translation, guesses, cameraError, errorMessage, isModelReady } from "./ref"

import { useNotification } from "@kyvg/vue3-notification";

const { notify } = useNotification()

export const showNotif = ({ type, text }) => notify({ type, text, });

let start

export const startSnap = () => {
  isSnapping.value = true;
  firstTime.value = false;
  start = new Date().getTime()
};


export const endSnap = () => {
  isSnapping.value = false;
  const end = new Date().getTime()
  performance.value = (end - start) / 1000

};

export const setLabelPair = ({ lbl, trnslt, gss }) => {
  label.value = lbl;
  translation.value = trnslt;
  guesses.value = gss;
};


export const showError = (error) => {
  cameraError.value = true
  errorMessage.value = error
  isSnapping.value = false
  isModelReady.value = true
  throw error
}
