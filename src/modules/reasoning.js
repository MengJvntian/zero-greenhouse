(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  let activeNodeId = null;
  let selectedEvidenceId = null;
  let draggedEvidenceId = null;

  function getEvidence(evidenceId) {
    return window.ZeroGreenhouse.evidence.find((item) => item.id === evidenceId);
  }

  function getActiveNode() {
    const { deductions } = window.ZeroGreenhouse;
    return deductions.find((node) => node.id === activeNodeId) || deductions[0];
  }

  function getSlots(node) {
    const saved = window.ZeroGreenhouse.gameState.reasoningSlots[node.id] || [];
    return node.slots.map((_, index) => saved[index] || null);
  }

  function nodeReady(node) {
    return node.acceptedEvidence.some((combo) => combo.every((id) => window.ZeroGreenhouse.gameState.foundEvidence.has(id)));
  }

  function slotAccepts(slot, evidenceId) {
    const evidence = getEvidence(evidenceId);
    return Boolean(evidence && (!slot.category || evidence.category === slot.category));
  }

  function isCorrectCombination(node, slots) {
    return node.acceptedEvidence.some((combo) => {
      if (combo.length !== slots.length) return false;
      const placed = [...slots].sort().join("|");
      const accepted = [...combo].sort().join("|");
      return placed === accepted;
    });
  }

  function renderDeductions() {
    const { deductions, gameState } = window.ZeroGreenhouse;
    const deductionList = document.querySelector("#deductionList");
    const deductionCount = document.querySelector("#deductionCount");
    if (!deductionList || !deductionCount) return;

    if (!activeNodeId || !deductions.some((node) => node.id === activeNodeId)) {
      activeNodeId = deductions[0]?.id || null;
    }

    const activeNode = getActiveNode();
    deductionList.innerHTML = `
      <section class="reasoning-board">
        <div class="reasoning-column evidence-pool">
          <h3>已发现物证</h3>
          <div class="reasoning-evidence-list" id="reasoningEvidenceList">
            ${renderEvidencePool(activeNode)}
          </div>
        </div>
        <div class="reasoning-column reasoning-node">
          <div class="reasoning-node-tabs">
            ${deductions.map((node) => renderNodeTab(node)).join("")}
          </div>
          ${renderActiveNode(activeNode)}
        </div>
        <div class="reasoning-column conclusion-column">
          <h3>已形成推论</h3>
          <div class="conclusion-list">
            ${renderConclusions()}
          </div>
        </div>
      </section>
    `;

    bindReasoningEvents(activeNode);
    deductionCount.textContent = `${gameState.solvedReasoning.size}/${deductions.length}`;
  }

  function renderEvidencePool(activeNode) {
    const { evidence, gameState } = window.ZeroGreenhouse;
    const found = evidence.filter((item) => gameState.foundEvidence.has(item.id));
    if (!found.length) {
      return "<p class=\"reasoning-empty\">还没有可用于推理的物证。</p>";
    }

    return found.map((item) => {
      const compatible = activeNode.slots.some((slot) => slotAccepts(slot, item.id));
      const selected = selectedEvidenceId === item.id;
      return `
        <button class="reasoning-card ${selected ? "selected" : ""} ${compatible ? "" : "muted"}" type="button" draggable="true" data-evidence="${item.id}">
          <img src="${item.image}" alt="${item.title}">
          <strong>${item.title}</strong>
          <span>${item.category}</span>
        </button>
      `;
    }).join("");
  }

  function renderNodeTab(node) {
    const solved = window.ZeroGreenhouse.gameState.solvedReasoning.has(node.id);
    const ready = nodeReady(node);
    return `
      <button class="node-tab ${activeNodeId === node.id ? "active" : ""} ${solved ? "solved" : ""}" type="button" data-node="${node.id}">
        <span>${node.title}</span>
        <small>${solved ? "已生成" : ready ? "可推理" : "证据不足"}</small>
      </button>
    `;
  }

  function renderActiveNode(node) {
    if (!node) return "<p class=\"reasoning-empty\">没有推理节点。</p>";
    const slots = getSlots(node);
    const solved = window.ZeroGreenhouse.gameState.solvedReasoning.has(node.id);
    return `
      <div class="reasoning-question">
        <p class="label">推理节点</p>
        <h3>${node.title}</h3>
        <p>${node.prompt}</p>
      </div>
      <div class="reasoning-slots">
        ${node.slots.map((slot, index) => renderSlot(node, slot, slots[index], index, solved)).join("")}
      </div>
      <div class="reasoning-controls">
        <button class="primary" id="checkReasoning" type="button" ${solved ? "disabled" : ""}>验证推论</button>
        <button class="ghost" id="clearReasoning" type="button" ${solved ? "disabled" : ""}>清空槽位</button>
      </div>
      <p class="reasoning-feedback ${solved ? "correct" : ""}" id="reasoningFeedback">
        ${solved ? node.conclusion : ""}
      </p>
    `;
  }

  function renderSlot(node, slot, evidenceId, index, solved) {
    const evidence = evidenceId ? getEvidence(evidenceId) : null;
    return `
      <button class="reasoning-slot ${evidence ? "filled" : ""}" type="button" data-slot="${index}" ${solved ? "disabled" : ""}>
        <small>${slot.label}</small>
        ${evidence ? `<strong>${evidence.title}</strong><span>${evidence.category}</span><em data-remove-slot="${index}">移除</em>` : "<strong>放入物证</strong><span>点击已发现物证或拖入这里</span>"}
      </button>
    `;
  }

  function renderConclusions() {
    const { deductions, gameState } = window.ZeroGreenhouse;
    const solved = deductions.filter((node) => gameState.solvedReasoning.has(node.id));
    if (!solved.length) return "<p class=\"reasoning-empty\">推论尚未形成。</p>";
    return solved.map((node) => `
      <article class="reasoning-conclusion">
        <strong>${node.title}</strong>
        <p>${node.conclusion}</p>
      </article>
    `).join("");
  }

  function bindReasoningEvents(activeNode) {
    const board = document.querySelector("#deductionList");
    if (!board || !activeNode) return;

    board.querySelectorAll("[data-node]").forEach((button) => {
      button.addEventListener("click", () => {
        activeNodeId = button.dataset.node;
        selectedEvidenceId = null;
        renderDeductions();
      });
    });

    board.querySelectorAll("[data-evidence]").forEach((card) => {
      card.addEventListener("click", () => {
        selectedEvidenceId = selectedEvidenceId === card.dataset.evidence ? null : card.dataset.evidence;
        renderDeductions();
      });
      card.addEventListener("dragstart", (event) => {
        draggedEvidenceId = card.dataset.evidence;
        event.dataTransfer.setData("text/plain", card.dataset.evidence);
        event.dataTransfer.effectAllowed = "copy";
      });
      card.addEventListener("dragend", () => {
        draggedEvidenceId = null;
      });
    });

    board.querySelectorAll("[data-slot]").forEach((slotButton) => {
      slotButton.addEventListener("click", (event) => {
        const removeTarget = event.target.closest("[data-remove-slot]");
        if (removeTarget) {
          clearSlot(activeNode.id, Number(removeTarget.dataset.removeSlot));
          return;
        }
        placeSelectedEvidence(activeNode, Number(slotButton.dataset.slot));
      });
      slotButton.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        slotButton.classList.add("drag-over");
      });
      slotButton.addEventListener("dragleave", () => {
        slotButton.classList.remove("drag-over");
      });
      slotButton.addEventListener("drop", (event) => {
        event.preventDefault();
        slotButton.classList.remove("drag-over");
        const evidenceId = event.dataTransfer.getData("text/plain") || draggedEvidenceId;
        draggedEvidenceId = null;
        placeEvidence(activeNode, Number(slotButton.dataset.slot), evidenceId);
      });
    });

    board.querySelector("#checkReasoning")?.addEventListener("click", () => checkReasoning(activeNode));
    board.querySelector("#clearReasoning")?.addEventListener("click", () => clearAllSlots(activeNode));
  }

  function placeSelectedEvidence(node, slotIndex) {
    if (!selectedEvidenceId) return;
    placeEvidence(node, slotIndex, selectedEvidenceId);
  }

  function placeEvidence(node, slotIndex, evidenceId) {
    const { state, toast } = window.ZeroGreenhouse;
    const slot = node.slots[slotIndex];
    if (!evidenceId || !window.ZeroGreenhouse.gameState.foundEvidence.has(evidenceId)) return;
    if (!slotAccepts(slot, evidenceId)) {
      toast.showToast("这项物证类型放不进当前槽位。");
      return;
    }
    state.setReasoningSlot(node.id, slotIndex, evidenceId);
    selectedEvidenceId = null;
    renderDeductions();
  }

  function clearSlot(nodeId, slotIndex) {
    window.ZeroGreenhouse.state.clearReasoningSlot(nodeId, slotIndex);
    renderDeductions();
  }

  function clearAllSlots(node) {
    node.slots.forEach((_, index) => window.ZeroGreenhouse.state.clearReasoningSlot(node.id, index));
    selectedEvidenceId = null;
    renderDeductions();
  }

  function checkReasoning(node) {
    const { state, toast } = window.ZeroGreenhouse;
    const slots = getSlots(node);
    const feedback = document.querySelector("#reasoningFeedback");
    if (slots.some((id) => !id)) {
      if (feedback) {
        feedback.textContent = "槽位还没有放满。";
        feedback.className = "reasoning-feedback wrong";
      }
      return;
    }

    if (!isCorrectCombination(node, slots)) {
      if (feedback) {
        feedback.textContent = node.hint;
        feedback.className = "reasoning-feedback wrong";
      }
      toast.showToast("组合还不能支撑这个推论。");
      return;
    }

    state.addSolvedReasoning(node.id);
    toast.showToast("推论成立，已加入逻辑链。");
    renderDeductions();
  }

  window.ZeroGreenhouse.reasoningModule = { renderDeductions };
})();
