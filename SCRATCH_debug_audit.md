# Scratch Paper — Debug Trigger Audit

Status: first quick pass only. No code fix applied in this pass.

## Files read

- `index.html`
- `tabs.js`
- `debug.js`
- `debug.css`
- script load order at the bottom of `index.html`

## Main finding

There are **two separate Debug menu implementations active at the same time**.

### Debug system A — HTML + `debug.js` + `debug.css`

- `index.html` already contains:
  - `#debugHotspot`
  - `#debugPanel`
  - `#debugCloseButton`
- `debug.js` attaches the intended five-tap pointer sequence to `#debugHotspot`.
- `debug.css` controls the intended panel with `.debug-panel.is-open`.

This is the system that was repeatedly edited to require five taps.

### Debug system B — dynamically created by `tabs.js`

`tabs.js` also runs `installCombatDebugShell()` on page load.

That function creates a second set of elements:

- `#combatDebugTrigger`
- `#combatDebugPanel`
- `#closeCombatDebug`
- an additional invisible 72 × 72 trigger
- a second Debug dropdown panel
- inline CSS injected through a `<style>` element

Most importantly, this second trigger uses:

```js
trigger.addEventListener("click", () => {
  debugPanel.hidden = false;
});
```

That means this second Debug panel is intentionally opened by **one click/tap**.

## Why the five-tap fixes appeared not to work

The five-tap code in `debug.js` may be behaving correctly, but it is not the only trigger on the Combat screen.

The invisible one-click trigger created by `tabs.js` sits at:

```css
top: 78px;
right: 18px;
width: 72px;
height: 72px;
```

The original hidden five-tap hotspot sits at the bottom-right of the Combat panel.

Therefore, depending on where the screen is tapped, the user can hit the second one-click trigger and see a Debug panel immediately. Rewriting only `debug.js` could never remove that behavior.

## Script-order note

`index.html` loads scripts in this order:

1. `script.js`
2. `tabs.js`
3. `explore.js`
4. `crafting.js`
5. `debug.js`

Because `tabs.js` runs `installCombatDebugShell()` before `debug.js` loads, the duplicate one-click Debug shell is already installed by the time the five-tap code initializes.

## First-pass conclusion

The likely root cause is not reversed tap numbers or iPhone generating five pointer events.

The clear first-pass root cause is:

> `tabs.js` contains an older duplicate Debug implementation whose invisible trigger opens on one click.

## Next deeper-check targets

Before applying a fix, the next pass should verify:

- whether any CSS causes the two invisible trigger areas to overlap
- whether any other file references `combatDebugTrigger`, `combatDebugPanel`, `debugHotspot`, or `debugPanel`
- whether the desired final UI is the dropdown panel from `tabs.js` or the grouped placeholder panel in `index.html`
- which single implementation should remain
- whether removing `installCombatDebugShell()` affects any other tab behavior
- whether browser caching on GitHub Pages needs a cache-busting strategy after the fix

## Probable clean fix direction

Not applied yet:

1. Keep one Debug implementation only.
2. Remove the dynamic Debug shell and one-click listener from `tabs.js`.
3. Put the desired dropdown UI into the existing `#debugPanel`, or revise that one panel.
4. Keep one invisible hotspot with one five-tap controller.
5. Search the full repo for all Debug IDs and listeners.
6. Test one, two, four, and five taps separately.
