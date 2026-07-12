const DEBUG_TAPS_REQUIRED = 5;
const DEBUG_TAP_WINDOW_MS = 3000;
const DEBUG_MIN_TAP_GAP_MS = 160;
const DEBUG_MAX_PRESS_MS = 700;

const debugHotspot = document.getElementById("debugHotspot");
const debugPanel = document.getElementById("debugPanel");
const debugCloseButton = document.getElementById("debugCloseButton");
const combatGameTab = document.getElementById("combatGameTab");

let debugTapCount = 0;
let debugSequenceTimer = null;
let lastCountedTapAt = 0;
let armedPointerId = null;
let pointerDownAt = 0;

function resetDebugTapSequence() {
  debugTapCount = 0;
  lastCountedTapAt = 0;
  armedPointerId = null;
  pointerDownAt = 0;

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

function beginDebugTap(event) {
  if (!event.isPrimary || event.button !== 0 || armedPointerId !== null) return;

  armedPointerId = event.pointerId;
  pointerDownAt = performance.now();
  debugHotspot.setPointerCapture?.(event.pointerId);
}

function cancelDebugTap(event) {
  if (event.pointerId !== armedPointerId) return;
  armedPointerId = null;
  pointerDownAt = 0;
}

function finishDebugTap(event) {
  if (!event.isPrimary || event.pointerId !== armedPointerId) return;

  const now = performance.now();
  const pressDuration = now - pointerDownAt;
  armedPointerId = null;
  pointerDownAt = 0;

  if (pressDuration < 0 || pressDuration > DEBUG_MAX_PRESS_MS) return;
  if (lastCountedTapAt > 0 && now - lastCountedTapAt < DEBUG_MIN_TAP_GAP_MS) return;

  lastCountedTapAt = now;
  debugTapCount += 1;

  if (debugTapCount === 1) {
    debugSequenceTimer = window.setTimeout(resetDebugTapSequence, DEBUG_TAP_WINDOW_MS);
  }

  if (debugTapCount === DEBUG_TAPS_REQUIRED) {
    openDebugPanel();
  }
}

debugHotspot.addEventListener("pointerdown", beginDebugTap);
debugHotspot.addEventListener("pointerup", finishDebugTap);
debugHotspot.addEventListener("pointercancel", cancelDebugTap);
debugHotspot.addEventListener("lostpointercapture", cancelDebugTap);
debugCloseButton.addEventListener("click", closeDebugPanel);
combatGameTab.addEventListener("click", closeDebugPanel);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) closeDebugPanel();
});

closeDebugPanel();
