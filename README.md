# Gold Clicker

A static browser idle/clicker game built with HTML, CSS, and vanilla JavaScript. It runs entirely in the browser and saves to `localStorage` under the stable key `clickerGameSaveV1`.

## Current controls

- **Mining:** tap for Gold, buy tap power, hire miners, mine Iron Ore after crafting a pickaxe, and assign miners between Gold and Iron once the Rocky Trail is unlocked.
- **Exploring:** pick an unlocked location, explore on a timestamp cooldown, collect materials and location clues, and buy Expedition Upgrades.
- **Crafting:** process Hide into Leather and Leather Bindings, craft tools, and use the Furnace to queue Iron Ingot smelting from Iron Ore plus Coal.
- **Farming:** plant and harvest Wheat after crafting a hoe.
- **Debug:** tap the hidden Combat debug hotspot five times to reveal saved debug controls for resources, milestones, cooldowns, and free crafting.

## Local testing

No build step or package install is required. Useful checks:

```bash
node --check script.js explore.js crafting.js farming.js debug.js tabs.js
node tests/static-checks.js
```

## No paid services required

This game does not use Replit, Replit Agent, a database, a backend server, or any API credits.

## Publish free with GitHub Pages

1. Create a new GitHub repository.
2. Upload the repository files to the repository root.
3. Open the repository's **Settings**.
4. Open **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose the `main` branch and `/ (root)`.
7. Save the setting.

GitHub will publish the game at a URL similar to:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY-NAME/`

## Save behavior

The game saves in the browser using `localStorage`. Progress is stored separately on each browser/device. Older saves are normalized on load so new resources, Furnace state, exploration upgrades, worker assignments, and milestones receive safe defaults without resetting normal progress.
