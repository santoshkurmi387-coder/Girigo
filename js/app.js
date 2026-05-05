/* ═══════════════════════════════════════
   GIRIGO  기리고  — App Logic
   Faithful to the show's mechanics
════════════════════════════════════════ */

'use strict';

// ── State ───────────────────────────────
const state = {
  currentScreen: 'splash',
  mediaStream:   null,
  mediaRecorder: null,
  recordedChunks:[],
  recordedBlob:  null,
  wishText:      '',
  isRecording:   false,
  countdown:     null,   // interval
  countdownEnd:  null,   // timestamp
  windowTimer:   null,   // interval for 4-hour window
  recognizing:   false,
  recognition:   null,
};

// ── DOM refs ─────────────────────────────
const $ = id => document.getElementById(id);

// Screens
const screens = {
  splash:     $('screen-splash'),
  terms:      $('screen-terms'),
  record:     $('screen-record'),
  transcribe: $('screen-transcribe'),
  transmit:   $('screen-transmit'),
  countdown:  $('screen-countdown'),
  echo:       $('screen-echo'),
};

// ── Screen transition ─────────────────────
function goTo(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  state.currentScreen = name;
}

// ── Time Window Logic ─────────────────────
function isInWindow() {
  const h = new Date().getHours();
  return h >= 0 && h < 4;   // midnight to 4am
}

function getWindowRemaining() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  if (!isInWindow()) return 0;
  const totalSec = (4 * 3600) - (h * 3600 + m * 60 + s);
  return Math.max(0, totalSec);
}

function formatTime(totalSeconds) {
  const h  = Math.floor(totalSeconds / 3600);
  const m  = Math.floor((totalSeconds % 3600) / 60);
  const s  = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function startWindowTimer() {
  if (state.windowTimer) clearInterval(state.windowTimer);
  const clk = $('window-timer');
  state.windowTimer = setInterval(() => {
    const rem = getWindowRemaining();
    clk.textContent = formatTime(rem);
    if (rem <= 0) {
      clk.style.color = '#444';
      if (!state.isRecording) {
        clearInterval(state.windowTimer);
      }
    }
  }, 1000);
  clk.textContent = formatTime(getWindowRemaining());
}

// ── Splash ────────────────────────────────
function initSplash() {
  const lock = $('time-lock-msg');
  if (!isInWindow()) {
    lock.textContent = '오전 0시~4시에만 열립니다 · MIDNIGHT – 4AM ONLY';
    lock.style.color = 'var(--red)';
  } else {
    lock.textContent = '';
  }
}

$('btn-enter').addEventListener('click', () => {
  // Show horror flicker then go to terms
  flashGlitch(2, () => goTo('terms'));
});

// ── Terms ─────────────────────────────────
$('btn-agree').addEventListener('click', () => {
  flashGlitch(1, () => {
    goTo('record');
    initRecordScreen();
  });
});

// ── Record Screen ─────────────────────────
async function initRecordScreen() {
  startWindowTimer();
  updateWindowClock();

  // Show the window timer based on real time
  const clk = $('window-timer');
  clk.textContent = formatTime(getWindowRemaining());

  // Attempt camera
  try {
    state.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const video = $('camera-video');
    video.srcObject = state.mediaStream;
    // Hide placeholder hands once camera is live
    video.addEventListener('loadeddata', () => {
      $('center-hands').style.opacity = '0.25';
    });
  } catch (err) {
    // Camera denied – keep hands overlay visible
    console.warn('Camera not available:', err.message);
  }

  // Setup speech recognition if available
  setupSpeechRecognition();
}

function updateWindowClock() {
  const clk = $('window-timer');
  const rem  = getWindowRemaining();
  clk.textContent = formatTime(rem);
}

// ── Speech Recognition ─────────────────────
function setupSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  state.recognition = new SR();
  state.recognition.lang = 'ko-KR';
  state.recognition.interimResults = false;
  state.recognition.maxAlternatives = 1;

  state.recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript.trim();
    if (transcript) {
      state.wishText = transcript;
      stopRecording();
      showTranscription(transcript);
    }
  };
  state.recognition.onerror = () => {
    // Fallback handled in stopRecording
  };
}

// ── Record Button ──────────────────────────
const btnRecord = $('btn-record');
const recDot    = $('rec-dot');
const recLabel  = $('rec-dot-label');
const btnLabel  = $('rec-btn-label');

btnRecord.addEventListener('click', () => {
  if (!state.isRecording) startRecording();
  else stopRecording();
});

function startRecording() {
  state.isRecording = true;
  btnRecord.classList.add('active');
  recDot.classList.add('recording');
  recLabel.textContent = 'REC';
  btnLabel.textContent = '중지 · STOP';
  $('rec-instructions').innerHTML = '<p>소원을 말하세요...</p><small>Speak your wish aloud...</small>';

  // Start speech recognition
  if (state.recognition) {
    try {
      state.recognition.start();
    } catch(e) {}
  }

  // Start media recording
  if (state.mediaStream) {
    try {
      state.recordedChunks = [];
      state.mediaRecorder = new MediaRecorder(state.mediaStream);
      state.mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) state.recordedChunks.push(e.data);
      };
      state.mediaRecorder.onstop = () => {
        state.recordedBlob = new Blob(state.recordedChunks, { type: 'video/webm' });
      };
      state.mediaRecorder.start();
    } catch(e) {}
  }

  // Auto-stop after 60s max
  setTimeout(() => {
    if (state.isRecording) stopRecording();
  }, 60000);
}

function stopRecording() {
  if (!state.isRecording) return;
  state.isRecording = false;
  btnRecord.classList.remove('active');
  recDot.classList.remove('recording');
  recLabel.textContent = 'READY';
  btnLabel.textContent = '소원 말하기';
  $('rec-instructions').innerHTML = '<p>카메라를 바라보고 소원을 말하세요</p><small>Look into the camera and speak your wish</small>';

  if (state.recognition) {
    try { state.recognition.stop(); } catch(e) {}
  }
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
  }

  // If we don't have speech recognition result, show prompt for manual input
  if (!state.wishText) {
    flashGlitch(1, () => showManualWishInput());
  }
}

// ── Manual fallback (if no speech recognition) ──
function showManualWishInput() {
  // Show transcription screen with a prompt for typing
  goTo('transcribe');
  const wishDisplay = $('wish-text-display');
  const cursor      = $('typing-cursor');

  wishDisplay.textContent = '';
  cursor.style.display    = 'inline';
  $('trans-actions').style.display = 'none';

  // Add a text input dynamically
  const inp = document.createElement('input');
  inp.type        = 'text';
  inp.placeholder = '소원을 입력하세요...';
  inp.style.cssText = `
    width:100%; background:transparent; border:none; border-bottom:1px solid #444;
    color:#f0f0f0; font-size:15px; padding:8px 0; outline:none;
    font-family:inherit; letter-spacing:1px; margin-top:10px;
  `;
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && inp.value.trim()) {
      state.wishText = inp.value.trim();
      inp.remove();
      showTranscription(state.wishText);
    }
  });

  const box = document.querySelector('.transcribe-box');
  box.appendChild(inp);
  inp.focus();
}

// ── Transcription Screen ───────────────────
function showTranscription(text) {
  goTo('transcribe');
  const display = $('wish-text-display');
  const cursor  = $('typing-cursor');
  const actions = $('trans-actions');

  display.textContent = '';
  cursor.style.display = 'inline';
  actions.style.display = 'none';

  // Typing effect
  let i = 0;
  const typingInterval = setInterval(() => {
    if (i < text.length) {
      display.textContent += text[i++];
    } else {
      clearInterval(typingInterval);
      cursor.style.display = 'none';
      setTimeout(() => {
        actions.style.display = 'flex';
      }, 400);
    }
  }, 60);
}

$('btn-erase').addEventListener('click', () => {
  state.wishText = '';
  flashGlitch(1, () => goTo('record'));
});

$('btn-submit').addEventListener('click', () => {
  flashGlitch(2, () => {
    goTo('transmit');
    runTransmission();
  });
});

// ── Transmission ───────────────────────────
function runTransmission() {
  setTimeout(() => {
    flashGlitch(3, () => {
      goTo('countdown');
      startCountdown();
    });
  }, 3000);
}

// ── Countdown Screen ───────────────────────
function startCountdown() {
  $('wish-display-countdown').textContent = `"${state.wishText}"`;

  // 24 hours in ms
  const duration = 24 * 60 * 60 * 1000;
  state.countdownEnd = Date.now() + duration;

  if (state.countdown) clearInterval(state.countdown);

  function tick() {
    const remaining = Math.max(0, state.countdownEnd - Date.now());
    const totalSec  = Math.floor(remaining / 1000);
    $('countdown-display').textContent = formatTime(totalSec);

    // Update bar
    const pct = remaining / duration * 100;
    $('countdown-bar').style.width = pct + '%';

    if (remaining <= 0) {
      clearInterval(state.countdown);
      $('countdown-display').textContent = '00:00:00';
      $('countdown-display').style.color = '#ff4444';
    }
  }

  tick();
  state.countdown = setInterval(tick, 1000);
}

$('btn-pass').addEventListener('click', () => {
  // "Pass it on" — show a simple share dialog or just show echo screen
  const shareText = `나는 기리고에서 소원을 빌었습니다. 당신도 24시간 안에 전달하세요.\n"${state.wishText}"\n\n— 기리고 앱`;
  if (navigator.share) {
    navigator.share({
      title: '기리고 · Girigo',
      text: shareText,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('📋 복사되었습니다 · Copied to clipboard!\n\n소원을 다른 사람에게 전달하세요.');
    }).catch(() => {
      alert('전달 기능을 사용하려면 HTTPS가 필요합니다.\n\n소원: ' + state.wishText);
    });
  }
});

$('btn-reset').addEventListener('click', () => {
  if (state.countdown) clearInterval(state.countdown);
  state.wishText = '';
  flashGlitch(2, () => {
    goTo('splash');
    initSplash();
  });
});

// ── Echo Screen ────────────────────────────
$('btn-echo-close').addEventListener('click', () => {
  goTo('countdown');
});

// Random echo trigger while on countdown
function maybeShowEcho() {
  if (state.currentScreen !== 'countdown') return;
  // 15% chance every 2 minutes
  const r = Math.random();
  if (r < 0.15) {
    flashGlitch(2, () => goTo('echo'));
  }
}
setInterval(maybeShowEcho, 120000);

// ── Glitch Effect ──────────────────────────
function flashGlitch(intensity, cb) {
  let overlay = document.getElementById('glitch-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'glitch-overlay';
    document.body.appendChild(overlay);
    overlay.innerHTML = '<div class="glitch-line"></div>';
  }
  overlay.style.display = 'block';
  overlay.style.background = `rgba(200,0,0,${0.04 * intensity})`;

  let flickers = intensity * 3;
  const interval = setInterval(() => {
    overlay.style.opacity = Math.random() > 0.5 ? '1' : '0';
    flickers--;
    if (flickers <= 0) {
      clearInterval(interval);
      overlay.style.display = 'none';
      if (cb) cb();
    }
  }, 60);
}

// ── Ambient audio illusion ────────────────
// Using Web Audio API to create eerie low-frequency drones
function createAmbienceAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Low drone
    function createDrone(freq, gainVal) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return { osc, gain };
    }

    const d1 = createDrone(55,  0.04);
    const d2 = createDrone(82,  0.02);
    const d3 = createDrone(110, 0.015);

    // Subtle LFO modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value  = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(d1.osc.frequency);
    lfo.start();

    // Occasional low thud
    function playThud() {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }
      const src  = ctx.createBufferSource();
      const g    = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type            = 'lowpass';
      filt.frequency.value = 80;
      g.gain.value = 0.3;
      src.buffer = buf;
      src.connect(filt);
      filt.connect(g);
      g.connect(ctx.destination);
      src.start();
    }

    // Play a thud on screen transitions
    window._playThud = playThud;
    // Schedule occasional thuds
    setInterval(() => {
      if (['countdown','transmit'].includes(state.currentScreen)) {
        playThud();
      }
    }, 8000 + Math.random() * 12000);

  } catch(e) {
    // Audio not critical
  }
}

// ── Init ───────────────────────────────────
initSplash();

// Start ambient audio on first user interaction
document.addEventListener('click', () => {
  createAmbienceAudio();
}, { once: true });
