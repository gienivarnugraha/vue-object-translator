import axios from "axios";
import { apiUrls } from "@/config";
import { setLabelPair, endSnap } from "./helpers"
import { langMap } from "./lang"

export const onTranslateFail = () => {
  setLabelPair({ lbl: "?", trnslt: "?", gss: "?" })

  setTimeout(endSnap(), 200);
};

export const translateRequest = async (term, source, target) => {
  try {
    const { data } = await axios.get(`${apiUrls.translate}&q=${term}&source=${langMap[source]}&target=${langMap[target]}`)
    return data.data.translations[0].translatedText
  } catch (error) {
    onTranslateFail();
    throw error
  }
}

export const detectRequest = async (image) => {
  try {
    const { data } = await axios.post(apiUrls.cloudVision,
      {
        requests: [
          {
            image: {
              content: image,
            },
            features: [
              { type: "LABEL_DETECTION", maxResults: 3 },
              { type: "CROP_HINTS", "maxResults": 3 }
            ],
          },
        ],
      })

    /*
    {
        "responses": [
            {
                "labelAnnotations": [
                    {
                        "mid": "/m/025kyy",
                        "description": "Forehead",
                        "score": 0.9846564,
                        "topicality": 0.9846564
                    },
                    {
                        "mid": "/m/0k0pj",
                        "description": "Nose",
                        "score": 0.98358303,
                        "topicality": 0.98358303
                    },
                    {
                        "mid": "/m/03q69",
                        "description": "Hair",
                        "score": 0.98284185,
                        "topicality": 0.98284185
                    }
                ],
                "cropHintsAnnotation": {
                    "cropHints": [
                        {
                            "boundingPoly": {
                                "vertices": [
                                    {
                                        "x": 32
                                    },
                                    {
                                        "x": 390
                                    },
                                    {
                                        "x": 390,
                                        "y": 639
                                    },
                                    {
                                        "x": 32,
                                        "y": 639
                                    }
                                ]
                            },
                            "confidence": 0.50223213,
                            "importanceFraction": 1
                        }
                    ]
                }
            }
        ]
    }
    */

    let labels;

    if (
      !data.responses ||
      !data.responses.length ||
      !data.responses[0].labelAnnotations
    ) {
      labels = [];
    } else {
      labels = data.responses[0].labelAnnotations;
    }

    return labels

  } catch (error) {
    console.log(error)
    throw error;

  }
}
