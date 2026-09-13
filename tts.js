const fs = require("fs");
const path = require("path");
const sherpa_onnx = require("sherpa-onnx");

// 1. Path to your JSON file
const input_path = "C:\\Users\\ATHARVA\\Downloads\\my codes\\web\\HackAIService\\input_samples.json";

// 2. Initialize the TTS model with corrected paths
const tts = sherpa_onnx.createOfflineTts({
  model: {
    vits: {
      model: "./tts_model/model.onnx",
      tokens: "./tts_model/tokens.txt",
    },
    numThreads: 1,
    debug: 1,
  },
  maxNumSentences: 1,
});

console.log("TTS model loaded successfully!");

// 3. Helper function to write a standard .wav file
function saveWav(filename, sampleRate, samples) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // Write standard WAV Header
  view.setUint32(0, 0x46464952, true); // 'RIFF'
  view.setUint32(4, 36 + samples.length * 2, true); 
  view.setUint32(8, 0x45564157, true); // 'WAVE'
  view.setUint32(12, 0x20746d66, true); // 'fmt '
  view.setUint32(16, 16, true); 
  view.setUint16(20, 1, true); 
  view.setUint16(22, 1, true); 
  view.setUint32(24, sampleRate, true); 
  view.setUint32(28, sampleRate * 2, true); 
  view.setUint16(32, 2, true); 
  view.setUint16(34, 16, true); 
  view.setUint32(36, 0x61746164, true); // 'data'
  view.setUint32(40, samples.length * 2, true); 

  // Convert Float32 audio samples to Int16
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  // Write to file
  fs.writeFileSync(filename, Buffer.from(buffer));
}

// 4. Read the JSON and generate audio
try {
  const fileContent = fs.readFileSync(input_path, "utf-8");
  const inputSamples = JSON.parse(fileContent);

  const samples = Array.isArray(inputSamples) ? inputSamples : [inputSamples];

  samples.forEach((item, index) => {
    console.log(`\nGenerating audio for language: ${item.language}...`);
    console.log(`Text: ${item.text}`);

    const audio = tts.generate({
      text: item.text,
      sid: 0,
      emotionId: 0
    });

    if (!audio || !audio.samples) {
      console.error(`Failed to generate audio for ${item.language}`);
      return;
    }

    const outputFilename = `C:\\Users\\ATHARVA\\Downloads\\my codes\\web\\HackAIService\\Audio Samples\\output_${item.language.toLowerCase()}_${index}.wav`;
    saveWav(outputFilename, audio.sampleRate, audio.samples);

    console.log(`✅ Saved to ${outputFilename}`);
  });

  console.log("\nAll TTS tasks completed!");

} catch (error) {
  console.error("Error reading JSON file or running TTS:", error);
}