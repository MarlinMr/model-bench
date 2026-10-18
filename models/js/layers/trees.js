/* Layer 6: PINES (Bob Ross "happy little pine trees").
 * A belt of pines standing on the meadow between the horizon and the lower
 * ground: 8 trunks at staggered depths (far = small/high, near = big/low),
 * each trunk a narrow rounded stroke, foliage = 3 stacked triangle tiers
 * (dark -> mid -> light) with puffy painterly tips.
 * Reveal = left-to-right wipe. Only animation: rustling — foliage sways a
 * tiny angle sin(t*0.9+phase)*0.03 rad about its own base; trunk stays put.
 * All positions deterministic (seeded rand at module top-level).
 */
(function () {
  "use strict";

  var P = window.PALETTE;
  var L = window.LAYOUT;
  var rand = window.makeRand(4242);

  var N = 8;
  var TREES = [];
  for (var i = 0; i < N; i++) {
    var f = i / (N - 1); // 0 = far (high on the band, small), 1 = near (low, big)
    var x = ((i + 0.5) / N) * L.W + (rand() - 0.5) * (L.W / N) * 0.6;
    x = Math.max(60, Math.min(L.W - 60, x));
    // Quadratic spread: far trees cluster near the horizon (perspective).
    var y = L.horizonY + 24 + f * f * (L.treeBelt.bottom - L.horizonY - 24);
    var h = 45 + f * 115;
    // Keep every top at or below treeBelt.top (allowed to poke above the
    // belt, never above the horizon line itself).
    var maxH = y - L.treeBelt.top;
    if (h > maxH) h = maxH;
    TREES.push({
      x: x,
      y: y,
      h: h,
      w: h * (0.36 + rand() * 0.10), // crown half-width
      phase: rand() * Math.PI * 2
    });
  }

  // One foliage tier: filled triangle with puffy blobs at apex + corners.
  function tier(c, x, baseY, halfW, hgt, color) {
    var topY = baseY - hgt;
    c.beginPath();
    c.moveTo(x, topY);
    c.lineTo(x - halfW, baseY);
    c.lineTo(x + halfW, baseY);
    c.closePath();
    c.fillStyle = color;
    c.fill();
    var r = hgt * 0.22 + 3;
    window.Brush.puff(c, x, topY + r * 0.6, r, color, 0.9);
    window.Brush.puff(c, x - halfW * 0.82, baseY - hgt * 0.12, r * 0.9, color, 0.7);
    window.Brush.puff(c, x + halfW * 0.82, baseY - hgt * 0.10, r * 0.9, color, 0.7);
  }

  function drawTree(c, t, tr) {
    var trunkH = tr.h * 0.28;
    var trunkW = Math.max(3, tr.h * 0.045);

    // Soft ground shadow patch
    window.Brush.shadow(c, tr.x, tr.y + 3, tr.w * 0.7, 5, P.shadow);

    // Trunk: narrow rounded stroke, stays put while foliage ripples.
    c.save();
    c.lineCap = "round";
    c.strokeStyle = P.tree.trunk;
    c.lineWidth = trunkW;
    c.beginPath();
    c.moveTo(tr.x, tr.y);
    c.lineTo(tr.x, tr.y - trunkH);
    c.stroke();
    c.restore();

    // Foliage: sways about its own base, 3 tiers dark (back/bottom) to light (tip)
    var a = Math.sin(t * 0.9 + tr.phase) * 0.03;
    c.save();
    c.translate(tr.x, tr.y);
    c.rotate(a);
    c.translate(-tr.x, -tr.y);
    var fb = tr.y - trunkH * 0.5; // foliage base (half the trunk still shows)
    var fh = tr.h - trunkH * 0.5;
    tier(c, tr.x, fb, tr.w, fh * 0.40, P.tree.dark);
    tier(c, tr.x, fb - fh * 0.30, tr.w * 0.75, fh * 0.40, P.tree.mid);
    tier(c, tr.x, fb - fh * 0.58, tr.w * 0.50, fh * 0.42, P.tree.light);
    c.restore();
  }

  window.Painter.registerLayer({
    id: "trees",
    name: "Happy little pine trees",
    draw: function (c, t, reveal, W, H) {
      // Reveal: left-to-right wipe (same pattern as sky.js / mountains.js / meadow.js)
      c.save();
      c.beginPath();
      c.rect(0, 0, W * reveal, H);
      c.clip();

      // Gentle grow-in alpha on top of the wipe
      c.save();
      c.globalAlpha = Math.min(1, reveal * 1.6);

      // Paint order: far (small, high) first, near (big, low) last.
      for (var i = 0; i < TREES.length; i++) {
        drawTree(c, t, TREES[i]);
      }

      c.restore();
      c.restore();
    }
  });
})();
