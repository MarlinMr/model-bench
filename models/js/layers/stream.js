/* Layer 7: STREAM (Bob Ross "little brook").
 * A meandering ribbon of water following LAYOUT.stream.centerAt/widthAt,
 * sampled stepwise from the horizon down to the bottom edge.
 * Reveal = left-to-right wipe. Animation = quiet flow: bright centerline
 * puffs shimmer (alpha 0.6 + 0.25*sin(t*1.3+phase)) and a handful of
 * sparkle dots drift down the stream (y wraps horizon -> bottom).
 * All positions/phases deterministic (seeded rand at module top-level).
 */
(function () {
  "use strict";

  var P = window.PALETTE;
  var L = window.LAYOUT;
  var rand = window.makeRand(9091);

  // Ribbon slices: one horizontal band per step of y (pure fn of LAYOUT).
  var STEP = 16;
  var SLICES = [];
  for (var y = L.horizonY; y <= L.H; y += STEP) {
    if (y > L.H) y = L.H;
    SLICES.push({
      y: y,
      x: L.stream.centerAt(y),
      hw: L.stream.widthAt(y),
      phase: rand() * Math.PI * 2
    });
  }

  // Sparkle dots: deterministic parametric positions, scrolling down the stream.
  var NS = 5;
  var SPARKLES = [];
  for (var i = 0; i < NS; i++) {
    SPARKLES.push({
      u: rand(),             // progress offset along the stream, 0..1
      f: rand() - 0.5,       // lateral offset in half-width units
      r: 4 + rand() * 5,     // puff radius
      speed: 0.030 + rand() * 0.025,
      phase: rand() * Math.PI * 2
    });
  }

  window.Painter.registerLayer({
    id: "stream",
    name: "A little brook",
    draw: function (c, t, reveal, W, H) {
      // Reveal: left-to-right wipe (same pattern as every other layer).
      c.save();
      c.beginPath();
      c.rect(0, 0, W * reveal, H);
      c.clip();

      // Gentle dab-in alpha on top of the wipe.
      c.save();
      c.globalAlpha = Math.min(1, reveal * 1.6);

      // Water ribbon: a rounded band per slice (round line caps, painterly).
      c.save();
      c.lineCap = "round";
      c.lineJoin = "round";
      c.strokeStyle = P.water.base;
      for (var i = 0; i < SLICES.length; i++) {
        var s = SLICES[i];
        c.lineWidth = s.hw * 2;
        c.beginPath();
        c.moveTo(s.x - s.hw + 2, s.y);
        c.lineTo(s.x + s.hw - 2, s.y);
        c.stroke();
      }
      c.restore();

      // Bright centerline puffs with a slight alpha shimmer.
      for (var j = 0; j < SLICES.length; j++) {
        var sl = SLICES[j];
        var a = 0.6 + 0.25 * Math.sin(t * 1.3 + sl.phase);
        window.Brush.puff(c, sl.x, sl.y, Math.max(5, sl.hw * 0.40), P.water.bright, a);
      }

      // Quiet sparkles drifting down the stream (wrap horizon -> bottom).
      for (var k = 0; k < SPARKLES.length; k++) {
        var sp = SPARKLES[k];
        var prog = (sp.u + t * sp.speed) % 1;
        var sy = L.horizonY + prog * (H - L.horizonY);
        var sx = L.stream.centerAt(sy) + sp.f * L.stream.widthAt(sy);
        var sa = 0.55 + 0.30 * Math.sin(t * 2.1 + sp.phase);
        window.Brush.puff(c, sx, sy, sp.r, P.water.sparkle, sa);
      }

      c.restore();
      c.restore();
    }
  });
})();
