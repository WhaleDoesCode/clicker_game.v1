const craftingDefaults = {
  resources: {
    sticks: 0,
    stonePebbles: 0,
    hide: 0,
    leather: 0,
    leatherBinding: 0,
    ironOre: 0,
    ironIngot: 0,
    coal: 0,
    locationClues: 0
  },
  equipment: {
    woodenPickaxe: 0,
    woodenSword: 0,
    woodenHoe: 0,
    ironPickaxe: 0,
    ironSword: 0,
    ironHoe: 0,
    equippedTool: null
  }
};

const resourceLabels = {
  sticks: "sticks",
  stonePebbles: "stone pebbles",
  hide: "hide",
  leather: "leather",
  leatherBinding: "leather binding",
  ironOre: "iron ore",
  ironIngot: "iron ingots",
  coal: "coal",
  locationClues: "location clues"
};

const craftingRecipes = {
  woodenPickaxe: { type: "equipment", name: "Wooden Pickaxe", costs: { sticks: 4, stonePebbles: 6 }, output: { equipment: "woodenPickaxe", amount: 1 } },
  woodenSword: { type: "equipment", name: "Wooden Sword", costs: { sticks: 5, stonePebbles: 2 }, output: { equipment: "woodenSword", amount: 1 } },
  woodenHoe: { type: "equipment", name: "Wooden Hoe", costs: { sticks: 4, stonePebbles: 3, hide: 1 }, output: { equipment: "woodenHoe", amount: 1 } },
  hideToLeather: { type: "resource", name: "Process Leather", costs: { hide: 2 }, output: { resource: "leather", amount: 1 } },
  leatherBinding: { type: "resource", name: "Make Leather Binding", costs: { leather: 2 }, output: { resource: "leatherBinding", amount: 1 } },
  ironPickaxe: { type: "equipment", name: "Iron Pickaxe", costs: { ironIngot: 4, sticks: 2, leatherBinding: 1 }, output: { equipment: "ironPickaxe", amount: 1 } },
  ironSword: { type: "equipment", name: "Iron Sword", costs: { ironIngot: 3, sticks: 2, leatherBinding: 1 }, output: { equipment: "ironSword", amount: 1 } },
  ironHoe: { type: "equipment", name: "Iron Hoe", costs: { ironIngot: 2, sticks: 3, leatherBinding: 1 }, output: { equipment: "ironHoe", amount: 1 } }
};

const craftingElements = {
  equippedToolName: document.getElementById("equippedToolName"),
  status: document.getElementById("craftingStatus"),
  inventory: {
    sticks: document.getElementById("craftSticksCount"),
    stonePebbles: document.getElementById("craftStoneCount"),
    hide: document.getElementById("craftHideCount"),
    leather: document.getElementById("craftLeatherCount"),
    leatherBinding: document.getElementById("craftBindingCount"),
    ironOre: document.getElementById("craftIronOreCount"),
    ironIngot: document.getElementById("craftIronIngotCount"),
    coal: document.getElementById("craftCoalCount")
  },
  recipes: {}
};


const FURNACE_LEVELS = {
  1: { capacity: 1, timeMs: 12000, buildCost: { stonePebbles: 12, sticks: 6, leatherBinding: 1 } },
  2: { capacity: 2, timeMs: 9000, upgradeCost: { ironIngot: 8, stonePebbles: 15, leatherBinding: 4 } },
  3: { capacity: 5, timeMs: 6000, upgradeCost: { ironIngot: 16, stonePebbles: 30, leatherBinding: 8 } }
};
const FURNACE_RECIPE = { ironOre: 3, coal: 1 };
const furnaceEls = {
  level: document.getElementById("furnaceLevel"), status: document.getElementById("furnaceStatus"), queue: document.getElementById("furnaceQueue"), time: document.getElementById("furnaceTimeRemaining"), lifetime: document.getElementById("furnaceLifetime"),
  build: document.getElementById("buildFurnace"), upgrade: document.getElementById("upgradeFurnace"), queueOne: document.getElementById("queueFurnaceBatch"), queueMax: document.getElementById("queueFurnaceMax")
};
function furnaceFreeCrafting() { return Boolean(game.debugSettings?.freeCrafting); }
function furnaceNoCooldowns() { return Boolean(game.debugSettings?.noCooldowns); }
function furnaceConfig() { return FURNACE_LEVELS[game.furnace.level] || { capacity: 0, timeMs: 0 }; }
function hasCosts(cost) { return furnaceFreeCrafting() || Object.entries(cost).every(([r,a]) => (game.resources[r] || 0) >= a); }
function payCosts(cost) { if (!furnaceFreeCrafting()) Object.entries(cost).forEach(([r,a]) => game.resources[r] -= a); }
function formatMissing(cost) { return Object.entries(cost).filter(([r,a]) => (game.resources[r] || 0) < a).map(([r,a]) => `${Math.max(0,a-(game.resources[r]||0))} ${resourceLabels[r]||r}`).join(", "); }
function maybeUnlockFurnace() { if (!game.furnace.unlocked && ((game.equipment.woodenPickaxe||0) > 0 || (game.equipment.ironPickaxe||0) > 0) && game.resources.stonePebbles >= 5) game.furnace.unlocked = true; }
function resolveFurnaceQueue() {
  if (!game.furnace.queuedBatches || game.furnace.level < 1) return 0;
  const cfg = furnaceConfig();
  const elapsed = furnaceNoCooldowns() ? Number.MAX_SAFE_INTEGER : Date.now() - (game.furnace.queueStartedAt || Date.now());
  const complete = Math.min(game.furnace.queuedBatches, Math.floor(elapsed / cfg.timeMs));
  if (complete <= 0) return 0;
  let ingots = complete;
  for (let i = 0; i < complete; i += 1) if (game.milestones?.ironworker && Math.random() < 0.10) ingots += 1;
  game.resources.ironIngot += ingots;
  game.furnace.lifetimeBatches += complete;
  game.furnace.queuedBatches -= complete;
  game.furnace.queueStartedAt = game.furnace.queuedBatches > 0 ? (furnaceNoCooldowns() ? Date.now() : game.furnace.queueStartedAt + complete * cfg.timeMs) : 0;
  if (typeof checkExplorationMilestones === "function") checkExplorationMilestones();
  return ingots;
}
function renderFurnace() {
  ensureCraftingState(); maybeUnlockFurnace(); const completed = resolveFurnaceQueue(); const cfg = furnaceConfig();
  const unlocked = game.furnace.unlocked; const built = game.furnace.level > 0; const nextLevel = game.furnace.level + 1;
  furnaceEls.level.textContent = !unlocked ? "Locked" : built ? `Level ${game.furnace.level}` : "Plans Ready";
  furnaceEls.queue.textContent = `${game.furnace.queuedBatches}/${cfg.capacity || 0}`; furnaceEls.lifetime.textContent = formatNumber(game.furnace.lifetimeBatches);
  const remaining = built && game.furnace.queuedBatches ? Math.max(0, cfg.timeMs - (Date.now() - game.furnace.queueStartedAt)) : 0; furnaceEls.time.textContent = remaining ? `${Math.ceil(remaining/1000)}s` : "Ready";
  furnaceEls.status.textContent = completed ? `Completed ${formatNumber(completed)} iron ingot${completed===1?"":"s"}.` : !unlocked ? "Own a pickaxe and 5 stone pebbles to discover furnace plans." : !built ? "Build Level 1 to start timed smelting." : `Level ${game.furnace.level}: ${cfg.capacity} slot(s), ${cfg.timeMs/1000}s per batch.`;
  const buildCost = FURNACE_LEVELS[1].buildCost; furnaceEls.build.hidden = built; furnaceEls.build.disabled = !unlocked || !hasCosts(buildCost); furnaceEls.build.textContent = hasCosts(buildCost) ? `${furnaceFreeCrafting()?"Debug ":""}Build Furnace` : `Need ${formatMissing(buildCost)}`;
  const upgradeCost = FURNACE_LEVELS[nextLevel]?.upgradeCost; furnaceEls.upgrade.hidden = !built; furnaceEls.upgrade.disabled = !upgradeCost || !hasCosts(upgradeCost); furnaceEls.upgrade.textContent = !upgradeCost ? "Max Level" : hasCosts(upgradeCost) ? `${furnaceFreeCrafting()?"Debug ":""}Upgrade Furnace` : `Need ${formatMissing(upgradeCost)}`;
  const canQueue = built && game.furnace.queuedBatches < cfg.capacity && hasCosts(FURNACE_RECIPE); furnaceEls.queueOne.disabled = !canQueue; furnaceEls.queueMax.disabled = !canQueue; const miss = hasCosts(FURNACE_RECIPE) ? "" : `Need ${formatMissing(FURNACE_RECIPE)}`; furnaceEls.queueOne.textContent = canQueue ? "Queue 1 Batch" : (game.furnace.queuedBatches >= cfg.capacity ? "Queue Full" : miss || "Build Furnace");
}
function buildFurnace() { ensureCraftingState(); maybeUnlockFurnace(); const cost = FURNACE_LEVELS[1].buildCost; if (!game.furnace.unlocked || !hasCosts(cost)) return renderCrafting(); payCosts(cost); game.furnace.level = 1; renderCrafting(); saveGame(); }
function upgradeFurnace() { ensureCraftingState(); const next = FURNACE_LEVELS[game.furnace.level + 1]; if (!next || !hasCosts(next.upgradeCost)) return renderCrafting(); payCosts(next.upgradeCost); game.furnace.level += 1; renderCrafting(); saveGame(); }
function queueFurnaceBatches(max) { ensureCraftingState(); resolveFurnaceQueue(); const cfg = furnaceConfig(); if (game.furnace.level < 1) return; let room = cfg.capacity - game.furnace.queuedBatches; let affordable = furnaceFreeCrafting() ? room : Math.min(Math.floor(game.resources.ironOre / 3), Math.floor(game.resources.coal / 1), room); let count = max ? affordable : Math.min(1, affordable); if (count <= 0) return renderCrafting(); if (!furnaceFreeCrafting()) { game.resources.ironOre -= count * 3; game.resources.coal -= count; } if (!game.furnace.queuedBatches) game.furnace.queueStartedAt = Date.now(); game.furnace.queuedBatches += count; renderCrafting(); saveGame(); }

Object.keys(craftingRecipes).forEach((key) => {
  const suffix = key.charAt(0).toUpperCase() + key.slice(1);
  craftingElements.recipes[key] = {
    owned: document.getElementById(`${key}Owned`),
    requirements: document.getElementById(`${key}Requirements`),
    craft: document.getElementById(`craft${suffix}`),
    equip: document.getElementById(`equip${suffix}`)
  };
});

function ensureCraftingState() {
  game = normalizeGameState(game);
}

function freeCraftingEnabled() {
  return Boolean(game.debugSettings?.freeCrafting);
}

function hasRecipeMaterials(recipeKey) {
  const recipe = craftingRecipes[recipeKey];
  return freeCraftingEnabled() || Object.entries(recipe.costs).every(([resource, amount]) => game.resources[resource] >= amount);
}

function formatRecipeRequirements(recipeKey) {
  return Object.entries(craftingRecipes[recipeKey].costs)
    .map(([resource, amount]) => `${amount} ${resourceLabels[resource] || resource}`)
    .join(", ");
}

function getEquippedToolName() {
  const equipped = game.equipment.equippedTool;
  return equipped && craftingRecipes[equipped] ? craftingRecipes[equipped].name : "None";
}

function renderCrafting() {
  ensureCraftingState();

  Object.entries(craftingElements.inventory).forEach(([resource, element]) => {
    if (element) element.textContent = formatNumber(game.resources[resource]);
  });

  const equipped = game.equipment.equippedTool;
  craftingElements.equippedToolName.textContent = getEquippedToolName();

  Object.entries(craftingRecipes).forEach(([key, recipe]) => {
    const elements = craftingElements.recipes[key];
    const affordable = hasRecipeMaterials(key);
    const requirements = formatRecipeRequirements(key);

    if (!elements?.craft) return;
    if (elements.owned) elements.owned.textContent = formatNumber(game.equipment[recipe.output.equipment] || 0);
    if (elements.requirements) elements.requirements.textContent = `Requires ${requirements}.`;
    elements.craft.disabled = !affordable;
    elements.craft.textContent = affordable
      ? `${freeCraftingEnabled() ? "Debug " : ""}${recipe.type === "resource" ? recipe.name : `Craft ${recipe.name}`}`
      : `Need ${requirements}`;

    if (elements.equip) {
      const owned = game.equipment[recipe.output.equipment] || 0;
      elements.equip.disabled = owned < 1;
      elements.equip.textContent = equipped === recipe.output.equipment ? "Equipped" : "Equip";
    }
  });
  if (typeof renderFurnace === "function") renderFurnace();
}

function consumeRecipeCosts(recipe) {
  if (freeCraftingEnabled()) return;
  Object.entries(recipe.costs).forEach(([resource, amount]) => {
    game.resources[resource] -= amount;
  });
}

function grantRecipeOutput(recipe) {
  if (recipe.type === "equipment") {
    game.equipment[recipe.output.equipment] += recipe.output.amount;
  } else {
    game.resources[recipe.output.resource] += recipe.output.amount;
  }
}

function craftItem(recipeKey) {
  ensureCraftingState();
  const recipe = craftingRecipes[recipeKey];

  if (!recipe) return;
  if (!hasRecipeMaterials(recipeKey)) {
    craftingElements.status.textContent = `Not enough materials for ${recipe.name}.`;
    renderCrafting();
    return;
  }

  consumeRecipeCosts(recipe);
  grantRecipeOutput(recipe);
  craftingElements.status.textContent = `${freeCraftingEnabled() ? "Debug granted" : recipe.type === "resource" ? "Created" : "Crafted"} ${recipe.name}.`;
  renderCrafting();
  if (typeof renderExploration === "function") renderExploration();
  if (typeof renderIronMining === "function") renderIronMining();
  if (typeof renderFarming === "function") renderFarming();
  saveGame();
}

function equipItem(recipeKey) {
  ensureCraftingState();
  const recipe = craftingRecipes[recipeKey];
  const equipmentKey = recipe?.output?.equipment;
  if (!equipmentKey || (game.equipment[equipmentKey] || 0) < 1) return;

  game.equipment.equippedTool = equipmentKey;
  craftingElements.status.textContent = `Equipped ${recipe.name}.`;
  renderCrafting();
  if (typeof renderIronMining === "function") renderIronMining();
  if (typeof renderFarming === "function") renderFarming();
  saveGame();
}

Object.keys(craftingRecipes).forEach((key) => {
  craftingElements.recipes[key].craft?.addEventListener("click", () => craftItem(key));
  craftingElements.recipes[key].equip?.addEventListener("click", () => equipItem(key));
});
furnaceEls.build?.addEventListener("click", buildFurnace);
furnaceEls.upgrade?.addEventListener("click", upgradeFurnace);
furnaceEls.queueOne?.addEventListener("click", () => queueFurnaceBatches(false));
furnaceEls.queueMax?.addEventListener("click", () => queueFurnaceBatches(true));

resetButton.addEventListener("click", () => {
  ensureCraftingState();
  renderCrafting();
  saveGame();
});

window.craftingRecipes = craftingRecipes;
window.craftingElements = craftingElements;
window.craftItem = craftItem;
window.renderCrafting = renderCrafting;
window.renderFurnace = renderFurnace;
window.FURNACE_LEVELS = FURNACE_LEVELS;
window.FURNACE_RECIPE = FURNACE_RECIPE;

ensureCraftingState();
renderCrafting();
saveGame();
