# 기리고 · Girigo 🙏

> **Fan web app recreation of the cursed wish app from Netflix's *If Wishes Could Kill* (2026)**

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![No Framework](https://img.shields.io/badge/No_Framework-000000?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📱 About

A pixel-perfect fan recreation of **Girigo (기리고)** — the cursed wish-granting app from the Netflix Korean horror series *If Wishes Could Kill* (기리면 죽는다), premiering April 24, 2026.

Built as a pure HTML/CSS/JS web app. No framework. No backend. No uploads. Everything stays on your device.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌙 Time Lock | App shows midnight – 4AM restriction, matching the show |
| ⏱️ 4-Hour Window | Live countdown timer in the top-right of the record screen |
| 📷 Camera Feed | Grayscale-filtered camera with scan lines & corner brackets |
| 🎙️ Speech Recognition | Web Speech API — speak your wish aloud (Korean + English) |
| ✍️ Typing Animation | Wish transcription types itself out, character by character |
| 📡 Transmission | Three expanding concentric rings animate when wish is sent |
| ⏳ 24hr Countdown | Full countdown timer begins after submission |
| 🔁 Pass On | Native share sheet or clipboard copy to pass the curse |
| 👻 Echo Screen | Randomly appears — "your wish has returned in another voice" |
| 🎵 Ambient Audio | Eerie low-frequency drone via Web Audio API |
| ⚡ Glitch FX | Red glitch flash transitions between every screen |
| 📴 Offline Ready | No internet needed after first load |

---

## 🎬 The Rules (from the show)

```
01 — 소원은 직접 소리 내어 말해야 합니다
     Wishes must be spoken aloud

02 — 하루에 하나의 소원만 허용됩니다
     Only one wish per night (midnight – 4AM)

03 — 소원이 이루어지면 24시간 안에 전달하세요
     Pass it on within 24 hours

04 — 두 번째 소원의 대가는 두 배입니다
     The toll of a second wish is doubled
```

---

## 🗂️ Project Structure

```
girigo/
├── index.html          # All screens (splash, terms, record, transcribe, transmit, countdown, echo)
├── icon.svg            # Praying hands app icon
├── css/
│   └── style.css       # Full dark horror aesthetic styles
├── js/
│   └── app.js          # App logic, camera, speech recognition, countdown, audio
└── README.md
```

---

## 🚀 Getting Started

### Option 1 — Open directly
```bash
git clone https://github.com/YOUR_USERNAME/girigo.git
cd girigo
# Open index.html in Chrome or Edge
```

### Option 2 — Local server (recommended for full features)
```bash
git clone https://github.com/YOUR_USERNAME/girigo.git
cd girigo

# Python
python -m http.server 8000

# Node.js
npx serve .

# Then open: http://localhost:8000
```

### Option 3 — GitHub Pages
1. Push to GitHub
2. Go to **Settings → Pages**
3. Source: `main` branch, `/ (root)`
4. Your app will be live at `https://YOUR_USERNAME.github.io/girigo`

---

## 🌐 Browser Support

| Browser | Camera | Speech Recognition | Audio |
|---|---|---|---|
| Chrome ✅ | ✅ | ✅ | ✅ |
| Edge ✅ | ✅ | ✅ | ✅ |
| Firefox | ✅ | ❌ (text fallback) | ✅ |
| Safari | ✅ | ⚠️ Partial | ✅ |

> Speech recognition requires HTTPS or localhost. Text input fallback always available.

---

## 🔒 Privacy

- Camera and microphone stay **on your device only**
- **Nothing is uploaded** to any server
- No accounts, no tracking, no cookies
- Recorded wish video is stored in memory only (not saved to disk)

---

## 🛠️ Tech Stack

- **HTML5** — semantic structure, all 7 screens
- **CSS3** — CSS variables, keyframe animations, noise texture, grid layout
- **Vanilla JS** — MediaRecorder API, Web Speech API, Web Audio API, Navigator Share API

---

## 📄 License

MIT License — free to use, modify, and share.

---

## ⚠️ Disclaimer

This is an **independent fan project**. Not affiliated with Netflix, Kwonsiwon, or the official Girigo app on Google Play. All series references belong to their respective owners.

*"이름을 소리 내어 말한 것은 구속됩니다"*  
*Names spoken aloud are bound.*
