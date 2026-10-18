/* Layer 4: MOUNTAINS (Bob Ross "happy little mountains").
 * Far ridge + near ridge with snow caps, baselines sitting on the horizon.
 * Reveal = left-to-right wipe. Only animation: breathing snow highlights.
 * All positions deterministic (seeded rand at module top-level).
 */
(function () {
  "use strict";

  var P = window.PALETTE;
  var L = window.LAYOUT;
  var rand = window.makeRand(2718);

  function makePeaks(count, hMin, hMax, wMin, wMax) {
    var peaks = [];
    for (var i = 0; i < count; i++) {
      peaks.push({
        cx: ((i + 0.5) / count) * L.W + (rand() - 0.5) * (L.W / count) * 0.7,
        halfW: wMin + rand() * (wMax - wMin),
        h: hMin + rand() * (hMax - hMin),
        jag: 0.8 + rand() * 0.6 // snow lip irregularity
      });
    }
    return peaks;
  }

  var FAR_PEAKS = makePeaks(7, 70, 140, 80, 130);
  var NEAR_PEAKS = makePeaks(5, 45, 105, 100, 170);

  function heightAt(peaks, x) {
    var h = 0;
    for (var i = 0; i < peaks.length; i++) {
      var p = peaks[i];
      var d = Math.abs(x - p.cx);
      if (d < p.halfW) {
        var v = p.h * (1 - d / p.halfW);
        if (v > h) h = v;
      }
    }
    return h;
  }

  function ridgePath(c, peaks, W, base) {
    c.beginPath();
    c.moveTo(-2, base + 2);
    for (var x = -2; x <= W + 2; x += 6) c.lineTo(x, base - heightAt(peaks, x));
    c.lineTo(W + 2, base + 2);
    c.closePath();
  }

  function paintRidge(c, peaks, W, base, body, rim) {
    ridgePath(c, peaks, W, base);
    c.fillStyle = body;
    c.fill();

    // Soft rim along the crest
    c.save();
    c.beginPath();
    for (var x = 0; x <= W; x += 8) {
      var y = base - heightAt(peaks, x);
      if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.lineCap = "round";
    c.lineWidth = 9;
    c.strokeStyle = rim;
    c.globalAlpha = rim === P.mountain.farLit ? 0.5 : 0.3;
    c.stroke();
    c.restore();

    // Paintery puff softness on the slopes (kept above horizonY+2)
    for (var px = -20; px <= W + 40; px += 64) {
      var ph = heightAt(peaks, px);
      if (ph < 52) continue;
      window.Brush.puff(c, px, base - ph + 16, 24, body, 0.85);
    }
  }

  function snowCaps(c, t, peaks, base, frac, spread) {
    var alpha = 0.85 + 0.10 * Math.sin(t * 0.6); // slow breathing highlight
    for (var i = 0; i < peaks.length; i++) {
      var p = peaks[i];
      var apexY = base - p.h;
      var cutY = base - p.h * frac;
      var hw = p.halfW * (1 - frac) * spread;
      var j = p.jag * 3;

      // Jagged snow cap triangle at the summit
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = P.mountain.snow;
      c.beginPath();
      c.moveTo(p.cx, apexY);
      c.lineTo(p.cx - hw, cutY + j);
      c.lineTo(p.cx - hw * 0.55, cutY - 1.2 * j);
      c.lineTo(p.cx - hw * 0.1, cutY + j);
      c.lineTo(p.cx + hw * 0.4, cutY - 0.8 * j);
      c.lineTo(p.cx + hw, cutY + 1.4 * j);
      c.closePath();
      c.fill();
      c.restore();

      // Soft snow puff on the top
      window.Brush.puff(c, p.cx, apexY + 8, hw * 0.55 + 6, P.mountain.snow, alpha * 0.7);
    }
  }

  window.Painter.registerLayer({
    id: "mountains",
    name: "Happy little mountains",
    draw: function (c, t, reveal, W, H) {
      var base = L.horizonY;

      // Reveal: left-to-right wipe (same pattern as sky.js)
      c.save();
      c.beginPath();
      c.rect(0, 0, W * reveal, H);
      c.clip();

      // Far ridge (lit side), then near ridge in front
      paintRidge(c, FAR_PEAKS, W, base, P.mountain.far, P.mountain.farLit);
      snowCaps(c, t, FAR_PEAKS, base, 0.30, 1.0);

      paintRidge(c, NEAR_PEAKS, W, base, P.mountain.near, P.shadow);
      snowCaps(c, t, NEAR_PEAKS, base, 0.38, 1.15); // slightly wider caps

      c.restore();
    }
  });
})();
