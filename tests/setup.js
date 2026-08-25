import {
  afterEach,
  vi
} from "vitest";


Object.defineProperty(
  window,
  "scrollTo",
  {
    configurable: true,
    writable: true,
    value: vi.fn()
  }
);


Object.defineProperty(
  window.Element.prototype,
  "scrollIntoView",
  {
    configurable: true,
    writable: true,
    value: vi.fn()
  }
);


class MockDataTransfer {

  constructor() {

    this._files = [];


    this.items = {

      add: (file) => {

        this._files.push(
          file
        );

      }

    };

  }


  get files() {

    return this._files;

  }

}


Object.defineProperty(
  globalThis,
  "DataTransfer",
  {
    configurable: true,
    writable: true,
    value: MockDataTransfer
  }
);


Object.defineProperty(
  window,
  "DataTransfer",
  {
    configurable: true,
    writable: true,
    value: MockDataTransfer
  }
);


afterEach(
  () => {

    vi.restoreAllMocks();

    vi.unstubAllGlobals();

  }
);