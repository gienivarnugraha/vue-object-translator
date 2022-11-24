import xhr from "xhr";
import { apiUrls } from "@/config";

import { translate } from "./translate"
import { label, translation, guesses, isSnapping, firstTime, modelConfig ,showError, performance} from "./ref"
import { video, canvas, ctx } from "./camera"
import { detectObjects } from "./model"

const breakPoint = 800;
const canvSize = 640;
const targetPct = 0.7;
const targetTop = 0.4;



const startSnap = () => {
  isSnapping.value = true;
  firstTime.value = false;
  return new Date().getTime()
};

const endSnap = (start) => {
  isSnapping.value = false;
  const end = new Date().getTime()
  performance.value =  (end - start) / 1000

};

export const snap = () => {
  const start = startSnap();

  if (modelConfig.value !== 'google_vision') {
    detectObjects(video.value).then(predictions => {
      let labels = predictions.map((prediction) => prediction = {
        'description': prediction.class,
        'score': prediction.score,
      }).sort((labelA, labelB) => labelB.score - labelA.score)

      translate(labels);
    }).catch(err => {
      showError(`failed to detect object ${err} `);
      console.log(err);
    })

  } else {
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

    const body = {
      responses: [
        {
          labelAnnotations: [
            {
              mid: "/m/03q69",
              description: "Hair",
              score: 0.9850375,
              topicality: 0.9850375,
            },
            {
              mid: "/m/04hgtk",
              description: "Head",
              score: 0.97214437,
              topicality: 0.97214437,
            },
            {
              mid: "/m/014sv8",
              description: "Eye",
              score: 0.93755245,
              topicality: 0.93755245,
            },
            {
              mid: "/m/03f52z",
              description: "Eyelash",
              score: 0.8961158,
              topicality: 0.8961158,
            }

          ],
        },
      ],
    };

    let labels = body.responses[0].labelAnnotations;

    translate(labels);


    /*
    xhr.post(
      apiUrls.cloudVision,
      {
        json: {
          requests: [
            {
              image: {
                content: image,
              },
              features: [
                { type: "LABEL_DETECTION", maxResults: 3 }
                {"type": "CROP_HINTS", "maxResults": 3}
              ],
            },
          ],
        },
      },
      (err, res, body) => {
        let labels;
        if (
          err ||
          !body.responses ||
          !body.responses.length ||
          !body.responses[0].labelAnnotations
        ) {
          labels = [];
        } else {
          labels = body.responses[0].labelAnnotations;
        }



        translate(labels);


      }
    ); */
  }

  setTimeout(endSnap(start), 200);
};
