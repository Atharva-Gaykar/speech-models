### 🎙️ Offline Text-to-Speech (TTS) Generation

The core execution script is `tts.js` (working code). It utilizes `sherpa-onnx` to perform fast, offline inference using a multilingual VITS TTS model, converting text directly into `.wav` audio files.

**Requirements**

1. **Dependencies:** Ensure your node modules are installed (defined in `package.json`).
```bash
npm install

```



**Inputs**
The script reads target phrases from an input file. Format your inputs as an array of JSON objects containing the target language and the native text:

```json
[
  {
    "language": "Assamese",
    "text": "নমস্কাৰ, আপুনি আজি কেনে আছে? বতৰটো আজি বৰ ধুনীয়া।"
  }
]

```

**Usage**
Run the generator via Node.js to process the inputs and output audio files:

```bash
node tts.js

```

<img width="252" height="370" alt="image" src="https://github.com/user-attachments/assets/0750a59d-3095-4896-841f-0b2123c3aa0b" />

<img width="501" height="286" alt="Screenshot 2026-09-11 201602" src="https://github.com/user-attachments/assets/ab445338-c5bf-41db-b92d-8479937000b3" />

---



### 🎙️ Offline Speech-to-Text (STT) Generation

For offline speech recognition, this project utilizes the Indic Conformer model optimized for `sherpa-onnx`.

**Requirements & Execution**
The model files and setup instructions for mobile integration are hosted on Hugging Face.

***Repository:** [https://huggingface.co/meetsync/indic-conformer-onnx-sherpa](https://huggingface.co/meetsync/indic-conformer-onnx-sherpa)



This repository contains the required scripts to download the ONNX model binaries and provides the implementation code for running the STT pipeline locally with React Native.
