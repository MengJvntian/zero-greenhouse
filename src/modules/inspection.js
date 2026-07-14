(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  let hintsEnabled = false;
  let activeObject = null;

  function findObject(room, objectId) {
    return room.objects.find((object) => object.id === objectId);
  }

  function roomProgressText(roomKey) {
    const { gameState, rooms } = window.ZeroGreenhouse;
    const room = rooms[roomKey];
    const roomState = gameState.roomState[roomKey];
    if (!room || !roomState) return "";
    return `已调查 ${roomState.inspectedCount}/${roomState.totalInspectables}`;
  }

  function objectStages(object) {
    return object.stages || [
      {
        id: "observe",
        label: "仔细观察",
        evidenceId: object.clue,
        text: object.note
      }
    ];
  }

  function evidenceForObject(object) {
    if (!object?.clue) return null;
    return window.ZeroGreenhouse.evidence.find((item) => item.id === object.clue) || null;
  }

  function completedStageIds(object) {
    const { gameState } = window.ZeroGreenhouse;
    return gameState.objectStages[object.id] || [];
  }

  function stageIsAvailable(stage, completedIds) {
    return (stage.requires || []).every((id) => completedIds.includes(id));
  }

  function objectIsComplete(object) {
    const { gameState } = window.ZeroGreenhouse;
    return gameState.inspectedObjects.has(object.id);
  }

  function openInspection(room) {
    const view = document.querySelector("#inspectionView");
    const scene = document.querySelector("#inspectionScene");
    const title = document.querySelector("#inspectorTitle");
    const text = document.querySelector("#inspectorText");
    const observationBox = document.querySelector("#observationBox");
    if (!view || !scene) return;

    document.querySelector(".scene")?.classList.add("in-inspection");
    view.hidden = false;
    view.classList.remove("leaving");
    view.classList.add("entering");
    window.setTimeout(() => view.classList.remove("entering"), 220);

    if (title) title.textContent = room.name;
    if (text) text.textContent = `${room.text} ${roomProgressText(room.id)}`;
    if (observationBox) observationBox.textContent = "在近景中选择可疑物件。";

    renderInspectionScene(room);
  }

  function closeInspection() {
    const view = document.querySelector("#inspectionView");
    if (!view || view.hidden) return;

    view.classList.add("leaving");
    window.setTimeout(() => {
      view.hidden = true;
      view.classList.remove("leaving");
      document.querySelector(".scene")?.classList.remove("in-inspection");
    }, 180);
  }

  function renderInspectionScene(room) {
    const { gameState } = window.ZeroGreenhouse;
    const scene = document.querySelector("#inspectionScene");
    if (!scene) return;

    scene.className = `inspection-scene ${hintsEnabled ? "hints-on" : ""}`;
    scene.innerHTML = `
      <img class="inspection-scene-image" src="${room.image}" alt="${room.name}">
      <div class="inspection-vignette"></div>
      <div class="hotspot-cursor" id="hotspotCursor"></div>
    `;

    room.hotspots.forEach((hotspot) => {
      const object = findObject(room, hotspot.objectId);
      if (!object) return;

      const inspected = gameState.inspectedObjects.has(object.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `scene-hotspot ${inspected ? "inspected" : ""}`;
      button.dataset.hotspot = hotspot.id;
      button.style.left = `${hotspot.x}%`;
      button.style.top = `${hotspot.y}%`;
      button.style.width = `${hotspot.width}%`;
      button.style.height = `${hotspot.height}%`;
      button.setAttribute("aria-label", `${hotspot.label}，${hotspot.cursorText}`);
      button.title = hotspot.cursorText;
      button.addEventListener("mouseenter", () => showCursorText(hotspot.cursorText));
      button.addEventListener("focus", () => showCursorText(hotspot.cursorText));
      button.addEventListener("mouseleave", hideCursorText);
      button.addEventListener("blur", hideCursorText);
      button.addEventListener("click", () => openObjectZoom(object));
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openObjectZoom(object);
        }
      });
      scene.appendChild(button);
    });
  }

  function showCursorText(text) {
    const cursor = document.querySelector("#hotspotCursor");
    if (!cursor) return;
    cursor.textContent = text;
    cursor.classList.add("visible");
  }

  function hideCursorText() {
    document.querySelector("#hotspotCursor")?.classList.remove("visible");
  }

  function openObjectZoom(object) {
    const { state } = window.ZeroGreenhouse;
    const zoom = document.querySelector("#objectZoom");
    const title = document.querySelector("#objectZoomTitle");
    if (!zoom) return;

    activeObject = object;
    state.setCurrentObject(object.id);
    if (title) title.textContent = object.title || object.label;
    zoom.hidden = false;
    zoom.classList.remove("leaving");
    zoom.classList.add("entering");
    window.setTimeout(() => zoom.classList.remove("entering"), 180);
    renderObjectZoom();
  }

  function closeObjectZoom() {
    const zoom = document.querySelector("#objectZoom");
    if (!zoom || zoom.hidden) return;

    zoom.classList.add("leaving");
    window.setTimeout(() => {
      zoom.hidden = true;
      zoom.classList.remove("leaving");
      activeObject = null;
    }, 160);
  }

  function renderObjectZoom() {
    if (!activeObject) return;

    const { gameState } = window.ZeroGreenhouse;
    const visual = document.querySelector("#objectVisual");
    const observation = document.querySelector("#objectObservation");
    const stageList = document.querySelector("#objectStageList");
    const earned = document.querySelector("#objectEarned");
    const stages = objectStages(activeObject);
    const completedIds = completedStageIds(activeObject);
    const isComplete = objectIsComplete(activeObject);

    if (visual) {
      const evidence = evidenceForObject(activeObject);
      const image = activeObject.image || evidence?.image || null;
      visual.className = `object-visual ${activeObject.visual || "object-generic"} ${isComplete ? "complete" : ""}`;
      visual.innerHTML = image
        ? `<img class="object-image" src="${image}" alt="${activeObject.title || activeObject.label}">`
        : `
          <div class="object-shape shape-main"></div>
          <div class="object-shape shape-detail-a"></div>
          <div class="object-shape shape-detail-b"></div>
        `;
    }

    if (observation) {
      const lastCompleted = [...stages].reverse().find((stage) => completedIds.includes(stage.id));
      observation.textContent = lastCompleted?.text || "先看整体，再检查可疑细节。";
    }

    if (earned) {
      earned.textContent = isComplete && activeObject.clue ? `已记录物证：${activeObject.title || activeObject.label}` : "";
      earned.classList.toggle("visible", Boolean(earned.textContent));
    }

    if (!stageList) return;
    stageList.innerHTML = "";

    stages.forEach((stage) => {
      const done = completedIds.includes(stage.id);
      const available = stageIsAvailable(stage, completedIds);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `object-stage ${done ? "done" : ""}`;
      button.disabled = !available || done;
      button.textContent = done ? `${stage.label} ✓` : stage.label;
      button.addEventListener("click", () => inspectObjectStage(stage));
      stageList.appendChild(button);
    });

    if (isComplete) {
      const result = document.createElement("p");
      result.className = "object-result";
      result.textContent = "这个物件已经检查完毕。再次查看不会重复记录物证。";
      stageList.appendChild(result);
    }
  }

  function inspectObjectStage(stage) {
    if (!activeObject) return;

    const { evidenceModule, gameState, reasoningModule, rooms, sceneModule, state } = window.ZeroGreenhouse;
    const observationBox = document.querySelector("#observationBox");
    const objectObservation = document.querySelector("#objectObservation");
    const wasComplete = objectIsComplete(activeObject);

    state.addObjectStage(activeObject.id, stage.id);
    if (objectObservation) objectObservation.textContent = stage.text;
    if (observationBox) observationBox.textContent = stage.text;

    const evidenceWasNew = stage.evidenceId ? state.addFoundEvidence(stage.evidenceId) : false;
    const stages = objectStages(activeObject);
    const completedIds = completedStageIds(activeObject);
    const allRequiredDone = stages.every((item) => completedIds.includes(item.id));
    const shouldComplete = Boolean(stage.evidenceId) || allRequiredDone;

    if (shouldComplete) state.completeObject(activeObject.id);

    const isFirstCompletion = !wasComplete && objectIsComplete(activeObject);
    if (observationBox) {
      observationBox.classList.toggle("first-discovery", isFirstCompletion);
      if (isFirstCompletion) {
        window.setTimeout(() => observationBox.classList.remove("first-discovery"), 520);
      }
    }

    evidenceModule.renderEvidence();
    reasoningModule.renderDeductions();
    if (gameState.currentRoom) {
      const room = rooms[gameState.currentRoom];
      renderInspectionScene(room);
      const text = document.querySelector("#inspectorText");
      if (text) text.textContent = `${room.text} ${roomProgressText(gameState.currentRoom)}`;
    }
    sceneModule.renderRoomStatuses();
    renderObjectZoom();
    showEvidenceEarned(evidenceWasNew, isFirstCompletion, stage.evidenceId);
  }

  function showEvidenceEarned(evidenceWasNew, isFirstCompletion, evidenceId) {
    const earned = document.querySelector("#objectEarned");
    if (!earned || !activeObject) return;

    if (evidenceWasNew) {
      window.ZeroGreenhouse.evidenceModule.showEvidenceDiscovery(evidenceId);
      earned.textContent = `获得物证：${activeObject.title || activeObject.label}`;
      earned.classList.add("visible", "new-evidence");
      window.setTimeout(() => earned.classList.remove("new-evidence"), 900);
    } else if (isFirstCompletion && !activeObject.clue) {
      earned.textContent = "检查完毕：没有记录为物证。";
      earned.classList.add("visible");
    }
  }

  function bindInspectionEvents() {
    document.querySelector("#inspectionBack")?.addEventListener("click", closeInspection);
    document.querySelector("#objectClose")?.addEventListener("click", closeObjectZoom);
    document.querySelector("#hintToggle")?.addEventListener("click", () => {
      hintsEnabled = !hintsEnabled;
      const button = document.querySelector("#hintToggle");
      button?.setAttribute("aria-pressed", String(hintsEnabled));
      button?.classList.toggle("active", hintsEnabled);
      const { gameState, rooms } = window.ZeroGreenhouse;
      if (gameState.currentRoom) renderInspectionScene(rooms[gameState.currentRoom]);
    });
  }

  function resetInspectionView() {
    hintsEnabled = false;
    const view = document.querySelector("#inspectionView");
    const scene = document.querySelector("#inspectionScene");
    const zoom = document.querySelector("#objectZoom");
    const observationBox = document.querySelector("#observationBox");
    const hintToggle = document.querySelector("#hintToggle");
    if (view) {
      view.hidden = true;
      view.classList.remove("entering", "leaving");
    }
    document.querySelector(".scene")?.classList.remove("in-inspection");
    if (scene) scene.innerHTML = "";
    if (zoom) {
      zoom.hidden = true;
      zoom.classList.remove("entering", "leaving");
    }
    if (observationBox) observationBox.textContent = "等待检查。";
    if (hintToggle) {
      hintToggle.classList.remove("active");
      hintToggle.setAttribute("aria-pressed", "false");
    }
  }

  window.ZeroGreenhouse.inspectionModule = {
    bindInspectionEvents,
    closeInspection,
    closeObjectZoom,
    openObjectZoom,
    openInspection,
    resetInspectionView
  };
})();
