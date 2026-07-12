const EXPLORATION_COOLDOWN_MS = 900;
const MAX_EXPLORATION_LOG_ENTRIES = 5;

const explorationDefaults = {
  resources: {
    sticks: 0,
    stonePebbles: 0,
    hide: 0,
    leather: 0,
    leatherBinding: 0
  },
  exploration: {
    totalTrips: 0,
    currentLocation: "forest",
    cooldownUntil: 0,
    log: []
  }
};

const sticksCountEl = document.getElementById("sticksCount");
const stonePebblesCountEl = document.getElementById("stonePebblesCount");
const hideCountEl = document.getElementById("hideCount");
const explorationTripsEl = document.getElementById("explorationTrips");
const exploreButton = document.getElementById("exploreButton");
const exploreCooldownTextEl = document.getElementById("exploreCooldownText");
const exploreLogEl = document.getElementById("exploreLog");
const exploringGameTab = document.getElementById("exploringGameTab");
let explorationCooldownTimer = null;

function ensureExplorationState() {
  const savedResources = game.resources || {};
  const savedExploration = game.exploration || {};

  game.resources = { ...explorationDefaults.resources, ...savedResources };
  game.exploration = {
    ...explorationDefaults.exploration,
    ...savedExploration,
    log: Array.isArray(savedExploration.log)
      ? savedExploration.log.slice(0, MAX_EXPLORATION_LOG_ENTRIES)
      : []
  };
}

function getExplorationResult() {
  const roll = Math.random();
  if (roll < 0.30) return { resource: null, amount: 0, message: "The forest was quiet. You found nothing useful." };
  if (roll < 0.62) return { resource: "sticks", amount: 1, message: "You found a sturdy stick." };
  if (roll < 0.74) return { resource: "sticks", amount: 2, message: "You gathered two useful sticks." };
  if (roll < 0.89) return { resource: "stonePebbles", amount: 1, message: "You kicked over a loose stone pebble." };
  if (roll < 0.96) return { resource: "stonePebbles", amount: 2, message: "You found two smooth stone pebbles." };
  return { resource: "hide", amount: 1, message: "You discovered a usable animal hide near an old trail." };
}

function addExplorationLog(message) {
  game.exploration.log.unshift(message);
  game.exploration.log = game.exploration.log.slice(0, MAX_EXPLORATION_LOG_ENTRIES);
}

function renderExplorationLog() {
  exploreLogEl.replaceChildren();
  const entries = game.exploration.log.length ? game.exploration.log : ["The trail is waiting."];
  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    exploreLogEl.appendChild(item);
  });
}

function getCooldownRemaining() {
  return Math.max(0, game.exploration.cooldownUntil - Date.now());
}

function finishExplorationCooldown() {
  explorationCooldownTimer = null;
  game.exploration.cooldownUntil = 0;
  renderExploration();
  saveGame();
}

function renderExploration() {
  ensureExplorationState();
  sticksCountEl.textContent = formatNumber(game.resources.sticks);
  stonePebblesCountEl.textContent = formatNumber(game.resources.stonePebbles);
  hideCountEl.textContent = formatNumber(game.resources.hide);
  explorationTripsEl.textContent = formatNumber(game.exploration.totalTrips);
  renderExplorationLog();

  const remaining = getCooldownRemaining();
  exploreButton.disabled = remaining > 0;
  exploreButton.textContent = remaining > 0 ? "Exploring..." : "Explore the Forest";
  exploreCooldownTextEl.textContent = remaining > 0
    ? `Returning in ${(remaining / 1000).toFixed(1)} seconds.`
    : "Ready to explore.";

  if (explorationCooldownTimer) window.clearTimeout(explorationCooldownTimer);
  explorationCooldownTimer = remaining > 0
    ? window.setTimeout(finishExplorationCooldown, remaining + 30)
    : null;
}

function exploreForest() {
  ensureExplorationState();
  if (getCooldownRemaining() > 0) {
    renderExploration();
    return;
  }

  const result = getExplorationResult();
  game.exploration.totalTrips += 1;
  if (result.resource) game.resources[result.resource] += result.amount;
  addExplorationLog(result.message);
  game.exploration.cooldownUntil = Date.now() + EXPLORATION_COOLDOWN_MS;
  renderExploration();
  if (typeof renderCrafting === "function") renderCrafting();
  saveGame();
}

exploreButton.addEventListener("click", exploreForest);
exploringGameTab.addEventListener("click", renderExploration);
resetButton.addEventListener("click", () => {
  ensureExplorationState();
  renderExploration();
  if (typeof renderCrafting === "function") renderCrafting();
  saveGame();
});

ensureExplorationState();
renderExploration();
saveGame();
