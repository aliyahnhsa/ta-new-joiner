import {
  readFile
} from "node:fs/promises";


import {
  dirname,
  resolve
} from "node:path";


import {
  fileURLToPath
} from "node:url";


import {
  expect,
  vi
} from "vitest";


const currentDirectory =
  dirname(
    fileURLToPath(
      import.meta.url
    )
  );


const projectRoot =
  resolve(
    currentDirectory,
    ".."
  );


const indexHtmlPath =
  resolve(
    projectRoot,
    "index.html"
  );



export const TEST_REGION_DATA = [

  [
    "31",
    "DKI JAKARTA"
  ],

  [
    "31.71",
    "KOTA JAKARTA PUSAT"
  ],

  [
    "31.71.01",
    "GAMBIR"
  ],

  [
    "31.71.01.1001",
    "GAMBIR"
  ],


  [
    "32",
    "JAWA BARAT"
  ],

  [
    "32.73",
    "KOTA BANDUNG"
  ],

  [
    "32.73.01",
    "SUKASARI"
  ],

  [
    "32.73.01.1001",
    "ISOLA"
  ]

];


export async function flushPromises() {

  await Promise.resolve();

  await Promise.resolve();


  await new Promise(
    (resolvePromise) => {

      setTimeout(
        resolvePromise,
        0
      );

    }
  );


  await Promise.resolve();

}


export async function waitUntil(
  callback,
  timeout = 3000
) {

  const start =
    Date.now();


  let lastError =
    null;


  while (
    Date.now() - start <
    timeout
  ) {

    try {

      return callback();

    } catch (error) {

      lastError =
        error;

    }


    await new Promise(
      (resolvePromise) => {

        setTimeout(
          resolvePromise,
          10
        );

      }
    );

  }


  throw (
    lastError ||
    new Error(
      "Condition was not reached before timeout."
    )
  );

}


export function getById(
  id
) {

  return document.getElementById(
    id
  );

}


export function setInputValue(
  id,
  value
) {

  const element =
    getById(
      id
    );


  element.value =
    value;


  element.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true
      }
    )
  );


  element.dispatchEvent(
    new Event(
      "change",
      {
        bubbles: true
      }
    )
  );


  return element;

}


export function selectValue(
  id,
  value
) {

  const select =
    getById(
      id
    );


  select.value =
    value;


  select.dispatchEvent(
    new Event(
      "change",
      {
        bubbles: true
      }
    )
  );


  return select;

}


export function checkRadio(
  name,
  value
) {

  const radio =
    document.querySelector(
      `input[type="radio"][name="${name}"][value="${value}"]`
    );


  if (
    !radio
  ) {

    throw new Error(
      `Radio "${name}" value "${value}" tidak ditemukan.`
    );

  }


  radio.checked =
    true;


  radio.dispatchEvent(
    new Event(
      "change",
      {
        bubbles: true
      }
    )
  );


  return radio;

}


export function setCheckbox(
  id,
  checked
) {

  const checkbox =
    getById(
      id
    );


  checkbox.checked =
    checked;


  checkbox.dispatchEvent(
    new Event(
      "change",
      {
        bubbles: true
      }
    )
  );


  return checkbox;

}



export function createPdfFile(
  fileName = "test.pdf",
  size = 100
) {

  return new File(
    [
      new Uint8Array(
        size
      )
    ],
    fileName,
    {
      type:
        "application/pdf"
    }
  );

}


export function installFileState(
  input,
  initialFiles = []
) {

  let currentFiles =
    Array.from(
      initialFiles
    );


  Object.defineProperty(
    input,
    "files",
    {

      configurable:
        true,


      get() {

        return currentFiles;

      },


      set(value) {

        currentFiles =
          Array.from(
            value || []
          );

      }

    }
  );


  Object.defineProperty(
    input,
    "value",
    {

      configurable:
        true,


      get() {

        return currentFiles.length
          ? `C:\\fakepath\\${currentFiles[0].name}`
          : "";

      },


      set(value) {

        if (
          value === ""
        ) {

          currentFiles =
            [];

        }

      }

    }
  );


  return {

    getFiles() {

      return currentFiles;

    },


    setFiles(
      files
    ) {

      currentFiles =
        Array.from(
          files || []
        );

    }

  };

}


export function setFile(
  id,
  file
) {

  const input =
    getById(
      id
    );


  installFileState(
    input,
    [
      file
    ]
  );


  input.dispatchEvent(
    new Event(
      "change",
      {
        bubbles: true
      }
    )
  );


  return input;

}


export function clickNext(
  pageNumber
) {

  const button =
    document.querySelector(
      `[data-form-page="${pageNumber}"] [data-next-page]`
    );


  button.click();

}


export function getVisiblePage() {

  return document.querySelector(
    ".form-page.is-visible"
  );

}


export function getPostCalls(
  fetchMock
) {

  return fetchMock
    .mock
    .calls
    .filter(
      (
        [
          ,
          options
        ]
      ) =>
        options?.method ===
        "POST"
    );

}


export function getPostPayload(
  fetchMock
) {

  const postCall =
    getPostCalls(
      fetchMock
    )[0];


  if (
    !postCall
  ) {

    throw new Error(
      "POST call tidak ditemukan."
    );

  }


  return JSON.parse(
    postCall[1].body
  );

}


export function createFetchMock({
  csvMode = "success",
  backendMode = "success",
  httpStatus = 500
} = {}) {

  return vi.fn(
    async (
      url,
      options = {}
    ) => {

      const urlString =
        String(
          url
        );


      const isOrganization =
        urlString.includes(
          "organization.csv"
        );


      const isRecruiters =
        urlString.includes(
          "recruiters.csv"
        );


      if (
        isOrganization ||
        isRecruiters
      ) {

        if (
          csvMode ===
          "networkError"
        ) {

          throw new Error(
            "CSV_NETWORK_ERROR"
          );

        }


        if (
          csvMode ===
          "httpError"
        ) {

          return {

            ok:
              false,


            status:
              500,


            text:
              async () =>
                ""

          };

        }


        if (
          isOrganization
        ) {

          return {

            ok:
              true,


            status:
              200,


            text:
              async () =>
                [
                  "directorate,unit",
                  "Technology,Other",
                  "Technology,Business Support Systems Sub Unit",
                  "Commercial,Other",
                  "Commercial,Product Management Unit"
                ].join(
                  "\n"
                )

          };

        }


        return {

          ok:
            true,


          status:
            200,


          text:
            async () =>
              [
                "name",
                "Audy Atira Pramono",
                "Demus Abethego"
              ].join(
                "\n"
              )

        };

      }

      if (
        options.method ===
        "POST"
      ) {

        if (
          backendMode ===
          "networkError"
        ) {

          throw new Error(
            "NETWORK_DOWN"
          );

        }


        if (
          backendMode ===
          "httpError"
        ) {

          return {

            ok:
              false,


            status:
              httpStatus,


            text:
              async () =>
                `HTTP ${httpStatus} test error`

          };

        }


        if (
          backendMode ===
          "nonJson"
        ) {

          return {

            ok:
              true,


            status:
              200,


            text:
              async () =>
                "OK_NOT_JSON"

          };

        }


        return {

          ok:
            true,


          status:
            200,


          text:
            async () =>
              JSON.stringify(
                {
                  success:
                    true
                }
              )

        };

      }


      return {

        ok:
          true,


        status:
          200,


        text:
          async () =>
            ""

      };

    }
  );

}


export async function bootFrontend({
  csvMode = "success",
  backendMode = "success",
  httpStatus = 500,
  powerAutomateUrl =
    "https://unit-test.local/power-automate",
  preloadStorage = {},
  suppressConsoleError = false
} = {}) {

  vi.resetModules();


  localStorage.clear();

  const html =
    await readFile(
      indexHtmlPath,
      "utf8"
    );


  const htmlWithoutScripts =
    html.replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      ""
    );


  document.open();


  document.write(
    htmlWithoutScripts
  );


  document.close();


  window.WILAYAH_INDONESIA =
    TEST_REGION_DATA;


  window.__POWER_AUTOMATE_URL__ =
    powerAutomateUrl;



  Object.entries(
    preloadStorage
  ).forEach(
    (
      [
        key,
        value
      ]
    ) => {

      localStorage.setItem(
        key,
        value
      );

    }
  );


  const fetchMock =
    createFetchMock({
      csvMode,
      backendMode,
      httpStatus
    });


  vi.stubGlobal(
    "fetch",
    fetchMock
  );


  window.fetch =
    fetchMock;

  vi.spyOn(
    console,
    "info"
  ).mockImplementation(
    () => {}
  );


  if (
    suppressConsoleError
  ) {

    vi.spyOn(
      console,
      "error"
    ).mockImplementation(
      () => {}
    );

  }


  await import(
    "../js/app.js"
  );


  await flushPromises();


  await waitUntil(
    () => {

      expect(
        getById(
          "direktorat"
        ).options.length
      ).toBeGreaterThan(
        1
      );


      expect(
        getById(
          "recruiter"
        ).options.length
      ).toBeGreaterThan(
        1
      );

    }
  );


  return {

    fetchMock

  };

}



export async function fillValidPage2({
  sameAsKtp = true
} = {}) {

  setInputValue(
    "namaDepan",
    "Ara"
  );


  setInputValue(
    "namaTengah",
    "Rizkita"
  );


  setInputValue(
    "namaBelakang",
    "Setiadji"
  );


  setInputValue(
    "kotaLahir",
    "Jakarta"
  );


  checkRadio(
    "JenisKelamin",
    "Wanita"
  );


  setInputValue(
    "tanggalLahir",
    "2000-01-01"
  );



  setInputValue(
    "alamatKtp",
    "Jl. KTP Test No. 1"
  );


  selectValue(
    "provinsiKtp",
    "DKI JAKARTA"
  );


  selectValue(
    "kotaKtp",
    "KOTA JAKARTA PUSAT"
  );


  selectValue(
    "kecamatanKtp",
    "GAMBIR"
  );


  selectValue(
    "kelurahanKtp",
    "GAMBIR"
  );


  setInputValue(
    "rtRwKtp",
    "001/002"
  );


  setInputValue(
    "kodePosKtp",
    "10110"
  );



  setCheckbox(
    "alamatSamaDenganKtp",
    sameAsKtp
  );


  if (
    !sameAsKtp
  ) {

    setInputValue(
      "alamatDomisili",
      "Jl. Domisili Test No. 2"
    );


    selectValue(
      "provinsiDomisili",
      "JAWA BARAT"
    );


    selectValue(
      "kotaDomisili",
      "KOTA BANDUNG"
    );


    selectValue(
      "kecamatanDomisili",
      "SUKASARI"
    );


    selectValue(
      "kelurahanDomisili",
      "ISOLA"
    );


    setInputValue(
      "rtRwDomisili",
      "003/004"
    );


    setInputValue(
      "kodePosDomisili",
      "40154"
    );

  }


  setInputValue(
    "nomorHandphone",
    "081234567890"
  );


  setInputValue(
    "nomorLinkAja",
    "081234567891"
  );


  setInputValue(
    "emailPribadi",
    "ara.test@example.com"
  );


  setInputValue(
    "namaEmergencyContact",
    "Test Contact"
  );


  selectValue(
    "hubunganEmergencyContact",
    "Ibu"
  );


  setInputValue(
    "nomorEmergencyContact",
    "081234567892"
  );

}


export async function fillValidPage3({
  partner = false,
  children = false,
  skipFiles = []
} = {}) {

  setInputValue(
    "nomorKtp",
    "3171234567890123"
  );


  setInputValue(
    "nomorKk",
    "3171234567890123"
  );


  setInputValue(
    "nomorNpwp",
    "0"
  );


  selectValue(
    "statusPajak",
    "TK/0"
  );


  if (
    !skipFiles.includes(
      "lampiranKtp"
    )
  ) {

    setFile(
      "lampiranKtp",
      createPdfFile(
        "KTP_Ara.pdf"
      )
    );

  }


  if (
    !skipFiles.includes(
      "lampiranKk"
    )
  ) {

    setFile(
      "lampiranKk",
      createPdfFile(
        "KK_Ara.pdf"
      )
    );

  }


  if (
    !skipFiles.includes(
      "lampiranNpwp"
    )
  ) {

    setFile(
      "lampiranNpwp",
      createPdfFile(
        "NPWP_Ara.pdf"
      )
    );

  }



  setCheckbox(
    "memilikiPasangan",
    partner
  );


  if (
    partner
  ) {

    setInputValue(
      "namaPasangan",
      "Pasangan Test"
    );


    setInputValue(
      "nomorKtpPasangan",
      "3171234567890999"
    );


    setFile(
      "lampiranKtpPasangan",
      createPdfFile(
        "KTP_Pasangan.pdf"
      )
    );

  }


  setCheckbox(
    "memilikiAnak",
    children
  );


  if (
    children
  ) {

    setInputValue(
      "namaAnakPertama",
      "Anak Pertama"
    );


    setFile(
      "lampiranAnakPertama",
      createPdfFile(
        "Anak_Pertama.pdf"
      )
    );

  }


  setInputValue(
    "namaPemilikTabungan",
    "Ara Test"
  );


  setInputValue(
    "nomorRekening",
    "1234567890"
  );


  selectValue(
    "namaBank",
    "Bank Mandiri"
  );


  if (
    !skipFiles.includes(
      "lampiranBukuTabungan"
    )
  ) {

    setFile(
      "lampiranBukuTabungan",
      createPdfFile(
        "Rekening_Ara.pdf"
      )
    );

  }


  setInputValue(
    "nomorBpjsKetenagakerjaan",
    "0"
  );


  setInputValue(
    "nomorBpjsKesehatan",
    "0"
  );


  selectValue(
    "pendidikanTerakhir",
    "Sarjana / S1"
  );


  if (
    !skipFiles.includes(
      "lampiranIjazah"
    )
  ) {

    setFile(
      "lampiranIjazah",
      createPdfFile(
        "Ijazah_Ara.pdf"
      )
    );

  }

}

export async function fillValidPage4({
  groupUnit =
    "Business Support Systems Sub Unit"
} = {}) {

  setInputValue(
    "tanggalJoin",
    "2026-09-01"
  );


  checkRadio(
    "LokasiKerja",
    "Jakarta"
  );


  setInputValue(
    "posisi",
    "Software Engineer Intern"
  );


  selectValue(
    "direktorat",
    "Technology"
  );


  selectValue(
    "groupUnit",
    groupUnit
  );


  if (
    groupUnit ===
    "Other"
  ) {

    setInputValue(
      "groupUnitLainnya",
      "Test Custom Unit"
    );

  }


  setFile(
    "signedOfferProposal",
    createPdfFile(
      "Ara_SignedOfferProposal.pdf"
    )
  );


  setInputValue(
    "atasan",
    "Test Manager"
  );


  selectValue(
    "recruiter",
    "Audy Atira Pramono"
  );


  selectValue(
    "ukuranKaos",
    "M - 50 x 71 cm"
  );

}


export async function fillValidForm(
  options = {}
) {

  await fillValidPage2({

    sameAsKtp:
      options.sameAsKtp ??
      true

  });


  await fillValidPage3({

    partner:
      options.partner ??
      false,


    children:
      options.children ??
      false,


    skipFiles:
      options.skipFiles ??
      []

  });


  await fillValidPage4({

    groupUnit:
      options.groupUnit

  });


  await flushPromises();

}
export function openSubmitConfirmation() {

  getById(
    "newJoinerForm"
  ).dispatchEvent(
    new Event(
      "submit",
      {

        bubbles:
          true,


        cancelable:
          true

      }
    )
  );

}