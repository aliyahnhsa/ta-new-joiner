/**
 * @vitest-environment jsdom
 * @vitest-environment-options {"url":"https://newjoiner.example.com/"}
 */


import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";


import {
  bootFrontend,
  fillValidForm,
  getById,
  getPostCalls,
  getPostPayload,
  getVisiblePage,
  openSubmitConfirmation,
  waitUntil
} from "./test-utils.js";



beforeEach(
  () => {

    document.body.innerHTML =
      "";


    localStorage.clear();


    delete window.__POWER_AUTOMATE_URL__;

  }
);


describe(
  "LinkAja New Joiner Form - Production Lock Behavior",
  () => {



    it(
      "langsung menampilkan success page jika submission lock sudah ada",
      async () => {

        await bootFrontend({

          preloadStorage: {

            linkajaNewJoinerSubmitted:
              "true",


            linkajaNewJoinerSubmissionId:
              "NJ-PROD-LOCKED"

          }

        });


        expect(
          getById(
            "submissionSuccess"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
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
            "formStepper"
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
          "NJ-PROD-LOCKED"
        );

      }
    );

    it(
      "menyimpan submission lock setelah submit sukses di production",
      async () => {

        const {
          fetchMock
        } =
          await bootFrontend();


        await fillValidForm();


        openSubmitConfirmation();


        getById(
          "confirmSubmitButton"
        ).click();


        await waitUntil(
          () => {

            expect(
              getPostCalls(
                fetchMock
              )
            ).toHaveLength(
              1
            );


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


        const payload =
          getPostPayload(
            fetchMock
          );


        expect(
          localStorage.getItem(
            "linkajaNewJoinerSubmitted"
          )
        ).toBe(
          "true"
        );


        expect(
          localStorage.getItem(
            "linkajaNewJoinerSubmissionId"
          )
        ).toBe(
          payload.submissionId
        );

      }
    );


    it(
      "pageshow dan popstate mengembalikan user ke success page jika sudah locked",
      async () => {

        await bootFrontend({

          preloadStorage: {

            linkajaNewJoinerSubmitted:
              "true",


            linkajaNewJoinerSubmissionId:
              "NJ-PROD-HISTORY"

          }

        });


        const form =
          getById(
            "newJoinerForm"
          );


        const stepper =
          getById(
            "formStepper"
          );


        const success =
          getById(
            "submissionSuccess"
          );



        form.classList.remove(
          "is-hidden"
        );


        stepper.classList.remove(
          "is-hidden"
        );


        success.classList.add(
          "is-hidden"
        );


        window.dispatchEvent(
          new Event(
            "pageshow"
          )
        );


        expect(
          form.classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        expect(
          stepper.classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        expect(
          success.classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
        );



        form.classList.remove(
          "is-hidden"
        );


        stepper.classList.remove(
          "is-hidden"
        );


        success.classList.add(
          "is-hidden"
        );


        window.dispatchEvent(
          new Event(
            "popstate"
          )
        );


        expect(
          form.classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        expect(
          stepper.classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        expect(
          success.classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
        );

      }
    );



    it(
      "tidak mengirim POST baru jika production browser sudah locked",
      async () => {

        const {
          fetchMock
        } =
          await bootFrontend({

            preloadStorage: {

              linkajaNewJoinerSubmitted:
                "true",


              linkajaNewJoinerSubmissionId:
                "NJ-PROD-NO-RESUBMIT"

            }

          });



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


        expect(
          getPostCalls(
            fetchMock
          )
        ).toHaveLength(
          0
        );


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


    it(
      "tetap membuka form jika localStorage getItem gagal",
      async () => {

        vi.spyOn(
          Storage.prototype,
          "getItem"
        ).mockImplementation(
          () => {

            throw new Error(
              "STORAGE_READ_BLOCKED"
            );

          }
        );


        await bootFrontend();


        expect(
          getById(
            "submissionSuccess"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          true
        );


        expect(
          getById(
            "newJoinerForm"
          ).classList.contains(
            "is-hidden"
          )
        ).toBe(
          false
        );


        expect(
          getVisiblePage()
            ?.dataset
            .formPage
        ).toBe(
          "1"
        );

      }
    );

    it(
      "submit tetap sukses walaupun localStorage setItem gagal",
      async () => {

        const {
          fetchMock
        } =
          await bootFrontend();


        vi.spyOn(
          Storage.prototype,
          "setItem"
        ).mockImplementation(
          () => {

            throw new Error(
              "STORAGE_WRITE_BLOCKED"
            );

          }
        );


        await fillValidForm();


        openSubmitConfirmation();


        getById(
          "confirmSubmitButton"
        ).click();


        await waitUntil(
          () => {

            expect(
              getPostCalls(
                fetchMock
              )
            ).toHaveLength(
              1
            );


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
          localStorage.getItem(
            "linkajaNewJoinerSubmitted"
          )
        ).toBeNull();

      }
    );

  }
);