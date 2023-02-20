export let activeView = ref("main");

export let translation = ref("");
export let guesses = ref("");
export let label = ref("");

export let performance = ref(0);

export let cameraReady = ref(false);
export let cameraError = ref(false);
export let errorMessage = ref('');
export let userAgent = ref("");

export let firstTime = ref(true);
export let isSnapping = ref(false);

export let modelConfig = ref( "google_vision");

export let model = ref(null)
export let isLiveStream = ref(false)
export let isModelReady = ref(true)

export let facingMode = ref('auto')
export let hasFrontCam = ref(false)
