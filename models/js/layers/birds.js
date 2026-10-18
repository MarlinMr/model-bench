/* Layer 2: BIRDS.
 * Small flocks of birds crossing the sky. Pure function of t (no state).
 * Painted after sky, before land layers (so land covers overlaps if any).
 */
(function () {
  "use strict";

  var L = window.LAYOUT;
  var rand = window.makeRand(4242);
  var FLOCK = [];
  for (var i = 0; i < 4; i++) {
    FLOCK.push({
      y: L.H * (0.12 + rand() * 0.24),
      speed: 45 + rand() * 30,
      x0: rand() * (L.W + 400),
      size: 9 + rand() * 7,
      phase: rand() * Math.PI * 2,
      flapHz: 5 + rand() * 3,
      dir: rand() > 0.5 ? 1 : -1
    });
  }

  function bird(c, x, y, s, flap) {
    var w = s * (0.55 + 0.45 * flap); // wing sweep
    c.strokeStyle = "rgba(35,38,45,0.78)";
    c.lineWidth = Math.max(1.2, s * 0.16);
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x - s, y + w * 0.5);
    c.quadraticCurveTo(x - s * 0.4, y - w, x, y);
    c.quadraticCurveTo(x + s * 0.4, y - w, x + s, y + w * 0.5);
    c.stroke();
  }

  window.Painter.registerLayer({
    id: "birds",
    name: "Birds in flight",
    draw: function (c, t, reveal, W, H) {
      var span = W + 400;
      for (var i = 0; i < FLOCK.length; i++) {
        var b = FLOCK[i];
        var raw = ((b.x0 + t * b.speed * b.dir) % span + span) % span - 200;
        var x = b.dir > 0 ? raw : W - raw;
        var flap = Math.sin(t * b.flapHz * Math.PI + b.phase);
        bird(c, x, b.y + Math.sin(t * 0.9 + b.phase) * 6, b.size, flap);
        bird(c, x + 40, b.y + 12, b.size * 0.8, flap * 0.9);
      }
    }
  });
})();
