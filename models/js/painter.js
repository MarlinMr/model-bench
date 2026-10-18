/* Painter engine: sequential reveal + infinite animation loop.
 *
 * Convention (all layers MUST follow this):
 *  - Painter.registerLayer({ id, name, draw }) registers a layer.
 *    Layers are drawn in registration order (= script order in index.html),
 *    which is the paint order: background first, foreground last.
 *  - draw(ctx, t, reveal, W, H):
 *      ctx    : 2d context
 *      t      : seconds since scene start (use t, NOT accumulated state)
 *      reveal : 0..1 while this layer is being painted in, then stays 1
 *      W, H   : canvas CSS pixel size (960 x 640)
 *  - Animation MUST be a pure function of t (deterministic, no drift).
 *  - A layer must NOT clear the canvas. The engine clears once per frame.
 */
(function () {
  "use strict";

  var layers = [];
  var revealEntries = [];
  var running = false;
  var rafId = 0;
  var startTime = 0;
  var ctx = null;
  var W = 0;
  var H = 0;

  function registerLayer(def) {
    if (!def || typeof def.draw !== "function") {
      throw new Error("Painter: layer needs a draw() function (" + (def && def.id) + ")");
    }
    layers.push(def);
    if (ctx) def.ctx = ctx;
  }

  function start(canvas, opts) {
    opts = opts || {};
    var totalDelay = opts.totalDelay == null ? 0.8 : opts.totalDelay;
    var perLayer = opts.perLayer == null ? 0.7 : opts.perLayer;
    var revealDur = opts.revealDur == null ? 1.2 : opts.revealDur;

    W = canvas.width;
    H = canvas.height;
    ctx = canvas.getContext("2d");

    // De-duplicate ids
    var seen = {};
    for (var i = 0; i < layers.length; i++) {
      var id = layers[i].id || ("layer" + i);
      if (seen[id]) layers[i].id = id + "_" + i;
      else seen[layers[i].id] = true;
      layers[i].ctx = ctx;
    }

    revealEntries = layers.map(function (layer, i) {
      return {
        layer: layer,
        startAt: totalDelay + i * perLayer,
        dur: revealDur,
        revealed: false
      };
    });

    startTime = performance.now();
    running = true;
    rafId = requestAnimationFrame(frame);
    return window.Painter;
  }

  function easeInOut(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  function frame(now) {
    if (!running) return;
    var t = (now - startTime) / 1000;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < revealEntries.length; i++) {
      var e = revealEntries[i];
      if (t < e.startAt) continue;
      if (!e.revealed) e.revealed = true;
      var raw = Math.min(1, (t - e.startAt) / e.dur);
      e.layer.draw(ctx, t, easeInOut(raw), W, H);
    }
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  /* ---------- shared painterly brush helpers ---------- */

  var Brush = {
    // Fluffy "bob ross" blob built from overlapping circles. Deterministic per (x, y).
    puff: function (c, x, y, r, color, alpha) {
      if (alpha == null) alpha = 1;
      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      var n = Math.max(4, Math.round(r / 5));
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        var rr = r * (0.65 + 0.35 * Math.abs(Math.sin(a * 3 + x * 0.13 + y * 0.07)));
        var px = x + Math.cos(a) * r * 0.5;
        var py = y + Math.sin(a) * r * 0.36;
        c.moveTo(px + rr, py);
        c.arc(px, py, rr, 0, Math.PI * 2);
      }
      c.fill();
      c.restore();
    },
    // Row of puffs, left to right (grass line, cloud bank, tree foliage).
    band: function (c, x0, x1, y, r, color, alpha) {
      var step = r * 1.15;
      for (var x = x0; x <= x1 + step; x += step) {
        this.puff(c, x, y, r, color, alpha);
      }
    },
    // Soft shadow patch.
    shadow: function (c, x, y, rx, ry, color) {
      c.save();
      c.globalAlpha = 0.35;
      c.fillStyle = color || "rgba(10,30,25,0.5)";
      c.translate(x, y);
      c.scale(rx, ry);
      c.beginPath();
      c.arc(0, 0, 1, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
  };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  window.Painter = {
    registerLayer: registerLayer,
    start: start,
    stop: stop,
    layers: layers,
    get ctx() { return ctx; },
    get W() { return W; },
    get H() { return H; }
  };
  window.Brush = Brush;
  window.makeRand = mulberry32;
})();
