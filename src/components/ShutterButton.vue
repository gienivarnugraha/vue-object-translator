<template>
  <div
    id="shutter-button"
    :class="{ busy: isSnapping, busy: !isModelReady }"
    @click="snap"
  ></div>
</template>

<script setup>
import { isSnapping, isModelReady } from "@/composables/ref";
import { snap } from "@/composables/snap";
</script>

<style lang="css">
#shutter-button {
  position: fixed;
  width: 12.5vmin !important;
  height: 12.5vmin !important;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #fff;
  padding: 1.5vmin;
  background-clip: content-box;
  bottom: 10vmin;
  left: 50% !important;
  opacity: 0.8;
  transform: translateX(-50%);
  cursor: pointer;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  outline: 0;
}

#shutter-button:active {
  opacity: 1;
}

#shutter-button:hover {
  opacity: 0.6;
}

#shutter-button.busy {
  opacity: 0.3;
  cursor: wait;
}

@media (max-height: 450px) {
  #shutter-button {
    bottom: 12vmin !important;
  }
}

@media (max-height: 800px) {
  #shutter-button {
    width: 100px !important;
    height: 100px !important;
    padding: 10px !important;
    width: 10vmin !important;
    height: 10vmin !important;
    bottom: 10vmin !important;
  }
}
</style>
