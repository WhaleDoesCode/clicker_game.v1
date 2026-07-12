const DEBUG_TAPS_REQUIRED = 5;
const DEBUG_TAP_WINDOW_MS = 2000;

const debugHotspot = document.getElementById("debugHotspot");
const debugPanel = document.getElementById("debugPanel");
const debugCloseButton = document.getElementById("debugCloseButton");
let debugTapTimes = [];

function openDebugPanel() {
  debugPanel.hidden = false;
  debugTapTimes = [];
  debugPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeDebugPanel() {
  debugPanel.hidden = true;
  debugTapTimes = [];
}

function registerDebugTap() {
  const now = Date.now();
  debugTapTimes = debugTapTimes.filter((time) => now - time <= DEBUG_TAP_WINDOW_MS);
  debugTapTimes.push(now);

  if (debugTapTimes.length >= DEBUG_TAPS_REQUIRED) {
    openDebugPanel();
  }
}

debugHotspot.addEventListener("click", registerDebugTap);
debugCloseButton.addEventListener("click", closeDebugPanel);
