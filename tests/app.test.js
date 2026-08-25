import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";


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


/* ======================================================
   PROJECT PATH
   ====================================================== */

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


/* ======================================================
   TEST REGION DATA
   ====================================================== */

/*
 * Kita tidak perlu load seluruh wilayah-data.js
 * untuk unit test.
 *
 * Cukup sample kecil untuk mengetes:
 *
 * Provinsi
 * → Kota
 * → Kecamatan
 * → Kelurahan
 */

const TEST_REGION_DATA = [

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


/* ======================================================
   HELPERS
   ====================================================== */

async function flushPromises() {

  /*
   * Beberapa initialization app menggunakan
   * async fetch untuk CSV.
   *
   * Kasih event loop waktu untuk menyelesaikannya.
   */

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


async function waitUntil(
  callback,
  timeout = 2500
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


function getById(id) {

  return document.getElementById(
    id
  );

}


function setInputValue(
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


function selectValue(
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


function checkRadio(
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


function setCheckbox(
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


function createPdfFile(
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


function setFile(
  id,
  file
) {

  const input =
    getById(
      id
    );


  Object.defineProperty(
    input,
    "files",
    {

      configurable:
        true,

      value: [
        file
      ]

    }
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


function clickNext(
  pageNumber
) {

  const button =
    document.querySelector(
      `[data-form-page="${pageNumber}"] [data-next-page]`
    );


  button.click();

}


function getVisiblePage() {

  return document.querySelector(
    ".form-page.is-visible"
  );

}


/* ======================================================
   MOCK FETCH
   ====================================================== */

function createFetchMock() {

  return vi.fn(
    async (
      url,
      options = {}
    ) => {

      const urlString =
        String(
          url
        );


      /*
       * Mock organization.csv
       */

      if (
        urlString.includes(
          "organization.csv"
        )
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


      /*
       * Mock recruiters.csv
       */

      if (
        urlString.includes(
          "recruiters.csv"
        )
      ) {

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


      /*
       * Semua request lain dianggap
       * request backend Power Automate.
       *
       * Kita TIDAK benar-benar call network.
       */

      if (
        options.method ===
        "POST"
      ) {

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


/* ======================================================
   BOOT FRONTEND
   ====================================================== */

async function bootFrontend() {

  vi.resetModules();


  localStorage.clear();


  /*
   * Read real index.html.
   */

  const html =
    await readFile(
      indexHtmlPath,
      "utf8"
    );


  /*
   * Hapus script tag supaya jsdom tidak
   * mencoba execute script HTML sendiri.
   *
   * app.js nanti kita import manual.
   */

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


  /*
   * Inject test wilayah.
   */

  window.WILAYAH_INDONESIA =
    TEST_REGION_DATA;


  /*
   * Mock fetch.
   */

  const fetchMock =
    createFetchMock();


  vi.stubGlobal(
    "fetch",
    fetchMock
  );


  /*
   * Suppress development console info.
   */

  vi.spyOn(
    console,
    "info"
  ).mockImplementation(
    () => {}
  );


  /*
   * Execute REAL js/app.js.
   */

  await import(
    "../js/app.js"
  );


  await flushPromises();


  return {

    fetchMock

  };

}


/* ======================================================
   VALID FULL FORM FIXTURE
   ====================================================== */

async function fillValidForm() {

  /* ====================================================
     PAGE 2
     PERSONAL INFORMATION
     ==================================================== */

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
    "Jl. Test No. 1"
  );


  /*
   * Cascading KTP address.
   */

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


  /*
   * Same as KTP supaya domicile fields
   * tidak perlu diisi ulang.
   */

  setCheckbox(
    "alamatSamaDenganKtp",
    true
  );


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


  /* ====================================================
     PAGE 3
     DOCUMENTS
     ==================================================== */

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


  /*
   * Required PDF files.
   */

  setFile(
    "lampiranKtp",
    createPdfFile(
      "KTP_Ara.pdf"
    )
  );


  setFile(
    "lampiranKk",
    createPdfFile(
      "KK_Ara.pdf"
    )
  );


  setFile(
    "lampiranNpwp",
    createPdfFile(
      "NPWP_Ara.pdf"
    )
  );


  setFile(
    "lampiranBukuTabungan",
    createPdfFile(
      "Rekening_Ara.pdf"
    )
  );


  setFile(
    "lampiranIjazah",
    createPdfFile(
      "Ijazah_Ara.pdf"
    )
  );


  /* ====================================================
     PAGE 4
     HR
     ==================================================== */

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


  /*
   * CSV sudah dimock dan telah selesai load
   * ketika helper ini dipanggil.
   */

  selectValue(
    "direktorat",
    "Technology"
  );


  selectValue(
    "groupUnit",
    "Business Support Systems Sub Unit"
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


  setFile(
    "signedOfferProposal",
    createPdfFile(
      "Ara_SignedOfferProposal.pdf"
    )
  );


  await flushPromises();

}


/* ======================================================
   TEST SUITE
   ====================================================== */

describe(
  "LinkAja New Joiner Form - Frontend Unit Tests",
  () => {


    beforeEach(
      async () => {

        await bootFrontend();

      }
    );


    /* ==================================================
       TEST 1
       INITIAL PAGE
       ================================================== */

    it(
      "menampilkan halaman Intro saat pertama kali dibuka",
      () => {

        const visiblePage =
          getVisiblePage();


        expect(
          visiblePage
        ).not.toBeNull();


        expect(
          visiblePage.dataset
            .formPage
        ).toBe(
          "1"
        );


        expect(
          document.querySelector(
            '[data-step-indicator="1"]'
          ).classList.contains(
            "is-active"
          )
        ).toBe(
          true
        );

      }
    );


    /* ==================================================
       TEST 2
       NAVIGATION
       ================================================== */

    it(
      "berpindah dari Intro ke Informasi Pribadi ketika Next diklik",
      () => {

        clickNext(
          1
        );


        expect(
          getVisiblePage()
            .dataset
            .formPage
        ).toBe(
          "2"
        );


        expect(
          document.querySelector(
            '[data-step-indicator="2"]'
          ).classList.contains(
            "is-active"
          )
        ).toBe(
          true
        );

      }
    );


    /* ==================================================
       TEST 3
       REQUIRED VALIDATION
       ================================================== */

    it(
      "tidak mengizinkan lanjut jika field wajib halaman 2 masih kosong",
      () => {

        clickNext(
          1
        );


        clickNext(
          2
        );


        expect(
          getVisiblePage()
            .dataset
            .formPage
        ).toBe(
          "2"
        );


        expect(
          getById(
            "pageTwoStatus"
          ).textContent
        ).toContain(
          "Mohon lengkapi"
        );


        expect(
          getById(
            "namaDepan"
          ).classList.contains(
            "field-error"
          )
        ).toBe(
          true
        );

      }
    );


    /* ==================================================
       TEST 4
       DOMICILE TOGGLE
       ================================================== */

    it(
      "menonaktifkan field domisili ketika alamat sama dengan KTP",
      () => {

        setCheckbox(
          "alamatSamaDenganKtp",
          true
        );


        const domicilePanel =
          getById(
            "domicileFields"
          );


        expect(
          domicilePanel.classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        domicilePanel
          .querySelectorAll(
            "input, select"
          )
          .forEach(
            (field) => {

              expect(
                field.disabled
              ).toBe(
                true
              );

            }
          );


        expect(
          document.querySelector(
            '[data-toggle-state="alamatSamaDenganKtp"]'
          ).textContent.trim()
        ).toBe(
          "YA"
        );

      }
    );


    /* ==================================================
       TEST 5
       PARTNER TOGGLE
       ================================================== */

    it(
      "menampilkan dan mewajibkan data pasangan ketika toggle pasangan = YA",
      () => {

        setCheckbox(
          "memilikiPasangan",
          true
        );


        expect(
          getById(
            "partnerFields"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
        );


        expect(
          getById(
            "namaPasangan"
          ).disabled
        ).toBe(
          false
        );


        expect(
          getById(
            "namaPasangan"
          ).required
        ).toBe(
          true
        );


        expect(
          getById(
            "nomorKtpPasangan"
          ).required
        ).toBe(
          true
        );


        expect(
          getById(
            "lampiranKtpPasangan"
          ).required
        ).toBe(
          true
        );

      }
    );


    /* ==================================================
       TEST 6
       OTHER BANK
       ================================================== */

    it(
      "menampilkan field Nama Bank Lainnya ketika memilih Lainnya",
      () => {

        selectValue(
          "namaBank",
          "Lainnya"
        );


        expect(
          getById(
            "otherBankField"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
        );


        expect(
          getById(
            "namaBankLainnya"
          ).disabled
        ).toBe(
          false
        );


        expect(
          getById(
            "namaBankLainnya"
          ).required
        ).toBe(
          true
        );

      }
    );


    /* ==================================================
       TEST 7
       CASCADING REGION
       ================================================== */

    it(
      "mengisi dropdown wilayah secara cascading",
      () => {

        const province =
          getById(
            "provinsiKtp"
          );


        expect(
          Array.from(
            province.options
          ).some(
            (option) =>
              option.value ===
              "DKI JAKARTA"
          )
        ).toBe(
          true
        );


        selectValue(
          "provinsiKtp",
          "DKI JAKARTA"
        );


        const city =
          getById(
            "kotaKtp"
          );


        expect(
          city.disabled
        ).toBe(
          false
        );


        expect(
          Array.from(
            city.options
          ).some(
            (option) =>
              option.value ===
              "KOTA JAKARTA PUSAT"
          )
        ).toBe(
          true
        );


        selectValue(
          "kotaKtp",
          "KOTA JAKARTA PUSAT"
        );


        expect(
          Array.from(
            getById(
              "kecamatanKtp"
            ).options
          ).some(
            (option) =>
              option.value ===
              "GAMBIR"
          )
        ).toBe(
          true
        );


        selectValue(
          "kecamatanKtp",
          "GAMBIR"
        );


        expect(
          Array.from(
            getById(
              "kelurahanKtp"
            ).options
          ).some(
            (option) =>
              option.value ===
              "GAMBIR"
          )
        ).toBe(
          true
        );

      }
    );


    /* ==================================================
       TEST 8
       FILE TYPE VALIDATION
       ================================================== */

    it(
      "menolak file yang bukan PDF",
      () => {

        const invalidFile =
          new File(
            [
              "hello"
            ],
            "ktp.txt",
            {
              type:
                "text/plain"
            }
          );


        const input =
          setFile(
            "lampiranKtp",
            invalidFile
          );


        expect(
          input.checkValidity()
        ).toBe(
          false
        );


        expect(
          input
            .closest(
              ".upload-field"
            )
            .classList
            .contains(
              "has-error"
            )
        ).toBe(
          true
        );


        expect(
          input
            .closest(
              ".upload-field"
            )
            .querySelector(
              "small"
            )
            .textContent
        ).toContain(
          "PDF"
        );

      }
    );


    /* ==================================================
       TEST 9
       FILE SIZE VALIDATION
       ================================================== */

    it(
      "menolak PDF yang ukurannya lebih dari 5 MB",
      () => {

        const oversizedFile =
          createPdfFile(
            "large.pdf",
            (
              5 *
              1024 *
              1024
            ) + 1
          );


        const input =
          setFile(
            "lampiranKtp",
            oversizedFile
          );


        expect(
          input.checkValidity()
        ).toBe(
          false
        );


        expect(
          input
            .closest(
              ".upload-field"
            )
            .querySelector(
              "small"
            )
            .textContent
        ).toContain(
          "5 MB"
        );

      }
    );


    /* ==================================================
       TEST 10
       VALID PDF
       ================================================== */

    it(
    "menerima file PDF valid di bawah 5 MB",
    () => {

        const validPdf =
        createPdfFile(
            "KTP_Ara.pdf",
            1024
        );


        const input =
        setFile(
            "lampiranKtp",
            validPdf
        );


        const uploadField =
        input.closest(
            ".upload-field"
        );


        /*
        * Frontend harus menerima file.
        */

        expect(
        uploadField.classList.contains(
            "has-file"
        )
        ).toBe(
        true
        );


        /*
        * Tidak boleh ditandai error.
        */

        expect(
        uploadField.classList.contains(
            "has-error"
        )
        ).toBe(
        false
        );


        /*
        * Nama file harus muncul di UI.
        */

        expect(
        uploadField
            .querySelector(
            "[data-file-name]"
            )
            .textContent
        ).toBe(
        "KTP_Ara.pdf"
        );


        /*
        * File yang dibaca frontend harus benar.
        */

        expect(
        input.files
        ).toHaveLength(
        1
        );


        expect(
        input.files[0].name
        ).toBe(
        "KTP_Ara.pdf"
        );


        expect(
        input.files[0].type
        ).toBe(
        "application/pdf"
        );


        expect(
        input.files[0].size
        ).toBeLessThanOrEqual(
        5 * 1024 * 1024
        );

    }
    );


    /* ==================================================
       TEST 11
       CONFIRMATION MODAL
       ================================================== */

    it(
      "menampilkan confirmation modal sebelum data dikirim",
      async () => {

        await fillValidForm();


        const form =
          getById(
            "newJoinerForm"
          );


        form.dispatchEvent(
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


        expect(
          getById(
            "submitConfirmModal"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
        );


        expect(
          getById(
            "confirmSubmitButton"
          ).textContent.trim()
        ).toBe(
          "Ya, Kirim Data"
        );

      }
    );


    /* ==================================================
       TEST 12
       CANCEL CONFIRMATION
       ================================================== */

    it(
      "tidak mengirim data ketika user memilih Periksa Lagi",
      async () => {

        const {
          fetchMock
        } =
          await bootFrontend();


        await fillValidForm();


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


        getById(
          "cancelSubmitButton"
        ).click();


        expect(
          getById(
            "submitConfirmModal"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        const postCalls =
          fetchMock.mock.calls.filter(
            (
              [
                ,
                options
              ]
            ) =>
              options?.method ===
              "POST"
          );


        expect(
          postCalls
        ).toHaveLength(
          0
        );

      }
    );


    /* ==================================================
       TEST 13
       SUCCESSFUL SUBMISSION
       ================================================== */

    it(
      "membangun payload, mengirim sekali, lalu menampilkan halaman sukses",
      async () => {

        /*
         * Reboot supaya fetchMock test ini
         * bisa kita inspect.
         */

        const {
          fetchMock
        } =
          await bootFrontend();


        await fillValidForm();


        const form =
          getById(
            "newJoinerForm"
          );


        form.dispatchEvent(
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


        expect(
          getById(
            "submitConfirmModal"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
        );


        /*
         * Klik 2x sengaja.
         *
         * Frontend harus tetap hanya mengirim
         * satu POST karena isSubmitting.
         */

        getById(
          "confirmSubmitButton"
        ).click();


        getById(
          "confirmSubmitButton"
        ).click();


        await waitUntil(
          () => {

            const postCalls =
              fetchMock.mock.calls.filter(
                (
                  [
                    ,
                    options
                  ]
                ) =>
                  options?.method ===
                  "POST"
              );


            expect(
              postCalls
            ).toHaveLength(
              1
            );

          }
        );


        const postCall =
          fetchMock.mock.calls.find(
            (
              [
                ,
                options
              ]
            ) =>
              options?.method ===
              "POST"
          );


        expect(
          postCall
        ).toBeDefined();


        const [
          ,
          requestOptions
        ] =
          postCall;


        const payload =
          JSON.parse(
            requestOptions.body
          );


        /*
         * Test core field values.
         */

        expect(
          payload.NamaDepan
        ).toBe(
          "Ara"
        );


        expect(
          payload.NamaTengah
        ).toBe(
          "Rizkita"
        );


        expect(
          payload.NamaBelakang
        ).toBe(
          "Setiadji"
        );


        expect(
          payload.EmailPribadi
        ).toBe(
          "ara.test@example.com"
        );


        /*
         * Karena toggle alamat sama dengan KTP = YA,
         * payload domicile harus ikut KTP.
         */

        expect(
          payload.AlamatSamaDenganKTP
        ).toBe(
          "YA"
        );


        expect(
          payload.AlamatDomisili
        ).toBe(
          payload.AlamatKTP
        );


        expect(
          payload.ProvinsiDomisili
        ).toBe(
          payload.ProvinsiKTP
        );


        /*
         * Partner dan children default TIDAK.
         */

        expect(
          payload.MemilikiPasangan
        ).toBe(
          "TIDAK"
        );


        expect(
          payload.MemilikiAnak
        ).toBe(
          "TIDAK"
        );


        /*
         * Required file attachments:
         *
         * KTP
         * KK
         * NPWP
         * Buku Tabungan
         * Ijazah
         * Signed Offer
         */

        expect(
          payload.attachments
        ).toHaveLength(
          6
        );


        expect(
          payload.attachments.map(
            (attachment) =>
              attachment.fieldName
          )
        ).toEqual(
          expect.arrayContaining(
            [
              "LampiranKTP",
              "LampiranKartuKeluarga",
              "LampiranNPWP",
              "LampiranBukuTabungan",
              "LampiranIjazah",
              "SignedOfferProposal"
            ]
          )
        );


        /*
         * Content harus raw Base64.
         * Tidak boleh ada:
         *
         * data:application/pdf;base64,...
         */

        payload.attachments.forEach(
          (attachment) => {

            expect(
              attachment.content
            ).not.toMatch(
              /^data:/
            );


            expect(
              attachment.mimeType
            ).toBe(
              "application/pdf"
            );

          }
        );


        expect(
          payload.submissionId
        ).toMatch(
          /^NJ-/
        );


        expect(
          payload.timestamp
        ).toBeTruthy();


        /*
         * Success page.
         */

        await waitUntil(
          () => {

            expect(
              getById(
                "submissionSuccess"
              ).classList.contains(
                "is-hidden"
              )
            ).toBe(
              false
            );

          }
        );


        expect(
          getById(
            "newJoinerForm"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        expect(
          getById(
            "successSubmissionId"
          ).textContent
        ).toBe(
          payload.submissionId
        );


        /*
         * Karena test berjalan di localhost,
         * production submission lock TIDAK disimpan.
         */

        expect(
          localStorage.getItem(
            "linkajaNewJoinerSubmitted"
          )
        ).toBeNull();

      }
    );

  }
);