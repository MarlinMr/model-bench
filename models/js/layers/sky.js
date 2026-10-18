/* Layer 1: SKY (background).
 * Painted first. Reveal = left-to-right "painting the canvas in" (Bob Ross style).
 * Animations: drifting clouds + slowly pulsing sun halo. All pure functions of t.
 */
(function () {
  "use strict";

  var P = window.PALETTE;
  var L = window.LAYOUT;

  // Deterministic cloud data
  var rand = window.makeRand(1337);
  var CLOUDS = [];
  for (var i = 0; i < 7; i++) {
    CLOUDS.push({
      y: L.H * (0.10 + rand() * 0.34),
      r: 20 + rand() * 26,
      speed: 5 + rand() * 9,          // px / s
      x0: rand() * (L.W + 300) - 150, // start offset
      puffs: 4 + Math.floor(rand() * 4)
    });
  }

  window.Painter.registerLayer({
    id: "sky",
    name: "Sky, Sun, Clouds",
    revealPct: function () { return 1; },
    draw: function (c, t, reveal, W, H) {
      // Clip to the revealed band (reveal 0..1)
      c.save();
      c.beginPath();
      c.rect(0, 0, W * reveal, H);
      c.clip();

      // Sky gradient
      var g = c.createLinearGradient(0, 0, 0, L.horizonY);
      g.addColorStop(0, P.sky.top);
      g.addColorStop(0.65, P.sky.mid);
      g.addColorStop(1, P.sky.horizon);
      c.fillStyle = g;
      c.fillRect(0, 0, W, L.horizonY + 2);

      // Sun with glowing bloom
      var pulse = 1 + 0.03 * Math.sin(t * 0.8);
      var sg = c.createRadialGradient(L.sun.x, L.sun.y, 0, L.sun.x, L.sun.y, L.sun.halo * pulse);
      sg.addColorStop(0, P.sun.core);
      sg.addColorStop(0.35, P.sun.bloom);
      sg.addColorStop(1, "rgba(255,230,120,0)");
      c.fillStyle = sg;
      c.beginPath();
      c.arc(L.sun.x, L.sun.y, L.sun.halo * pulse, 0, Math.PI * 2);
      c.fill();

      // Clouds drifting left->right
      for (var i = 0; i < CLOUDS.length; i++) {
        var cl = CLOUDS[i];
        var span = W + 320;
        var x = ((cl.x0 + t * cl.speed) % span + span) % span - 160;
        for (var p = 0; p < cl.puffs; p++) {
          var ox = (p - cl.puffs / 2) * cl.r * 0.9;
          var oy = Math.sin(p * 1.3 + i) * cl.r * 0.3;
          window.Brush.puff(c, x + ox, cl.y + oy, cl.r * (0.7 + 0.3 * Math.abs(Math.sin(p * 2 + i * 0.7))), P.cloud, 0.92);
        }
      }

      c.restore();
    }
  });
})();
