(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  const filters = ["全部", "现场痕迹", "电子记录", "证词", "医学"];
  let activeFilter = "全部";

  function evidenceById(id) {
    return window.ZeroGreenhouse.evidence.find((item) => item.id === id);
  }

  function renderEvidence() {
    const { evidence, gameState } = window.ZeroGreenhouse;
    const evidenceCards = document.querySelector("#evidenceCards");
    const evidenceCount = document.querySelector("#evidenceCount");
    if (!evidenceCards || !evidenceCount) return;

    renderEvidenceTabDot();
    evidenceCards.innerHTML = "";
    evidenceCards.appendChild(renderFilterBar());

    evidence
      .filter((item) => activeFilter === "全部" || item.category === activeFilter)
      .forEach((item) => {
        const unlocked = gameState.foundEvidence.has(item.id);
        const isNew = gameState.newEvidence.has(item.id);
        const card = document.createElement("article");
        card.className = `card evidence-card ${unlocked ? "" : "locked"} ${isNew ? "new-evidence-card" : ""}`;
        if (!unlocked) {
          card.innerHTML = `<h3>空白记录</h3><p>还没有对应的现场观察。</p>`;
        } else {
          const foundAt = getFoundTime(item.id);
          card.tabIndex = 0;
          card.innerHTML = `
            <img class="evidence-thumb" src="${item.image}" alt="${item.title}">
            <div class="evidence-card-head">
              <h3>${item.title}</h3>
              ${isNew ? '<span class="new-dot" aria-label="新物证"></span>' : ""}
            </div>
            <p>${item.text}</p>
            <div class="evidence-meta">
              <span>${item.category}</span>
              <span>${item.sourceRoom}</span>
              ${item.important ? "<span>关键</span>" : ""}
            </div>
          `;
          card.addEventListener("click", () => openEvidenceDetail(item.id));
          card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openEvidenceDetail(item.id);
            }
          });
          card.title = `发现时间：${foundAt}`;
        }
        evidenceCards.appendChild(card);
      });

    evidenceCount.textContent = `${gameState.foundEvidence.size}/${evidence.length}`;
  }

  function renderFilterBar() {
    const bar = document.createElement("div");
    bar.className = "evidence-filters";
    filters.forEach((filter) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = filter === activeFilter ? "active" : "";
      button.textContent = filter;
      button.addEventListener("click", () => {
        activeFilter = filter;
        renderEvidence();
      });
      bar.appendChild(button);
    });
    return bar;
  }

  function getFoundTime(evidenceId) {
    const times = window.ZeroGreenhouse.gameState.evidenceFoundAt || {};
    return times[evidenceId] || "未知";
  }

  function openEvidenceDetail(evidenceId) {
    const item = evidenceById(evidenceId);
    if (!item) return;

    window.ZeroGreenhouse.state.markEvidenceViewed(evidenceId);
    renderEvidence();

    const related = item.relatedEvidence
      .map((id) => evidenceById(id))
      .filter(Boolean)
      .map((evidence) => evidence.title)
      .join("、") || "暂无";

    ensureEvidenceOverlay();
    const overlay = document.querySelector("#evidenceDetailOverlay");
    overlay.innerHTML = `
      <div class="evidence-discovery-card evidence-detail-card">
        <p class="label">物证详情</p>
        <h2>${item.title}</h2>
        <img class="evidence-detail-image" src="${item.image}" alt="${item.title}">
        <p>${item.text}</p>
        <dl>
          <div><dt>类型</dt><dd>${item.category}</dd></div>
          <div><dt>来源房间</dt><dd>${item.sourceRoom}</dd></div>
          <div><dt>来源物件</dt><dd>${item.sourceObject}</dd></div>
          <div><dt>发现时间</dt><dd>${getFoundTime(item.id)}</dd></div>
          <div><dt>关键证据</dt><dd>${item.important ? "是" : "否"}</dd></div>
          <div><dt>可关联证据</dt><dd>${related}</dd></div>
        </dl>
        <button class="primary evidence-close" type="button">关闭</button>
      </div>
    `;
    overlay.hidden = false;
    overlay.querySelector(".evidence-close").addEventListener("click", () => {
      overlay.hidden = true;
      renderEvidenceTabDot();
    });
  }

  function showEvidenceDiscovery(evidenceId) {
    const item = evidenceById(evidenceId);
    if (!item) return;

    ensureEvidenceOverlay();
    playDiscoverySound();
    const overlay = document.querySelector("#evidenceDetailOverlay");
    overlay.innerHTML = `
      <div class="evidence-discovery-card">
        <p class="label">发现物证</p>
        <h2>${item.title}</h2>
        <img class="evidence-detail-image" src="${item.image}" alt="${item.title}">
        <p>${item.text}</p>
        <div class="evidence-meta">
          <span>${item.category}</span>
          <span>${item.sourceRoom}</span>
          ${item.important ? "<span>关键</span>" : ""}
        </div>
        <button class="primary evidence-close" type="button">加入案卷</button>
      </div>
    `;
    overlay.hidden = false;
    overlay.querySelector(".evidence-close").addEventListener("click", () => {
      overlay.hidden = true;
      renderEvidence();
    });
    window.setTimeout(() => {
      if (!overlay.hidden) {
        overlay.hidden = true;
        renderEvidence();
      }
    }, 2600);
    renderEvidenceTabDot();
  }

  function ensureEvidenceOverlay() {
    if (document.querySelector("#evidenceDetailOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "evidenceDetailOverlay";
    overlay.className = "evidence-overlay";
    overlay.hidden = true;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.hidden = true;
    });
  }

  function playDiscoverySound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(990, context.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
    } catch {
      // Audio is optional; browsers may block it.
    }
  }

  function renderEvidenceTabDot() {
    const tab = document.querySelector('.tab[data-tab="evidence"]');
    if (!tab) return;
    tab.classList.toggle("has-new", window.ZeroGreenhouse.gameState.newEvidence.size > 0);
  }

  window.ZeroGreenhouse.evidenceModule = {
    openEvidenceDetail,
    renderEvidence,
    renderEvidenceTabDot,
    showEvidenceDiscovery
  };
})();
