const SAVE_KEY = "clickerGameSaveV1";

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
  game.resources = {
    ironOre: 0,
    ironIngot: 0,
    ...(game.resources || {})
  };

  if (Number.isFinite(game.resources.iron) && !Number.isFinite(game.resources.ironOre)) {
    game.resources.ironOre = game.resources.iron;
  }

  game.equipment = {
    woodenPickaxe: 0,
    ironPickaxe: 0,
    equippedTool: null,
    ...(game.equipment || {})
  };
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

function render() {
  goldEl.textContent = formatNumber(game.gold);
  goldPerSecondEl.textContent = formatNumber(game.miners);
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

    if (!Number.isFinite(savedGame.lifetimeGold)) {
      game.lifetimeGold = game.gold;
    }

    const now = Date.now();
    const secondsAway = Math.max(0, Math.floor((now - game.lastPlayed) / 1000));
    const offlineGold = Math.min(secondsAway, 60 * 60 * 8) * game.miners;

    if (offlineGold > 0) {
      game.gold += offlineGold;
      game.lifetimeGold += offlineGold;
      statusTextEl.textContent = `Welcome back. Your miners earned ${formatNumber(offlineGold)} gold while you were away.`;
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
  game = {
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
  statusTextEl.textContent = "Save reset. Your progress saves automatically on this device.";
  setActiveProgressTab("milestones");
  render();
  saveGame();
}

mineButton.addEventListener("click", mineGold);
mineIronButton.addEventListener("click", mineIron);
buyTapUpgradeButton.addEventListener("click", buyTapUpgrade);
buyMinerButton.addEventListener("click", buyMiner);
resetButton.addEventListener("click", resetGame);
refreshMilestonesButton.addEventListener("click", refreshMilestones);
milestonesTab.addEventListener("click", () => setActiveProgressTab("milestones"));
rewardsTab.addEventListener("click", () => setActiveProgressTab("rewards"));

loadGame();
checkMilestones();
setActiveProgressTab("milestones");
render();
saveGame();

setInterval(() => {
  if (game.miners > 0) {
    game.gold += game.miners;
    game.lifetimeGold += game.miners;
    checkMilestones();
    render();
  }
}, 1000);

setInterval(saveGame, 5000);
window.renderIronMining = renderIronMining;
window.getIronPerTap = getIronPerTap;
window.addEventListener("beforeunload", saveGame);
