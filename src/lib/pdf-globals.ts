// Minimal no-op stubs for the browser globals that pdfjs-dist's pdf.mjs
// references at MODULE-EVAL time (DOMMatrix, Path2D, ImageData, …). Node — even
// v24/v25 on Vercel — doesn't define them, so importing pdfjs throws
// "ReferenceError: DOMMatrix is not defined" the instant the module is
// evaluated.
//
// CRITICAL: this must run BEFORE pdfjs is evaluated. The bundler may hoist/eager
// a route's dynamic import(), so installing the stubs inside the parse function
// is too late in production. We therefore call this from instrumentation.ts
// (runs at serverless cold-start, before any route code) AND defensively at the
// top of the PDF parse path. Text extraction never invokes these methods, so
// no-op stubs are sufficient (verified against real PDFs).

export function installPdfGlobals(): void {
  const g = globalThis as Record<string, unknown>;

  if (typeof g.DOMMatrix === "undefined") {
    g.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor(init?: number[] | string) {
        if (Array.isArray(init) && init.length >= 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        }
      }
      multiply() { return this; }
      translate() { return this; }
      scale() { return this; }
      inverse() { return this; }
      transformPoint(p: unknown) { return p; }
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
      width: number; height: number; data: Uint8ClampedArray;
      constructor(w: number, h: number) {
        this.width = w; this.height = h;
        this.data = new Uint8ClampedArray((w * h || 0) * 4);
      }
    };
  }

  if (typeof g.DOMRect === "undefined") {
    g.DOMRect = class DOMRect {
      x: number; y: number; width: number; height: number;
      constructor(x = 0, y = 0, w = 0, h = 0) {
        this.x = x; this.y = y; this.width = w; this.height = h;
      }
    };
  }

  if (typeof g.DOMPoint === "undefined") {
    g.DOMPoint = class DOMPoint {
      x: number; y: number;
      constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    };
  }
}
