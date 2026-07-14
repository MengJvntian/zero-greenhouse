(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  function showToast(message) {
    const verdict = document.querySelector("#verdict");
    if (!verdict || !message) return;
    verdict.className = "verdict fail";
    verdict.textContent = message;
  }

  window.ZeroGreenhouse.toast = { showToast };
})();
