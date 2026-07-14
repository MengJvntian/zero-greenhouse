(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  const storageKeys = {
    foundEvidence: "zeroGreenhouseFound",
    evidenceFoundAt: "zeroGreenhouseEvidenceFoundAt",
    crackedStatements: "zeroGreenhouseCrackedStatements",
    inspectedObjects: "zeroGreenhouseInspectedObjects",
    newEvidence: "zeroGreenhouseNewEvidence",
    objectStages: "zeroGreenhouseObjectStages",
    roomState: "zeroGreenhouseRoomState",
    reasoningSlots: "zeroGreenhouseReasoningSlots",
    solvedReasoning: "zeroGreenhouseSolved",
    timelineMarks: "zeroGreenhouseTimelineMarks",
    testimonyRecords: "zeroGreenhouseTestimonyRecords",
    viewedEvidence: "zeroGreenhouseViewedEvidence",
    unlockedDialogues: "zeroGreenhouseUnlockedDialogues"
  };

  const gameState = {
    currentRoom: null,
    currentObject: null,
    crackedStatements: new Set(),
    foundEvidence: new Set(),
    evidenceFoundAt: {},
    inspectedObjects: new Set(),
    newEvidence: new Set(),
    objectStages: {},
    roomState: {},
    reasoningSlots: {},
    solvedReasoning: new Set(),
    timelineMarks: {},
    testimonyRecords: new Set(),
    viewedEvidence: new Set(),
    unlockedDialogues: new Set(),
    selectedEvidence: [],
    caseProgress: 0
  };

  function readSet(key) {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      return new Set();
    }
  }

  function writeSet(key, value) {
    localStorage.setItem(key, JSON.stringify([...value]));
  }

  function readObject(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  }

  function writeObject(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function createRoomState(room) {
    return {
      locked: false,
      discovered: true,
      visited: false,
      inspectedCount: 0,
      totalInspectables: room.objects.length,
      completed: false,
      hasNewClue: false
    };
  }

  function ensureRoomState() {
    const rooms = window.ZeroGreenhouse.rooms || {};
    Object.entries(rooms).forEach(([roomId, room]) => {
      const existing = gameState.roomState[roomId] || {};
      gameState.roomState[roomId] = {
        ...createRoomState(room),
        ...existing,
        totalInspectables: room.objects.length
      };
    });
    recalculateRoomState();
  }

  function recalculateRoomState() {
    const rooms = window.ZeroGreenhouse.rooms || {};
    Object.entries(rooms).forEach(([roomId, room]) => {
      const state = gameState.roomState[roomId] || createRoomState(room);
      const inspectedCount = room.objects.filter((object) => gameState.inspectedObjects.has(object.id)).length;
      const hasUninspectedClue = room.objects.some((object) => object.clue && !gameState.inspectedObjects.has(object.id));
      state.inspectedCount = inspectedCount;
      state.totalInspectables = room.objects.length;
      state.completed = inspectedCount >= room.objects.length;
      state.hasNewClue = Boolean(state.visited && !state.completed && hasUninspectedClue);
      gameState.roomState[roomId] = state;
    });
  }

  function updateProgress() {
    const totalEvidence = window.ZeroGreenhouse.evidence?.length || 0;
    const totalReasoning = window.ZeroGreenhouse.deductions?.length || 0;
    const total = totalEvidence + totalReasoning;
    const complete = gameState.foundEvidence.size + gameState.solvedReasoning.size;
    gameState.caseProgress = total ? Math.round((complete / total) * 100) : 0;
  }

  function persistState() {
    recalculateRoomState();
    writeSet(storageKeys.foundEvidence, gameState.foundEvidence);
    writeSet(storageKeys.crackedStatements, gameState.crackedStatements);
    writeObject(storageKeys.evidenceFoundAt, gameState.evidenceFoundAt);
    writeSet(storageKeys.inspectedObjects, gameState.inspectedObjects);
    writeSet(storageKeys.newEvidence, gameState.newEvidence);
    writeObject(storageKeys.objectStages, gameState.objectStages);
    writeObject(storageKeys.roomState, gameState.roomState);
    writeObject(storageKeys.reasoningSlots, gameState.reasoningSlots);
    writeSet(storageKeys.solvedReasoning, gameState.solvedReasoning);
    writeObject(storageKeys.timelineMarks, gameState.timelineMarks);
    writeSet(storageKeys.testimonyRecords, gameState.testimonyRecords);
    writeSet(storageKeys.viewedEvidence, gameState.viewedEvidence);
    writeSet(storageKeys.unlockedDialogues, gameState.unlockedDialogues);
  }

  function hydrateState() {
    gameState.foundEvidence = readSet(storageKeys.foundEvidence);
    gameState.crackedStatements = readSet(storageKeys.crackedStatements);
    gameState.evidenceFoundAt = readObject(storageKeys.evidenceFoundAt);
    gameState.inspectedObjects = readSet(storageKeys.inspectedObjects);
    gameState.newEvidence = readSet(storageKeys.newEvidence);
    gameState.objectStages = readObject(storageKeys.objectStages);
    gameState.roomState = readObject(storageKeys.roomState);
    gameState.reasoningSlots = readObject(storageKeys.reasoningSlots);
    gameState.solvedReasoning = readSet(storageKeys.solvedReasoning);
    gameState.timelineMarks = readObject(storageKeys.timelineMarks);
    gameState.testimonyRecords = readSet(storageKeys.testimonyRecords);
    gameState.viewedEvidence = readSet(storageKeys.viewedEvidence);
    gameState.unlockedDialogues = readSet(storageKeys.unlockedDialogues);
    ensureRoomState();
    updateProgress();
  }

  function setCurrentRoom(roomId) {
    gameState.currentRoom = roomId;
    if (gameState.roomState[roomId]) {
      gameState.roomState[roomId].visited = true;
    }
    persistState();
  }

  function setCurrentObject(objectId) {
    gameState.currentObject = objectId;
    persistState();
  }

  function addObjectStage(objectId, stageId) {
    gameState.objectStages[objectId] = gameState.objectStages[objectId] || [];
    if (!gameState.objectStages[objectId].includes(stageId)) {
      gameState.objectStages[objectId].push(stageId);
      persistState();
      return true;
    }
    persistState();
    return false;
  }

  function completeObject(objectId) {
    const existed = gameState.inspectedObjects.has(objectId);
    gameState.inspectedObjects.add(objectId);
    persistState();
    return !existed;
  }

  function addFoundEvidence(evidenceId) {
    if (!evidenceId) return false;
    const existed = gameState.foundEvidence.has(evidenceId);
    gameState.foundEvidence.add(evidenceId);
    if (!existed) {
      gameState.newEvidence.add(evidenceId);
      gameState.evidenceFoundAt[evidenceId] = new Date().toLocaleString("zh-CN", {
        hour12: false,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
    updateProgress();
    persistState();
    return !existed;
  }

  function markEvidenceViewed(evidenceId) {
    gameState.viewedEvidence.add(evidenceId);
    gameState.newEvidence.delete(evidenceId);
    persistState();
  }

  function addSolvedReasoning(reasoningId) {
    const existed = gameState.solvedReasoning.has(reasoningId);
    gameState.solvedReasoning.add(reasoningId);
    updateProgress();
    persistState();
    return !existed;
  }

  function setReasoningSlot(nodeId, slotIndex, evidenceId) {
    gameState.reasoningSlots[nodeId] = gameState.reasoningSlots[nodeId] || [];
    gameState.reasoningSlots[nodeId][slotIndex] = evidenceId;
    persistState();
  }

  function clearReasoningSlot(nodeId, slotIndex) {
    gameState.reasoningSlots[nodeId] = gameState.reasoningSlots[nodeId] || [];
    gameState.reasoningSlots[nodeId][slotIndex] = null;
    persistState();
  }

  function crackStatement(statementId) {
    const existed = gameState.crackedStatements.has(statementId);
    gameState.crackedStatements.add(statementId);
    persistState();
    return !existed;
  }

  function setTimelineMark(evidenceId, mark) {
    if (!evidenceId || !mark) return;
    gameState.timelineMarks[evidenceId] = mark;
    persistState();
  }

  function unlockDialogue(dialogueId) {
    gameState.unlockedDialogues.add(dialogueId);
    persistState();
  }

  function addTestimonyRecord(recordId) {
    const existed = gameState.testimonyRecords.has(recordId);
    gameState.testimonyRecords.add(recordId);
    persistState();
    return !existed;
  }

  function setSelectedEvidence(evidenceIds) {
    gameState.selectedEvidence = [...evidenceIds];
  }

  function resetGameState() {
    gameState.currentRoom = null;
    gameState.currentObject = null;
    gameState.crackedStatements = new Set();
    gameState.foundEvidence = new Set();
    gameState.evidenceFoundAt = {};
    gameState.inspectedObjects = new Set();
    gameState.newEvidence = new Set();
    gameState.objectStages = {};
    gameState.roomState = {};
    gameState.reasoningSlots = {};
    gameState.solvedReasoning = new Set();
    gameState.timelineMarks = {};
    gameState.testimonyRecords = new Set();
    gameState.viewedEvidence = new Set();
    gameState.unlockedDialogues = new Set();
    gameState.selectedEvidence = [];
    gameState.caseProgress = 0;
    Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
    ensureRoomState();
  }

  hydrateState();

  window.ZeroGreenhouse.gameState = gameState;
  window.ZeroGreenhouse.state = {
    addFoundEvidence,
    addObjectStage,
    addSolvedReasoning,
    addTestimonyRecord,
    completeObject,
    crackStatement,
    clearReasoningSlot,
    hydrateState,
    markEvidenceViewed,
    recalculateRoomState,
    persistState,
    resetGameState,
    setReasoningSlot,
    setTimelineMark,
    setCurrentObject,
    setCurrentRoom,
    setSelectedEvidence,
    unlockDialogue,
    updateProgress
  };
})();
