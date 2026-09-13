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



<img width="501" height="286" alt="Screenshot 2026-09-11 201602" src="https://github.com/user-attachments/assets/ab445338-c5bf-41db-b92d-8479937000b3" />

---



### 🎙️ Offline Speech-to-Text (STT) Generation

For offline speech recognition, this project utilizes the Indic Conformer model optimized for `sherpa-onnx`.

<img width="212" height="637" alt="image" src="https://github.com/user-attachments/assets/aca352f0-3b14-4ced-966e-180c0d5668df" />



### 🎙️ Voice Based Game Page Navigation

Audio Samples Folder
        ↓
game_voice_navigation.js reads WAV file
        ↓
Language detected from filename
        ↓
Correct ONNX STT model selected
        ↓
Audio converted to text
        ↓
Language-specific phrases loaded from navigation_data.json
        ↓
Exact Match
        ↓
Fuzzy Match if Exact Match fails
        ↓
Game ID returned
        ↓
Frontend can navigate to that game's page




