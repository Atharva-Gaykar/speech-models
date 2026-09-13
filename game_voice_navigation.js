
const sherpa_onnx = require('sherpa-onnx-node');
const fs = require('fs');
const path = require('path');

// ============================================================
// PATHS
// ============================================================

const MODELS_DIR = path.join(__dirname, 'onnx_models');
const AUDIO_DIR = path.join(__dirname, 'Audio Samples');
const DATA_FILE = path.join(__dirname, 'navigation_data.json');


// ============================================================
// LANGUAGE CONFIGURATION
// ============================================================

const LANGS = {
  assamese: {
    code: 'as',
    model: 'as_model.int8.onnx'
  },

  bengali: {
    code: 'bn',
    model: 'bn_model.int8.onnx'
  },

  bodo: {
    code: 'brx',
    model: 'brx_model.int8.onnx'
  },

  manipuri: {
    code: 'mni',
    model: 'mni_model.int8.onnx'
  },

  nepali: {
    code: 'ne',
    model: 'ne_model.int8.onnx'
  }
};


// ============================================================
// LOAD JSON DATA
// ============================================================

if (!fs.existsSync(DATA_FILE)) {
  console.error('navigation_data.json not found.');
  process.exit(1);
}

const navigationData = JSON.parse(
  fs.readFileSync(DATA_FILE, 'utf8')
);


// ============================================================
// RECOGNIZER CACHE
// ============================================================

const recognizerCache = {};

function getRecognizer(language) {

  if (!LANGS[language]) {
    throw new Error(`Unknown language: ${language}`);
  }

  if (!recognizerCache[language]) {

    const modelPath = path.join(
      MODELS_DIR,
      language,
      LANGS[language].model
    );

    const tokensPath = path.join(
      MODELS_DIR,
      'tokens.txt'
    );

    if (!fs.existsSync(modelPath)) {
      throw new Error(
        `Model not found: ${modelPath}`
      );
    }

    if (!fs.existsSync(tokensPath)) {
      throw new Error(
        `tokens.txt not found: ${tokensPath}`
      );
    }

    console.log(`Loading ${language} model...`);

    recognizerCache[language] =
      new sherpa_onnx.OfflineRecognizer({

        modelConfig: {

          nemoCtc: {
            model: modelPath
          },

          tokens: tokensPath,

          numThreads: 2,

          provider: 'cpu'
        },

        decodingMethod: 'greedy_search'
      });
  }

  return recognizerCache[language];
}


// ============================================================
// GET LANGUAGE FROM AUDIO FILENAME
// ============================================================
//
// Example:
//
// output_assamese.wav
// output_bengali.wav
// output_bodo.wav
// output_manipuri.wav
// output_nepali.wav
//
// ============================================================

function getLanguageFromFilename(filename) {

  const name = filename.toLowerCase();

  if (name.includes('assamese')) {
    return 'assamese';
  }

  if (name.includes('bengali')) {
    return 'bengali';
  }

  if (name.includes('bodo')) {
    return 'bodo';
  }

  if (name.includes('manipuri')) {
    return 'manipuri';
  }

  if (name.includes('nepali')) {
    return 'nepali';
  }

  return null;
}


// ============================================================
// TEXT NORMALIZATION
// ============================================================
//
// English:
//   - lowercase
//   - remove punctuation
//
// Indian languages:
//   - DO NOT lowercase/change characters
//   - remove punctuation
//
// This normalization is applied to BOTH:
//   1. STT output
//   2. JSON phrases
//
// ============================================================

function normalizeText(text, languageCode) {

  if (!text) {
    return '';
  }

  let result = text.normalize('NFC');

  // English only
  if (languageCode === 'en') {
    result = result.toLowerCase();
  }

  // Remove punctuation.
  //
  // Includes:
  // . , ! ? ; : ' " 
  // Indian punctuation: । ॥
  //
  result = result.replace(
    /[.,!?;:'"“”‘’()[\]{}।॥]/g,
    ' '
  );

  // Remove extra spaces
  result = result.replace(/\s+/g, ' ');

  return result.trim();
}


// ============================================================
// TRANSCRIBE AUDIO
// ============================================================

function transcribe(filePath, language) {

  const recognizer = getRecognizer(language);

  const wave = sherpa_onnx.readWave(filePath);

  if (!wave || !wave.samples || wave.samples.length === 0) {
    throw new Error('Audio file contains no samples.');
  }

  const stream = recognizer.createStream();

  stream.acceptWaveform({
    sampleRate: wave.sampleRate,
    samples: wave.samples
  });

  recognizer.decode(stream);

  const result = recognizer.getResult(stream);

  return result.text.trim();
}


// ============================================================
// EXACT MATCH
// ============================================================

function findExactMatch(text, languageCode) {

  const input = normalizeText(
    text,
    languageCode
  );

  if (!input) {
    return null;
  }

  for (const game of navigationData) {

    const translations =
      game.translations?.[languageCode];

    if (!Array.isArray(translations)) {
      continue;
    }

    for (const phrase of translations) {

      const normalizedPhrase =
        normalizeText(
          phrase,
          languageCode
        );

      if (normalizedPhrase === input) {
        return game;
      }
    }
  }

  return null;
}


// ============================================================
// LEVENSHTEIN DISTANCE
// ============================================================

function levenshteinDistance(a, b) {

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {

    for (let j = 1; j <= a.length; j++) {

      if (b[i - 1] === a[j - 1]) {

        matrix[i][j] =
          matrix[i - 1][j - 1];

      } else {

        matrix[i][j] = Math.min(

          matrix[i - 1][j] + 1,

          matrix[i][j - 1] + 1,

          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}


// ============================================================
// SIMILARITY
// ============================================================

function similarity(a, b, languageCode) {

  a = normalizeText(a, languageCode);
  b = normalizeText(b, languageCode);

  if (!a || !b) {
    return 0;
  }

  const longer =
    a.length >= b.length ? a : b;

  const shorter =
    a.length >= b.length ? b : a;

  const distance =
    levenshteinDistance(
      longer,
      shorter
    );

  return (
    (longer.length - distance) /
    longer.length
  );
}


// ============================================================
// FUZZY MATCH
// ============================================================

function findFuzzyMatch(text, languageCode) {

  let bestGame = null;
  let bestPhrase = null;
  let bestScore = 0;

  for (const game of navigationData) {

    const translations =
      game.translations?.[languageCode];

    if (!Array.isArray(translations)) {
      continue;
    }

    for (const phrase of translations) {

      const score = similarity(
        text,
        phrase,
        languageCode
      );

      if (score > bestScore) {

        bestScore = score;
        bestGame = game;
        bestPhrase = phrase;
      }
    }
  }

  // Minimum fuzzy-match threshold
  if (bestGame && bestScore >= 0.70) {

    return {
      game: bestGame,
      phrase: bestPhrase,
      score: bestScore
    };
  }

  return null;
}


// ============================================================
// PROCESS ONE AUDIO FILE
// ============================================================

function processAudio(filename) {

  console.log('\n========================================');

  console.log(`Audio: ${filename}`);

  const language =
    getLanguageFromFilename(filename);

  if (!language) {

    console.log(
      'Status: SKIPPED - language not detected'
    );

    return;
  }

  const languageCode =
    LANGS[language].code;

  console.log(`Language: ${languageCode}`);

  const filePath =
    path.join(
      AUDIO_DIR,
      filename
    );

  try {

    // --------------------------------------------------------
    // STT
    // --------------------------------------------------------

    const text =
      transcribe(
        filePath,
        language
      );

    console.log(`STT: ${text || '[empty]'}`);

    if (!text) {

      console.log('Game ID: NOT FOUND');
      console.log('Reason: Empty STT result');

      return;
    }


    // --------------------------------------------------------
    // EXACT MATCH
    // --------------------------------------------------------

    const exactMatch =
      findExactMatch(
        text,
        languageCode
      );

    if (exactMatch) {

      console.log(
        `Game ID: ${exactMatch.id}`
      );

      console.log(
        `Game: ${exactMatch.game_name}`
      );

      console.log(
        'Match: EXACT'
      );

      return;
    }


    // --------------------------------------------------------
    // FUZZY MATCH
    // --------------------------------------------------------

    const fuzzyMatch =
      findFuzzyMatch(
        text,
        languageCode
      );

    if (fuzzyMatch) {

      console.log(
        `Game ID: ${fuzzyMatch.game.id}`
      );

      console.log(
        `Game: ${fuzzyMatch.game.game_name}`
      );

      console.log(
        `Matched phrase: ${fuzzyMatch.phrase}`
      );

      console.log(
        `Similarity: ${(fuzzyMatch.score * 100).toFixed(2)}%`
      );

      console.log(
        'Match: FUZZY'
      );

    } else {

      console.log(
        'Game ID: NOT FOUND'
      );

      console.log(
        'Match: NO MATCH'
      );
    }

  } catch (error) {

    console.error(
      `ERROR: ${error.message}`
    );
  }
}


// ============================================================
// MAIN
// ============================================================

function main() {

  if (!fs.existsSync(AUDIO_DIR)) {

    console.error(
      `Audio Samples folder not found:\n${AUDIO_DIR}`
    );

    process.exit(1);
  }

  const files =
    fs.readdirSync(AUDIO_DIR)
      .filter(
        file =>
          file.toLowerCase().endsWith('.wav')
      );

  if (files.length === 0) {

    console.log(
      `No WAV files found in:\n${AUDIO_DIR}`
    );

    return;
  }

  console.log(
    `Found ${files.length} WAV file(s).`
  );

  for (const file of files) {

    processAudio(file);
  }

  console.log(
    '\n========================================'
  );

  console.log('Finished.');
}


// ============================================================
// START
// ============================================================

main();