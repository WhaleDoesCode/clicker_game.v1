const EXPLORATION_COOLDOWN_MS = 900;
const MAX_EXPLORATION_LOG_ENTRIES = 5;

const EXPLORATION_LOOT_TABLES = {
  forest: [
    { weight: 28, resource: null, amount: 0, message: "The Forest was quiet. You found nothing useful." },
    { weight: 31, resource: "sticks", amount: 1, message: "You found a sturdy stick in the Forest." },
    { weight: 11, resource: "sticks", amount: 2, message: "You gathered two useful sticks in the Forest." },
    { weight: 15, resource: "stonePebbles", amount: 1, message: "You kicked over a loose stone pebble in the Forest." },
    { weight: 7, resource: "stonePebbles", amount: 2, message: "You found two smooth stone pebbles in the Forest." },
    { weight: 4, resource: "hide", amount: 1, message: "You discovered a usable animal hide near an old forest trail." },
    { weight: 4, resource: "locationClues", amount: 1, message: "You found a location clue pointing toward a rocky trail." }
  ],
  rockyTrail: [
    { weight: 20, resource: null, amount: 0, message: "The Rocky Trail yielded nothing this time." },
    { weight: 25, resource: "stonePebbles", amount: 1, message: "You chipped loose one stone pebble on the Rocky Trail." },
    { weight: 18, resource: "stonePebbles", amount: 2, message: "You gathered two stone pebbles from the Rocky Trail." },
    { weight: 7, resource: "stonePebbles", amount: 3, message: "You pried three stone pebbles from a rocky shelf." },
    { weight: 15, resource: "ironOre", amount: 1, message: "You found one iron ore vein on the Rocky Trail." },
    { weight: 5, resource: "ironOre", amount: 2, message: "You found two chunks of iron ore on the Rocky Trail." },
    { weight: 8, resource: "coal", amount: 1, message: "You collected a piece of coal beside the Rocky Trail." },
    { weight: 2, resource: "locationClues", amount: 1, message: "You found another location clue beyond the Rocky Trail." }
  ]
};

const EXPEDITION_UPGRADES = {
  compass: { name: "Compass", costs: [{ sticks: 5, stonePebbles: 5 }, { sticks: 10, stonePebbles: 10, leatherBinding: 1 }, { sticks: 15, stonePebbles: 15, leatherBinding: 2, ironIngot: 2 }] },
  trailBoots: { name: "Trail Boots", costs: [{ leather: 2, leatherBinding: 1 }, { leather: 4, leatherBinding: 2, ironIngot: 1 }, { leather: 6, leatherBinding: 3, ironIngot: 3 }] },
  backpack: { name: "Backpack", costs: [{ sticks: 8, leather: 2 }, { sticks: 12, leather: 3, leatherBinding: 2 }, { sticks: 20, leather: 5, leatherBinding: 3, ironIngot: 2 }] }
};

const locationNames = { forest: "Forest", rockyTrail: "Rocky Trail", oldRuins: "Old Ruins", snowfields: "Snowfields" };
const sticksCountEl = document.getElementById("sticksCount");
const stonePebblesCountEl = document.getElementById("stonePebblesCount");
const hideCountEl = document.getElementById("hideCount");
const coalCountEl = document.getElementById("coalCount");
const cluesCountEl = document.getElementById("locationCluesCount");
const explorationTripsEl = document.getElementById("explorationTrips");
const exploreButton = document.getElementById("exploreButton");
const exploreCooldownTextEl = document.getElementById("exploreCooldownText");
const exploreLogEl = document.getElementById("exploreLog");
const exploringGameTab = document.getElementById("exploringGameTab");
const locationCards = document.querySelectorAll(".future-location[data-location]");
const upgradeButtons = document.querySelectorAll("[data-expedition-upgrade]");
let explorationCooldownTimer = null;

function ensureExplorationState() { game = normalizeGameState(game); }
function explorationFreeCrafting() { return Boolean(game.debugSettings?.freeCrafting); }
function noExplorationCooldowns() { return Boolean(game.debugSettings?.noCooldowns); }
function getExplorationCooldownDuration() {
  if (noExplorationCooldowns()) return 0;
  const boots = game.exploration.upgrades.trailBoots || 0;
  const veteran = game.milestones?.trailVeteran ? 0.9 : 1;
  return Math.round(EXPLORATION_COOLDOWN_MS * Math.max(0.1, 1 - boots * 0.1) * veteran);
}
function weightedRoll(table) {
  let roll = Math.random() * 100;
  for (const entry of table) { if ((roll -= entry.weight) < 0) return { ...entry }; }
  return { ...table[table.length - 1] };
}
function getAdjustedLootTable(location) {
  const table = EXPLORATION_LOOT_TABLES[location] || EXPLORATION_LOOT_TABLES.forest;
  const compassShift = (game.exploration.upgrades.compass || 0) * 2 + (game.milestones?.trailFinder ? 5 : 0);
  const nothing = table.find((e) => !e.resource);
  if (!nothing || compassShift <= 0) return table;
  const shift = Math.min(nothing.weight, compassShift);
  const usefulWeight = 100 - nothing.weight;
  return table.map((entry) => entry.resource ? { ...entry, weight: entry.weight + shift * (entry.weight / usefulWeight) } : { ...entry, weight: entry.weight - shift });
}
function getExplorationResult(location) { return weightedRoll(getAdjustedLootTable(location)); }
function addExplorationLog(message) { game.exploration.log.unshift(message); game.exploration.log = game.exploration.log.slice(0, MAX_EXPLORATION_LOG_ENTRIES); }
function renderExplorationLog() {
  exploreLogEl.replaceChildren();
  (game.exploration.log.length ? game.exploration.log : ["The trail is waiting."]).forEach((entry) => { const item = document.createElement("li"); item.textContent = entry; exploreLogEl.appendChild(item); });
}
function getCooldownRemaining() { return Math.max(0, game.exploration.cooldownUntil - Date.now()); }
function finishExplorationCooldown() { explorationCooldownTimer = null; game.exploration.cooldownUntil = 0; renderExploration(); saveGame(); }
function canUnlockRockyTrail() { return game.resources.locationClues >= 3 && game.exploration.forestTrips >= 12; }
function updateLocationUnlocks() { if (canUnlockRockyTrail()) game.exploration.unlockedLocations.rockyTrail = true; }
function formatCost(cost) { return Object.entries(cost).map(([r,a]) => `${a} ${resourceLabels?.[r] || r}`).join(", "); }
function canAfford(cost) { return explorationFreeCrafting() || Object.entries(cost).every(([r,a]) => (game.resources[r] || 0) >= a); }
function renderExpeditionUpgrades() {
  upgradeButtons.forEach((button) => {
    const key = button.dataset.expeditionUpgrade;
    const level = game.exploration.upgrades[key] || 0;
    const card = button.closest(".expedition-upgrade");
    card.querySelector("[data-upgrade-level]").textContent = `${level}/3`;
    card.querySelector("[data-upgrade-effect]").textContent = key === "compass" ? `-${level * 2}% Nothing, +${game.milestones.trailFinder ? 5 : 0}% milestone luck` : key === "trailBoots" ? `${level * 10}% faster cooldown` : `${[0,15,25,35][level]}% double material haul`;
    if (level >= 3) { button.disabled = true; button.textContent = "Max Level"; card.querySelector("[data-upgrade-cost]").textContent = "Max Level"; return; }
    const cost = EXPEDITION_UPGRADES[key].costs[level];
    card.querySelector("[data-upgrade-cost]").textContent = `Next: ${formatCost(cost)}`;
    button.disabled = !canAfford(cost);
    button.textContent = canAfford(cost) ? `${explorationFreeCrafting() ? "Debug " : ""}Upgrade` : `Need ${formatCost(cost)}`;
  });
}
function renderExplorationMilestones() {
  document.querySelectorAll("[data-trail-milestone]").forEach((card) => {
    const key = card.dataset.trailMilestone;
    const done = Boolean(game.milestones[key]);
    card.classList.toggle("claimed", done);
    const status = card.querySelector("small");
    if (key === "trailFinder") status.textContent = done ? "Claimed" : `${game.exploration.unlockedLocations.rockyTrail ? 1 : 0}/1 Rocky Trail unlocked`;
    if (key === "trailVeteran") status.textContent = done ? "Claimed" : `${game.exploration.totalTrips}/50 trips`;
    if (key === "ironworker") status.textContent = done ? "Claimed" : `${game.furnace?.lifetimeBatches || 0}/25 batches`;
  });
}
function checkExplorationMilestones() {
  if (game.exploration.unlockedLocations.rockyTrail && !game.milestones.trailFinder) game.milestones.trailFinder = true;
  if (game.exploration.totalTrips >= 50 && !game.milestones.trailVeteran) game.milestones.trailVeteran = true;
  if ((game.furnace?.lifetimeBatches || 0) >= 25 && !game.milestones.ironworker) game.milestones.ironworker = true;
}
function renderExploration() {
  ensureExplorationState(); updateLocationUnlocks(); checkExplorationMilestones();
  sticksCountEl.textContent = formatNumber(game.resources.sticks); stonePebblesCountEl.textContent = formatNumber(game.resources.stonePebbles); hideCountEl.textContent = formatNumber(game.resources.hide); coalCountEl.textContent = formatNumber(game.resources.coal); cluesCountEl.textContent = formatNumber(game.resources.locationClues);
  explorationTripsEl.textContent = `${formatNumber(game.exploration.totalTrips)} total · Forest ${formatNumber(game.exploration.forestTrips)} · Trail ${formatNumber(game.exploration.rockyTrailTrips)}`;
  locationCards.forEach((card) => { const loc = card.dataset.location; const unlocked = Boolean(game.exploration.unlockedLocations[loc]); card.classList.toggle("active", game.exploration.currentLocation === loc); card.classList.toggle("locked", !unlocked); card.querySelector("span").textContent = loc === "rockyTrail" && !unlocked ? `Clues: ${Math.min(game.resources.locationClues,3)}/3 · Forest trips: ${Math.min(game.exploration.forestTrips,12)}/12` : unlocked ? (game.exploration.currentLocation === loc ? "Selected" : "Available") : "Locked"; });
  renderExplorationLog(); renderExpeditionUpgrades(); renderExplorationMilestones();
  const remaining = getCooldownRemaining(); const selected = locationNames[game.exploration.currentLocation] || "Forest";
  exploreButton.disabled = remaining > 0; exploreButton.textContent = remaining > 0 ? "Exploring..." : `Explore ${selected}`;
  exploreCooldownTextEl.textContent = remaining > 0 ? `Returning in ${(remaining / 1000).toFixed(1)} seconds.` : `Ready to explore ${selected}.`;
  if (explorationCooldownTimer) window.clearTimeout(explorationCooldownTimer);
  explorationCooldownTimer = remaining > 0 ? window.setTimeout(finishExplorationCooldown, remaining + 30) : null;
}
function selectLocation(location) { ensureExplorationState(); updateLocationUnlocks(); if (!game.exploration.unlockedLocations[location]) return; game.exploration.currentLocation = location; renderExploration(); saveGame(); }
function exploreSelectedLocation() {
  ensureExplorationState(); updateLocationUnlocks(); if (getCooldownRemaining() > 0) return renderExploration();
  const location = game.exploration.currentLocation || "forest"; const result = getExplorationResult(location); let amount = result.amount;
  const canDouble = result.resource && result.resource !== "locationClues"; const doubleChance = [0, .15, .25, .35][game.exploration.upgrades.backpack || 0] || 0; const doubled = canDouble && Math.random() < doubleChance; if (doubled) amount *= 2;
  game.exploration.totalTrips += 1; if (location === "rockyTrail") game.exploration.rockyTrailTrips += 1; else game.exploration.forestTrips += 1;
  if (result.resource) game.resources[result.resource] += amount;
  addExplorationLog(`[${locationNames[location]}] ${result.message}${doubled ? " Backpack doubled the haul!" : ""}`);
  game.exploration.cooldownUntil = Date.now() + getExplorationCooldownDuration();
  renderExploration(); if (typeof renderCrafting === "function") renderCrafting(); saveGame();
}
function buyExpeditionUpgrade(key) { ensureExplorationState(); const level = game.exploration.upgrades[key] || 0; if (level >= 3) return; const cost = EXPEDITION_UPGRADES[key].costs[level]; if (!canAfford(cost)) return renderExploration(); if (!explorationFreeCrafting()) Object.entries(cost).forEach(([r,a]) => game.resources[r] -= a); game.exploration.upgrades[key] = level + 1; renderExploration(); if (typeof renderCrafting === "function") renderCrafting(); saveGame(); }

exploreButton.addEventListener("click", exploreSelectedLocation);
locationCards.forEach((card) => card.addEventListener("click", () => selectLocation(card.dataset.location)));
upgradeButtons.forEach((button) => button.addEventListener("click", () => buyExpeditionUpgrade(button.dataset.expeditionUpgrade)));
exploringGameTab.addEventListener("click", renderExploration);
resetButton.addEventListener("click", () => { ensureExplorationState(); renderExploration(); saveGame(); });

window.EXPLORATION_LOOT_TABLES = EXPLORATION_LOOT_TABLES;
window.EXPEDITION_UPGRADES = EXPEDITION_UPGRADES;
window.renderExploration = renderExploration;
window.checkExplorationMilestones = checkExplorationMilestones;
ensureExplorationState(); renderExploration(); saveGame();
