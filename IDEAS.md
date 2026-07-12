# Clicker Game Ideas

This file is the working idea board for the project. Keep rough ideas here before changing the game.

## Current game

- Tap to earn gold.
- Buy stronger tap power.
- Hire miners for passive income.
- Progress saves in the browser with `localStorage`.
- Critical hits are implemented:
  - 10% chance per tap.
  - Critical taps award either 5× or 10× tap rewards.
  - A quick `CRITICAL!` message appears on the mine button.
  - `critChance` is stored in the existing save data.
- Current resource icons live in `assets/icons/`:
  - `iron_ore.png`
  - `iron_ingot.png`
  - `gold_ore.png`
  - `gold_ingot.png`

## Next ideas to discuss

- [ ] Use `gold_ore.png` for the main mining button.
- [ ] Add iron as the first mineable resource.
- [ ] Unlock gold after reaching an iron milestone.
- [ ] Add smelting: ore becomes ingots.
- [ ] Use ingots for upgrades instead of raw ore.
- [ ] Add separate inventory counts for ore and ingots.
- [ ] Add a furnace upgrade.
- [ ] Add miners assigned to iron or gold.
- [ ] Add offline production limits and a clearer welcome-back summary.
- [ ] Add small tap animations and floating `+1` numbers.

## Ten gameplay ideas

1. **Two-resource loop**  
   Mine iron first, smelt it into ingots, then use iron upgrades to unlock gold mining.

2. **Smelter system**  
   Ore is not instantly valuable. Players feed ore into a smelter that converts it into ingots over time.

3. **Tool tiers**  
   Wooden pickaxe → stone → iron → gold → fantasy late-game tier, with each tier increasing tap power and possibly critical-hit chance.

4. **Critical hits — IMPLEMENTED**  
   Every tap has a chance to strike a rich vein and award 5× or 10× resources.

5. **Resource-specific workers**  
   Iron miners gather iron ore, gold miners gather gold ore, and smelters automatically refine both.

6. **Mine depth progression**  
   Start at the surface, then unlock deeper layers with better rewards, higher costs, and new materials.

7. **Random ore veins**  
   Temporary events such as a Rich Gold Vein appear for 10–30 seconds and provide bonus income while active.

8. **Upgrade paths with choices**  
   Let players specialize in faster tapping, stronger passive income, better smelting, or higher rare-drop chance.

9. **Prestige system**  
   Reset the mine for permanent Mine Reputation or Prospector Points that improve future runs.

10. **Collection and milestones**  
    Add achievements such as mining 1,000 iron ore, owning 25 miners, or smelting the first gold ingot, each with a permanent reward.

## Possible game loop

1. Mine iron ore by tapping.
2. Buy better tools with iron ore.
3. Unlock a furnace.
4. Smelt iron ore into iron ingots.
5. Use iron ingots to unlock gold mining.
6. Mine and smelt gold.
7. Use gold ingots for stronger late-game upgrades.

## Resource ideas

### Iron

- Iron ore
- Iron ingot
- Iron miner
- Iron pickaxe
- Iron furnace upgrade

### Gold

- Gold ore
- Gold ingot
- Gold miner
- Gold pickaxe
- Gold furnace upgrade

## Upgrade ideas

- Pickaxe strength
- Miner speed
- Miner capacity
- Furnace speed
- Furnace batch size
- Ore value multiplier
- Ingot value multiplier
- Offline production time
- Critical tap chance
- Auto-smelting

## UI ideas

- Resource tabs for Iron and Gold.
- Inventory bar showing all four resources.
- Large centered resource icon for the active mine.
- Progress bar toward the next unlock.
- Upgrade cards grouped by mining, smelting, and automation.
- Small icon beside each cost.
- Clear disabled-state text showing what is missing.

## Save and safety rules

- Keep the current save key compatible when possible.
- Add new save fields with defaults so old saves still load.
- Never wipe a save during a normal update.
- Keep reset behind a confirmation prompt.
- Avoid paid services, databases, and API dependencies.
- Keep the game deployable through GitHub Pages.

## Decisions made

- The canonical icon folder is `assets/icons/`.
- Canonical icon names use lowercase snake_case.
- Current icons:
  - `iron_ore.png`
  - `iron_ingot.png`
  - `gold_ore.png`
  - `gold_ingot.png`

## Parking lot

Put random ideas here without worrying about order or feasibility.

- 

## Change log for this file

- 2026-07-12: Created the initial project idea board.
- 2026-07-12: Added ten gameplay ideas for progression, automation, events, upgrades, prestige, and milestones.
- 2026-07-12: Implemented critical hits with 5×/10× rewards, visible feedback, and save-compatible `critChance` data.
