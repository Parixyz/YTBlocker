let blockerEnabled = true;
let lastUrl = location.href;
let playbackGuardInterval = null;
let redirectingToQuotePage = false;

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

function stopAllMediaPlayback() {
  const mediaElements = document.querySelectorAll('video, audio');
  mediaElements.forEach((media) => {
    if (!media.dataset.shortBlockerPreviousMuted) {
      media.dataset.shortBlockerPreviousMuted = String(media.muted);
    }

    media.muted = true;
    media.volume = 0;

    try {
      media.pause();
      media.currentTime = 0;
    } catch (error) {
      // Ignore media timing errors while force-stopping Shorts playback.
    }
  });
}


function blockShortsPlayback() {
  stopAllMediaPlayback();
}

function restoreShortsPlayback() {
  const mediaElements = document.querySelectorAll('video, audio');
  mediaElements.forEach((media) => {
    if (media.dataset.shortBlockerPreviousMuted) {
      media.muted = media.dataset.shortBlockerPreviousMuted === 'true';
      delete media.dataset.shortBlockerPreviousMuted;
    }
  });
}

function ensurePlaybackGuard() {
  const shouldGuard = blockerEnabled && isShortsPage();

  if (shouldGuard && !playbackGuardInterval) {
    stopAllMediaPlayback();
    playbackGuardInterval = window.setInterval(stopAllMediaPlayback, 80);
    return;
  }

  if (!shouldGuard && playbackGuardInterval) {
    clearInterval(playbackGuardInterval);
    playbackGuardInterval = null;
    restoreShortsPlayback();
  }
}

function redirectToQuotePage() {
  if (redirectingToQuotePage) {
    return;
  }

  redirectingToQuotePage = true;
  const quoteUrl = chrome.runtime.getURL('quote.html');
  const currentUrl = encodeURIComponent(window.location.href);
  const fullQuoteUrl = `${quoteUrl}?from=${currentUrl}`;
  window.location.replace(fullQuoteUrl);
}

function runBlockingBehavior() {
  ensurePlaybackGuard();

  if (!blockerEnabled) {
    restoreHiddenShortsCards();
    return;
  }

  hideShortsCards();
  if (isShortsPage()) {
    stopAllMediaPlayback();
    redirectToQuotePage();
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
    setTimeout(runBlockingBehavior, 0);
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
