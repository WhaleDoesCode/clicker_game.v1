# Clicker Game Ideas

This file is the working idea board for the project. Keep rough ideas here before changing the game.

## Current game

- Five main tabs: Mining, Farming, Exploring, Crafting, and Combat.
- Mining:
  - Tap to earn gold, buy stronger tap power, hire passive miners, and earn offline gold with the same capped safety philosophy as before.
  - Critical hits have a 10% chance and award 5× or 10× tap rewards.
  - Miner assignment keeps `game.miners` as total hired miners. Gold miners earn 1 gold/second; Iron miners earn 1 Iron Ore every 5 seconds, or every 4 seconds while an Iron Pickaxe is equipped.
- Exploring:
  - Forest is available immediately and can reveal Location Clues.
  - Rocky Trail unlocks permanently after 3 Location Clues and 12 Forest trips.
  - Forest and Rocky Trail are selectable; Old Ruins and Snowfields remain future locked locations unless Debug unlocks them visually.
  - Exploration resources, separate trip counts, selected location, cooldown, upgrades, unlocks, and recent-find log save in `localStorage`.
  - Compass shifts chance away from Nothing, Trail Boots reduce cooldown from the base duration, and Backpack can double material hauls. Location clues are never doubled.
- Crafting and Furnace:
  - Shared inventory displays sticks, stone pebbles, hide, leather, leather bindings, iron ore, iron ingots, coal, and clues where appropriate.
  - Hide -> Leather and Leather -> Binding processing remain instant recipes.
  - Iron Ingots now normally come from a timestamp-driven Furnace queue: 3 Iron Ore + 1 Coal -> 1 Iron Ingot.
  - Furnace has 3 levels, survives refresh/offline elapsed time, and saves queue state and lifetime batches.
  - Wooden and Iron tools remain craftable and equippable.
- Farming:
  - Wooden Hoe ownership is required before planting.
  - Wheat planting uses a 15-second timestamp-based growth timer.
  - Harvesting awards 3–6 Wheat, or 5–9 Wheat with an equipped Iron Hoe.
  - Debug No Cooldowns makes planted crops immediately harvestable.
- Progress:
  - Original Mining milestones remain.
  - Trail Finder, Trail Veteran, and Ironworker are saved permanent progression rewards.
- Progress saves with the existing `clickerGameSaveV1` key.

## Current Forest result table

| Result | Chance |
| --- | ---: |
| Nothing | 28% |
| 1 stick | 31% |
| 2 sticks | 11% |
| 1 stone pebble | 15% |
| 2 stone pebbles | 7% |
| 1 hide | 4% |
| 1 location clue | 4% |

## Current Rocky Trail result table

| Result | Chance |
| --- | ---: |
| Nothing | 20% |
| 1 stone pebble | 25% |
| 2 stone pebbles | 18% |
| 3 stone pebbles | 7% |
| 1 iron ore | 15% |
| 2 iron ore | 5% |
| 1 coal | 8% |
| 1 location clue | 2% |

## Current costs and progression

### Expedition Upgrades

| Upgrade | Level 1 | Level 2 | Level 3 | Effect |
| --- | --- | --- | --- | --- |
| Compass | 5 sticks, 5 stone pebbles | 10 sticks, 10 stone pebbles, 1 leather binding | 15 sticks, 15 stone pebbles, 2 leather bindings, 2 iron ingots | Each level shifts 2 percentage points from Nothing to useful loot proportionally. Trail Finder adds +5 more points. |
| Trail Boots | 2 leather, 1 leather binding | 4 leather, 2 leather bindings, 1 iron ingot | 6 leather, 3 leather bindings, 3 iron ingots | Cooldown is reduced from base by 10% per level. Trail Veteran multiplies the result by another 0.9. |
| Backpack | 8 sticks, 2 leather | 12 sticks, 3 leather, 2 leather bindings | 20 sticks, 5 leather, 3 leather bindings, 2 iron ingots | 15% / 25% / 35% chance to double material loot only. |

### Furnace

| Level | Cost | Queue | Time | Recipe |
| --- | --- | ---: | ---: | --- |
| 1 | 12 stone pebbles, 6 sticks, 1 leather binding | 1 batch | 12 seconds | 3 iron ore + 1 coal -> 1 iron ingot |
| 2 | 8 iron ingots, 15 stone pebbles, 4 leather bindings | 2 batches | 9 seconds | same |
| 3 | 16 iron ingots, 30 stone pebbles, 8 leather bindings | 5 batches | 6 seconds | same |

### Milestones

| Milestone | Requirement | Reward |
| --- | --- | --- |
| Trail Finder | Unlock Rocky Trail | +5% exploration luck |
| Trail Veteran | 50 total exploration trips | Another 10% exploration cooldown reduction |
| Ironworker | 25 lifetime furnace batches | Each furnace batch has a 10% chance for +1 bonus Iron Ingot |

## Implemented feature packages

### Mining foundation

- [x] Gold tapping
- [x] Tap upgrades
- [x] Passive miners
- [x] Offline earnings
- [x] Critical hits
- [x] Milestones
- [x] Permanent rewards
- [x] Worker assignment between Gold and Iron

### Exploring foundation and Rocky Trail expansion

- [x] Forest location
- [x] Explore button and timestamp cooldown
- [x] Weighted Forest loot table with Location Clues
- [x] Rocky Trail unlock from clues and Forest trips
- [x] Rocky Trail loot table with better stone, Iron Ore, Coal, and clues
- [x] Selectable location cards
- [x] Resource inventory and recent-find travel log
- [x] Compass, Trail Boots, and Backpack upgrades
- [x] Trail milestone rewards
- [x] Save compatibility
- [x] Future locked Old Ruins and Snowfields

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

### Crafting and Furnace foundation

- [x] Crafting main tab
- [x] Shared material inventory
- [x] Wooden Pickaxe, Wooden Sword, Wooden Hoe recipes
- [x] Hide -> Leather and Leather -> Binding processing
- [x] Iron Pickaxe, Iron Sword, and Iron Hoe recipes
- [x] Furnace unlock, construction, queueing, and upgrades
- [x] Coal resource
- [x] Iron Ore + Coal smelting into Iron Ingots
- [x] Refresh/offline Furnace completion
- [x] Equipment ownership and equip controls
- [x] Reset compatibility

## Future additions

### Crafting and equipment

- [ ] Add a proper `wooden_pickaxe.png` icon.
- [ ] Add Gold Pickaxe when a matching icon exists.
- [ ] Activate Sword bonuses when Combat exists.
- [ ] Add recipe unlock requirements and categories for Tools, Weapons, Armor, and Materials.
- [ ] Add crafting milestones and permanent rewards beyond Ironworker.

### Exploring

- [ ] Add herbs and berries as Farming ingredients.
- [ ] Add Old Ruins with treasure, leather bindings, and combat encounters.
- [ ] Add Snowfields with cold-weather resources and equipment requirements.
- [ ] Add lantern/torch or weather equipment gates.

### Mining

- [ ] Use `gold_ore.png` for the main mining button.
- [ ] Unlock deeper Gold/rare ore veins after iron milestones.
- [ ] Add higher worker specializations.

## Current resource and equipment icons

Canonical icon folder: `assets/icons/`. Coal, clue, Compass, Backpack, and Furnace currently use styled text/emoji fallbacks rather than nonexistent asset paths.

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
- 2026-07-13: Added Rocky Trail discovery, Location Clues, Coal, Expedition Upgrades, the timed Furnace, miner worker assignment, Trail milestones, centralized state normalization, Debug integration, and static tests for the connected progression package.
