# Clicker Game Ideas

This file is the working idea board for the project. Keep rough ideas here before changing the game.

## Current game

- Tap to earn gold.
- Buy stronger tap power.
- Hire miners for passive income.
- Progress saves in the browser with `localStorage`.
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
