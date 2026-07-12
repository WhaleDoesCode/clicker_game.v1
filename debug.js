const DEBUG_TAPS_REQUIRED = 5;
const DEBUG_TAP_WINDOW_MS = 5000;

function removeLegacyDebugShell() {
  document.getElementById("combatDebugTrigger")?.remove();
  document.getElementById("combatDebugPanel")?.remove();
}

removeLegacyDebugShell();

const debugHotspot = document.getElementById("debugHotspot");
const debugPanel = document.getElementById("debugPanel");
const debugCloseButton = document.getElementById("debugCloseButton");
const combatGameTab = document.getElementById("combatGameTab");

let debugTapCount = 0;
let debugSequenceTimer = null;

function resetDebugTapSequence() {
  debugTapCount = 0;

  if (debugSequenceTimer) {
    window.clearTimeout(debugSequenceTimer);
    debugSequenceTimer = null;
  }
}

function closeDebugPanel() {
  debugPanel.classList.remove("is-open");
  debugPanel.hidden = true;
  resetDebugTapSequence();
}

function openDebugPanel() {
  debugPanel.hidden = false;
  debugPanel.classList.add("is-open");
  resetDebugTapSequence();
  debugPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function registerDebugTap(event) {
  event.preventDefault();
  debugTapCount += 1;

  if (debugTapCount === 1) {
    debugSequenceTimer = window.setTimeout(resetDebugTapSequence, DEBUG_TAP_WINDOW_MS);
  }

  if (debugTapCount === DEBUG_TAPS_REQUIRED) {
    openDebugPanel();
  }
}

debugHotspot.addEventListener("click", registerDebugTap);
debugCloseButton.addEventListener("click", closeDebugPanel);
combatGameTab.addEventListener("click", () => {
  removeLegacyDebugShell();
  closeDebugPanel();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) closeDebugPanel();
});

closeDebugPanel();
