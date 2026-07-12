const DEBUG_TAPS_REQUIRED = 5;
const DEBUG_TAP_WINDOW_MS = 2000;
const DEBUG_MIN_TAP_GAP_MS = 80;

const debugHotspot = document.getElementById("debugHotspot");
const debugPanel = document.getElementById("debugPanel");
const debugCloseButton = document.getElementById("debugCloseButton");
const combatGameTab = document.getElementById("combatGameTab");
let debugTapCount = 0;
let debugTapWindowTimer = null;
let lastDebugTapAt = 0;

function resetDebugTapSequence() {
  debugTapCount = 0;
  lastDebugTapAt = 0;

  if (debugTapWindowTimer) {
    window.clearTimeout(debugTapWindowTimer);
    debugTapWindowTimer = null;
  }
}

function openDebugPanel() {
  debugPanel.hidden = false;
  resetDebugTapSequence();
  debugPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function closeDebugPanel() {
  debugPanel.hidden = true;
  resetDebugTapSequence();
}

function registerDebugTap(event) {
  if (event.pointerType && event.isPrimary === false) return;

  const now = performance.now();
  if (now - lastDebugTapAt < DEBUG_MIN_TAP_GAP_MS) return;

  lastDebugTapAt = now;
  debugTapCount += 1;

  if (debugTapCount === 1) {
    debugTapWindowTimer = window.setTimeout(resetDebugTapSequence, DEBUG_TAP_WINDOW_MS);
  }

  if (debugTapCount >= DEBUG_TAPS_REQUIRED) {
    openDebugPanel();
  }
}

debugPanel.hidden = true;
resetDebugTapSequence();
debugHotspot.addEventListener("pointerup", registerDebugTap);
debugCloseButton.addEventListener("click", closeDebugPanel);
combatGameTab.addEventListener("click", resetDebugTapSequence);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) resetDebugTapSequence();
});
