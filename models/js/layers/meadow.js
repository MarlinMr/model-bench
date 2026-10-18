/* Layer 5: MEADOW (Bob Ross "happy little meadow").
 * Painted grass bank from the horizon down to the bottom edge; covers the
 * mountain base seam. Reveal = left-to-right wipe. Only animation:
 * gentle breeze (band rows bob ~2px) + breathing highlight rim.
 * All positions deterministic (seeded rand at module top-level).
 */
(function () {
  "use strict";

  var P = window.PALETTE;
  var L = window.LAYOUT;
  var rand = window.makeRand(5551);

  // Staggered grass-puff rows: far (small) down to near (big).
  var ROWS = [];
  var ROW_COUNT = 4;
  for (var i = 0; i < ROW_COUNT; i++) {
    var f = i / (ROW_COUNT - 1); // 0 = far row, 1 = near row
    ROWS.push({
      y: L.horizonY + 6 + f * (L.H - L.horizonY - 40) * (0.30 + 0.70 * f),
      r: 7 + f * 14,
      mix: f * 0.85,       // 0 = far color, 1 = mid color
      phase: rand() * Math.PI * 2
    });
  }
  var HILLOCKS = [];
  for (var h = 0; h < 5; h++) {
    HILLOCKS.push({
      x: rand() * L.W,
      yFrac: 0.25 + rand() * 0.65,
      rx: 40 + rand() * 70,
      ry: 14 + rand() * 20,
      mix: 0.3 + rand() * 0.5
    });
  }

  function blend(a, b, f) {
    // hex mix between two #rrggbb colors
    function ch(s, i) { return parseInt(s.substr(i, 2), 16); }
    var out = "#";
    for (var i = 1; i < 7; i += 2) {
      var v = Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * f);
      out += ("0" + v.toString(16)).slice(-2);
    }
    return out;
  }

  window.Painter.registerLayer({
    id: "meadow",
    name: "Happy little meadow",
    draw: function (c, t, reveal, W, H) {
      // Reveal: left-to-right wipe (same pattern as sky.js / mountains.js)
      c.save();
      c.beginPath();
      c.rect(0, 0, W * reveal, H);
      c.clip();

      var top = L.horizonY;

      // Ground: vertical gradient far -> mid -> near
      var g = c.createLinearGradient(0, top, 0, H);
      g.addColorStop(0, P.meadow.far);
      g.addColorStop(0.45, P.meadow.mid);
      g.addColorStop(1, P.meadow.near);
      c.fillStyle = g;
      c.fillRect(0, top, W, H - top);

      // Gentle shadow-pool hillocks to break up the flat bank
      for (var h = 0; h < HILLOCKS.length; h++) {
        var hil = HILLOCKS[h];
        var hy = top + hil.yFrac * (H - top);
        window.Brush.shadow(c, hil.x, hy, hil.rx, hil.ry, blend(P.meadow.mid, P.meadow.near, hil.mix));
      }

      // Highlight rim just below the horizon (grass catching the light).
      // Breathing alpha like the mountain snow.
      var rimAlpha = 0.85 + 0.10 * Math.sin(t * 0.5);
      c.save();
      c.globalAlpha = rimAlpha;
      window.Brush.band(c, 0, W, top + 6, 6, P.meadow.highlight);
      c.restore();

      // Staggered rows of grass puffs, small (far) to big (near),
      // with a gentle breeze bob (pure function of t).
      for (var i = 0; i < ROWS.length; i++) {
        var row = ROWS[i];
        var bob = Math.sin(t * 0.7 + row.phase) * 2;
        window.Brush.band(c, -20, W + 20, row.y + bob, row.r,
          blend(P.meadow.far, P.meadow.mid, row.mix), 0.9);
      }

      c.restore();
    }
  });
})();
