const SAVE_KEY = "clickerGameSaveV1";

let game = {
  gold: 0,
  tapPower: 1,
  miners: 0,
  tapUpgradeCost: 10,
  minerCost: 25,
  lastPlayed: Date.now()
};

const goldEl = document.getElementById("gold");
const goldPerSecondEl = document.getElementById("goldPerSecond");
const tapPowerEl = document.getElementById("tapPower");
const minersEl = document.getElementById("miners");
const tapCostTextEl = document.getElementById("tapCostText");
const minerCostTextEl = document.getElementById("minerCostText");
const tapPowerStatEl = document.getElementById("tapPowerStat");
const statusTextEl = document.getElementById("statusText");
const mineButton = document.getElementById("mineButton");
const buyTapUpgradeButton = document.getElementById("buyTapUpgrade");
const buyMinerButton = document.getElementById("buyMiner");
const resetButton = document.getElementById("resetButton");

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

function render() {
  goldEl.textContent = formatNumber(game.gold);
  goldPerSecondEl.textContent = formatNumber(game.miners);
  tapPowerEl.textContent = formatNumber(game.tapPower);
  tapPowerStatEl.textContent = formatNumber(game.tapPower);
  minersEl.textContent = formatNumber(game.miners);
  tapCostTextEl.textContent = formatNumber(game.tapUpgradeCost);
  minerCostTextEl.textContent = formatNumber(game.minerCost);

  buyTapUpgradeButton.disabled = game.gold < game.tapUpgradeCost;
  buyMinerButton.disabled = game.gold < game.minerCost;
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
    game = {
      ...game,
      ...savedGame
    };

    const now = Date.now();
    const secondsAway = Math.max(0, Math.floor((now - game.lastPlayed) / 1000));
    const offlineGold = Math.min(secondsAway, 60 * 60 * 8) * game.miners;

    if (offlineGold > 0) {
      game.gold += offlineGold;
      statusTextEl.textContent = `Welcome back. Your miners earned ${formatNumber(offlineGold)} gold while you were away.`;
    }
  } catch (error) {
    console.warn("The saved game could not be loaded.", error);
    localStorage.removeItem(SAVE_KEY);
  }
}

function mineGold() {
  game.gold += game.tapPower;
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
    lastPlayed: Date.now()
  };
  statusTextEl.textContent = "Save reset. Your progress saves automatically on this device.";
  render();
  saveGame();
}

mineButton.addEventListener("click", mineGold);
buyTapUpgradeButton.addEventListener("click", buyTapUpgrade);
buyMinerButton.addEventListener("click", buyMiner);
resetButton.addEventListener("click", resetGame);

loadGame();
render();
saveGame();

setInterval(() => {
  if (game.miners > 0) {
    game.gold += game.miners;
    render();
  }
}, 1000);

setInterval(saveGame, 5000);
window.addEventListener("beforeunload", saveGame);
