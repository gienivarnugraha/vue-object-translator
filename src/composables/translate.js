import xhr from "xhr";
import he from "he";
import { apiUrls } from "@/config";
import { speak } from "./speak"
import { label, translation, guesses, setLabelPair } from "./ref"
import { activeLang, langMap, targetLang } from "./lang"

const filterLong = true;
const lengthLimit = 8;

let cache = ref({});

const onTranslateFail = () => setLabelPair({ lbl: "?", trnslt: "?", gss: "?" });

export const translate = (raw) => {
  if (!raw.length) {
    return onTranslateFail();
  }

  const translateTimeStart = new Date().getTime()

  const labels = raw.map((l) => l.description);

  let filtered = filterLong ? labels.filter((t) => t.length <= lengthLimit) : labels;

  if (!filtered.length) {
    filtered = labels;
  }

  const gss = raw
    .slice(0, 3)
    .map((o) => `${o.description}: ${Math.round(o.score * 100)}%`)
    .join(", ");

  let term = filtered[0];

  if (!cache.value[activeLang.value]) {
    cache.value[activeLang.value] = {};
  }

  const cacheHit = cache.value[activeLang.value][term];

  if (cacheHit) {
    setLabelPair({ lbl: he.decode(term), trnslt: cacheHit, gss });
    speak(cacheHit, activeLang.value, speak.bind(null, term, targetLang.value));
    return;
  } else {
    /* TESTING PURPOSES */
    const body = {
      data: {
        translations: [
          {
            translatedText: "Rambut",
          },
        ],
      },
    };

    const result = body.data.translations[0].translatedText;
    setLabelPair({ lbl: he.decode(term), trnslt: result, gss });
    speak(
      he.decode(body.data.translations[0].translatedText),
      activeLang.value,
      speak.bind(null, term, targetLang.value)
    );

    /* END OF TESTING */

    /*     cache[activeLang.value][term] = result;

        Object.assign(cache, {
          [activeLang.value]: {
            [term]: result,
          },
        }); */

    /*  xhr.get(
       `${apiUrls.translate}&q=${term}&source=en&target=${langMap[activeLang.value]}`,
       (err, res, body) => {
         if (err) {
           return onTranslateFail();
         }
         const translation = he.decode(
           JSON.parse(body).data.translations[0].translatedText
         );

         // cache[activeLang.value][term] = translation;

         setLabelPair({ lbl: he.decode(term), trnslt: translation, gss });
         //setLabelPair({ lbl: he.decode(term), trnslt: cacheHit, gss });

         const translateTimeEnd = new Date().getTime()
         console.log('translate %s second', (translateTimeEnd - translateTimeStart)/1000);

         speak(translation, activeLang.value, speak.bind(null, term, targetLang.value));
       }
     ); */
  }
};
