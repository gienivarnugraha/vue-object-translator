import { endSnap, showNotif } from "./helpers";


const { speechSynthesis, SpeechSynthesisUtterance } = window;

const speechSupport = speechSynthesis && SpeechSynthesisUtterance;

let voices = speechSupport ? speechSynthesis.getVoices() : [];
let voiceMap = null;

if (voices.length) {
  setVoiceMap(voices);
} else if (speechSupport) {
  speechSynthesis.onvoiceschanged = () => setVoiceMap(speechSynthesis.getVoices());
}

export const speak = (text, lang, cb) => {
  if (!speechSupport) {
    cb && cb();
    return;
  }

  let msg = new SpeechSynthesisUtterance();

  try {
    msg.text = text;
    msg.lang = voices[voiceMap[lang]].lang;
    msg.voiceURI = voices[voiceMap[lang]].voiceURI;

    cb && msg.addEventListener("end", cb);

  } catch (error) {
    showNotif({ type: 'warn', text: 'Your browser doesnt support speak syntesis and speak support, please use Google Chrome, Safari or Mozilla Firefox'})
  }

  if (text) {
    speechSynthesis.speak(msg);
  } else {
    cb && cb();
  }

  setTimeout(endSnap(), 200);

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
