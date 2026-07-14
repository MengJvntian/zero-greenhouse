(function () {
  const app = window.ZeroGreenhouse;

  function renderAll() {
    app.evidenceModule.renderEvidence();
    app.dialogueModule.renderPeople();
    app.reasoningModule.renderDeductions();
    app.timelineModule.renderTimeline();
    app.verdictModule.renderVerdictFlow();
    app.sceneModule.renderRoomStatuses();
  }

  function switchTab(tabName) {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
    document.querySelectorAll(".tab-page").forEach((page) => {
      page.classList.toggle("active", page.id === tabName);
    });
  }

  function bindTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });
  }

  function resetCase() {
    app.state.resetGameState();
    app.sceneModule.resetSceneView();
    app.inspectionModule.resetInspectionView();
    app.dialogueModule.resetDialogueView();
    app.timelineModule.resetTimelineView();
    app.verdictModule.resetVerdictView();
    renderAll();
  }

  function init() {
    bindTabs();
    app.sceneModule.bindSceneEvents();
    app.inspectionModule.bindInspectionEvents();
    app.verdictModule.bindVerdictEvents();
    document.querySelector("#resetBtn")?.addEventListener("click", resetCase);
    renderAll();
  }

  init();
})();
