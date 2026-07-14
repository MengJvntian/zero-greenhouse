(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  function roomProgressLabel(roomKey) {
    const { gameState, rooms } = window.ZeroGreenhouse;
    const room = rooms[roomKey];
    const roomState = gameState.roomState[roomKey];
    if (!room || !roomState) return "";
    return `${room.name} · 已调查 ${roomState.inspectedCount}/${roomState.totalInspectables}`;
  }

  function setRoomHint(roomKey) {
    const roomHint = document.querySelector("#roomHint");
    if (roomHint) roomHint.textContent = roomProgressLabel(roomKey);
  }

  function renderMapHub() {
    const { gameState, rooms } = window.ZeroGreenhouse;
    const mapHub = document.querySelector("#mapHub");
    if (!mapHub) return;

    mapHub.innerHTML = Object.entries(rooms).map(([roomKey, room]) => {
      const roomState = gameState.roomState[roomKey];
      const status = roomState?.completed ? "已完成" : roomState?.visited ? "调查中" : "未进入";
      const marker = roomState?.completed ? "✓" : roomState?.hasNewClue ? "!" : roomState?.visited ? "•" : "";
      return `
        <button class="map-room-card ${gameState.currentRoom === roomKey ? "active-room" : ""} ${roomState?.visited && !roomState?.completed ? "visited-room" : ""} ${roomState?.completed ? "completed-room" : ""} ${roomState?.hasNewClue ? "new-clue-room" : ""}" type="button" data-room="${roomKey}" role="listitem" aria-label="${roomProgressLabel(roomKey)}">
          <img src="${room.image}" alt="${room.name}" loading="lazy">
          <span class="map-room-shade"></span>
          <span class="map-room-status">${marker}</span>
          <span class="map-room-text">
            <strong>${room.name}</strong>
            <small>${status} · 已调查 ${roomState?.inspectedCount || 0}/${roomState?.totalInspectables || room.objects.length}</small>
          </span>
        </button>
      `;
    }).join("");
  }

  function renderRoomStatuses() {
    if (window.ZeroGreenhouse.gameState.currentRoom) {
      setRoomHint(window.ZeroGreenhouse.gameState.currentRoom);
    }
    renderMapHub();
  }

  function openRoom(roomKey) {
    const { inspectionModule, rooms, state } = window.ZeroGreenhouse;
    const room = rooms[roomKey];
    if (!room) return;

    state.setCurrentRoom(roomKey);

    const inspectorTitle = document.querySelector("#inspectorTitle");
    const inspectorText = document.querySelector("#inspectorText");
    const roomHint = document.querySelector("#roomHint");
    const observationBox = document.querySelector("#observationBox");

    if (inspectorTitle) inspectorTitle.textContent = room.name;
    if (inspectorText) inspectorText.textContent = room.text;
    if (roomHint) roomHint.textContent = roomProgressLabel(roomKey);
    if (observationBox) observationBox.textContent = "选择一个物件细看。";

    inspectionModule.openInspection(room);
    renderRoomStatuses();
  }

  function bindSceneEvents() {
    const mapHub = document.querySelector("#mapHub");
    if (!mapHub) return;
    mapHub.addEventListener("click", (event) => {
      const card = event.target.closest("[data-room]");
      if (card) openRoom(card.dataset.room);
    });
    mapHub.addEventListener("mouseover", (event) => {
      const card = event.target.closest("[data-room]");
      if (card) setRoomHint(card.dataset.room);
    });
    mapHub.addEventListener("focusin", (event) => {
      const card = event.target.closest("[data-room]");
      if (card) setRoomHint(card.dataset.room);
    });
    mapHub.addEventListener("mouseout", () => {
      if (window.ZeroGreenhouse.gameState.currentRoom) setRoomHint(window.ZeroGreenhouse.gameState.currentRoom);
    });
  }

  function resetSceneView() {
    const roomHint = document.querySelector("#roomHint");
    const inspectorTitle = document.querySelector("#inspectorTitle");
    const inspectorText = document.querySelector("#inspectorText");

    if (roomHint) roomHint.textContent = "选择区域后，检查现场里的具体物件。";
    if (inspectorTitle) inspectorTitle.textContent = "尚未进入区域";
    if (inspectorText) inspectorText.textContent = "点击温室平面图上的区域进入近景。";
    renderRoomStatuses();
  }

  window.ZeroGreenhouse.sceneModule = { bindSceneEvents, openRoom, renderRoomStatuses, resetSceneView };
})();
