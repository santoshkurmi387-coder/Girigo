'use strict';

// ── helpers ──────────────────────────────────
const $ = id => document.getElementById(id);
let wishText = '';
let countdownInterval = null;
let countdownEnd = null;
let windowInterval = null;
let isRecording = false;
let mediaRecorder = null;
let recognition = null;
let stream = null;

// ── screen switch ─────────────────────────────
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
}

function flashTo(id) {
  document.body.style.background = '#111';
  setTimeout(() => { document.body.style.background = '#000'; show(id); }, 120);
}

// ── time utils ────────────────────────────────
function fmt(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2,'0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2,'0');
  const s = String(sec % 60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}
function windowRemaining() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  if (h >= 4) return 0;
  return (4 * 3600) - (h * 3600 + m * 60 + s);
}

// ── SCREEN 1 → 2 ─────────────────────────────
$('btn-wish').addEventListener('click', () => {
  flashTo('s-camera');
  initCamera();
});

// ── Camera init ───────────────────────────────
async function initCamera() {
  // Window timer
  if (windowInterval) clearInterval(windowInterval);
  const timerEl = $('cam-timer');
  function tick() { timerEl.textContent = fmt(windowRemaining()); }
  tick();
  windowInterval = setInterval(tick, 1000);

  // Camera
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'user' }, audio: true });
    $('video').srcObject = stream;
    $('video').addEventListener('loadeddata', () => {
      $('cam-hands').style.opacity = '0.3';
    });
  } catch(e) {
    $('cam-hint').textContent = '카메라 권한이 필요합니다';
  }

  // Speech recognition
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    recognition = new SR();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.onresult = e => {
      const t = e.results[0][0].transcript.trim();
      if (t) { wishText = t; stopRec(); showReview(t); }
    };
    recognition.onerror = () => { if (isRecording) stopRec(true); };
  }
}

// ── Record button ─────────────────────────────
$('btn-rec').addEventListener('click', () => {
  if (!isRecording) startRec(); else stopRec(true);
});

function startRec() {
  isRecording = true;
  $('btn-rec').classList.add('recording');
  $('rec-badge').style.display = 'flex';
  $('cam-hint').textContent = '소원을 말하세요...';
  $('rec-sub').textContent = '눌러서 중지';
  $('cam-hands').style.opacity = '0.15';

  if (recognition) { try { recognition.start(); } catch(e){} }

  if (stream) {
    try {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
    } catch(e) {}
  }

  // auto-stop after 30s
  setTimeout(() => { if (isRecording) stopRec(true); }, 30000);
}

function stopRec(manual = false) {
  isRecording = false;
  $('btn-rec').classList.remove('recording');
  $('rec-badge').style.display = 'none';
  $('cam-hint').textContent = '카메라를 보고 소원을 말하세요';
  $('rec-sub').textContent = '눌러서 시작';
  $('cam-hands').style.opacity = '0.3';

  if (recognition) { try { recognition.stop(); } catch(e){} }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();

  if (manual && !wishText) {
    // No speech detected — manual input
    showManualInput();
  }
}

// ── Manual text fallback ──────────────────────
function showManualInput() {
  flashTo('s-review');
  const box = document.querySelector('.review-box');
  $('cursor').style.display = 'none';

  let inp = document.getElementById('manual-inp');
  if (!inp) {
    inp = document.createElement('input');
    inp.id = 'manual-inp';
    inp.placeholder = '소원을 입력하세요...';
    inp.autocomplete = 'off';
    inp.style.cssText = `
      display:block; width:100%; background:transparent; border:none;
      border-bottom:1px solid rgba(255,255,255,0.2); color:#fff;
      font-size:16px; padding:8px 0; outline:none;
      font-family:'Noto Sans KR',sans-serif; letter-spacing:0.5px; margin-top:8px;
    `;
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && inp.value.trim()) {
        wishText = inp.value.trim();
        inp.remove();
        $('cursor').style.display = 'inline';
        showReview(wishText);
      }
    });
    box.appendChild(inp);
  }
  setTimeout(() => inp.focus(), 300);
}

// ── Review screen ─────────────────────────────
function showReview(text) {
  flashTo('s-review');
  const el = $('wish-typed');
  const cur = $('cursor');
  el.textContent = '';
  cur.style.display = 'inline';
  $('review-btns').style.display = 'none';

  let i = 0;
  const iv = setInterval(() => {
    if (i < text.length) { el.textContent += text[i++]; }
    else {
      clearInterval(iv);
      cur.style.display = 'none';
      setTimeout(() => { $('review-btns').style.display = 'flex'; }, 400);
    }
  }, 55);
}

$('btn-erase').addEventListener('click', () => {
  wishText = '';
  $('wish-typed').textContent = '';
  flashTo('s-camera');
});

$('btn-send').addEventListener('click', () => {
  flashTo('s-transmit');
  setTimeout(() => {
    flashTo('s-count');
    startCountdown();
  }, 2800);
});

// ── Countdown ─────────────────────────────────
function startCountdown() {
  $('wish-pill').textContent = `"${wishText}"`;
  const dur = 24 * 60 * 60 * 1000;
  countdownEnd = Date.now() + dur;
  if (countdownInterval) clearInterval(countdownInterval);

  function tick() {
    const rem = Math.max(0, Math.floor((countdownEnd - Date.now()) / 1000));
    $('count-digits').textContent = fmt(rem);
    $('count-bar').style.width = (rem / 86400 * 100) + '%';
    if (rem <= 0) clearInterval(countdownInterval);
  }
  tick();
  countdownInterval = setInterval(tick, 1000);
}

$('btn-pass').addEventListener('click', () => {
  const msg = `기리고에서 소원을 빌었습니다.\n"${wishText}"\n\n24시간 안에 전달하세요. — 기리고`;
  if (navigator.share) {
    navigator.share({ title: '기리고', text: msg }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(msg).then(()=> alert('복사됐어요! 친구에게 전달하세요 🙏')).catch(()=>{});
  }
});

$('btn-again').addEventListener('click', () => {
  if (countdownInterval) clearInterval(countdownInterval);
  wishText = '';
  flashTo('s-home');
});
