# Clicker Game Ideas

This file is the working idea board for the project. Keep rough ideas here before changing the game.

## Current game

- Four main tabs: Mining, Farming, Exploring, and Combat.
- Mining:
  - Tap to earn gold.
  - Buy stronger tap power.
  - Hire miners for passive income.
  - Critical hits have a 10% chance and award 5× or 10× tap rewards.
  - Milestones and permanent rewards are visible and saved.
- Exploring:
  - Forest is the first available location.
  - The Explore button has a short cooldown.
  - Exploration can award sticks, stone pebbles, or nothing.
  - Sticks, stone pebbles, trip count, cooldown state, and the recent-find log save in `localStorage`.
  - Rocky Trail, Old Ruins, and Snowfields are visible as future locked locations.
- Progress saves in the browser with the existing `clickerGameSaveV1` key.

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

## Exploring plan

### Implemented first chunk

- [x] Replace the Exploring placeholder with a working Forest screen.
- [x] Add an Explore button.
- [x] Add a short cooldown so Exploring feels different from Mining.
- [x] Add an inventory display for sticks and stone pebbles.
- [x] Add a recent-find travel log.
- [x] Save exploration resources and progress without replacing the old save.
- [x] Show future locked locations.

### Current Forest result table

| Result | Chance |
| --- | ---: |
| Nothing | 35% |
| 1 stick | 35% |
| 2 sticks | 10% |
| 1 stone pebble | 15% |
| 2 stone pebbles | 5% |

### Next Exploring additions

- [ ] Add hide as an uncommon Forest find.
- [ ] Add herbs and berries as Farming ingredients.
- [ ] Add a small chance to discover location clues.
- [ ] Unlock Rocky Trail after a trip or resource milestone.
- [ ] Give Rocky Trail better stone drops and a coal chance.
- [ ] Add Old Ruins with treasure, leather binding, and combat encounters.
- [ ] Add Snowfields with cold-weather resources and equipment requirements.
- [ ] Add exploration upgrades for luck, cooldown, and carry capacity.
- [ ] Add exploration milestones and permanent rewards.
- [ ] Add rare events such as abandoned camps, wounded travelers, and treasure maps.

## Icon checklist for future work

### Already available

- Sticks
- Stone pebbles
- Hide
- Leather
- Leather binding
- Wooden sword
- Iron sword
- Gold sword
- Wooden hoe
- Iron hoe
- Gold hoe
- Iron ore
- Iron ingot
- Gold ore
- Gold ingot

### Exploring icons still needed

- Forest location icon
- Rocky Trail location icon
- Old Ruins location icon
- Snowfields location icon
- Herb bundle
- Berries
- Coal
- Treasure map
- Location clue or map fragment
- Small treasure chest
- Abandoned camp
- Backpack or carry-capacity icon
- Exploration boots
- Compass
- Lantern or torch

### Farming icons likely needed

- Seeds
- Wheat
- Carrot
- Potato
- Corn
- Watering can
- Soil plot
- Fertilizer
- Wooden scythe or sickle
- Iron scythe or sickle
- Gold scythe or sickle

### Combat icons likely needed

- Basic enemy or slime
- Forest wolf
- Bandit
- Health potion
- Shield
- Helmet
- Chest armor
- Boots
- Ring
- Damage icon
- Defense icon

## Next Mining ideas

- [ ] Use `gold_ore.png` for the main mining button.
- [ ] Add iron as the first mineable resource.
- [ ] Unlock gold after reaching an iron milestone.
- [ ] Add smelting: ore becomes ingots.
- [ ] Use ingots for upgrades instead of raw ore.
- [ ] Add separate inventory counts for ore and ingots.
- [ ] Add a furnace upgrade.
- [ ] Add miners assigned to iron or gold.
- [ ] Add offline production limits and a clearer welcome-back summary.
- [ ] Add small tap animations and floating reward numbers.

## Ten gameplay ideas

1. **Two-resource loop**  
   Mine iron first, smelt it into ingots, then use iron upgrades to unlock gold mining.

2. **Smelter system**  
   Ore is not instantly valuable. Players feed ore into a smelter that converts it into ingots over time.

3. **Tool tiers**  
   Wooden → stone → iron → gold → fantasy late-game tier, with stronger gathering and critical-hit bonuses.

4. **Critical hits — IMPLEMENTED**  
   Every mining tap has a chance to strike a rich vein and award 5× or 10× resources.

5. **Resource-specific workers**  
   Iron miners gather iron ore, gold miners gather gold ore, and smelters automatically refine both.

6. **Mine depth progression**  
   Start at the surface, then unlock deeper layers with better rewards, higher costs, and new materials.

7. **Random ore veins**  
   Temporary rich veins appear for a limited time and provide bonus income.

8. **Upgrade paths with choices**  
   Let players specialize in tapping, passive income, smelting, farming, exploration, or combat.

9. **Prestige system**  
   Reset progression for permanent reputation or profession points.

10. **Collection and milestones — IMPLEMENTED FOR MINING**  
    Track progress in visible milestone collections with one-time and permanent rewards.

## Save and safety rules

- Keep the current save key compatible when possible.
- Add new save fields with defaults so old saves still load.
- Never wipe a save during a normal update.
- Keep reset behind a confirmation prompt.
- Avoid paid services, databases, and API dependencies.
- Keep the game deployable through GitHub Pages.
- Canonical icon names use lowercase snake_case.

## Change log for this file

- 2026-07-12: Created the initial project idea board.
- 2026-07-12: Added ten gameplay ideas for progression, automation, events, upgrades, prestige, and milestones.
- 2026-07-12: Implemented critical hits with 5×/10× rewards, visible feedback, and save-compatible `critChance` data.
- 2026-07-12: Implemented three visible Mining milestones with saved progress and one-time rewards.
- 2026-07-12: Added the Exploring roadmap, icon checklist, Forest result table, and first playable Exploring loop.