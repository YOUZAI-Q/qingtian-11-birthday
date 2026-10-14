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
  burst(window.innerWidth * .2, window.innerHeight * .25, 70);
  setTimeout(() => burst(window.innerWidth * .8, window.innerHeight * .3, 70), 280);
});

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

