const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Success is not final, failure is not fatal. - Winston Churchill",
  "Your limitation—it's only your imagination.",
  "Great things never came from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it."
];

let blockerEnabled = true;
let lastUrl = location.href;
let playbackGuardInterval = null;

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function isShortsPage() {
  return window.location.pathname.includes('/shorts/');
}

function hideShortsCards() {
  const shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');
  shortsLinks.forEach((el) => {
    const container = el.closest('ytd-rich-item-renderer, ytd-video-renderer');
    if (container && !container.dataset.shortBlockerHidden) {
      container.dataset.shortBlockerHidden = 'true';
      container.style.display = 'none';
    }
  });
}

function restoreHiddenShortsCards() {
  const hidden = document.querySelectorAll('[data-short-blocker-hidden="true"]');
  hidden.forEach((container) => {
    container.style.removeProperty('display');
    delete container.dataset.shortBlockerHidden;
  });
}

function getActiveShortsVideo() {
  return document.querySelector('video.html5-main-video');
}

function blockShortsPlayback() {
  if (!blockerEnabled || !isShortsPage()) {
    return;
  }

  const video = getActiveShortsVideo();
  if (!video) {
    return;
  }

  if (!video.dataset.shortBlockerPreviousMuted) {
    video.dataset.shortBlockerPreviousMuted = String(video.muted);
  }

  video.muted = true;
  video.pause();
}

function restoreShortsPlayback() {
  const video = getActiveShortsVideo();
  if (!video) {
    return;
  }

  if (video.dataset.shortBlockerPreviousMuted) {
    video.muted = video.dataset.shortBlockerPreviousMuted === 'true';
    delete video.dataset.shortBlockerPreviousMuted;
  }
}

function ensurePlaybackGuard() {
  const shouldGuard = blockerEnabled && isShortsPage();

  if (shouldGuard && !playbackGuardInterval) {
    blockShortsPlayback();
    playbackGuardInterval = window.setInterval(blockShortsPlayback, 400);
    return;
  }

  if (!shouldGuard && playbackGuardInterval) {
    clearInterval(playbackGuardInterval);
    playbackGuardInterval = null;
    restoreShortsPlayback();
  }
}

function removeOverlay() {
  const existing = document.getElementById('stay-concentrated-overlay');
  if (existing) {
    existing.remove();
  }
}

function showStayConcentratedDialog() {
  if (!blockerEnabled || !isShortsPage()) {
    removeOverlay();
    return;
  }

  if (document.getElementById('stay-concentrated-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'stay-concentrated-overlay';
  overlay.innerHTML = `
    <div class="quote-container" role="dialog" aria-modal="true" aria-labelledby="stay-concentrated-title">
      <h2 id="stay-concentrated-title">🧠 Stay Concentrated</h2>
      <p class="quote-text">${getRandomQuote()}</p>
      <div class="button-row">
        <button id="back-to-home-btn">Back to YouTube</button>
        <button id="new-quote-btn">New Quote</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('back-to-home-btn')?.addEventListener('click', () => {
    window.location.href = 'https://www.youtube.com';
  });

  document.getElementById('new-quote-btn')?.addEventListener('click', () => {
    const quoteNode = overlay.querySelector('.quote-text');
    if (quoteNode) {
      quoteNode.textContent = getRandomQuote();
    }
  });
}

function runBlockingBehavior() {
  ensurePlaybackGuard();

  if (!blockerEnabled) {
    removeOverlay();
    restoreHiddenShortsCards();
    return;
  }

  hideShortsCards();
  if (isShortsPage()) {
    blockShortsPlayback();
    showStayConcentratedDialog();
  } else {
    removeOverlay();
  }
}

function initializeBlockerState() {
  if (!chrome?.storage?.sync) {
    runBlockingBehavior();
    return;
  }

  chrome.storage.sync.get({ blockerEnabled: true }, (result) => {
    blockerEnabled = Boolean(result.blockerEnabled);
    runBlockingBehavior();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && Object.prototype.hasOwnProperty.call(changes, 'blockerEnabled')) {
      blockerEnabled = Boolean(changes.blockerEnabled.newValue);
      runBlockingBehavior();
    }
  });
}

new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(runBlockingBehavior, 200);
  }
}).observe(document, { subtree: true, childList: true });

window.addEventListener('beforeunload', () => {
  if (playbackGuardInterval) {
    clearInterval(playbackGuardInterval);
    playbackGuardInterval = null;
  }
});

initializeBlockerState();
runBlockingBehavior();
