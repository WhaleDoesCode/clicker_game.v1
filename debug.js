const DEBUG_TAPS_REQUIRED = 5;
const DEBUG_TAP_WINDOW_MS = 5000;
const DEBUG_RESOURCE_FLOOR = 999999;
const DEBUG_MAX_CURRENT_EQUIPMENT = 99;

const DEBUG_DEFAULTS = {
  infiniteGold: false,
  infiniteWood: false,
  infiniteStone: false,
  infiniteIron: false,
  infiniteHide: false,
  infiniteLeather: false,
  unlockAllEquipment: false,
  maxToolTier: false,
  completeMilestones: false,
  unlockAreas: false,
  freeCrafting: false,
  noCooldowns: false
};

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
let debugStatusEl = null;
let originalCraftItem = typeof window.craftItem === "function" ? window.craftItem : null;

function ensureDebugState() {
  game.debugSettings = {
    ...DEBUG_DEFAULTS,
    ...(game.debugSettings || {})
  };

  game.resources = {
    sticks: 0,
    stonePebbles: 0,
    iron: 0,
    hide: 0,
    leather: 0,
    leatherBinding: 0,
    ...(game.resources || {})
  };

  game.equipment = {
    woodenPickaxe: 0,
    woodenSword: 0,
    woodenHoe: 0,
    equippedTool: null,
    ...(game.equipment || {})
  };
}

function setDebugStatus(message) {
  if (debugStatusEl) debugStatusEl.textContent = message;
}

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
  removeLegacyDebugShell();
  ensureDebugState();
  syncDebugControls();
  applyDebugSettings(true);
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

function grantCurrentEquipment(amount) {
  ensureDebugState();
  let changed = false;

  Object.keys(game.equipment).forEach((key) => {
    if (key === "equippedTool" || typeof game.equipment[key] !== "number") return;
    const nextAmount = Math.max(game.equipment[key], amount);
    if (nextAmount !== game.equipment[key]) {
      game.equipment[key] = nextAmount;
      changed = true;
    }
  });

  return changed;
}

function completeCurrentMilestones() {
  const previous = {
    totalTaps: game.totalTaps || 0,
    lifetimeGold: game.lifetimeGold || 0,
    miners: game.miners || 0,
    claimed: Object.values(game.milestones || {}).filter(Boolean).length
  };

  game.totalTaps = Math.max(previous.totalTaps, 25);
  game.lifetimeGold = Math.max(previous.lifetimeGold, 250);
  game.miners = Math.max(previous.miners, 5);
  if (typeof checkMilestones === "function") checkMilestones();

  const claimedAfter = Object.values(game.milestones || {}).filter(Boolean).length;
  return game.totalTaps !== previous.totalTaps ||
    game.lifetimeGold !== previous.lifetimeGold ||
    game.miners !== previous.miners ||
    claimedAfter !== previous.claimed;
}

function updateUnlockedAreaDisplay() {
  document.querySelectorAll(".future-location").forEach((location) => {
    const isForest = location.classList.contains("active");
    const unlocked = Boolean(game.debugSettings.unlockAreas);
    location.classList.toggle("locked", !isForest && !unlocked);
    location.classList.toggle("debug-unlocked", !isForest && unlocked);

    if (!isForest) {
      const status = location.querySelector("span");
      if (status) status.textContent = unlocked ? "Debug unlocked · gameplay coming later" : "Locked";
    }
  });
}

function syncFreeCraftingButtons() {
  if (!game.debugSettings.freeCrafting) return;

  document.querySelectorAll(".recipe-card button[id^='craft']").forEach((button) => {
    button.disabled = false;
    const cardTitle = button.closest(".recipe-card")?.querySelector("h2")?.textContent;
    if (cardTitle) button.textContent = `Debug Craft ${cardTitle}`;
  });
}

function installFreeCraftingOverride() {
  if (!originalCraftItem && typeof window.craftItem === "function") {
    originalCraftItem = window.craftItem;
  }

  if (!originalCraftItem) return;

  window.craftItem = function debugAwareCraftItem(recipeKey) {
    ensureDebugState();

    if (!game.debugSettings.freeCrafting) {
      return originalCraftItem(recipeKey);
    }

    const recipe = craftingRecipes?.[recipeKey];
    if (!recipe || !(recipeKey in game.equipment)) return;

    game.equipment[recipeKey] += 1;
    craftingElements.status.textContent = `Debug crafted ${recipe.name} for free.`;
    if (typeof renderCrafting === "function") renderCrafting();
    syncFreeCraftingButtons();
    if (typeof renderExploration === "function") renderExploration();
    saveGame();
  };
}

function applyDebugSettings(forceRender = false) {
  ensureDebugState();
  const settings = game.debugSettings;
  let changed = false;

  if (settings.infiniteGold && game.gold < DEBUG_RESOURCE_FLOOR) {
    game.gold = DEBUG_RESOURCE_FLOOR;
    game.lifetimeGold = Math.max(game.lifetimeGold || 0, DEBUG_RESOURCE_FLOOR);
    changed = true;
  }

  const resourceMappings = {
    infiniteWood: "sticks",
    infiniteStone: "stonePebbles",
    infiniteIron: "iron",
    infiniteHide: "hide",
    infiniteLeather: "leather"
  };

  Object.entries(resourceMappings).forEach(([settingKey, resourceKey]) => {
    if (settings[settingKey] && game.resources[resourceKey] < DEBUG_RESOURCE_FLOOR) {
      game.resources[resourceKey] = DEBUG_RESOURCE_FLOOR;
      changed = true;
    }
  });

  if (settings.unlockAllEquipment) {
    changed = grantCurrentEquipment(1) || changed;
  }

  if (settings.maxToolTier) {
    changed = grantCurrentEquipment(DEBUG_MAX_CURRENT_EQUIPMENT) || changed;
  }

  if (settings.completeMilestones) {
    changed = completeCurrentMilestones() || changed;
  }

  if (settings.noCooldowns && game.exploration?.cooldownUntil) {
    game.exploration.cooldownUntil = 0;
    changed = true;
  }

  updateUnlockedAreaDisplay();
  installFreeCraftingOverride();

  if (changed || forceRender) {
    if (typeof render === "function") render();
    if (typeof renderExploration === "function") renderExploration();
    if (typeof renderCrafting === "function") renderCrafting();
  }

  syncFreeCraftingButtons();

  if (changed) saveGame();
}

function handleDebugToggle(event) {
  ensureDebugState();
  const key = event.currentTarget.dataset.debugKey;
  if (!key || !(key in DEBUG_DEFAULTS)) return;

  game.debugSettings[key] = event.currentTarget.checked;
  applyDebugSettings(true);
  saveGame();
  setDebugStatus(`${event.currentTarget.closest("label")?.querySelector("span")?.textContent || key}: ${event.currentTarget.checked ? "ON" : "OFF"}`);
}

function spawnDebugLoot() {
  ensureDebugState();
  const grants = {
    sticks: 25 + Math.floor(Math.random() * 76),
    stonePebbles: 25 + Math.floor(Math.random() * 76),
    iron: 10 + Math.floor(Math.random() * 41),
    hide: 5 + Math.floor(Math.random() * 21),
    leather: 5 + Math.floor(Math.random() * 21),
    leatherBinding: 5 + Math.floor(Math.random() * 21)
  };

  Object.entries(grants).forEach(([resource, amount]) => {
    game.resources[resource] += amount;
  });

  game.gold += 100;
  game.lifetimeGold += 100;
  if (typeof render === "function") render();
  if (typeof renderExploration === "function") renderExploration();
  if (typeof renderCrafting === "function") renderCrafting();
  syncFreeCraftingButtons();
  saveGame();
  setDebugStatus("Spawned a loot bundle and 100 gold.");
}

function syncDebugControls() {
  ensureDebugState();
  debugPanel.querySelectorAll("input[data-debug-key]").forEach((input) => {
    input.checked = Boolean(game.debugSettings[input.dataset.debugKey]);
  });
}

function activateDebugControls() {
  const labelToKey = {
    "Infinite Gold": "infiniteGold",
    "Infinite Wood": "infiniteWood",
    "Infinite Stone": "infiniteStone",
    "Infinite Iron": "infiniteIron",
    "Infinite Hide": "infiniteHide",
    "Infinite Leather": "infiniteLeather",
    "Unlock All Equipment": "unlockAllEquipment",
    "Max Tool Tier": "maxToolTier",
    "Complete Milestones": "completeMilestones",
    "Unlock Areas": "unlockAreas",
    "Free Crafting": "freeCrafting",
    "No Cooldowns": "noCooldowns"
  };

  debugPanel.querySelectorAll(".debug-option").forEach((label) => {
    const input = label.querySelector("input");
    const labelText = label.querySelector("span")?.textContent?.trim();
    const key = labelToKey[labelText];
    if (!input || !key) return;

    input.disabled = false;
    input.dataset.debugKey = key;
    input.addEventListener("change", handleDebugToggle);
    const small = label.querySelector("small");
    if (small) small.textContent = "Ready";
  });

  [...debugPanel.querySelectorAll(".debug-action")].forEach((button) => {
    button.disabled = false;

    if (button.textContent.trim() === "Save Game") {
      button.addEventListener("click", () => {
        saveGame();
        setDebugStatus("Game saved.");
      });
    } else if (button.textContent.trim() === "Reload Game") {
      button.addEventListener("click", () => window.location.reload());
    } else if (button.textContent.trim() === "Spawn Loot") {
      button.addEventListener("click", spawnDebugLoot);
    }
  });

  debugStatusEl = document.createElement("p");
  debugStatusEl.className = "debug-status";
  debugStatusEl.setAttribute("aria-live", "polite");
  debugStatusEl.textContent = "Debug controls are active. Settings save with this game.";
  debugPanel.appendChild(debugStatusEl);

  const intro = debugPanel.querySelector(":scope > p");
  if (intro) intro.textContent = "Debug settings are active and saved on this device.";

  syncDebugControls();
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

activateDebugControls();
ensureDebugState();
applyDebugSettings(true);
closeDebugPanel();

window.setInterval(() => applyDebugSettings(false), 500);
