<template>
  <main id="error-view">
    <div class="error-icon" @click="close">×</div>
    <h1 class="error-text">
      {{ errorMessage }}
    </h1>
  </main>
</template>

<script setup>
import { errorMessage, cameraError, activeView } from "@/composables/ref";

const close = () => {
  activeView.value = "main";
  cameraError.value = false;
  errorMessage.value = "";
};
</script>

<style lang="css">
#error-view .error-icon {
  position: fixed;
  z-index: 2;
  right: 5vmin;
  cursor: pointer;
}

#error-view .error-icon {
  font-size: 7.5vmin;
  top: 5vmin;
}

#error-view .error-icon:hover svg {
  opacity: 0.6;
  animation: rotate 0.3s ease-out;
}

#error-view {
  background-color: black;
  text-align: center;
  position: absolute;
  width: 100vw;
  height: 100vh;
  transition: opacity 0.2s ease-out;
}

.error-text {
  width: 50%;
  text-align: center;
  font-size: 3.2vmin;
  line-height: 1.5;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
}
</style>
