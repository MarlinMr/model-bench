/* Layer 8: FOREGROUND (Bob Ross "giant tree in the foreground").
 * The bottom band (roughly y = H-170 .. H, in front of everything): one big
 * hero tree with a swaying crown (fanned branches + clustered puffs,
 * dark -> mid -> light), a few gray rocks with soft shadows, bright
 * wildflower dots, and a sparse slow drift of falling leaves / petals.
 * Reveal = left-to-right wipe. Animation = pure fn of t (crown sway,
 * wildflower sway, leaf/petal drift). All positions/phases deterministic
 * (seeded rand at module top-level, seed 7171).
 */
(function () {
  "use strict";

  var P = window.PALETTE;
  var L = window.LAYOUT;
  var rand = window.makeRand(7171);

  /* ---------- big hero tree ---------- */
  var bx = Math.round(L.W * 0.74);
  var baseY = L.H + 10;                  // trunk base, rooted just off the bottom edge
  var trunkTop = L.H - 170;
  var T0 = { x: bx, y: baseY };
  var T1 = { x: bx - 12, y: L.H - 75 };
  var T2 = { x: bx + 8, y: trunkTop };
  var treePhase = rand() * Math.PI * 2;

  function trunkAt(s) {
    var u = 1 - s;
    return {
      x: u * u * T0.x + 2 * u * s * T1.x + s * s * T2.x,
      y: u * u * T0.y + 2 * u * s * T1.y + s * s * T2.y
    };
  }

  // 5 main branches fanning out/up along the upper trunk.
  var NBR = 5;
  var BRANCHES = [];
  for (var b = 0; b < NBR; b++) {
    var f = (b + 0.5) / NBR;
    var from = trunkAt(0.42 + f * 0.5);
    var side = (b % 2 === 0) ? -1 : 1;
    var reach = 54 + rand() * 42;
    var to = {
      x: from.x + side * reach + (rand() - 0.5) * 16,
      y: L.H - 148 - rand() * 26
    };
    var ctrl = {
      x: (from.x + to.x) / 2 + side * (8 + rand() * 14),
      y: (from.y + to.y) / 2 + 4
    };
    BRANCHES.push({ from: from, to: to, ctrl: ctrl });
  }

  // Foliage: one clustered puff per branch tip + one crown-center puff.
  var PUFFS = [];
  for (var pb = 0; pb < BRANCHES.length; pb++) {
    PUFFS.push({
      x: BRANCHES[pb].to.x + (rand() - 0.5) * 12,
      y: BRANCHES[pb].to.y + 2 + rand() * 6,
      r: 25 + rand() * 11
    });
  }
  PUFFS.push({ x: bx + 4, y: trunkTop - 2, r: 28 + rand() * 8 });
  // Highest puffs catch the light: dark (low/back) -> mid -> light (top).
  PUFFS.sort(function (a, b) { return a.y - b.y; });
  var PC = [P.tree.light, P.tree.light, P.tree.mid, P.tree.mid, P.tree.dark, P.tree.dark];
  for (var pc = 0; pc < PUFFS.length; pc++) PUFFS[pc].c = PC[pc] || P.tree.mid;

  /* ---------- rocks ---------- */
  var RO = [
    { x: 130 + rand() * 50, y: L.H - 36 - rand() * 12, r: 12 + rand() * 5, c: "#8a8f98" },
    { x: 245 + rand() * 45, y: L.H - 48 - rand() * 10, r: 14 + rand() * 5, c: "#6d7280" }, // leaning toward the stream edge
    { x: 330 + rand() * 45, y: L.H - 30 - rand() * 10, r: 10 + rand() * 5, c: "#8a8f98" },
    { x: 585 + rand() * 55, y: L.H - 56 - rand() * 10, r: 13 + rand() * 5, c: "#6d7280" }
  ];

  /* ---------- wildflowers ---------- */
  var FLOWER = [
    { petal: "#ff5f6d", core: "#8f2b39" },
    { petal: "#ffd23f", core: "#a37718" },
    { petal: "#f8f9fa", core: "#98a0ae" },
    { petal: "#b967ff", core: "#5f2f8f" }
  ];
  var NF = 11;
  var FLOWERS = [];
  for (var fl = 0; fl < NF; fl++) {
    var fc = FLOWER[fl % 4];
    FLOWERS.push({
      x: (fl + 0.5) / NF * L.W + (rand() - 0.5) * (L.W / NF) * 0.8,
      y: L.H - 26 - rand() * 135,
      r: 3 + rand() * 3,
      petal: fc.petal,
      core: fc.core,
      phase: rand() * Math.PI * 2
    });
  }

  /* ---------- drifting leaves / petals (sparse, slow) ---------- */
  var NL = 11;
  var LEAVES = [];
  var fallTop = L.H - 200;
  var fallBot = L.H + 14;
  var fallSpan = fallBot - fallTop;
  for (var lv = 0; lv < NL; lv++) {
    LEAVES.push({
      u: rand(),
      x: bx + (rand() - 0.5) * 300,
      r: 2.5 + rand() * 2,
      speed: 0.016 + rand() * 0.018,
      phase: rand() * Math.PI * 2,
      color: rand() > 0.5 ? P.tree.light : "#f2a9c6"
    });
  }

  window.Painter.registerLayer({
    id: "foreground",
    name: "Giant tree, rocks & wildflowers",
    draw: function (c, t, reveal, W, H) {
      // Reveal: left-to-right wipe (same pattern as every other layer).
      c.save();
      c.beginPath();
      c.rect(0, 0, W * reveal, H);
      c.clip();

      // Gentle dab-in alpha on top of the wipe.
      c.save();
      c.globalAlpha = Math.min(1, reveal * 1.6);

      // ---- big tree ----
      // Soft ground shadow under the hero tree.
      window.Brush.shadow(c, bx + 6, H - 4, 100, 9, P.shadow);

      // Trunk: thick rounded quadratic stroke, always planted.
      c.save();
      c.lineCap = "round";
      c.strokeStyle = P.tree.trunk;
      c.lineWidth = 17;
      c.beginPath();
      c.moveTo(T0.x, T0.y);
      c.quadraticCurveTo(T1.x, T1.y, T2.x, T2.y);
      c.stroke();
      c.restore();

      // Crown (branches + puffs) sways as one unit about the trunk base.
      var a = Math.sin(t * 0.6 + treePhase) * 0.02;
      c.save();
      c.translate(bx, H);
      c.rotate(a);
      c.translate(-bx, -H);

      c.save();
      c.lineCap = "round";
      c.lineJoin = "round";
      c.strokeStyle = P.tree.trunk;
      c.lineWidth = 7;
      for (var b = 0; b < BRANCHES.length; b++) {
        var br = BRANCHES[b];
        c.beginPath();
        c.moveTo(br.from.x, br.from.y);
        c.quadraticCurveTo(br.ctrl.x, br.ctrl.y, br.to.x, br.to.y);
        c.stroke();
      }
      c.restore();

      for (var p = 0; p < PUFFS.length; p++) {
        var pf = PUFFS[p];
        window.Brush.puff(c, pf.x, pf.y, pf.r, pf.c, 0.95);
      }

      c.restore();

      // ---- rocks (flattened puffs + soft shadow, a couple near the stream edge) ----
      for (var rk = 0; rk < RO.length; rk++) {
        var ro = RO[rk];
        window.Brush.shadow(c, ro.x, ro.y + ro.r * 0.32, ro.r * 1.25, ro.r * 0.34, P.shadow);
        window.Brush.puff(c, ro.x, ro.y, ro.r, ro.c, 1);
        window.Brush.puff(c, ro.x - ro.r * 0.18, ro.y - ro.r * 0.24, ro.r * 0.55, "#a7adb8", 0.8);
      }

      // ---- wildflowers (tiny sway, bright dot + darker center) ----
      for (var fl = 0; fl < FLOWERS.length; fl++) {
        var fw = FLOWERS[fl];
        var fx = fw.x + Math.sin(t * 0.8 + fw.phase) * 1.6;
        window.Brush.puff(c, fx, fw.y, fw.r, fw.petal, 0.95);
        c.save();
        c.globalAlpha = Math.min(1, reveal * 1.6) * 0.9;
        c.fillStyle = fw.core;
        c.beginPath();
        c.arc(fx, fw.y, Math.max(1, fw.r * 0.35), 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // ---- drifting leaves / petals: fall (y increases with t), sway, wrap in-band ----
      for (var li = 0; li < LEAVES.length; li++) {
        var lv2 = LEAVES[li];
        var prog = (lv2.u + t * lv2.speed) % 1;
        var ly = fallTop + prog * fallSpan;
        var lx2 = lv2.x + Math.sin(t * 0.8 + lv2.phase) * 8;
        var la = 0.45 + 0.25 * Math.sin(t * 1.4 + lv2.phase);
        window.Brush.puff(c, lx2, ly, lv2.r, lv2.color, la);
      }

      c.restore();
      c.restore();
    }
  });
})();
