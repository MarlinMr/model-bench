/* Boot: starts the painter engine once the DOM is ready.
 * Do NOT put draw logic here — this is only the start call.
 * Layer registration happens inside each js/layers/*.js file, in script order.
 */
(function () {
  "use strict";
  function boot() {
    var canvas = document.getElementById("scene");
    if (!canvas) {
      console.error("Painter: no #scene canvas found in index.html");
      return;
    }
    window.Painter.start(canvas, {
      totalDelay: 0.6,   // beat of "starting to paint"
      perLayer: 0.85,    // gap between each layer start
      revealDur: 1.6     // seconds each layer takes to paint in
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
