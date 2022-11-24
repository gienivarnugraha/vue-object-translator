
import {
 cameraReady,
 userAgent,
 showError,
} from './ref'

export let stream = ref(null);
export let video = ref(null);
export let ctx = ref(null);
export let canvas = ref(null);

let attemptedTwice = ref(false);

const { body } = window.document;

const { MediaStreamTrack } = window;
const { mediaDevices } = navigator;
const sourceEnumSupport = mediaDevices && mediaDevices.enumerateDevices;
const streamTrackSupport = MediaStreamTrack && MediaStreamTrack.getSources;
const sourceSupport = sourceEnumSupport || streamTrackSupport;

const getUserMedia = (() => {
  const fn =
    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  return fn ? fn.bind(navigator) : null;
})();

const findBestSource = (sources) => {
  let source = null;

  if (sourceSupport && sources && sources.length) {
    if (sourceEnumSupport) {
      for (let i = 0; i < sources.length; i++) {
        const candidate = sources[i];

        if (candidate.kind === "videoinput") {
          if (typeof candidate.getCapabilities === "function") {
            const capabilities = candidate.getCapabilities();

            if (capabilities && capabilities.facingMode === "environment") {
              source = candidate;
              break;
            }
          }

          if (/facing back/i.test(candidate.label)) {
            source = candidate;
            break;
          }
        }
      }
    } else {
      source = sources.find((s) => s.facing === "environment");
      if (!source) {
        source = sources.find((s) => s.kind === "video");
      }
    }
  }

  return source;
};

const activateCamera = (noConstraint = true) => {
  mediaDevices
    .getUserMedia({
      audio: false,
      video: noConstraint || { facingMode: "environment" },
    })
    .then((stream) => {
      cameraSuccess(stream);
    })
    .catch((err) => {
      console.error(err);

      if (!noConstraint && err.name === "ConstraintNotSatisfiedError") {
        return activateCamera(true);
      }

     showError( /iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream
        ? "On iOS, Safari is the only browser allowed to use the camera. Please try using Safari."
       : "Your browser or device doesn’t allow access to the camera. Please try using a modern browser."
     )
    });
};



const activateCameraLegacy = (sources) => {
  const source = findBestSource(sources);

  getUserMedia(
    {
      audio: false,
      video: source
        ? {
          optional: [{ sourceId: sourceEnumSupport ? source.deviceId : source.id }],
        }
        : true,
    },
    (stream) => {
      if (sourceEnumSupport && !source && !attemptedTwice.value) {
        attemptedTwice.value = true;
        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
          enumerateDevices();
        }, 1);
        return;
      }
      cameraSuccess(stream);
    },
    (err) => {
      showError(`error to load video ${err}`)
    }
  );
};

const cameraSuccess = (strm) => {
  let canv = window.document.getElementById("canvas");
  let videoEl = window.document.getElementById("video");

  videoEl.srcObject = strm;

  cameraReady.value = true;
  video.value = videoEl;
  ctx.value = canv.getContext("2d");
  stream.value = strm;
  canvas.value = canv;
};

const enumerateDevices = () =>
  mediaDevices
    .enumerateDevices()
    .then((sources) => activateCameraLegacy(sources))
    .catch(() => activateCameraLegacy(null));

export const requestCamera = () => {
  if (cameraReady.value) {
    return;
  }

  userAgent.value = navigator.userAgent;

  if (mediaDevices && mediaDevices.getUserMedia) {
    return activateCamera();
  }

  if (!getUserMedia) {
    showError(`failed to load the camera: ${error} `);
    return;
  }

  if (sourceEnumSupport) {
    enumerateDevices();
  } else if (streamTrackSupport) {
    MediaStreamTrack.getSources((sources) => activateCameraLegacy(sources));
  } else {
    activateCameraLegacy(null);
  }
};
