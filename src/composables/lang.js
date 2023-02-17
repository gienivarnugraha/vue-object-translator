
const queryLangs = window.location.search.slice(1);

export const langList = queryLangs
  ? queryLangs.split(",")
  : [
    "english",
    "indonesia",
    "spanish",
    "french",
    "german",
    "italian",
    "chinese",
    "japanese",
    "korean",
    "hindi",
    "dutch",
  ];

export const langMap = {
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

export let sourceLang = ref(langList[0]);
export let targetLang = ref(langList[1]);
