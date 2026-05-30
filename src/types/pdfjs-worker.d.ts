// pdfjs-dist ships its worker as an .mjs without type declarations. We import it
// purely for its side effects (so the bundler ships it); no API surface needed.
declare module "pdfjs-dist/legacy/build/pdf.worker.mjs";
