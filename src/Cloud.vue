<script setup>
/* Composables */
import { requestCamera } from "@/composables/camera";
import { requestFullscreen, fullscreen } from "@/composables/fullscreen";
import { loadModel } from "@/composables/model";
import { activeLang, targetLang, langList } from "@/composables/lang";
import {
  activeView,
  translation,
  label,
  guesses,
  setLabelPair,
  modelConfig,
  cameraReady,
  cameraError,
  isSnapping,
  isModelReady,
  loading,
  performance,
} from "@/composables/ref";

/* Components */
import Error from "@/components/Error.vue";
import List from "@/components/List.vue";
import Cog from "@/components/icons/Cog.vue";
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
    activeLang.value = lang;
  }

  resetView();
};

onMounted(() =>
  window.document.addEventListener("DOMContentLoaded", () => requestCamera())
);
</script>

<template>
  <Error v-if="cameraError" />

  <main v-else class="app" @ontouchstart="!fullscreen ? requestFullscreen() : null">
    <div id="shroud"></div>

    <section id="setting-view" v-if="!loading">
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
        <h5>Model</h5>
        <h4 @click="activeView = 'model'">
          {{ modelConfig }}
        </h4>
      </div>
    </section>

    <div>
      <loading v-if="isSnapping"> Detecting objects.. </loading>
      <loading v-if="isModelReady"> Loading Models.. </loading>

      <div v-if="activeView === 'main'" id="target" :class="{ flashing: loading }"></div>

      <section id="main-view" v-if="activeView === 'main'" :class="{ faded: loading }">
        <div class="row">
          <h5>Object</h5>
          <h2>{{ label }}</h2>
          <h4 @click="(activeView = 'lang'), (langSelect = 'target')">
            {{ targetLang }}
          </h4>
        </div>

        <div class="row">
          <h5>Translation</h5>
          <h2>{{ translation }}</h2>
          <h4 @click="(activeView = 'lang'), (langSelect = 'source')">
            {{ activeLang }}
          </h4>
        </div>

        <ShutterButton v-if="cameraReady" />

        <div class="debug">{{ guesses }}</div>
        <div class="performance">
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
