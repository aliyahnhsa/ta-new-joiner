import {
  afterEach,
  vi
} from "vitest";


/* ======================================================
   MOCK BROWSER SCROLL APIs
   ====================================================== */

/*
 * jsdom tidak benar-benar melakukan scrolling.
 * Frontend menggunakan window.scrollTo().
 */

Object.defineProperty(
  window,
  "scrollTo",
  {
    configurable: true,
    writable: true,
    value: vi.fn()
  }
);


/*
 * Frontend juga menggunakan:
 *
 * element.scrollIntoView(...)
 *
 * Method ini tersedia di browser normal,
 * tetapi tidak diimplementasikan penuh oleh jsdom.
 */

Object.defineProperty(
  window.Element.prototype,
  "scrollIntoView",
  {
    configurable: true,
    writable: true,
    value: vi.fn()
  }
);


/* ======================================================
   CLEANUP
   ====================================================== */

afterEach(
  () => {

    vi.restoreAllMocks();

    vi.unstubAllGlobals();

  }
);