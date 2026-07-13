const SAVE_KEY = "clickerGameSaveV1";

const BASE_GAME_DEFAULTS = {
  gold: 0, tapPower: 1, miners: 0, tapUpgradeCost: 10, minerCost: 25, critChance: 0.1, lifetimeGold: 0, totalTaps: 0,
  milestones: { tapApprentice: false, goldCollector: false, crewBoss: false, trailFinder: false, trailVeteran: false, ironworker: false },
  resources: { sticks: 0, stonePebbles: 0, hide: 0, leather: 0, leatherBinding: 0, ironOre: 0, ironIngot: 0, coal: 0, locationClues: 0 },
  equipment: { woodenPickaxe: 0, woodenSword: 0, woodenHoe: 0, ironPickaxe: 0, ironSword: 0, ironHoe: 0, equippedTool: null },
  exploration: { totalTrips: 0, forestTrips: 0, rockyTrailTrips: 0, currentLocation: "forest", cooldownUntil: 0, log: [], unlockedLocations: { forest: true, rockyTrail: false, oldRuins: false, snowfields: false }, upgrades: { compass: 0, trailBoots: 0, backpack: 0 } },
  furnace: { unlocked: false, level: 0, queuedBatches: 0, queueStartedAt: 0, lifetimeBatches: 0 },
  workers: { goldMiners: 0, ironMiners: 0, lastIronAt: Date.now() },
  lastPlayed: Date.now()
};

function deepMergeDefaults(defaults, saved) {
  const result = Array.isArray(defaults) ? [] : { ...defaults };
  Object.entries(saved || {}).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value) && defaults[key] && typeof defaults[key] === "object" && !Array.isArray(defaults[key])) {
      result[key] = deepMergeDefaults(defaults[key], value);
    } else {
      result[key] = value;
    }
  });
  return result;
}

function normalizeGameState(target = game) {
  const legacyIron = target?.resources && Number.isFinite(target.resources.iron) ? target.resources.iron : null;
  const normalized = deepMergeDefaults(BASE_GAME_DEFAULTS, target || {});
  if (legacyIron !== null && (!Number.isFinite(target.resources.ironOre) || target.resources.ironOre <= 0)) normalized.resources.ironOre = legacyIron;
  delete normalized.resources.iron;
  normalized.exploration.log = Array.isArray(normalized.exploration.log) ? normalized.exploration.log.slice(0, 5) : [];
  if (!normalized.exploration.unlockedLocations.forest) normalized.exploration.unlockedLocations.forest = true;
  if (!normalized.exploration.unlockedLocations[normalized.exploration.currentLocation]) normalized.exploration.currentLocation = "forest";
  normalized.miners = Math.max(0, Math.floor(normalized.miners || 0));
  normalized.workers.goldMiners = Math.max(0, Math.floor(normalized.workers.goldMiners || 0));
  normalized.workers.ironMiners = Math.max(0, Math.floor(normalized.workers.ironMiners || 0));
  if (normalized.workers.goldMiners + normalized.workers.ironMiners > normalized.miners) normalized.workers.ironMiners = Math.max(0, normalized.miners - normalized.workers.goldMiners);
  normalized.workers.goldMiners = normalized.miners - normalized.workers.ironMiners;
  return normalized;
}

window.normalizeGameState = normalizeGameState;


let game = {
  gold: 0,
  tapPower: 1,
  miners: 0,
  tapUpgradeCost: 10,
  minerCost: 25,
  critChance: 0.1,
  lifetimeGold: 0,
  totalTaps: 0,
  milestones: {
    tapApprentice: false,
    goldCollector: false,
    crewBoss: false
  },
  lastPlayed: Date.now()
};

const goldEl = document.getElementById("gold");
const goldPerSecondEl = document.getElementById("goldPerSecond");
const tapPowerEl = document.getElementById("tapPower");
const minersEl = document.getElementById("miners");
const tapCostTextEl = document.getElementById("tapCostText");
const minerCostTextEl = document.getElementById("minerCostText");
const tapPowerStatEl = document.getElementById("tapPowerStat");
const critChanceStatEl = document.getElementById("critChanceStat");
const criticalHitTextEl = document.getElementById("criticalHitText");
const statusTextEl = document.getElementById("statusText");
const milestonesClaimedEl = document.getElementById("milestonesClaimed");
const permanentTapBonusEl = document.getElementById("permanentTapBonus");
const mineButton = document.getElementById("mineButton");
const buyTapUpgradeButton = document.getElementById("buyTapUpgrade");
const buyMinerButton = document.getElementById("buyMiner");
const resetButton = document.getElementById("resetButton");
const refreshMilestonesButton = document.getElementById("refreshMilestonesButton");
const mineIronButton = document.getElementById("mineIronButton");
const ironOreCountEl = document.getElementById("ironOreCount");
const ironIngotCountEl = document.getElementById("ironIngotCount");
const ironPerTapEl = document.getElementById("ironPerTap");
const ironMineStatusEl = document.getElementById("ironMineStatus");
const workerUnlockStatusEl = document.getElementById("workerUnlockStatus");
const workerTotalEl = document.getElementById("workerTotal");
const goldMinersCountEl = document.getElementById("goldMinersCount");
const ironMinersCountEl = document.getElementById("ironMinersCount");
const workerGoldRateEl = document.getElementById("workerGoldRate");
const workerIronRateEl = document.getElementById("workerIronRate");
const ironMinerMinusButton = document.getElementById("ironMinerMinus");
const ironMinerPlusButton = document.getElementById("ironMinerPlus");
const ironMinerMaxButton = document.getElementById("ironMinerMax");
const allGoldMinersButton = document.getElementById("allGoldMiners");
const milestonesTab = document.getElementById("milestonesTab");
const rewardsTab = document.getElementById("rewardsTab");
const milestonesPanel = document.getElementById("milestonesPanel");
const rewardsPanel = document.getElementById("rewardsPanel");

const milestoneElements = {
  tapApprentice: {
    card: document.getElementById("milestoneTapApprentice"),
    bar: document.getElementById("tapMilestoneBar"),
    text: document.getElementById("tapMilestoneText")
  },
  goldCollector: {
    card: document.getElementById("milestoneGoldCollector"),
    bar: document.getElementById("goldMilestoneBar"),
    text: document.getElementById("goldMilestoneText")
  },
  crewBoss: {
    card: document.getElementById("milestoneCrewBoss"),
    bar: document.getElementById("minerMilestoneBar"),
    text: document.getElementById("minerMilestoneText")
  }
};

const rewardElements = {
  tapApprentice: {
    card: document.getElementById("tapApprenticeReward"),
    status: document.getElementById("tapApprenticeRewardStatus")
  },
  crewBoss: {
    card: document.getElementById("crewBossReward"),
    status: document.getElementById("crewBossRewardStatus")
  }
};

function formatNumber(value) {
  if (value < 1000) {
    return Math.floor(value).toLocaleString();
  }

  const units = ["K", "M", "B", "T", "Qa", "Qi"];
  let unitIndex = -1;
  let compact = value;

  while (compact >= 1000 && unitIndex < units.length - 1) {
    compact /= 1000;
    unitIndex += 1;
  }

  return `${compact.toFixed(compact >= 100 ? 0 : compact >= 10 ? 1 : 2)}${units[unitIndex]}`;
}

function setActiveProgressTab(tabName) {
  const showMilestones = tabName === "milestones";

  milestonesTab.classList.toggle("active", showMilestones);
  rewardsTab.classList.toggle("active", !showMilestones);
  milestonesTab.setAttribute("aria-selected", String(showMilestones));
  rewardsTab.setAttribute("aria-selected", String(!showMilestones));
  milestonesPanel.hidden = !showMilestones;
  rewardsPanel.hidden = showMilestones;

  checkMilestones();
  renderMilestones();
  renderPermanentRewards();
  renderIronMining();
  renderWorkers();
}

function setMilestoneProgress(key, current, target, unit) {
  const milestone = milestoneElements[key];
  const claimed = game.milestones[key];
  const progress = Math.min(100, (current / target) * 100);

  milestone.card.classList.toggle("claimed", claimed);
  milestone.bar.style.width = `${claimed ? 100 : progress}%`;
  milestone.text.textContent = claimed
    ? "Completed · Reward claimed"
    : `${formatNumber(current)} / ${formatNumber(target)} ${unit}`;
}

function setRewardStatus(key) {
  const reward = rewardElements[key];
  const unlocked = game.milestones[key];

  reward.card.classList.toggle("unlocked", unlocked);
  reward.card.classList.toggle("locked", !unlocked);
  reward.status.textContent = unlocked ? "Unlocked" : "Locked";
}

function renderMilestones() {
  const claimedCount = Object.values(game.milestones).filter(Boolean).length;
  milestonesClaimedEl.textContent = claimedCount;

  setMilestoneProgress("tapApprentice", game.totalTaps, 25, "taps");
  setMilestoneProgress("goldCollector", game.lifetimeGold, 250, "gold");
  setMilestoneProgress("crewBoss", game.miners, 5, "miners");
}

function renderPermanentRewards() {
  const permanentTapBonus =
    (game.milestones.tapApprentice ? 1 : 0) +
    (game.milestones.crewBoss ? 2 : 0);

  permanentTapBonusEl.textContent = permanentTapBonus;
  setRewardStatus("tapApprentice");
  setRewardStatus("crewBoss");
}

function ensureIronState() {
  game = normalizeGameState(game);
}

function ownsIronMiningPickaxe() {
  ensureIronState();
  return (game.equipment.woodenPickaxe || 0) > 0 || (game.equipment.ironPickaxe || 0) > 0;
}

function getIronPerTap() {
  ensureIronState();
  return game.equipment.equippedTool === "ironPickaxe" && (game.equipment.ironPickaxe || 0) > 0 ? 2 : 1;
}

function renderIronMining() {
  ensureIronState();
  const unlocked = ownsIronMiningPickaxe();
  const yieldAmount = getIronPerTap();

  ironOreCountEl.textContent = formatNumber(game.resources.ironOre);
  ironIngotCountEl.textContent = formatNumber(game.resources.ironIngot);
  ironPerTapEl.textContent = formatNumber(yieldAmount);
  mineIronButton.disabled = !unlocked;
  mineIronButton.textContent = unlocked ? "Mine Iron" : "Wooden Pickaxe Required";
  ironMineStatusEl.textContent = unlocked
    ? `Iron mine unlocked. ${yieldAmount === 2 ? "Iron Pickaxe equipped for +1 ore." : "Equip an Iron Pickaxe for 2 ore per tap."}`
    : "Own a Wooden Pickaxe to unlock iron mining.";
}

function ironWorkerUnlocked() {
  ensureIronState();
  return Boolean(game.exploration?.unlockedLocations?.rockyTrail) && ownsIronMiningPickaxe();
}

function normalizeWorkers() {
  game = normalizeGameState(game);
  if (!ironWorkerUnlocked()) game.workers.ironMiners = 0;
  game.workers.goldMiners = game.miners - game.workers.ironMiners;
}

function getIronWorkerSecondsPerOre() {
  return game.equipment?.equippedTool === "ironPickaxe" && (game.equipment.ironPickaxe || 0) > 0 ? 4 : 5;
}

function processIronWorkers() {
  normalizeWorkers();
  const now = Date.now();
  const elapsed = Math.min(now - (game.workers.lastIronAt || now), 60 * 60 * 8 * 1000);
  const secondsPerOre = getIronWorkerSecondsPerOre();
  const ore = Math.floor((elapsed / 1000) * game.workers.ironMiners / secondsPerOre);
  if (ore > 0) {
    game.resources.ironOre += ore;
    game.workers.lastIronAt = now;
  }
}

function renderWorkers() {
  normalizeWorkers();
  const unlocked = ironWorkerUnlocked();
  workerUnlockStatusEl.textContent = unlocked ? "Iron unlocked" : "Gold only";
  workerTotalEl.textContent = formatNumber(game.miners);
  goldMinersCountEl.textContent = formatNumber(game.workers.goldMiners);
  ironMinersCountEl.textContent = formatNumber(game.workers.ironMiners);
  workerGoldRateEl.textContent = formatNumber(game.workers.goldMiners);
  workerIronRateEl.textContent = unlocked ? `${game.workers.ironMiners} ore / ${getIronWorkerSecondsPerOre()}s each` : "Locked";
  ironMinerMinusButton.disabled = !unlocked || game.workers.ironMiners <= 0;
  ironMinerPlusButton.disabled = !unlocked || game.workers.ironMiners >= game.miners;
  ironMinerMaxButton.disabled = !unlocked || game.workers.ironMiners >= game.miners;
  allGoldMinersButton.disabled = game.workers.ironMiners <= 0;
}

function assignIronMiners(count) {
  normalizeWorkers();
  if (!ironWorkerUnlocked()) return renderWorkers();
  game.workers.ironMiners = Math.max(0, Math.min(game.miners, count));
  game.workers.goldMiners = game.miners - game.workers.ironMiners;
  render();
  saveGame();
}

function render() {
  goldEl.textContent = formatNumber(game.gold);
  goldPerSecondEl.textContent = formatNumber(game.workers?.goldMiners ?? game.miners);
  tapPowerEl.textContent = formatNumber(game.tapPower);
  tapPowerStatEl.textContent = formatNumber(game.tapPower);
  minersEl.textContent = formatNumber(game.miners);
  critChanceStatEl.textContent = `${Math.round(game.critChance * 100)}%`;
  tapCostTextEl.textContent = formatNumber(game.tapUpgradeCost);
  minerCostTextEl.textContent = formatNumber(game.minerCost);

  buyTapUpgradeButton.disabled = game.gold < game.tapUpgradeCost;
  buyMinerButton.disabled = game.gold < game.minerCost;
  renderMilestones();
  renderPermanentRewards();
  renderIronMining();
  renderWorkers();
}

function saveGame() {
  game.lastPlayed = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function loadGame() {
  const rawSave = localStorage.getItem(SAVE_KEY);

  if (!rawSave) {
    return;
  }

  try {
    const savedGame = JSON.parse(rawSave);
    const savedMilestones = savedGame.milestones || {};

    game = {
      ...game,
      ...savedGame,
      milestones: {
        ...game.milestones,
        ...savedMilestones
      }
    };

    game = normalizeGameState(game);

    if (!Number.isFinite(savedGame.lifetimeGold)) {
      game.lifetimeGold = game.gold;
    }

    const now = Date.now();
    const secondsAway = Math.max(0, Math.floor((now - game.lastPlayed) / 1000));
    const cappedSeconds = Math.min(secondsAway, 60 * 60 * 8);
    const offlineGold = cappedSeconds * (game.workers?.goldMiners ?? game.miners);
    const ironSeconds = game.equipment?.equippedTool === "ironPickaxe" ? 4 : 5;
    const offlineIron = Math.floor((cappedSeconds * (game.workers?.ironMiners || 0)) / ironSeconds);

    if (offlineGold > 0 || offlineIron > 0) {
      game.gold += offlineGold;
      game.lifetimeGold += offlineGold;
      game.resources.ironOre += offlineIron;
      statusTextEl.textContent = `Welcome back. Your workers earned ${formatNumber(offlineGold)} gold${offlineIron ? ` and ${formatNumber(offlineIron)} iron ore` : ""} while you were away.`;
    }
  } catch (error) {
    console.warn("The saved game could not be loaded.", error);
    localStorage.removeItem(SAVE_KEY);
  }
}

function showCriticalHit(multiplier, amount) {
  criticalHitTextEl.textContent = `CRITICAL! ${multiplier}× +${formatNumber(amount)}`;
  criticalHitTextEl.classList.remove("show");
  void criticalHitTextEl.offsetWidth;
  criticalHitTextEl.classList.add("show");
}

function claimMilestone(key, message, reward) {
  if (game.milestones[key]) {
    return false;
  }

  game.milestones[key] = true;
  reward();
  statusTextEl.textContent = `Milestone complete: ${message}`;
  return true;
}

function checkMilestones() {
  let claimedAny = false;

  if (game.totalTaps >= 25) {
    claimedAny = claimMilestone(
      "tapApprentice",
      "Tap Apprentice — permanent +1 tap power.",
      () => {
        game.tapPower += 1;
      }
    ) || claimedAny;
  }

  if (game.lifetimeGold >= 250) {
    claimedAny = claimMilestone(
      "goldCollector",
      "Gold Collector — +50 gold.",
      () => {
        game.gold += 50;
      }
    ) || claimedAny;
  }

  if (game.miners >= 5) {
    claimedAny = claimMilestone(
      "crewBoss",
      "Crew Boss — permanent +2 tap power.",
      () => {
        game.tapPower += 2;
      }
    ) || claimedAny;
  }

  return claimedAny;
}

function refreshMilestones() {
  const claimedBefore = Object.values(game.milestones).filter(Boolean).length;
  const claimedNewReward = checkMilestones();

  render();
  saveGame();

  const claimedAfter = Object.values(game.milestones).filter(Boolean).length;
  statusTextEl.textContent = claimedNewReward || claimedAfter > claimedBefore
    ? "Milestones refreshed. New reward claimed."
    : "Milestones refreshed. Everything is up to date.";
}

function mineIron() {
  ensureIronState();
  if (!ownsIronMiningPickaxe()) {
    renderIronMining();
    return;
  }

  const oreEarned = getIronPerTap();
  game.resources.ironOre += oreEarned;
  ironMineStatusEl.textContent = `Mined ${formatNumber(oreEarned)} iron ore.`;
  render();
  if (typeof renderCrafting === "function") renderCrafting();
  saveGame();
}

function mineGold() {
  const isCritical = Math.random() < game.critChance;
  const multiplier = isCritical && Math.random() < 0.2 ? 10 : isCritical ? 5 : 1;
  const goldEarned = game.tapPower * multiplier;

  game.gold += goldEarned;
  game.lifetimeGold += goldEarned;
  game.totalTaps += 1;

  if (isCritical) {
    showCriticalHit(multiplier, goldEarned);
  }

  checkMilestones();
  render();
  saveGame();
}

function buyTapUpgrade() {
  if (game.gold < game.tapUpgradeCost) {
    return;
  }

  game.gold -= game.tapUpgradeCost;
  game.tapPower += 1;
  game.tapUpgradeCost = Math.ceil(game.tapUpgradeCost * 1.65);
  render();
  saveGame();
}

function buyMiner() {
  if (game.gold < game.minerCost) {
    return;
  }

  game.gold -= game.minerCost;
  game.miners += 1;
  game.workers.goldMiners += 1;
  game.minerCost = Math.ceil(game.minerCost * 1.72);
  checkMilestones();
  render();
  saveGame();
}

function resetGame() {
  const confirmed = window.confirm("Reset all progress? This cannot be undone.");

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(SAVE_KEY);
  game = normalizeGameState({ lastPlayed: Date.now(), workers: { goldMiners: 0, ironMiners: 0, lastIronAt: Date.now() } });
  statusTextEl.textContent = "Save reset. Your progress saves automatically on this device.";
  setActiveProgressTab("milestones");
  render();
  if (typeof renderExploration === "function") renderExploration();
  if (typeof renderCrafting === "function") renderCrafting();
  saveGame();
}

mineButton.addEventListener("click", mineGold);
mineIronButton.addEventListener("click", mineIron);
buyTapUpgradeButton.addEventListener("click", buyTapUpgrade);
buyMinerButton.addEventListener("click", buyMiner);
resetButton.addEventListener("click", resetGame);
refreshMilestonesButton.addEventListener("click", refreshMilestones);
ironMinerMinusButton.addEventListener("click", () => assignIronMiners(game.workers.ironMiners - 1));
ironMinerPlusButton.addEventListener("click", () => assignIronMiners(game.workers.ironMiners + 1));
ironMinerMaxButton.addEventListener("click", () => assignIronMiners(game.miners));
allGoldMinersButton.addEventListener("click", () => assignIronMiners(0));
milestonesTab.addEventListener("click", () => setActiveProgressTab("milestones"));
rewardsTab.addEventListener("click", () => setActiveProgressTab("rewards"));

loadGame();
checkMilestones();
setActiveProgressTab("milestones");
render();
saveGame();

setInterval(() => {
  processIronWorkers();
  game = normalizeGameState(game);
  if (game.workers.goldMiners > 0) {
    game.gold += game.workers.goldMiners;
    game.lifetimeGold += game.workers.goldMiners;
    checkMilestones();
    render();
  }
}, 1000);

setInterval(saveGame, 5000);
window.renderIronMining = renderIronMining;
window.renderWorkers = renderWorkers;
window.assignIronMiners = assignIronMiners;
window.getIronPerTap = getIronPerTap;
window.addEventListener("beforeunload", saveGame);
