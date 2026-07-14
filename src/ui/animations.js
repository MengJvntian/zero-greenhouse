(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  function markWrongChoice(element) {
    element?.classList.add("wrong");
  }

  function markCorrectChoice(element) {
    element?.classList.add("correct");
  }

  window.ZeroGreenhouse.animations = { markCorrectChoice, markWrongChoice };
})();
