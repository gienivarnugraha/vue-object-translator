<template>
  <div>
    <svg
      id="camera"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      stroke-width="3"
      stroke="#FFFFFF"
      fill="none"
    >
      <path
        d="M54.1,51.63H9.9a2,2,0,0,1-2-2V20.37a2,2,0,0,1,2-2h7.54A1,1,0,0,0,18.2,18l4.1-4.95a2,2,0,0,1,1.52-.7H40a2,2,0,0,1,1.51.7L45.6,18a1,1,0,0,0,.76.35H54.1a2,2,0,0,1,2,2V49.63A2,2,0,0,1,54.1,51.63Z"
      />
      <path
        d="M42.5,31.21a10.49,10.49,0,0,1,.29,2.46A10.66,10.66,0,0,1,24.7,41.3"
        stroke-linecap="round"
      />
      <path d="M21.72,35.94A10.65,10.65,0,0,1,39.52,26" stroke-linecap="round" />
      <polyline points="34.73 27.3 39.66 26.1 39.28 21.48" stroke-linecap="round" />
      <polyline points="29.61 40.41 24.44 41.1 24.83 45.73" stroke-linecap="round" />
    </svg>
  </div>
</template>

<style>
#camera {
  z-index: 2;
  position: fixed;
  width: 12.5vmin !important;
  height: 12.5vmin !important;
  padding: 1.5vmin;
  bottom: 10vmin;
  left: 70% !important;
  opacity: 0.8;
  transform: translateX(-70%);
  cursor: pointer;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  outline: 0;
}

@media (max-height: 450px) {
  #shutter-button {
    bottom: 12vmin !important;
    width: 100px !important;
    height: 100px !important;
  }
}

@media (max-height: 800px) {
  #shutter-button {
    width: 100px !important;
    height: 100px !important;
    padding: 10px !important;
  }
}
</style>
