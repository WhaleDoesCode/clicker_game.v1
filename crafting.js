const craftingDefaults = {
  resources: {
    sticks: 0,
    stonePebbles: 0,
    hide: 0,
    leather: 0,
    leatherBinding: 0,
    ironOre: 0,
    ironIngot: 0
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
  ironIngot: "iron ingots"
};

const craftingRecipes = {
  woodenPickaxe: { type: "equipment", name: "Wooden Pickaxe", costs: { sticks: 4, stonePebbles: 6 }, output: { equipment: "woodenPickaxe", amount: 1 } },
  woodenSword: { type: "equipment", name: "Wooden Sword", costs: { sticks: 5, stonePebbles: 2 }, output: { equipment: "woodenSword", amount: 1 } },
  woodenHoe: { type: "equipment", name: "Wooden Hoe", costs: { sticks: 4, stonePebbles: 3, hide: 1 }, output: { equipment: "woodenHoe", amount: 1 } },
  hideToLeather: { type: "resource", name: "Process Leather", costs: { hide: 2 }, output: { resource: "leather", amount: 1 } },
  leatherBinding: { type: "resource", name: "Make Leather Binding", costs: { leather: 2 }, output: { resource: "leatherBinding", amount: 1 } },
  ironIngot: { type: "resource", name: "Smelt Iron Ingot", costs: { ironOre: 3 }, output: { resource: "ironIngot", amount: 1 } },
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
    ironIngot: document.getElementById("craftIronIngotCount")
  },
  recipes: {}
};

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
  const savedEquipment = game.equipment || {};
  game.resources = { ...craftingDefaults.resources, ...(game.resources || {}) };
  if (Number.isFinite(game.resources.iron) && !Number.isFinite(game.resources.ironOre)) {
    game.resources.ironOre = game.resources.iron;
  }
  game.equipment = { ...craftingDefaults.equipment, ...savedEquipment };
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

resetButton.addEventListener("click", () => {
  ensureCraftingState();
  renderCrafting();
  saveGame();
});

window.craftingRecipes = craftingRecipes;
window.craftingElements = craftingElements;
window.craftItem = craftItem;
window.renderCrafting = renderCrafting;

ensureCraftingState();
renderCrafting();
saveGame();
