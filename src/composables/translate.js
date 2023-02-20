import { speak } from "./speak"
import { sourceLang, targetLang } from "./lang"
import { setLabelPair } from "./helpers"
import { translateRequest, onTranslateFail } from "./api"

export let cache = ref({});

export const translate = async (raw) => {
  if (!raw.length) {
    return onTranslateFail();
  }

  const labels = raw.map((l) => l.description);

  const gss = raw
    .slice(0, 3)
    .map((o) => `${o.description}: ${Math.round(o.score * 100)}%`)
    .join(", ");

  let term = labels[0]

  if (!cache.value[term]) {
    cache.value[term] = {
      source: {},
      target: {}
    }
  }

  let sourceTranslated

  let sourceCacheHit = cache.value[term].source[sourceLang.value];
  let targetCacheHit = cache.value[term].target[targetLang.value];

  try {
    if (sourceLang.value !== 'english') {
      sourceTranslated = await translateRequest(term, 'english', sourceLang.value)
    } else {
      sourceTranslated = term
    }
    cache.value[term].source[sourceLang.value] = sourceTranslated;
  } catch (error) {
    onTranslateFail();
    throw error
  }

  console.log(cache.value);

  if (sourceCacheHit && targetCacheHit) {
    console.log('cache hit!');
    setLabelPair({ lbl: sourceCacheHit, trnslt: targetCacheHit, gss });
    speak(targetCacheHit, targetLang.value, speak.bind(null, sourceCacheHit, sourceLang.value));
    return;
  } else {
    const targetTranslated = await translateRequest(sourceTranslated, sourceLang.value, targetLang.value)
    cache.value[term].target[targetLang.value] = targetTranslated

    setLabelPair({ lbl: sourceTranslated, trnslt: targetTranslated, gss });
    speak(targetTranslated, targetLang.value, speak.bind(null, sourceTranslated, sourceLang.value));
  }

};

/* TESTING PURPOSES */
/*     const body = {
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
      sourceLang.value,
      speak.bind(null, term, targetLang.value)
    ); */

/* END OF TESTING */

/* cache[sourceLang.value][term] = result;

    Object.assign(cache, {
      [sourceLang.value]: {
        [term]: result,
      },
    }); */
