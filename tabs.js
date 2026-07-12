const gameSectionTabs = {
  mining: { button: document.getElementById("miningGameTab"), panel: document.getElementById("miningGamePanel") },
  farming: { button: document.getElementById("farmingGameTab"), panel: document.getElementById("farmingGamePanel") },
  exploring: { button: document.getElementById("exploringGameTab"), panel: document.getElementById("exploringGamePanel") },
  crafting: { button: document.getElementById("craftingGameTab"), panel: document.getElementById("craftingGamePanel") },
  combat: { button: document.getElementById("combatGameTab"), panel: document.getElementById("combatGamePanel") }
};

function setActiveGameSection(sectionName) {
  Object.entries(gameSectionTabs).forEach(([name, section]) => {
    const isActive = name === sectionName;
    section.button.classList.toggle("active", isActive);
    section.button.setAttribute("aria-selected", String(isActive));
    section.panel.hidden = !isActive;
  });

  if (sectionName === "mining") {
    checkMilestones();
    render();
  }

  if (sectionName === "exploring" && typeof renderExploration === "function") {
    renderExploration();
  }

  if (sectionName === "crafting" && typeof renderCrafting === "function") {
    renderCrafting();
  }
}

function installCombatDebugShell() {
  const combatPanel = gameSectionTabs.combat.panel;
  if (!combatPanel || document.getElementById("combatDebugTrigger")) return;

  combatPanel.classList.add("combat-debug-host");

  const trigger = document.createElement("button");
  trigger.id = "combatDebugTrigger";
  trigger.type = "button";
  trigger.className = "combat-debug-trigger";
  trigger.setAttribute("aria-label", "Open debug panel");
  trigger.setAttribute("tabindex", "-1");

  const debugPanel = document.createElement("section");
  debugPanel.id = "combatDebugPanel";
  debugPanel.className = "combat-debug-panel";
  debugPanel.hidden = true;
  debugPanel.innerHTML = `
    <div class="combat-debug-heading">
      <div>
        <p class="eyebrow">Developer Tools</p>
        <h2>Debug</h2>
      </div>
      <button id="closeCombatDebug" class="combat-debug-close" type="button">Close</button>
    </div>
    <label class="combat-debug-control">
      <span>Debug option</span>
      <select id="combatDebugOption">
        <option value="">Choose an option</option>
        <option value="infiniteWood">Infinite Wood</option>
        <option value="infiniteStone">Infinite Stone Pebbles</option>
        <option value="infiniteHide">Infinite Hide</option>
        <option value="infiniteGold">Infinite Gold</option>
        <option value="unlockGear">Unlock All Gear</option>
        <option value="resetOverrides">Reset Debug Overrides</option>
      </select>
    </label>
    <button id="applyCombatDebug" type="button" disabled>Settings not implemented yet</button>
    <p class="combat-debug-note">This panel is only the control shell. No debug option changes the save or game yet.</p>
  `;

  combatPanel.append(trigger, debugPanel);

  const style = document.createElement("style");
  style.textContent = `
    .combat-debug-host { position: relative; }
    .combat-debug-trigger {
      position: absolute;
      top: 78px;
      right: 18px;
      z-index: 5;
      width: 72px;
      height: 72px;
      padding: 0;
      border: 0;
      background: transparent;
      box-shadow: none;
      opacity: 0;
      color: transparent;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    .combat-debug-trigger:active { transform: none; }
    .combat-debug-panel {
      position: relative;
      z-index: 6;
      display: grid;
      gap: 16px;
      margin-top: 20px;
      border: 1px solid rgba(96, 165, 250, 0.38);
      border-radius: 20px;
      padding: 18px;
      background: rgba(15, 23, 42, 0.96);
      text-align: left;
      box-shadow: 0 22px 50px rgba(0, 0, 0, 0.32);
    }
    .combat-debug-panel[hidden] { display: none; }
    .combat-debug-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .combat-debug-heading h2,
    .combat-debug-heading .eyebrow { margin-bottom: 0; }
    .combat-debug-close {
      width: auto;
      padding: 9px 12px;
      background: rgba(51, 65, 85, 0.9);
    }
    .combat-debug-control { display: grid; gap: 7px; }
    .combat-debug-control span { color: #cbd5e1; font-weight: 800; }
    .combat-debug-control select {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 12px;
      padding: 13px;
      background: #0f172a;
      color: #f8fafc;
      font: inherit;
    }
    .combat-debug-note {
      margin: 0;
      color: #94a3b8;
      font-size: 0.84rem;
      line-height: 1.45;
    }
  `;
  document.head.appendChild(style);

  trigger.addEventListener("click", () => {
    debugPanel.hidden = false;
  });

  debugPanel.querySelector("#closeCombatDebug").addEventListener("click", () => {
    debugPanel.hidden = true;
  });
}

Object.entries(gameSectionTabs).forEach(([name, section]) => {
  section.button.addEventListener("click", () => setActiveGameSection(name));
});

installCombatDebugShell();
setActiveGameSection("mining");
