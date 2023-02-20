
import { cameraReady, userAgent, facingMode,  hasMultipleCamera } from './ref'

import { showError, showNotif } from './helpers'

export let stream = ref(null);
export let video = ref(null);
export let ctx = ref(null);
export let canvas = ref(null);

let attemptedTwice = ref(false);

const { MediaStreamTrack } = window;
const { mediaDevices } = navigator;
const sourceEnumSupport = mediaDevices && mediaDevices.enumerateDevices;
const streamTrackSupport = MediaStreamTrack && MediaStreamTrack.getSources;
const sourceSupport = sourceEnumSupport || streamTrackSupport;

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

export const activateCamera = async (noConstraint = true) => {

  const constraints = {
    audio: false,
    video: {
      ...(await narrowDownFacingMode())
    }
  };

  try {
    if (cameraReady.value && stream.value) {
      console.log(stream.value);
      stream.value.getTracks().forEach(track => track.stop());
    }

    let strm = await mediaDevices.getUserMedia(constraints)

    cameraSuccess(strm)
  } catch (err) {
    console.error(err);
    if (err.name === 'OverconstrainedError') {
      showError(`Your device doesn't have a rear camera`)
    }

    if (!noConstraint && err.name === "ConstraintNotSatisfiedError") {
      return activateCamera();
    }

    showError(/iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream
      ? "On iOS, Safari is the only browser allowed to use the camera. Please try using Safari."
      : "Your browser or device doesn’t allow access to the camera. Please try using a modern browser."
    )

  }
};


// Modern phones often have multipe front/rear cameras.
// Sometimes special purpose cameras like the wide-angle camera are picked
// by default. Those are not optimal for scanning QR codes but standard
// media constraints don't allow us to specify which camera we want exactly.
const narrowDownFacingMode = async () => {
  // Filter some devices, known to be bad choices.
  const devices = (await navigator.mediaDevices.enumerateDevices())
    .filter(({ kind }) => kind === "videoinput")
    .filter(({ label }) => !label.includes("infrared"));

  console.log(devices);

  if (devices.length > 2) {
    // Explicitly picking the first entry in the list of all videoinput
    // devices for as the default front camera and the last entry as the default
    // rear camera seems to be a good heuristic on some devices.
    const frontCamera = devices[0];
    const rearCamera = devices[devices.length - 1];

    hasMultipleCamera.value = true

    switch (facingMode.value) {
      case "auto":
        return { deviceId: { exact: rearCamera.deviceId } };
      case "rear":
        return { deviceId: { exact: rearCamera.deviceId } };
      case "front":
        return { deviceId: { exact: frontCamera.deviceId } };
      default:
        return undefined;
    }
  } else {
    switch (facingMode.value) {
      case "auto":
        return { facingMode: { ideal: "environment" } };
      case "rear":
        return { facingMode: { exact: "environment" } };
      case "front":
        return { facingMode: { exact: "user" } };
      default:
        return undefined;
    }
  }
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
      showNotif({ type: 'error', text: `error to load video ${err}` })
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
