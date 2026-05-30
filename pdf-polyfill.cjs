// CommonJS preload (via NODE_OPTIONS=--require ./pdf-polyfill.cjs).
//
// Runs at the very start of the Node process — before ANY ESM module (including
// pdfjs chunks) is evaluated. This is the only timing guarantee strong enough to
// beat the bundler hoisting pdfjs's module-eval, which references browser
// globals (DOMMatrix, Path2D, ImageData, …) that Node doesn't define.
//
// Text extraction never calls these methods, so no-op stubs suffice.

(function installPdfGlobals() {
  const g = globalThis;

  if (typeof g.DOMMatrix === "undefined") {
    g.DOMMatrix = class DOMMatrix {
      constructor(init) {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        if (Array.isArray(init) && init.length >= 6) {
          this.a = init[0]; this.b = init[1]; this.c = init[2];
          this.d = init[3]; this.e = init[4]; this.f = init[5];
        }
      }
      multiply() { return this; }
      translate() { return this; }
      scale() { return this; }
      inverse() { return this; }
      transformPoint(p) { return p; }
    };
  }

  if (typeof g.Path2D === "undefined") {
    g.Path2D = class Path2D {
      addPath() {} moveTo() {} lineTo() {} bezierCurveTo() {}
      quadraticCurveTo() {} arc() {} closePath() {} rect() {}
    };
  }

  if (typeof g.ImageData === "undefined") {
    g.ImageData = class ImageData {
      constructor(w, h) {
        this.width = w; this.height = h;
        this.data = new Uint8ClampedArray((w * h || 0) * 4);
      }
    };
  }

  if (typeof g.DOMRect === "undefined") {
    g.DOMRect = class DOMRect {
      constructor(x = 0, y = 0, w = 0, h = 0) {
        this.x = x; this.y = y; this.width = w; this.height = h;
      }
    };
  }

  if (typeof g.DOMPoint === "undefined") {
    g.DOMPoint = class DOMPoint {
      constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    };
  }
})();
