const musicButton = document.querySelector('#musicButton');
const giftOpening = document.querySelector('#giftOpening');
const giftBox = document.querySelector('#giftBox');
const musicLabel = document.querySelector('#musicLabel');
const musicDock = document.querySelector('#musicDock');
const birthdayPlayer = document.querySelector('#birthdayPlayer');
const minimizeMusic = document.querySelector('#minimizeMusic');
const startButton = document.querySelector('#startButton');
const swapButton = document.querySelector('#swapButton');
const characterStage = document.querySelector('#characterStage');
const wishToast = document.querySelector('#wishToast');
const confettiLayer = document.querySelector('#confetti');

const chapters = [...document.querySelectorAll('.scene')];
const navDots = [...document.querySelectorAll('.dot-nav a')];

giftBox.addEventListener('click', () => {
  giftOpening.classList.add('opened');
  startBirthdaySong();
  const rect = giftBox.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 3, 80);
  setTimeout(() => {
    giftOpening.classList.add('finished');
    document.body.classList.remove('intro-locked');
    document.querySelectorAll('.hero .reveal').forEach((element) => element.classList.add('visible'));
  }, 2400);
}, { once: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
  revealObserver.observe(element);
});

const chapterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const index = chapters.indexOf(entry.target);
    document.querySelector('.chapter-indicator').textContent = entry.target.dataset.chapter;
    navDots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
  });
}, { threshold: 0.46 });
chapters.forEach((chapter) => chapterObserver.observe(chapter));

startButton.addEventListener('click', () => {
  document.querySelector('#eleven').scrollIntoView({ behavior: 'smooth' });
  startBirthdaySong();
  burst(window.innerWidth / 2, window.innerHeight * 0.35, 42);
});

document.querySelectorAll('.star-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.star-card.open').forEach((opened) => opened.classList.remove('open'));
    card.classList.add('open');
    wishToast.textContent = card.dataset.wish;
    wishToast.classList.add('show');
    const rect = card.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
    clearTimeout(window.wishTimer);
    window.wishTimer = setTimeout(() => wishToast.classList.remove('show'), 2800);
  });
});

document.querySelectorAll('.floating-balloon').forEach((balloon) => {
  balloon.addEventListener('click', () => {
    const rect = balloon.getBoundingClientRect();
    balloon.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.18)' },
      { transform: 'scale(.1)', opacity: 0 }
    ], { duration: 420, fill: 'forwards' });
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
  }, { once: true });
});

swapButton.addEventListener('click', () => {
  characterStage.classList.add('swapped');
  setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2, 55), 780);
});

document.querySelector('#celebrateButton').addEventListener('click', () => {
  playCelebrationSound();
  burst(window.innerWidth * .2, window.innerHeight * .25, 70);
  setTimeout(() => burst(window.innerWidth * .8, window.innerHeight * .3, 70), 280);
});

let celebrationAudioContext;

function playCelebrationSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  celebrationAudioContext ||= new AudioContext();
  const context = celebrationAudioContext;
  if (context.state === 'suspended') context.resume();

  const start = context.currentTime + .03;
  const master = context.createGain();
  const fireworksMix = context.createGain();
  const cheersMix = context.createGain();
  const compressor = context.createDynamicsCompressor();
  master.gain.setValueAtTime(.0001, start);
  master.gain.exponentialRampToValueAtTime(1, start + .05);
  master.gain.exponentialRampToValueAtTime(.0001, start + 4.6);
  fireworksMix.gain.value = 2.4;
  cheersMix.gain.value = .62;
  compressor.threshold.value = -7;
  compressor.knee.value = 10;
  compressor.ratio.value = 7;
  compressor.attack.value = .004;
  compressor.release.value = .24;
  fireworksMix.connect(master);
  cheersMix.connect(master);
  master.connect(compressor).connect(context.destination);

  [0, .48, 1.08].forEach((delay, index) => {
    fireworkLaunch(context, fireworksMix, start + delay);
    fireworkBurst(context, fireworksMix, start + delay + .34, index);
  });

  [0, .14, .28, .5, .72, .94].forEach((delay, index) => {
    cheerVoice(context, cheersMix, start + .42 + delay, index);
  });
}

function fireworkLaunch(context, output, time) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(320, time);
  oscillator.frequency.exponentialRampToValueAtTime(1180, time + .3);
  gain.gain.setValueAtTime(.0001, time);
  gain.gain.exponentialRampToValueAtTime(.13, time + .04);
  gain.gain.exponentialRampToValueAtTime(.0001, time + .32);
  oscillator.connect(gain).connect(output);
  oscillator.start(time);
  oscillator.stop(time + .34);
}

function fireworkBurst(context, output, time, variant) {
  const duration = 1.15;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const fade = Math.pow(1 - i / data.length, 2.7);
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  noise.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1700 + variant * 420, time);
  filter.frequency.exponentialRampToValueAtTime(190, time + duration);
  gain.gain.setValueAtTime(.52, time);
  gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
  noise.connect(filter).connect(gain).connect(output);
  noise.start(time);

  const boom = context.createOscillator();
  const boomGain = context.createGain();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(92 + variant * 11, time);
  boom.frequency.exponentialRampToValueAtTime(34, time + .72);
  boomGain.gain.setValueAtTime(.62, time);
  boomGain.gain.exponentialRampToValueAtTime(.0001, time + .78);
  boom.connect(boomGain).connect(output);
  boom.start(time);
  boom.stop(time + .8);

  for (let i = 0; i < 12; i += 1) {
    const spark = context.createOscillator();
    const sparkGain = context.createGain();
    const sparkTime = time + .05 + Math.random() * .82;
    spark.type = 'square';
    spark.frequency.setValueAtTime(900 + Math.random() * 2600, sparkTime);
    sparkGain.gain.setValueAtTime(.035 + Math.random() * .035, sparkTime);
    sparkGain.gain.exponentialRampToValueAtTime(.0001, sparkTime + .035 + Math.random() * .07);
    spark.connect(sparkGain).connect(output);
    spark.start(sparkTime);
    spark.stop(sparkTime + .12);
  }
}

function cheerVoice(context, output, time, index) {
  const oscillator = context.createOscillator();
  const overtone = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const base = 245 + index * 24;
  const length = 1.55 + (index % 3) * .18;

  oscillator.type = 'sawtooth';
  overtone.type = 'sine';
  oscillator.frequency.setValueAtTime(base, time);
  oscillator.frequency.exponentialRampToValueAtTime(base * 1.85, time + .42);
  oscillator.frequency.exponentialRampToValueAtTime(base * 1.42, time + length);
  overtone.frequency.setValueAtTime(base * 2.01, time);
  overtone.frequency.exponentialRampToValueAtTime(base * 3.25, time + .42);
  overtone.frequency.exponentialRampToValueAtTime(base * 2.65, time + length);

  filter.type = 'bandpass';
  filter.frequency.value = 1050 + index * 55;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(.0001, time);
  gain.gain.exponentialRampToValueAtTime(.055, time + .16);
  gain.gain.setValueAtTime(.045, time + .7);
  gain.gain.exponentialRampToValueAtTime(.0001, time + length);

  oscillator.connect(filter);
  overtone.connect(filter);
  filter.connect(gain).connect(output);
  oscillator.start(time);
  overtone.start(time);
  oscillator.stop(time + length);
  overtone.stop(time + length);
}

function burst(x, y, count = 50) {
  const colors = ['#f36f5e', '#f5a340', '#ffd361', '#176f6c', '#3468b2', '#f6b7c2'];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti-piece';
    piece.style.left = `${x + (Math.random() - .5) * 160}px`;
    piece.style.top = `${y + (Math.random() - .5) * 50}px`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > .7 ? '50%' : '1px';
    piece.style.setProperty('--duration', `${1.8 + Math.random() * 1.8}s`);
    piece.style.setProperty('--drift', `${(Math.random() - .5) * 460}px`);
    piece.style.setProperty('--spin', `${(Math.random() - .5) * 1200}deg`);
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 3800);
  }
}

function startBirthdaySong() {
  if (!birthdayPlayer.src) birthdayPlayer.src = birthdayPlayer.dataset.src;
  musicDock.classList.add('open');
  musicButton.classList.add('playing');
  musicButton.setAttribute('aria-pressed', 'true');
  musicLabel.textContent = '收起歌词生日歌';
}

function hideMusicDock() {
  musicDock.classList.remove('open');
  musicButton.setAttribute('aria-pressed', 'false');
  musicLabel.textContent = '打开歌词生日歌';
}

musicButton.addEventListener('click', () => {
  if (!birthdayPlayer.src) {
    startBirthdaySong();
  } else if (musicDock.classList.contains('open')) {
    hideMusicDock();
  } else {
    musicDock.classList.add('open');
    musicButton.setAttribute('aria-pressed', 'true');
    musicLabel.textContent = '收起歌词生日歌';
  }
});
minimizeMusic.addEventListener('click', hideMusicDock);

window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal').forEach((element) => element.classList.add('visible'));
  setTimeout(() => burst(window.innerWidth * .72, window.innerHeight * .2, 22), 600);
});

