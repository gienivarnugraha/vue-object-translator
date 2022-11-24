
export let fullscreen = ref(false);


export const requestFullscreen = () => {
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

