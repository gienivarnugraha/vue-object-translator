<template>
  <div class="loading">
    <svg id="spinner" width="65px" height="65px" viewBox="0 0 66 66">
      <circle />
    </svg>
    <div class="caption">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="css">
@media (min-width: 800px) {
  #spinner {
    top: 40% !important;
    left: 50% !important;
    transform: translateY(-40%) translateX(-50%) !important;
  }
}

.loading {
  position: absolute;
  width: 100vw;
  height: 100vh;
}

#spinner,
.caption {
  position: relative;
  transition: opacity 0.3s ease-out;
  opacity: 1;
  text-align: center;
}

#spinner {
  animation: rotate 1.4s linear infinite;
  top: 50%;
  left: 45%;
  transform: translateY(-50%) translateX(-45%);
}

.caption {
  top: 60%;
  transform: translateY(-60%);
}

#spinner.active {
  opacity: 1;
}

#spinner circle {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  cx: 33;
  cy: 33;
  r: 30;
  stroke-dasharray: 187;
  stroke-dashoffset: 0;
  stroke: #fff;
  transform-origin: center;
  animation: dash 1.4s ease-in-out infinite;
}
</style>
