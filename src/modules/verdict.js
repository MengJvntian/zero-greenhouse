(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  const closureState = {
    stage: 0,
    culprit: "",
    culpritEvidence: new Set(),
    methodReasoning: "",
    forgeryReasoning: "",
    chain: [],
    epilogueIndex: 0,
    completed: false,
    message: ""
  };

  const chainChoices = ["关闭加热系统", "转移心脏药", "伪造门禁记录", "低温诱发心衰"];

  function evidenceTitle(id) {
    return window.ZeroGreenhouse.evidence.find((item) => item.id === id)?.title || id;
  }

  function reasoningTitle(id) {
    return window.ZeroGreenhouse.deductions.find((item) => item.id === id)?.title || id;
  }

  function hasReasoning(id) {
    return window.ZeroGreenhouse.gameState.solvedReasoning.has(id);
  }

  function missingRequiredReasoning() {
    return window.ZeroGreenhouse.solution.requiredReasoning.filter((id) => !hasReasoning(id));
  }

  function renderVerdictFlow() {
    const closure = document.querySelector("#caseClosure");
    if (!closure) return;

    closure.innerHTML = `
      <div class="closure-progress">
        ${["锁定凶手", "确定手法", "识别伪造", "逻辑链", "结案演出"].map((label, index) => `
          <span class="${closureState.stage === index + 1 ? "active" : ""} ${closureState.stage > index + 1 || closureState.completed ? "done" : ""}">${index + 1}. ${label}</span>
        `).join("")}
      </div>
      ${renderStage()}
    `;
    bindClosureEvents();
  }

  function renderStage() {
    if (closureState.stage === 0) return renderIntro();
    if (closureState.stage === 1) return renderCulpritStage();
    if (closureState.stage === 2) return renderMethodStage();
    if (closureState.stage === 3) return renderForgeryStage();
    if (closureState.stage === 4) return renderChainStage();
    return renderEpilogueStage();
  }

  function renderIntro() {
    const missing = missingRequiredReasoning();
    return `
      <section class="closure-stage">
        <h3>准备结案</h3>
        <p>结案会逐步检查凶手、手法、伪造证据和行动顺序。关键推论不足时可以开始，但无法得到完整评分。</p>
        ${missing.length ? `<p class="closure-gap">缺少关键推论：${missing.map(reasoningTitle).join("、")}</p>` : "<p class=\"closure-ready\">关键推论已经齐备。</p>"}
        <div class="closure-actions">
          <button class="primary" type="button" data-closure-start>开始结案</button>
          ${closureState.completed ? "<button class=\"ghost\" type=\"button\" data-closure-replay>重新查看结案剧情</button>" : ""}
        </div>
      </section>
    `;
  }

  function renderCulpritStage() {
    const { people, evidence, gameState, solution } = window.ZeroGreenhouse;
    const foundEvidence = evidence.filter((item) => gameState.foundEvidence.has(item.id));
    return `
      <section class="closure-stage">
        <p class="label">第一阶段</p>
        <h3>谁实施了计划？</h3>
        <div class="closure-people">
          ${people.map((person) => `<button type="button" class="${closureState.culprit === person.name ? "selected" : ""}" data-closure-culprit="${person.name}">${person.name}<small>${person.role}</small></button>`).join("")}
        </div>
        <h4>出示用于锁定凶手的证据</h4>
        <div class="closure-evidence">
          ${foundEvidence.map((item) => `<button type="button" class="${closureState.culpritEvidence.has(item.id) ? "selected" : ""}" data-closure-evidence="${item.id}"><img src="${item.image}" alt="${item.title}"><strong>${item.title}</strong><span>${item.category}</span></button>`).join("") || "<p>还没有可出示的物证。</p>"}
        </div>
        <p class="closure-hint">需要解释谁知道心脏药与低温之间的关系。</p>
        ${renderMessage()}
        <div class="closure-actions">
          <button class="primary" type="button" data-closure-check="culprit">确认凶手</button>
          <button class="ghost" type="button" data-closure-back>返回</button>
        </div>
      </section>
    `;
  }

  function renderMethodStage() {
    return `
      <section class="closure-stage">
        <p class="label">第二阶段</p>
        <h3>死者真正的死亡原因是什么？</h3>
        <div class="closure-reasoning-list">
          ${window.ZeroGreenhouse.deductions.map((item) => renderReasoningChoice(item, "method")).join("")}
        </div>
        <p class="closure-hint">手法必须解释低温、药盒位置和沈砚身体条件。</p>
        ${renderMessage()}
        <div class="closure-actions">
          <button class="primary" type="button" data-closure-check="method">确认手法</button>
          <button class="ghost" type="button" data-closure-back>上一步</button>
        </div>
      </section>
    `;
  }

  function renderForgeryStage() {
    return `
      <section class="closure-stage">
        <p class="label">第三阶段</p>
        <h3>凶手伪造了哪项关键证据？</h3>
        <div class="closure-reasoning-list">
          ${window.ZeroGreenhouse.deductions.map((item) => renderReasoningChoice(item, "forgery")).join("")}
        </div>
        <p class="closure-hint">伪造项必须能解释“记录存在，但现场痕迹不支持”。</p>
        ${renderMessage()}
        <div class="closure-actions">
          <button class="primary" type="button" data-closure-check="forgery">确认伪造</button>
          <button class="ghost" type="button" data-closure-back>上一步</button>
        </div>
      </section>
    `;
  }

  function renderReasoningChoice(item, type) {
    const solved = hasReasoning(item.id);
    const selected = type === "method" ? closureState.methodReasoning === item.id : closureState.forgeryReasoning === item.id;
    return `
      <button type="button" class="${selected ? "selected" : ""}" data-closure-${type}="${item.id}" ${solved ? "" : "disabled"}>
        <strong>${item.title}</strong>
        <span>${solved ? item.conclusion : "尚未形成推论"}</span>
      </button>
    `;
  }

  function renderChainStage() {
    return `
      <section class="closure-stage">
        <p class="label">第四阶段</p>
        <h3>构建完整逻辑链</h3>
        <div class="closure-chain">
          <div>
            <h4>可选行动</h4>
            <div class="closure-chain-bank">
              ${chainChoices.map((item) => `<button type="button" data-chain-add="${item}" ${closureState.chain.includes(item) ? "disabled" : ""}>${item}</button>`).join("")}
            </div>
          </div>
          <div>
            <h4>你的顺序</h4>
            <div class="closure-chain-result">
              ${closureState.chain.length ? closureState.chain.map((item, index) => `<button type="button" data-chain-remove="${index}"><span>${index + 1}</span>${item}</button>`).join("") : "<p>按发生顺序点击左侧行动。</p>"}
            </div>
          </div>
        </div>
        ${renderMessage()}
        <div class="closure-actions">
          <button class="primary" type="button" data-closure-check="chain">确认逻辑链</button>
          <button class="ghost" type="button" data-chain-clear>清空</button>
          <button class="ghost" type="button" data-closure-back>上一步</button>
        </div>
      </section>
    `;
  }

  function renderEpilogueStage() {
    const { solution } = window.ZeroGreenhouse;
    const lines = solution.epilogue.slice(0, closureState.epilogueIndex + 1);
    const done = closureState.epilogueIndex >= solution.epilogue.length - 1;
    const missing = missingRequiredReasoning();
    return `
      <section class="closure-stage closure-epilogue">
        <p class="label">第五阶段</p>
        <h3>结案演出</h3>
        <div class="epilogue-lines">
          ${lines.map((line) => `<p>${line}</p>`).join("")}
        </div>
        ${done ? renderScore(missing) : ""}
        <div class="closure-actions">
          <button class="primary" type="button" data-closure-next-epilogue>${done ? "重新播放" : "播放下一段"}</button>
          <button class="ghost" type="button" data-closure-restart>重新推理</button>
        </div>
      </section>
    `;
  }

  function renderScore(missing) {
    const perfect = !missing.length;
    return `
      <div class="case-score ${perfect ? "perfect" : ""}">
        <strong>${perfect ? "案件评分：S" : "案件评分：B"}</strong>
        <p>${perfect ? "关键物证、时间矛盾与伪造链全部闭合。" : `结论成立，但缺少关键推论：${missing.map(reasoningTitle).join("、")}。`}</p>
      </div>
    `;
  }

  function renderMessage() {
    return closureState.message ? `<p class="closure-message">${closureState.message}</p>` : "";
  }

  function bindClosureEvents() {
    const closure = document.querySelector("#caseClosure");
    if (!closure) return;

    closure.querySelector("[data-closure-start]")?.addEventListener("click", () => {
      closureState.stage = 1;
      closureState.message = "";
      renderVerdictFlow();
    });
    closure.querySelector("[data-closure-replay]")?.addEventListener("click", replayEpilogue);
    closure.querySelector("[data-closure-restart]")?.addEventListener("click", resetVerdictView);
    closure.querySelector("[data-closure-back]")?.addEventListener("click", () => {
      closureState.stage = Math.max(0, closureState.stage - 1);
      closureState.message = "";
      renderVerdictFlow();
    });
    closure.querySelectorAll("[data-closure-culprit]").forEach((button) => {
      button.addEventListener("click", () => {
        closureState.culprit = button.dataset.closureCulprit;
        closureState.message = "";
        renderVerdictFlow();
      });
    });
    closure.querySelectorAll("[data-closure-evidence]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.closureEvidence;
        if (closureState.culpritEvidence.has(id)) closureState.culpritEvidence.delete(id);
        else closureState.culpritEvidence.add(id);
        closureState.message = "";
        renderVerdictFlow();
      });
    });
    closure.querySelectorAll("[data-closure-method]").forEach((button) => {
      button.addEventListener("click", () => {
        closureState.methodReasoning = button.dataset.closureMethod;
        closureState.message = "";
        renderVerdictFlow();
      });
    });
    closure.querySelectorAll("[data-closure-forgery]").forEach((button) => {
      button.addEventListener("click", () => {
        closureState.forgeryReasoning = button.dataset.closureForgery;
        closureState.message = "";
        renderVerdictFlow();
      });
    });
    closure.querySelectorAll("[data-chain-add]").forEach((button) => {
      button.addEventListener("click", () => {
        closureState.chain.push(button.dataset.chainAdd);
        closureState.message = "";
        renderVerdictFlow();
      });
    });
    closure.querySelectorAll("[data-chain-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        closureState.chain.splice(Number(button.dataset.chainRemove), 1);
        renderVerdictFlow();
      });
    });
    closure.querySelector("[data-chain-clear]")?.addEventListener("click", () => {
      closureState.chain = [];
      closureState.message = "";
      renderVerdictFlow();
    });
    closure.querySelectorAll("[data-closure-check]").forEach((button) => {
      button.addEventListener("click", () => checkStage(button.dataset.closureCheck));
    });
    closure.querySelector("[data-closure-next-epilogue]")?.addEventListener("click", () => {
      const lines = window.ZeroGreenhouse.solution.epilogue;
      if (closureState.epilogueIndex >= lines.length - 1) {
        replayEpilogue();
        return;
      }
      closureState.epilogueIndex += 1;
      renderVerdictFlow();
    });
  }

  function checkStage(stage) {
    const { solution } = window.ZeroGreenhouse;
    if (stage === "culprit") {
      const evidenceOk = solution.culpritEvidence.every((id) => closureState.culpritEvidence.has(id));
      if (closureState.culprit === solution.culprit && evidenceOk) advance();
      else closureState.message = "逻辑缺口：这个选择还没有同时解释心脏药位置和谁掌握低温风险。";
    }
    if (stage === "method") {
      if (!hasReasoning(solution.methodReasoning)) closureState.message = "缺少关键推论：还不能证明真正死因。";
      else if (closureState.methodReasoning === solution.methodReasoning) advance();
      else closureState.message = "逻辑缺口：该推论无法解释药盒被转移后的致命条件。";
    }
    if (stage === "forgery") {
      if (!hasReasoning(solution.forgeryReasoning)) closureState.message = "缺少关键推论：还不能拆穿关键伪造。";
      else if (closureState.forgeryReasoning === solution.forgeryReasoning) advance();
      else closureState.message = "逻辑缺口：真正被伪造的记录必须被现场痕迹直接否定。";
    }
    if (stage === "chain") {
      if (closureState.chain.join("|") === solution.chain.join("|")) {
        closureState.stage = 5;
        closureState.epilogueIndex = 0;
        closureState.completed = true;
        closureState.message = "";
      } else {
        closureState.message = "顺序还不对。先制造低温条件，再移走自救手段，死亡后才需要伪造外来路线。";
      }
    }
    renderVerdictFlow();
  }

  function advance() {
    closureState.stage += 1;
    closureState.message = "";
  }

  function replayEpilogue() {
    closureState.stage = 5;
    closureState.epilogueIndex = 0;
    closureState.message = "";
    renderVerdictFlow();
  }

  function bindVerdictEvents() {
    renderVerdictFlow();
  }

  function resetVerdictView() {
    closureState.stage = 0;
    closureState.culprit = "";
    closureState.culpritEvidence = new Set();
    closureState.methodReasoning = "";
    closureState.forgeryReasoning = "";
    closureState.chain = [];
    closureState.epilogueIndex = 0;
    closureState.message = "";
    const verdict = document.querySelector("#verdict");
    if (verdict) {
      verdict.className = "verdict";
      verdict.textContent = "";
    }
    renderVerdictFlow();
  }

  window.ZeroGreenhouse.verdictModule = { bindVerdictEvents, renderVerdictFlow, resetVerdictView };
})();
