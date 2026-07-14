(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  let selectedPerson = null;
  let activeTopic = null;
  let lineIndex = 0;

  function topicRecordId(person, topic) {
    return `${person.name}:${topic.id}`;
  }

  function topicUnlocked(topic) {
    const { gameState } = window.ZeroGreenhouse;
    if (topic.unlocked) return true;
    if (topic.requiresStatement && !gameState.crackedStatements.has(topic.requiresStatement)) return false;
    if (topic.requiresEvidence?.length) {
      return topic.requiresEvidence.every((id) => gameState.foundEvidence.has(id));
    }
    return Boolean(topic.requiresStatement && gameState.crackedStatements.has(topic.requiresStatement));
  }

  function topicCracked(topic) {
    return Boolean(topic.contradiction && window.ZeroGreenhouse.gameState.crackedStatements.has(topic.contradiction.statementId));
  }

  function getTopicDialogue(topic) {
    if (!topic) return [];
    if (topicCracked(topic) && topic.contradiction?.successDialogue) {
      return [...topic.dialogue, ...topic.contradiction.successDialogue];
    }
    return topic.dialogue;
  }

  function renderPeople() {
    const { people } = window.ZeroGreenhouse;
    const peopleList = document.querySelector("#peopleList");
    if (!peopleList) return;

    peopleList.innerHTML = "";
    people.forEach((person) => {
      const button = document.createElement("button");
      button.className = `person ${selectedPerson?.name === person.name ? "active" : ""}`;
      button.type = "button";
      button.innerHTML = `
        <img class="person-thumb" src="${person.image}" alt="${person.name}">
        <span><h3>${person.name}</h3><p>${person.role}｜${person.motive}</p></span>
      `;
      button.addEventListener("click", () => selectPerson(person));
      peopleList.appendChild(button);
    });
    renderInterview();
  }

  function selectPerson(person) {
    selectedPerson = person;
    activeTopic = null;
    lineIndex = 0;
    renderPeople();
  }

  function renderInterview() {
    const interviewBox = document.querySelector("#interviewBox");
    if (!interviewBox) return;

    if (!selectedPerson) {
      interviewBox.innerHTML = "<h3>选择一名嫌疑人</h3><p>证词会暴露时间线和动机的缺口。</p>";
      return;
    }

    const topics = selectedPerson.topics.map((topic) => {
      const unlocked = topicUnlocked(topic);
      const recorded = window.ZeroGreenhouse.gameState.testimonyRecords.has(topicRecordId(selectedPerson, topic));
      const cracked = topicCracked(topic);
      const requirement = topic.requiresEvidence?.length || topic.requiresStatement ? "需解锁" : "可询问";
      return `
        <button class="topic-button ${activeTopic?.id === topic.id ? "active" : ""} ${recorded || cracked ? "recorded" : ""}" type="button" data-topic="${topic.id}" ${unlocked ? "" : "disabled"}>
          <span>${topic.title}</span>
          <small>${cracked ? "矛盾成立" : recorded ? "已记录" : unlocked ? requirement : "未解锁"}</small>
        </button>
      `;
    }).join("");

    interviewBox.innerHTML = `
      <div class="interview-person">
        <img src="${selectedPerson.image}" alt="${selectedPerson.name}">
        <div>
          <h3>${selectedPerson.name}的询问</h3>
          <p>${selectedPerson.role}。动机：${selectedPerson.motive}</p>
        </div>
      </div>
      <div class="topic-list">${topics}</div>
      <div class="dialogue-window" id="dialogueWindow">
        ${renderDialogueWindow()}
      </div>
      <div class="testimony-log">
        <h4>已记录证词</h4>
        ${renderTestimonyLog(selectedPerson)}
      </div>
    `;

    interviewBox.querySelectorAll("[data-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        const topic = selectedPerson.topics.find((item) => item.id === button.dataset.topic);
        startTopic(topic);
      });
    });
    interviewBox.querySelector("#continueDialogue")?.addEventListener("click", continueDialogue);
    interviewBox.querySelector("#presentEvidence")?.addEventListener("click", openEvidencePicker);
    interviewBox.querySelector("#endInquiry")?.addEventListener("click", () => {
      activeTopic = null;
      lineIndex = 0;
      renderInterview();
    });
  }

  function renderDialogueWindow() {
    if (!activeTopic) return "<p>选择一个话题开始询问。</p>";
    const dialogue = getTopicDialogue(activeTopic);
    const visibleLines = dialogue.slice(0, lineIndex + 1);
    const lines = visibleLines.map((line) => `<p class="dialogue-line">${line}</p>`).join("");
    const done = lineIndex >= dialogue.length - 1;
    const canPresent = Boolean(activeTopic.contradiction);
    const cracked = topicCracked(activeTopic);
    return `
      <div>${lines}</div>
      <div class="dialogue-actions">
        <button class="primary" id="continueDialogue" type="button">${done ? "记录证词" : "追问"}</button>
        ${canPresent ? `<button class="ghost" id="presentEvidence" type="button" ${cracked ? "disabled" : ""}>${cracked ? "矛盾已破解" : "出示证据"}</button>` : ""}
        <button class="ghost" id="endInquiry" type="button">结束询问</button>
      </div>
    `;
  }

  function renderTestimonyLog(person) {
    const records = person.topics.filter((topic) => {
      return window.ZeroGreenhouse.gameState.testimonyRecords.has(topicRecordId(person, topic))
        || window.ZeroGreenhouse.gameState.testimonyRecords.has(`${person.name}:${topic.id}:contradiction`);
    });
    if (!records.length) return "<p>暂无记录。</p>";
    return records.map((topic) => {
      const cracked = topicCracked(topic);
      const line = cracked && topic.contradiction
        ? topic.contradiction.successDialogue[topic.contradiction.successDialogue.length - 1]
        : getTopicDialogue(topic)[getTopicDialogue(topic).length - 1];
      return `<p><strong>${topic.title}</strong>${cracked ? "（矛盾成立）" : ""}：${line}</p>`;
    }).join("");
  }

  function startTopic(topic) {
    if (!topic || !topicUnlocked(topic)) return;
    activeTopic = topic;
    lineIndex = 0;
    window.ZeroGreenhouse.state.unlockDialogue(topicRecordId(selectedPerson, topic));
    renderInterview();
  }

  function continueDialogue() {
    if (!activeTopic || !selectedPerson) return;
    const dialogue = getTopicDialogue(activeTopic);
    if (lineIndex < dialogue.length - 1) {
      lineIndex += 1;
      renderInterview();
      return;
    }
    window.ZeroGreenhouse.state.addTestimonyRecord(topicRecordId(selectedPerson, activeTopic));
    renderInterview();
  }

  function openEvidencePicker() {
    if (!activeTopic?.contradiction) return;

    let overlay = document.querySelector("#presentEvidenceOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "presentEvidenceOverlay";
      overlay.className = "evidence-overlay";
      document.body.appendChild(overlay);
    }

    const { evidence, gameState } = window.ZeroGreenhouse;
    const cards = evidence
      .filter((item) => gameState.foundEvidence.has(item.id))
      .map((item) => `<button class="present-evidence-card" type="button" data-evidence="${item.id}"><img src="${item.image}" alt="${item.title}"><strong>${item.title}</strong><span>${item.category}</span></button>`)
      .join("") || "<p>还没有可出示的物证。</p>";

    overlay.innerHTML = `
      <div class="evidence-discovery-card present-evidence-panel">
        <p class="label">出示证据</p>
        <h2>${activeTopic.title}</h2>
        <p>选择一项物证，判断它是否能推翻当前说法。</p>
        <div class="present-evidence-list">${cards}</div>
        <p class="present-result" id="presentResult"></p>
        <button class="ghost present-close" type="button">关闭</button>
      </div>
    `;
    overlay.hidden = false;
    overlay.querySelector(".present-close").addEventListener("click", () => { overlay.hidden = true; });
    overlay.querySelectorAll("[data-evidence]").forEach((button) => {
      button.addEventListener("click", () => presentEvidence(button.dataset.evidence, overlay));
    });
  }

  function presentEvidence(evidenceId, overlay) {
    const contradiction = activeTopic?.contradiction;
    const result = overlay.querySelector("#presentResult");
    if (!contradiction || !result) return;

    if (evidenceId !== contradiction.contradictionEvidence) {
      result.textContent = "这项证据无法推翻当前说法。";
      result.className = "present-result wrong";
      return;
    }

    window.ZeroGreenhouse.state.crackStatement(contradiction.statementId);
    window.ZeroGreenhouse.state.addTestimonyRecord(`${selectedPerson.name}:${activeTopic.id}:contradiction`);
    lineIndex = getTopicDialogue(activeTopic).length - 1;
    result.textContent = "矛盾成立。新的追问已经解锁。";
    result.className = "present-result correct";
    window.setTimeout(() => {
      overlay.hidden = true;
      renderInterview();
    }, 480);
  }

  function resetDialogueView() {
    selectedPerson = null;
    activeTopic = null;
    lineIndex = 0;
    const interviewBox = document.querySelector("#interviewBox");
    if (interviewBox) {
      interviewBox.innerHTML = "<h3>选择一名嫌疑人</h3><p>证词会暴露时间线和动机的缺口。</p>";
    }
    renderPeople();
  }

  window.ZeroGreenhouse.dialogueModule = { renderPeople, resetDialogueView };
})();
