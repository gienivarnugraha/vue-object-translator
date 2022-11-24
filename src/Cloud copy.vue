<script setup>
import { langList, apiUrls } from "./config";
import xhr from "xhr";
import he from "he";

let activeView = ref("main");
let cameraReady = ref(false);
let cameraError = ref(false);
let stream = ref(null);
let video = ref(null);
let ctx = ref(null);
let canvas = ref(null);
let isSnapping = ref(false);
let firstTime = ref(true);
let fullscreen = ref(false);
let label = ref("");
let translation = ref("");
let activeLang = ref(langList[0]);
let targetLang = ref("english");
let guesses = ref("");
let userAgent = ref("");
let rotateTerms = ref(false);
let attemptedTwice = ref(false);
let cache = ref({});

onMounted(() =>
  window.document.addEventListener("DOMContentLoaded", () => requestCamera())
);

const changeLang = (lang) => {
  activeView.value = "main";
  activeLang.value = lang;
  label.value = "";
  translation.value = "";
};

const changeView = (view) => {
  activeView.value = view;
};

const { body } = window.document;

const requestFullscreen = () => {
  if (body.requestFullscreen) {
    body.requestFullscreen();
  } else if (body.webkitRequestFullscreen) {
    body.webkitRequestFullscreen();
  } else if (body.mozRequestFullScreen) {
    body.mozRequestFullScreen();
  } else if (body.msRequestFullscreen) {
    body.msRequestFullscreen();
  }
  fullscreen.value = true;
};

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
      cameraError.value = true;
    });
};

const breakPoint = 800;
const canvSize = 640;
const targetPct = 0.7;
const targetTop = 0.4;

const startSnap = () => {
  isSnapping.value = true;
  firstTime.value = false;
};

const endSnap = () => {
  isSnapping.value = false;
};

const snap = () => {
  startSnap();

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
  /*
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
            },
            {
              mid: "/m/0d4v4",
              description: "Window",
              score: 0.8512647,
              topicality: 0.8512647,
            },
            {
              mid: "/m/031b6r",
              description: "Window blind",
              score: 0.8485484,
              topicality: 0.8485484,
            },
            {
              mid: "/m/083vt",
              description: "Wood",
              score: 0.7974202,
              topicality: 0.7974202,
            },
            {
              mid: "/m/02q_bfg",
              description: "Tints and shades",
              score: 0.77360374,
              topicality: 0.77360374,
            },
            {
              mid: "/m/03gfsp",
              description: "Ceiling",
              score: 0.73074895,
              topicality: 0.73074895,
            },
            {
              mid: "/m/0hndl",
              description: "Shade",
              score: 0.72956115,
              topicality: 0.72956115,
            },
          ],
        },
      ],
    };

    const labelsTest = body.responses[0].labelAnnotations;

    endSnap();

    translate(labelsTest); */

  xhr.post(
    apiUrls.cloudVision,
    {
      json: {
        requests: [
          {
            image: {
              content: image,
            },
            features: { type: "LABEL_DETECTION", maxResults: 3 },
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

      setTimeout(endSnap(), 200);
    }
  );
};

const { speechSynthesis, SpeechSynthesisUtterance } = window;

const speechSupport = speechSynthesis && SpeechSynthesisUtterance;
const filterLong = true;
const lengthLimit = 8;

let voices = speechSupport ? speechSynthesis.getVoices() : [];
let voiceMap = null;

const langMap = {
  english: "en",
  indonesia: "id",
  spanish: "es",
  german: "de",
  french: "fr",
  chinese: "zh",
  italian: "it",
  korean: "ko",
  japanese: "ja",
  dutch: "nl",
  hindi: "hi",
};

if (voices.length) {
  setVoiceMap(voices);
} else if (speechSupport) {
  speechSynthesis.onvoiceschanged = () => setVoiceMap(speechSynthesis.getVoices());
}

const speak = (text, lang, cb) => {
  if (!speechSupport) {
    cb && cb();
    return;
  }

  let msg = new SpeechSynthesisUtterance();

  msg.addEventListener("error", (error) => console.error(error));

  msg.text = text;
  msg.lang = voices[voiceMap[lang]].lang;
  msg.voiceURI = voices[voiceMap[lang]].voiceURI;

  cb && msg.addEventListener("end", cb);

  if (text) {
    speechSynthesis.speak(msg);
  } else {
    cb && cb();
  }
};

const setVoiceMap = (voiceList) => {
  voices = voiceList;

  const voiceRxs = {
    english: /en(-|_)gb/i,
    indonesia: /id(-|_)id/i,
    spanish: /es(-|_)(mx|es)/i,
    german: /de(-|_)de/i,
    french: /fr(-|_)fr/i,
    chinese: /zh(-|_)cn/i,
    italian: /it(-|_)it/i,
    korean: /ko(-|_)kr/i,
    japanese: /ja(-|_)jp/i,
    dutch: /nl(-|_)nl/i,
    hindi: /hi(-|_)in/i,
  };

  voiceMap = Object.keys(voiceRxs).reduce((a, k) => {
    a[k] = voices.findIndex((v) => voiceRxs[k].test(v.lang));
    return a;
  }, {});
};

const onTranslateFail = () => setLabelPair({ lbl: "?", trnslt: "?", gss: "" });

const translate = (raw) => {
  if (!raw.length) {
    return onTranslateFail();
  }

  const labels = raw.map((l) => l.description);

  let filtered = filterLong ? labels.filter((t) => t.length <= lengthLimit) : labels;

  if (!filtered.length) {
    filtered = labels;
  }

  const gss = raw
    .slice(0, 3)
    .map((o) => `${o.description}: ${Math.round(o.score * 100)}%`)
    .join(", ");

  let term = filtered[0];

  if (rotateTerms.value && term === label.value && filtered.length > 1) {
    term = filtered.slice(1)[Math.floor(Math.random() * (filtered.length - 1))];
  }

  if (!cache.value[activeLang.value]) {
    cache.value[activeLang.value] = {};
  }

  const setLabelPair = ({ lbl, trnslt, gss }) => {
    label.value = lbl;
    translation.value = trnslt;
    guesses.value = gss;
  };

  const cacheHit = cache.value[activeLang.value][term];

  if (cacheHit) {
    setLabelPair({ lbl: he.decode(term), trnslt: cacheHit, gss });
    speak(cacheHit, activeLang.value, speak.bind(null, term, targetLang.value));
    return;
  } else {
    /*     const body = {
          data: {
            translations: [
              {
                translatedText: "Pelo",
              },
            ],
          },
        }; */

    // const result = body.data.translations[0].translatedText;
    // setLabelPair({ lbl: he.decode(term), trnslt: result, gss });
    // speak(translation, activeLang.value, speak.bind(null, term, targetLang.value));

    /*     cache[activeLang.value][term] = result;

        Object.assign(cache, {
          [activeLang.value]: {
            [term]: result,
          },
        }); */

    xhr.get(
      `${apiUrls.translate}&q=${term}&source=en&target=${langMap[activeLang.value]}`,
      (err, res, body) => {
        if (err) {
          return onTranslateFail();
        }
        const translation = he.decode(
          JSON.parse(body).data.translations[0].translatedText
        );

        // cache[activeLang.value][term] = translation;

        setLabelPair({ lbl: he.decode(term), trnslt: translation, gss });
        //setLabelPair({ lbl: he.decode(term), trnslt: cacheHit, gss });

        speak(translation, activeLang.value, speak.bind(null, term, targetLang.value));
      }
    );
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
      console.error(err);
      cameraError.value = true;
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

const requestCamera = () => {
  if (cameraReady.value) {
    return;
  }

  userAgent.value = navigator.userAgent;

  if (mediaDevices && mediaDevices.getUserMedia) {
    return activateCamera();
  }

  if (!getUserMedia) {
    console.error(err);
    cameraError.value = true;
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
</script>

<template>
  <main class="app" @ontouchstart="!fullscreen ? requestFullscreen() : null">
    <div id="shroud"></div>

    <svg v-if="isSnapping" id="spinner" width="65px" height="65px" viewBox="0 0 66 66">
      <circle />
    </svg>

    <div v-if="cameraError">
      <h1 id="cam-error">
        {{
          /iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream
            ? "On iOS, Safari is the only browser allowed to use the camera. Please try using Safari."
            : "Your browser or device doesn’t allow access to the camera. Please try using a modern browser."
        }}
      </h1>
    </div>

    <div>
      <div
        v-if="activeView === 'main' && !firstTime"
        id="target"
        :class="{ flashing: isSnapping }"
      ></div>

      <section id="main-view" v-if="activeView === 'main'" :class="{ faded: isSnapping }">
        <div class="row" v-if="!firstTime && translation">
          <h2>{{ translation }}</h2>
          <h4 @click="changeView('list')">{{ activeLang }}</h4>
        </div>

        <div class="row" v-if="!firstTime && label">
          <h2>{{ label }}</h2>
          <h4>{{ targetLang }}</h4>
        </div>

        <div
          v-if="cameraReady"
          id="shutter-button"
          :class="{ busy: isSnapping }"
          @click="snap"
        ></div>

        <h5 v-if="firstTime && cameraReady" id="first-time">
          Try taking a picture of something.
        </h5>
        <div class="debug">{{ guesses }}</div>
      </section>
    </div>
    <div>
      <section id="lang-list" v-if="activeView === 'list'">
        <div class="x" @click="changeView('main')">×</div>
        <ul>
          <li
            v-for="(lang, id) in langList"
            :key="id"
            :class="lang === activeLang ? 'active' : ''"
            @click="changeLang(lang)"
          >
            {{ lang }}
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
