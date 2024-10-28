const videoIds = [
    "nuyT4iW05Jc",
    "mSSevB5deHU",
    "2po4w1Ime4o",
    "K1xcNCgCCaY",
    "_b2KL2eoVQE",
    "OdM7xCxekPk",
    "M6JLOQ2L0qs",
    "-wYyIvFFp4g",
    "sS_CmzLCqTY",
    "XvjR0jsPbnY",
    "ceCqfX-lhG0",
    "GNNIu2R8v2o",
    "KY2QiRG-3y0",
    "Z2Ue7gtSK4o",
    "2po4w1Ime4o",
    "k8K9Ji_d8fg",
    "mSSevB5deHU"
  ];
  /*
  export function getRandomId() {
    const randomIndex = Math.floor(Math.random() * videoIds.length);
    return videoIds[randomIndex];
  }
*/
  export async function getRandomId() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('randomVideoIds', function(data) {
        const videoIds = data.randomVideoIds || [
          "nuyT4iW05Jc",
          "mSSevB5deHU",
          "2po4w1Ime4o"
        ];
        const randomIndex = Math.floor(Math.random() * videoIds.length);
        resolve(videoIds[randomIndex]);
      });
    });
  }
