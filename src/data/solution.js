(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  window.ZeroGreenhouse.solution = {
    culprit: "周弥",
    method: "低温诱发心衰",
    forgery: "00:05 北门刷卡记录",
    contradiction: "温控曲线早于停电下降",
    culpritEvidence: ["medicine", "note"],
    methodReasoning: "medical-method",
    forgeryReasoning: "northdoor-forgery",
    requiredReasoning: ["temperature-before-outage", "medical-method", "northdoor-forgery"],
    chain: ["关闭加热系统", "转移心脏药", "低温诱发心衰", "伪造门禁记录"],
    epilogue: [
      "周弥先利用低温试验知识关闭备用加热系统，让温室在停电前就开始降温。",
      "她把沈砚的心脏药移到高架，制造他无法及时自救的条件。",
      "沈砚在低温与心律失控中倒下，茶杯和药剂柜只是把视线引向别人。",
      "00:05 的北门记录来自门禁触发，不来自真实开门；连续水线把伪造钉死。",
      "周弥沉默了很久，只说自己以为沈砚会撑到有人发现。"
    ]
  };
})();
