const sherpa_onnx = require('sherpa-onnx-node');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, 'onnx_models');
const AUDIO_DIR = path.join(__dirname, 'Audio Samples');

// folder name (as it appears under onnx_models/) -> model filename
const LANGS = {
  assamese: 'as_model.int8.onnx',
  Bengali: 'bn_model.int8.onnx',
  bodo: 'brx_model.int8.onnx',
  manipuri: 'mni_model.int8.onnx',
  nepali: 'ne_model.int8.onnx',
};

// output_nepali.wav -> nepali
function langFromFilename(filename) {
  const match = filename.match(/^output_([a-z]+)\.wav$/i);
  return match ? match[1].toLowerCase() : null;
}

function findFolder(lang) {
  return Object.keys(LANGS).find((folder) => folder.toLowerCase() === lang);
}

const recognizerCache = {};

function getRecognizer(folder) {
  if (!recognizerCache[folder]) {
    recognizerCache[folder] = new sherpa_onnx.OfflineRecognizer({
      modelConfig: {
        nemoCtc: { model: path.join(MODELS_DIR, folder, LANGS[folder]) },
        tokens: path.join(MODELS_DIR, 'tokens.txt'),
        numThreads: 2,
        provider: 'cpu',
      },
      decodingMethod: 'greedy_search',
    });
  }
  return recognizerCache[folder];
}

function transcribe(filePath, folder) {
  const recognizer = getRecognizer(folder);
  const wave = sherpa_onnx.readWave(filePath);
  const stream = recognizer.createStream();
  stream.acceptWaveform({ sampleRate: wave.sampleRate, samples: wave.samples });
  recognizer.decode(stream);
  return recognizer.getResult(stream).text;
}

function main() {
  const files = fs.readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.wav'));

  for (const file of files) {
    const lang = langFromFilename(file);
    const folder = lang && findFolder(lang);

    if (!folder) {
      console.log(`${file} -> skipped (no matching model for "${lang}")`);
      continue;
    }

    const text = transcribe(path.join(AUDIO_DIR, file), folder);
    console.log(`${file} (${folder}) -> ${text}`);
  }
}

main();