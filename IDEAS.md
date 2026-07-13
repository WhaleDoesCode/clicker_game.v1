# Clicker Game Ideas

This file is the working idea board for the project. Keep rough ideas here before changing the game.

## Current game

- Five main tabs: Mining, Farming, Exploring, Crafting, and Combat.
- Mining:
  - Tap to earn gold.
  - Buy stronger tap power.
  - Hire miners for passive income.
  - Critical hits have a 10% chance and award 5× or 10× tap rewards.
  - Milestones and permanent rewards are visible and saved.
- Exploring:
  - Forest is the first available location.
  - The Explore button has a short cooldown.
  - Exploration awards sticks, stone pebbles, hide, or nothing.
  - Resources, trip count, cooldown state, and the recent-find log save in `localStorage`.
  - Rocky Trail, Old Ruins, and Snowfields are visible as future locked locations.
- Farming:
  - Wooden Hoe ownership is required before planting.
  - Wheat planting uses a 15-second timestamp-based growth timer.
  - Harvesting awards 3–6 Wheat, or 5–9 Wheat with an equipped Iron Hoe.
  - Wheat inventory, harvest count, and the Farming log save with existing saves.
  - Debug No Cooldowns makes planted crops immediately harvestable.
- Crafting:
  - Shared inventory displays sticks, stone pebbles, hide, leather, leather bindings, iron ore, and iron ingots.
  - Wooden Pickaxe, Wooden Sword, Wooden Hoe, Iron Pickaxe, Iron Sword, and Iron Hoe recipes are implemented.
  - Crafting consumes the listed materials and grants owned equipment.
  - Crafted equipment can be equipped.
  - Hide can be processed into Leather, Leather can be processed into Leather Binding, and Iron Ore can be smelted into Iron Ingot.
  - Equipment ownership and the equipped tool save with the existing game save.
- Iron Mining:
  - The Gold Clicker loop remains unchanged.
  - A separate Iron Mine awards iron ore after the player owns a Wooden Pickaxe or better.
  - Iron ore and iron ingot inventory save with the existing save key.
  - Equipping an Iron Pickaxe increases iron ore per tap from 1 to 2.
- Progress saves with the existing `clickerGameSaveV1` key.

## Current Forest result table

| Result | Chance |
| --- | ---: |
| Nothing | 30% |
| 1 stick | 32% |
| 2 sticks | 12% |
| 1 stone pebble | 15% |
| 2 stone pebbles | 7% |
| 1 hide | 4% |

## Current crafting recipes

| Item | Materials | Purpose |
| --- | --- | --- |
| Wooden Pickaxe | 4 sticks, 6 stone pebbles | Starter Mining equipment |
| Wooden Sword | 5 sticks, 2 stone pebbles | Starter Combat equipment |
| Wooden Hoe | 4 sticks, 3 stone pebbles, 1 hide | Starter Farming equipment |
| 2 Hide -> Leather | 2 hide | Material processing |
| 2 Leather -> Binding | 2 leather | Material processing |
| Iron Ingot | 3 iron ore | Smelting |
| Iron Pickaxe | 4 iron ingots, 2 sticks, 1 leather binding | Iron Mining bonus while equipped |
| Iron Sword | 3 iron ingots, 2 sticks, 1 leather binding | Future Combat equipment |
| Iron Hoe | 2 iron ingots, 3 sticks, 1 leather binding | Wheat harvest bonus while equipped |

## Current resource and equipment icons

Canonical icon folder: `assets/icons/`

- `gold_ingot.png`
- `gold_ore.png`
- `gold_hoe.png`
- `gold_sword.png`
- `hide.png`
- `iron_ingot.png`
- `iron_ore.png`
- `iron_hoe.png`
- `iron_sword.png`
- `leather.png`
- `leather_binding.png`
- `sticks.png`
- `stone_pebbles.png`
- `wooden_hoe.png`
- `wooden_sword.png`

## Implemented feature packages

### Mining foundation

- [x] Gold tapping
- [x] Tap upgrades
- [x] Passive miners
- [x] Offline earnings
- [x] Critical hits
- [x] Milestones
- [x] Permanent rewards

### Exploring foundation

- [x] Forest location
- [x] Explore button and cooldown
- [x] Weighted loot table
- [x] Sticks and stone pebbles
- [x] Uncommon hide drop
- [x] Resource inventory
- [x] Recent-find travel log
- [x] Save compatibility
- [x] Future locked locations

### Farming foundation

- [x] Wooden Hoe ownership requirement
- [x] Wheat planting
- [x] 15-second timestamp-based growth
- [x] 3–6 Wheat harvest
- [x] Wheat inventory
- [x] Harvest count
- [x] Farming log
- [x] Save compatibility
- [x] Debug No Cooldowns compatibility

### Crafting foundation

- [x] Crafting main tab
- [x] Shared material inventory
- [x] Wooden Pickaxe recipe
- [x] Wooden Sword recipe
- [x] Wooden Hoe recipe
- [x] Clear requirements and disabled states
- [x] Material consumption
- [x] Equipment ownership
- [x] Equip controls
- [x] Saved equipment state
- [x] Reset compatibility

## Next Crafting additions

- [ ] Add a proper `wooden_pickaxe.png` icon.
- [x] Add recipes that process hide into leather.
- [x] Add recipes that process leather into leather bindings.
- [x] Add Iron Pickaxe, Iron Sword, and Iron Hoe recipes.
- [ ] Add Gold Pickaxe when a matching icon exists.
- [x] Give equipped tools real gameplay bonuses in their matching tabs for Iron Pickaxe and Iron Hoe.
- [ ] Activate Sword bonuses when Combat exists.
- [ ] Add recipe unlock requirements.
- [ ] Add crafting milestones and permanent rewards.
- [ ] Add recipe categories for Tools, Weapons, Armor, and Materials.

## Next Exploring additions

- [ ] Add herbs and berries as Farming ingredients.
- [ ] Add a small chance to discover location clues.
- [ ] Unlock Rocky Trail after a trip or resource milestone.
- [ ] Give Rocky Trail better stone drops and a coal chance.
- [ ] Add Old Ruins with treasure, leather bindings, and combat encounters.
- [ ] Add Snowfields with cold-weather resources and equipment requirements.
- [ ] Add exploration upgrades for luck, cooldown, and carry capacity.
- [ ] Add exploration milestones and permanent rewards.

## Next Mining additions

- [ ] Use `gold_ore.png` for the main mining button.
- [x] Add iron as the first mineable resource.
- [ ] Unlock gold after reaching an iron milestone.
- [x] Add smelting: ore becomes ingots.
- [x] Use ingots for iron tools instead of raw ore.
- [x] Add separate inventory counts for ore and ingots.
- [ ] Add a furnace upgrade.
- [ ] Add miners assigned to iron or gold.

## Icons still needed

### Crafting and equipment

- Wooden pickaxe
- Stone pickaxe
- Iron pickaxe
- Gold pickaxe
- Crafting hammer
- Furnace
- Backpack
- Shield
- Helmet
- Chest armor
- Boots
- Ring

### Exploring

- Forest location
- Rocky Trail location
- Old Ruins location
- Snowfields location
- Herb bundle
- Berries
- Coal
- Treasure map
- Location clue or map fragment
- Small treasure chest
- Compass
- Lantern or torch

### Farming

- Seeds
- Wheat
- Carrot
- Potato
- Corn
- Watering can
- Soil plot
- Fertilizer

### Combat

- Basic enemy or slime
- Forest wolf
- Bandit
- Health potion
- Damage icon
- Defense icon

## Save and safety rules

- Keep the current save key compatible when possible.
- Add new save fields with defaults so old saves still load.
- Never wipe a save during a normal update.
- Keep reset behind a confirmation prompt.
- Avoid paid services, databases, and API dependencies.
- Keep the game deployable through GitHub Pages.
- Canonical icon names use lowercase snake_case.

## Change log

- 2026-07-12: Created the initial project idea board.
- 2026-07-12: Added Mining critical hits and milestones.
- 2026-07-12: Added the first playable Exploring loop.
- 2026-07-12: Added hide drops and the first playable Crafting loop with three recipes and saved equipment.

- 2026-07-13: Added material processing, smelting, iron mining, iron inventory, iron equipment recipes, Iron Pickaxe mining yield, Iron Hoe wheat harvest bonuses, and debug support for iron progression.
