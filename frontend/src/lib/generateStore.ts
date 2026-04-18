// src/lib/generateStore.ts
// Lightweight in-memory store that bridges GeneratePage → PreviewPage.
// When the user clicks "Generate Portfolio", GeneratePage fires the API call
// and stores the promise here. PreviewPage reads it immediately after navigation
// and waits on it — no polling, no fixed timeouts, no localStorage hacks.
//
// The store is intentionally module-level (not React state) so it survives
// the GeneratePage unmount that happens during navigation.

let _promise: Promise<{ portfolioId: string }> | null = null;

export const generateStore = {
  set(promise: Promise<{ portfolioId: string }>) {
    _promise = promise;
  },
  take(): Promise<{ portfolioId: string }> | null {
    const p = _promise;
    _promise = null; // consume it — each generate gets one promise
    return p;
  },
};
