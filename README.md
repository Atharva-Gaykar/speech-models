# 🎙️ Voice Navigation & Offline Speech System

This module provides an **offline speech-processing pipeline** for voice-based interaction and navigation within the application.

It includes:

* 📁 A standardized project folder structure
* 🔊 Offline Text-to-Speech (TTS) generation
* 📥 Automatic STT model downloading and setup
* 🎤 Offline Speech-to-Text (STT) processing
* 🎮 Voice-based navigation between game pages

---

## 📁 Folder Structure

Follow the folder structure shown below when adding or modifying files in this project.

<img width="212" height="462" alt="image" src="https://github.com/user-attachments/assets/15d981e9-df03-469e-9b23-ac4ea4d08d1e" />

This structure keeps the audio files, speech models, scripts, and navigation logic organized and makes it easier to maintain the project.


## 📁 STT Model Folder Structure

```text
models/
└── stt/
    ├── as/
    │   ├── as_model.int8.onnx
    │   └── tokens.txt
    ├── bn/
    │   ├── bn_model.int8.onnx
    │   └── tokens.txt
    ├── brx/
    │   ├── brx_model.int8.onnx
    │   └── tokens.txt
    ├── mni/
    │   ├── mni_model.int8.onnx
    │   └── tokens.txt
    └── ne/
        ├── ne_model.int8.onnx
        └── tokens.txt
```

### Language Model Mapping

| Folder | Language | Model |
|--------|----------|-------|
| `as` | Assamese | `as_model.int8.onnx` |
| `bn` | Bengali | `bn_model.int8.onnx` |
| `brx` | Bodo | `brx_model.int8.onnx` |
| `mni` | Manipuri | `mni_model.int8.onnx` |
| `ne` | Nepali | `ne_model.int8.onnx` |

---

## 🔊 Offline Text-to-Speech (TTS) Generation

**Reference file:** `tts.js`

The TTS module generates speech **locally without requiring an internet connection**.

The generated audio can be used for:

* Voice prompts
* Game instructions
* Navigation feedback
* Other spoken responses within the application

### TTS Flow

The `tts.js` file handles the process of loading the TTS model and generating audio from text.

---

## 📥 STT Model Download

**Reference file:** `test_model_download.js`

The STT model download script is responsible for obtaining and preparing the required Speech-to-Text models.

<img width="2026" height="4062" alt="model-download-flow" src="https://github.com/user-attachments/assets/2df647cb-8bd7-4e26-b5b2-d4fd9ce000a7" />

### STT Model Setup (Refer stt.js)

The download process ensures that the required model files are available locally before the speech-recognition pipeline is executed.

After the models are downloaded, they can be used by the voice navigation system for offline transcription.

---

## 🎮 Voice-Based Game Page Navigation

**Reference file:** `game_navigation....js`

The voice navigation system allows the user to navigate between different game pages using spoken commands.

<img width="554" height="2122" alt="game-page-flow-simple" src="https://github.com/user-attachments/assets/39b149af-5bb1-43da-bcec-6f010c0120e9" />

### Navigation Flow

```text
Audio Input
     ↓
WAV File Read
     ↓
Language Identified
     ↓
Correct ONNX STT Model Selected
     ↓
Speech Converted to Text
     ↓
Language-Specific Navigation Phrases Loaded
     ↓
Exact Match
     ↓
Fuzzy Match (if exact match fails)
     ↓
Game ID Returned
     ↓
Frontend Navigates to the Corresponding Game Page
```

The system first determines the language of the audio input and selects the corresponding ONNX STT model.

The transcribed text is then compared against the language-specific navigation phrases. An **exact match** is attempted first, followed by **fuzzy matching** when an exact match cannot be found.

Once a valid command is identified, the corresponding **Game ID** is returned so that the frontend can navigate to the appropriate game page.

---

## 🖥️ Game Page UI & Voice Navigation Flow

The complete interaction between the voice-navigation system and the game-page UI is illustrated below.

<img width="1124" height="3146" alt="gamepage-ui-voice-navigation-flow" src="https://github.com/user-attachments/assets/0339fb80-40dc-4dd8-8a82-03fae6018b05" />

This flow shows how voice input is processed and ultimately connected to the frontend game-navigation experience.

---

## 🔗 Related Files

| File                     | Purpose                              |
| ------------------------ | ------------------------------------ |
| `tts.js`                 | Offline Text-to-Speech generation    |
| `test_model_download.js` | STT model download and setup         |
| `game_navigation....js`  | Voice-based game navigation          |
| `navigation_data.json`   | Language-specific navigation phrases |
| `Audio Samples/`         | Sample WAV files used for testing    |
| `onnx_models/`           | Local ONNX STT models                |

---

## ⚙️ Overall System Flow

```text
User Voice Input
       ↓
Audio Sample / WAV File
       ↓
Language Detection
       ↓
Language-Specific ONNX STT Model
       ↓
Speech-to-Text
       ↓
Navigation Phrase Matching
       ↓
Exact Match
       ↓
Fuzzy Match (Fallback)
       ↓
Game ID
       ↓
Frontend Game Navigation
       ↓
Selected Game Page
```

The system is designed to keep the speech-processing pipeline **local and offline**, while providing voice-based navigation between game pages.
