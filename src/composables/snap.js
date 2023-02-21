import { translate } from "./translate"
import { modelConfig } from "./ref"
import { video, canvas, ctx } from "./camera"
import { detectObjects } from "./model"
import { startSnap, showNotif, endSnap } from "./helpers"
import { detectRequest } from "./api"

const breakPoint = 800;
const canvSize = 640;
const targetPct = 0.7;
const targetTop = 0.4;

export const snap = async () => {
  startSnap();

  /* detect with mobilenet */
  if (modelConfig.value !== 'google_vision') {
    try {
      const predictions = await detectObjects(video.value)

      let labels = predictions.map((prediction) => prediction = {
        'description': prediction.class,
        'score': prediction.score,
      }).sort((labelA, labelB) => labelB.score - labelA.score)

      endSnap()

      translate(labels);

    } catch (error) {
      showNotif({ type: 'error', text: `failed to load the model ${error}` })
    }

  } else {

    /* detect with google vision */

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const vidW = video.value.videoWidth;
    const vidH = video.value.videoHeight;

    if (winW >= breakPoint) {
      const cropSize = Math.min(winW, winH) * targetPct;
      const sourceSize = (cropSize / Math.max(winW, winH)) * vidW;

      canvas.value.width = canvas.value.height = canvSize;

      ctx.value.drawImage(
        video.value,
        Math.round(((winW / 2 - cropSize / 2) / winW) * vidW),
        Math.round(((winH * targetTop - cropSize / 2) / winH) * vidH),
        sourceSize,
        sourceSize,
        0,
        0,
        canvSize,
        canvSize
      );
    } else {
      canvas.value.width = vidW;
      canvas.value.height = vidH;
      ctx.value.drawImage(video.value, 0, 0);
    }

    const image = canvas.value
      .toDataURL("image/jpeg", 1)
      .replace("data:image/jpeg;base64,", "");

    const labels = await detectRequest(image)

    endSnap()

    translate(labels);
  }
};
