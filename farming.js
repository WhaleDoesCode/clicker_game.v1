const FARMING_GROW_TIME_MS = 15000;
const FARMING_LOG_LIMIT = 6;

const farmingElements = {
  button: document.getElementById("farmActionButton"),
  status: document.getElementById("farmingStatus"),
  timer: document.getElementById("farmingTimer"),
  wheat: document.getElementById("wheatCount"),
  harvests: document.getElementById("farmingHarvests"),
  hoeStatus: document.getElementById("farmingHoeStatus"),
  plot: document.getElementById("wheatPlot"),
  plotIcon: document.getElementById("wheatPlotIcon"),
  plotTitle: document.getElementById("wheatPlotTitle"),
  log: document.getElementById("farmingLog")
};

function ensureFarmingState() {
  game.resources = {
    wheat: 0,
    ...(game.resources || {})
  };

  game.equipment = {
    woodenHoe: 0,
    ...(game.equipment || {})
  };

  game.farming = {
    crop: null,
    plantedAt: 0,
    readyAt: 0,
    harvests: 0,
    log: [],
    ...(game.farming || {})
  };

  if (!Array.isArray(game.farming.log)) game.farming.log = [];
}

function ownsWoodenHoe() {
  return (game.equipment?.woodenHoe || 0) > 0;
}

function farmingNoCooldownsEnabled() {
  return Boolean(game.debugSettings?.noCooldowns);
}

function cropIsReady(now = Date.now()) {
  if (!game.farming.crop) return false;
  return farmingNoCooldownsEnabled() || now >= game.farming.readyAt;
}

function addFarmingLog(message) {
  game.farming.log.unshift(message);
  game.farming.log = game.farming.log.slice(0, FARMING_LOG_LIMIT);
}

function formatFarmingTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, "0")}` : `${seconds}s`;
}

function renderFarmingLog() {
  farmingElements.log.innerHTML = "";
  const entries = game.farming.log.length ? game.farming.log : ["The field is waiting for its first crop."];

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    farmingElements.log.appendChild(item);
  });
}

function renderFarming() {
  ensureFarmingState();

  const now = Date.now();
  const hasHoe = ownsWoodenHoe();
  const hasCrop = Boolean(game.farming.crop);
  const ready = cropIsReady(now);
  const remaining = Math.max(0, game.farming.readyAt - now);

  farmingElements.wheat.textContent = formatNumber(game.resources.wheat);
  farmingElements.harvests.textContent = formatNumber(game.farming.harvests);
  farmingElements.hoeStatus.textContent = hasHoe ? "Wooden Hoe ready" : "Wooden Hoe required";
  farmingElements.hoeStatus.classList.toggle("ready", hasHoe);

  farmingElements.plot.classList.toggle("growing", hasCrop && !ready);
  farmingElements.plot.classList.toggle("ready", ready);

  if (!hasCrop) {
    farmingElements.plotIcon.textContent = "🌱";
    farmingElements.plotTitle.textContent = "Empty Wheat Plot";
    farmingElements.status.textContent = hasHoe
      ? "Your plot is ready. Plant wheat to begin."
      : "Craft a Wooden Hoe in the Crafting tab before planting.";
    farmingElements.timer.textContent = "Ready to plant.";
    farmingElements.button.textContent = hasHoe ? "Plant Wheat" : "Wooden Hoe Required";
    farmingElements.button.disabled = !hasHoe;
  } else if (!ready) {
    farmingElements.plotIcon.textContent = "🌿";
    farmingElements.plotTitle.textContent = "Wheat Growing";
    farmingElements.status.textContent = "The wheat is taking root.";
    farmingElements.timer.textContent = `Ready in ${formatFarmingTime(remaining)}.`;
    farmingElements.button.textContent = `Growing · ${formatFarmingTime(remaining)}`;
    farmingElements.button.disabled = true;
  } else {
    farmingElements.plotIcon.textContent = "🌾";
    farmingElements.plotTitle.textContent = "Wheat Ready";
    farmingElements.status.textContent = "The wheat is fully grown and ready to harvest.";
    farmingElements.timer.textContent = "Harvest available.";
    farmingElements.button.textContent = "Harvest Wheat";
    farmingElements.button.disabled = false;
  }

  renderFarmingLog();
}

function plantWheat() {
  ensureFarmingState();
  if (!ownsWoodenHoe() || game.farming.crop) return;

  const now = Date.now();
  game.farming.crop = "wheat";
  game.farming.plantedAt = now;
  game.farming.readyAt = farmingNoCooldownsEnabled() ? now : now + FARMING_GROW_TIME_MS;
  addFarmingLog("Planted a fresh wheat crop.");
  renderFarming();
  saveGame();
}

function harvestWheat() {
  ensureFarmingState();
  if (!cropIsReady()) return;

  const amount = 3 + Math.floor(Math.random() * 4);
  game.resources.wheat += amount;
  game.farming.harvests += 1;
  game.farming.crop = null;
  game.farming.plantedAt = 0;
  game.farming.readyAt = 0;
  addFarmingLog(`Harvested ${amount} wheat.`);
  renderFarming();
  if (typeof renderCrafting === "function") renderCrafting();
  saveGame();
}

function handleFarmAction() {
  ensureFarmingState();
  if (!game.farming.crop) {
    plantWheat();
  } else if (cropIsReady()) {
    harvestWheat();
  }
}

farmingElements.button.addEventListener("click", handleFarmAction);
farmingGameTab.addEventListener("click", renderFarming);
resetButton.addEventListener("click", () => {
  ensureFarmingState();
  renderFarming();
});

ensureFarmingState();
renderFarming();
saveGame();
window.setInterval(renderFarming, 500);
