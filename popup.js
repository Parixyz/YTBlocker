document.addEventListener('DOMContentLoaded', () => {
  const statusValue = document.getElementById('status-value');
  const toggle = document.getElementById('enable-toggle');

  if (!statusValue || !toggle) {
    return;
  }

  if (!chrome?.storage?.sync) {
    statusValue.textContent = 'Unavailable';
    toggle.disabled = true;
    return;
  }

  chrome.storage.sync.get({ blockerEnabled: true }, ({ blockerEnabled }) => {
    const enabled = Boolean(blockerEnabled);
    toggle.checked = enabled;
    statusValue.textContent = enabled ? 'Active ✓' : 'Disabled';
  });

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ blockerEnabled: enabled }, () => {
      statusValue.textContent = enabled ? 'Active ✓' : 'Disabled';
    });
  });
});
