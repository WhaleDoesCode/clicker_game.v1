const craftingDefaults = {
  equipment: {
    woodenPickaxe: 0,
    woodenSword: 0,
    woodenHoe: 0,
    equippedTool: null
  }
};

const craftingRecipes = {
  woodenPickaxe: {
    name: "Wooden Pickaxe",
    costs: { sticks: 4, stonePebbles: 6 }
  },
  woodenSword: {
    name: "Wooden Sword",
    costs: { sticks: 5, stonePebbles: 2 }
  },
  woodenHoe: {
    name: "Wooden Hoe",
    costs: { sticks: 4, stonePebbles: 3, hide: 1 }
  }
};

const craftingElements = {
  equippedToolName: document.getElementById("equippedToolName"),
  status: document.getElementById("craftingStatus"),
  inventory: {
    sticks: document.getElementById("craftSticksCount"),
    stonePebbles: document.getElementById("craftStoneCount"),
    hide: document.getElementById("craftHideCount"),
    leather: document.getElementById("craftLeatherCount"),
    leatherBinding: document.getElementById("craftBindingCount")
  },
  recipes: {
    woodenPickaxe: {
      owned: document.getElementById("woodenPickaxeOwned"),
      requirements: document.getElementById("woodenPickaxeRequirements"),
      craft: document.getElementById("craftWoodenPickaxe"),
      equip: document.getElementById("equipWoodenPickaxe")
    },
    woodenSword: {
      owned: document.getElementById("woodenSwordOwned"),
      requirements: document.getElementById("woodenSwordRequirements"),
      craft: document.getElementById("craftWoodenSword"),
      equip: document.getElementById("equipWoodenSword")
    },
    woodenHoe: {
      owned: document.getElementById("woodenHoeOwned"),
      requirements: document.getElementById("woodenHoeRequirements"),
      craft: document.getElementById("craftWoodenHoe"),
      equip: document.getElementById("equipWoodenHoe")
    }
  }
};

function ensureCraftingState() {
  const savedEquipment = game.equipment || {};
  game.resources = {
    sticks: 0,
    stonePebbles: 0,
    hide: 0,
    leather: 0,
    leatherBinding: 0,
    ...(game.resources || {})
  };
  game.equipment = {
    ...craftingDefaults.equipment,
    ...savedEquipment
  };
}

function hasRecipeMaterials(recipeKey) {
  const recipe = craftingRecipes[recipeKey];
  return Object.entries(recipe.costs).every(([resource, amount]) => game.resources[resource] >= amount);
}

function formatRecipeRequirements(recipeKey) {
  const recipe = craftingRecipes[recipeKey];
  return Object.entries(recipe.costs)
    .map(([resource, amount]) => {
      const labels = {
        sticks: "sticks",
        stonePebbles: "stone pebbles",
        hide: "hide"
      };
      return `${amount} ${labels[resource] || resource}`;
    })
    .join(", ");
}

function renderCrafting() {
  ensureCraftingState();

  Object.entries(craftingElements.inventory).forEach(([resource, element]) => {
    element.textContent = formatNumber(game.resources[resource]);
  });

  const equipped = game.equipment.equippedTool;
  craftingElements.equippedToolName.textContent = equipped ? craftingRecipes[equipped].name : "None";

  Object.entries(craftingRecipes).forEach(([key, recipe]) => {
    const elements = craftingElements.recipes[key];
    const affordable = hasRecipeMaterials(key);
    const owned = game.equipment[key] || 0;

    elements.owned.textContent = formatNumber(owned);
    elements.requirements.textContent = `Requires ${formatRecipeRequirements(key)}.`;
    elements.craft.disabled = !affordable;
    elements.craft.textContent = affordable ? `Craft ${recipe.name}` : `Need ${formatRecipeRequirements(key)}`;
    elements.equip.disabled = owned < 1;
    elements.equip.textContent = equipped === key ? "Equipped" : "Equip";
  });
}

function craftItem(recipeKey) {
  ensureCraftingState();
  const recipe = craftingRecipes[recipeKey];

  if (!hasRecipeMaterials(recipeKey)) {
    craftingElements.status.textContent = `Not enough materials for ${recipe.name}.`;
    renderCrafting();
    return;
  }

  Object.entries(recipe.costs).forEach(([resource, amount]) => {
    game.resources[resource] -= amount;
  });
  game.equipment[recipeKey] += 1;
  craftingElements.status.textContent = `Crafted ${recipe.name}.`;
  renderCrafting();
  if (typeof renderExploration === "function") renderExploration();
  saveGame();
}

function equipItem(recipeKey) {
  ensureCraftingState();
  if ((game.equipment[recipeKey] || 0) < 1) return;

  game.equipment.equippedTool = recipeKey;
  craftingElements.status.textContent = `Equipped ${craftingRecipes[recipeKey].name}.`;
  renderCrafting();
  saveGame();
}

Object.keys(craftingRecipes).forEach((key) => {
  craftingElements.recipes[key].craft.addEventListener("click", () => craftItem(key));
  craftingElements.recipes[key].equip.addEventListener("click", () => equipItem(key));
});

resetButton.addEventListener("click", () => {
  ensureCraftingState();
  renderCrafting();
  saveGame();
});

ensureCraftingState();
renderCrafting();
saveGame();
