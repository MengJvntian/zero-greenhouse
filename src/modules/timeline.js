(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  const markLabels = {
    record: "记录时间",
    real: "真实时间",
    unreliable: "不可信"
  };

  function sortTime(time) {
    const [hour, minute] = time.split(":").map(Number);
    return (hour < 4 ? hour + 24 : hour) * 60 + minute;
  }

  function evidenceByTime() {
    const { evidence, gameState } = window.ZeroGreenhouse;
    return evidence
      .filter((item) => item.timeline && gameState.foundEvidence.has(item.id))
      .sort((a, b) => sortTime(a.timeline.time) - sortTime(b.timeline.time));
  }

  function currentMark(item) {
    return window.ZeroGreenhouse.gameState.timelineMarks[item.id]
      || (item.timeline.kind.includes("记录") ? "record" : "real");
  }

  function renderTimeline() {
    const timelineBoard = document.querySelector("#timelineBoard");
    if (!timelineBoard) return;

    const { timelinePoints } = window.ZeroGreenhouse;
    const foundEvents = evidenceByTime();
    const eventsByTime = foundEvents.reduce((acc, item) => {
      acc[item.timeline.time] = acc[item.timeline.time] || [];
      acc[item.timeline.time].push(item);
      return acc;
    }, {});

    timelineBoard.innerHTML = `
      <div class="timeline-track">
        ${timelinePoints.map((point) => renderTimePoint(point, eventsByTime[point.time] || [])).join("")}
      </div>
      <div class="timeline-evidence-bank">
        <h3>可放入时间轴的物证</h3>
        ${renderTimelineBank(foundEvents)}
      </div>
      ${renderTimelineContradictions(foundEvents)}
    `;

    timelineBoard.querySelectorAll("[data-timeline-mark]").forEach((button) => {
      button.addEventListener("click", () => {
        window.ZeroGreenhouse.state.setTimelineMark(button.dataset.evidence, button.dataset.timelineMark);
        renderTimeline();
      });
    });
  }

  function renderTimePoint(point, events) {
    return `
      <article class="timeline-point">
        <div class="timeline-time">
          <strong>${point.time}</strong>
          <span>${point.label}</span>
        </div>
        <div class="timeline-events">
          ${events.length ? events.map(renderTimelineEvent).join("") : "<p>尚无物证放入此时间点。</p>"}
        </div>
      </article>
    `;
  }

  function renderTimelineEvent(item) {
    const mark = currentMark(item);
    const unreliable = mark === "unreliable";
    return `
      <div class="timeline-event ${unreliable ? "questioned" : ""}">
        <div>
          <strong>${unreliable ? "??:??" : item.timeline.time} ${item.title}</strong>
          <p>${item.timeline.label}。${item.timeline.note}</p>
          <small>${markLabels[mark] || mark}</small>
        </div>
        <div class="timeline-markers" aria-label="标记时间性质">
          <button type="button" data-evidence="${item.id}" data-timeline-mark="record" data-timeline-mark-active="${mark === "record"}">记录</button>
          <button type="button" data-evidence="${item.id}" data-timeline-mark="real" data-timeline-mark-active="${mark === "real"}">真实</button>
          <button type="button" data-evidence="${item.id}" data-timeline-mark="unreliable" data-timeline-mark-active="${mark === "unreliable"}">?</button>
        </div>
      </div>
    `;
  }

  function renderTimelineBank(foundEvents) {
    if (!foundEvents.length) return "<p>调查控制台、北门和走廊后，时间物证会出现在这里。</p>";
    return `
      <div class="timeline-bank-list">
        ${foundEvents.map((item) => `
          <button type="button" class="timeline-bank-card" data-evidence="${item.id}" data-timeline-mark="${currentMark(item)}">
            <strong>${item.title}</strong>
            <span>${item.timeline.time} · ${item.timeline.kind}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderTimelineContradictions(foundEvents) {
    const hasThermo = foundEvents.some((item) => item.id === "thermo");
    const hasOutage = foundEvents.some((item) => item.id === "outage");
    const recorderUntrusted = window.ZeroGreenhouse.gameState.timelineMarks.recorder === "unreliable";
    const solvedTemp = window.ZeroGreenhouse.gameState.solvedReasoning.has("temperature-before-outage");
    const solvedRecording = window.ZeroGreenhouse.gameState.solvedReasoning.has("recording-time");

    return `
      <div class="timeline-contradictions">
        <h3>时间矛盾</h3>
        <article class="${hasThermo && hasOutage ? "active" : ""}">
          <strong>温度下降早于停电</strong>
          <p>${hasThermo && hasOutage ? "23:42 的温控曲线排在 23:58 停电记录之前，低温不是停电自然造成的。" : "需要温控曲线和停电记录同时进入案卷。"}</p>
          <small>${solvedTemp ? "已形成推论" : "可在推演中完成论证"}</small>
        </article>
        <article class="${recorderUntrusted ? "active" : ""}">
          <strong>录音时间不可信</strong>
          <p>${recorderUntrusted ? "录音已被标记为不可信时间，22:48 只能作为记录时间看待。" : "标记录音为不可信后，时间轴会把它显示为问号。"}</p>
          <small>${solvedRecording ? "已形成推论" : "需要与发电机时间互相核对"}</small>
        </article>
      </div>
    `;
  }

  function resetTimelineView() {
    renderTimeline();
  }

  window.ZeroGreenhouse.timelineModule = { renderTimeline, resetTimelineView };
})();
