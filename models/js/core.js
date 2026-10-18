/* Scene layout: shared geometry constants + small helpers.
 * Every layer files MUST import from LAYOUT for positions so future
 * layers (mountains, trees, water, foreground) line up consistently.
 *
 * Design space is 960 x 640 absolute pixels (canvas is set to that size
 * in index.html; CSS scales it down).
 */
(function () {
  "use strict";
  var W = 960, H = 640;
  var horizonY = Math.round(H * 0.62);       // line where sky meets land

  var LAYOUT = {
    W: W,
    H: H,
    horizonY: horizonY,
    sun: { x: W * 0.78, y: H * 0.22, core: 34, halo: 150 },
    // Stream: a meandering vertical-ish band flowing from the horizon
    // (behind the mountains) down to the bottom edge. Center x as fn of y.
    stream: {
      widthAt: function (y) { return 26 + (y - LAYOUT.horizonY) * 0.42; },
      centerAt: function (y) {
        return W * 0.38
          + Math.sin(((y - LAYOUT.horizonY) / H) * 5.2) * 60
          + Math.sin(((y - LAYOUT.horizonY) / H) * 2.1 + 1.7) * 30;
      }
    },
    // Tree belt band: y range where the pine forest sits
    treeBelt: { top: horizonY - 26, bottom: H - 70 },
    // Meadow band: between tree belt bottom and stream edge (rough)
    meadowTop: horizonY,
    meadowBottom: H
  };

  window.LAYOUT = LAYOUT;
})();
