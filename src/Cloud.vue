<script setup>
/* Composables */
import { requestCamera, activateCamera } from "@/composables/camera";
import { requestFullscreen, fullscreen } from "@/composables/fullscreen";
import { loadModel } from "@/composables/model";
import { sourceLang, targetLang, langList } from "@/composables/lang";
import { setLabelPair, showNotif } from "@/composables/helpers";
import {
  activeView,
  translation,
  label,
  guesses,
  modelConfig,
  cameraReady,
  cameraError,
  isSnapping,
  isModelReady,
  performance,
  facingMode,
} from "@/composables/ref";

/* Components */
import Error from "@/components/Error.vue";
import List from "@/components/List.vue";
import Cog from "@/components/icons/Cog.vue";
import Camera from "@/components/icons/Camera.vue";
import Loading from "@/components/Loading.vue";
import ShutterButton from "@/components/ShutterButton.vue";

let langSelect = ref("");

let modelList = ref([
  "lite_mobilenet_v2",
  "mobilenet_v1",
  "mobilenet_v2",
  "google_vision",
]);

const resetView = () => {
  setLabelPair({
    label: "",
    translation: "",
  });

  performance.value = 0;

  activeView.value = "main";
};

const changeModel = (value) => {
  modelConfig.value = value;
  if (value !== "google_vision") {
    loadModel();
  }

  resetView();
};

const changeLang = (lang) => {
  if (langSelect.value === "target") {
    targetLang.value = lang;
  }
  if (langSelect.value === "source") {
    sourceLang.value = lang;
  }

  resetView();
};

const changeCamera = () => {
  if (facingMode.value === "environment") facingMode.value = "user";
  else facingMode.value = "environment";

  activateCamera(facingMode.value);
};

onMounted(() =>
  window.document.addEventListener("DOMContentLoaded", () => requestCamera())
);
</script>

<template>
  <notifications />

  <Error v-if="cameraError" />

  <main v-else class="app" @ontouchstart="!fullscreen ? requestFullscreen() : null">
    <div id="shroud"></div>

    <section id="setting-view" v-if="!isSnapping">
      <div
        class="setting-icon"
        v-if="activeView === 'main' || activeView === 'settings'"
        @click="
          activeView === 'settings' ? (activeView = 'main') : (activeView = 'settings')
        "
      >
        <Cog />
      </div>
      <div class="row" v-if="activeView === 'settings'">
        <h5 class="text title">Model</h5>
        <h4 class="text lang" @click="activeView = 'model'">
          {{ modelConfig }}
        </h4>
      </div>
    </section>

    <div>
      <loading v-if="isSnapping"> Detecting objects.. </loading>
      <loading v-if="!isModelReady"> Loading Models.. </loading>

      <div
        v-if="activeView === 'main'"
        id="target"
        :class="{ flashing: isSnapping }"
      ></div>

      <section
        id="main-view"
        v-if="activeView === 'main'"
        :class="{ faded: isSnapping || !isModelReady }"
      >
        <div class="row">
          <h5 class="text title">Source</h5>
          <h2 class="text result">{{ label }}</h2>
          <h4 class="text lang" @click="(activeView = 'lang'), (langSelect = 'source')">
            {{ sourceLang }}
          </h4>
        </div>

        <div class="row">
          <h5 class="text title">Translation</h5>
          <h2 class="text result">{{ translation }}</h2>
          <h4 class="lang text" @click="(activeView = 'lang'), (langSelect = 'target')">
            {{ targetLang }}
          </h4>
        </div>

        <ShutterButton v-if="cameraReady" />

        <Camera @click="changeCamera()" />

        <div class="debug debug-text">{{ guesses }}</div>
        <div class="debug debug-performance" v-if="performance">
          Time elapsed using {{ modelConfig }} : {{ performance }} second
        </div>
      </section>
    </div>
    <div>
      <List :lists="langList" view="lang" @selected="changeLang" />
      <List :lists="modelList" view="model" @selected="changeModel" />
    </div>
  </main>
</template>

<style lang="css">
#target {
  position: absolute;
  pointer-events: none;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

#target.flashing {
  animation: flash 0.3s ease-out;
}

#canvas {
  display: none;
}

#shroud {
  background-color: rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.row {
  width: 100%;
  height: 50%;
  margin: 0 auto;
}

.lang {
  font-size: 3vmin;
  text-decoration: underline;
  color: #ffc234;
}

.lang-disabled {
  font-size: 3vmin;
  pointer-events: none;
}

.lang:hover {
  cursor: pointer;
  opacity: 0.6;
}

.result {
  font-size: 8vmin;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title {
  text-transform: uppercase;
  font-size: 3vmin;
  margin-bottom: 16px;
}

.text {
  font-weight: normal;
  position: relative;
  text-transform: uppercase;
  top: 40%;
  transform: translateY(-40%);
  width: 100%;
}

.debug {
  user-select: none;
  position: fixed;
  width: 90%;
  left: 50%;
  transform: translateX(-50%);
  font-family: monospace;
}

.debug-text {
  bottom: 4vmin;
  font-size: 3vmin;
  line-height: 1.5;
}

.debug-performance {
  bottom: 1.5vmin;
  font-size: 2vmin;
  line-height: 1.5;
}

@media (min-width: 800px) {
  #target {
    left: 50%;
    top: 40%;
    border: 2px dashed rgba(255, 255, 255, 0.5);
    transform: translate3d(-50%, -50%, 0);
    display: block;
    height: 70vmin;
    width: 70vmin;
  }

  .result {
    font-size: 60px;
  }

  .lang {
    font-size: 16px;
  }

  .title {
    font-size: 16px;
  }

  .debug-text {
    font-size: 1.6rem;
  }

  .debug-performance {
    font-size: 1rem;
  }
}

@media (max-height: 600px) {
  #target {
    display: none;
  }
}
</style>
