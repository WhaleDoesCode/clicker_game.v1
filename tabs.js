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

Object.entries(gameSectionTabs).forEach(([name, section]) => {
  section.button.addEventListener("click", () => setActiveGameSection(name));
});

setActiveGameSection("mining");