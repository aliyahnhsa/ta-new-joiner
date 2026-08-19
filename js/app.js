(() => {
  "use strict";

  const MAX_FILE_SIZE =
    5 * 1024 * 1024;

  const DEFAULT_ORGANIZATION = [
    {
      directorate: "CEO Office",
      unit: "Other"
    },
    {
      directorate: "CEO Office",
      unit: "Corporate Affairs & Strategic Communication Unit"
    },
    {
      directorate: "CEO Office",
      unit: "Human Capital Unit"
    },
    {
      directorate: "CEO Office",
      unit: "Internal Audit Sub Unit"
    },
    {
      directorate: "CEO Office",
      unit: "Procurement & General Service Sub Unit"
    },
    {
      directorate: "CEO Office",
      unit: "Risk Fraud Legal Compliance Unit"
    },

    {
      directorate: "Commercial",
      unit: "Other"
    },
    {
      directorate: "Commercial",
      unit: "Customer Support Operations Unit"
    },
    {
      directorate: "Commercial",
      unit: "Account Management Unit"
    },
    {
      directorate: "Commercial",
      unit: "B2B Partnership Unit"
    },
    {
      directorate: "Commercial",
      unit: "Product Management Unit"
    },
    {
      directorate: "Commercial",
      unit: "Product Solutions Unit"
    },
    {
      directorate: "Commercial",
      unit: "Marketing & Growth Unit"
    },
    {
      directorate: "Commercial",
      unit: "Commercial Strategy Sub Unit"
    },

    {
      directorate: "Finance & Strategy",
      unit: "Other"
    },
    {
      directorate: "Finance & Strategy",
      unit: "Finance Group"
    },
    {
      directorate: "Finance & Strategy",
      unit: "Corporate Finance Unit"
    },
    {
      directorate: "Finance & Strategy",
      unit: "Operational Finance Unit"
    },

    {
      directorate: "Technology",
      unit: "Other"
    },
    {
      directorate: "Technology",
      unit: "Engineering Group"
    },
    {
      directorate: "Technology",
      unit: "Software Engineering Unit"
    },
    {
      directorate: "Technology",
      unit: "Technical System & Development Analyst Sub Unit"
    },
    {
      directorate: "Technology",
      unit: "Infrastructure Engineering & Cyber Security Group"
    },
    {
      directorate: "Technology",
      unit: "Cloud Architect Unit"
    },
    {
      directorate: "Technology",
      unit: "Cyber Security Sub Unit"
    },
    {
      directorate: "Technology",
      unit: "Business Support Systems Sub Unit"
    },
    {
      directorate: "Technology",
      unit: "Site Reliability Engineering Sub Unit"
    },
    {
      directorate: "Technology",
      unit: "SDET Sub Unit"
    }
  ];

  const DEFAULT_RECRUITERS = [
    {
      name: "Audy Atira Pramono"
    },
    {
      name: "Demus Abethego"
    }
  ];

  const form =
    document.getElementById(
      "newJoinerForm"
    );

  const pages =
    Array.from(
      document.querySelectorAll(
        "[data-form-page]"
      )
    );

  const steps =
    Array.from(
      document.querySelectorAll(
        "[data-step-indicator]"
      )
    );

  const collator =
    new Intl.Collator(
      "id",
      {
        sensitivity: "base"
      }
    );

  const statuses = {
    2:
      document.getElementById(
        "pageTwoStatus"
      ),

    3:
      document.getElementById(
        "pageThreeStatus"
      ),

    4:
      document.getElementById(
        "pageFourStatus"
      )
  };

  function getElement(id) {
    return document.getElementById(
      id
    );
  }

  /* ==================================================
     DATA WILAYAH
     ================================================== */

  const regionRows =
    Array.isArray(
      window.WILAYAH_INDONESIA
    )
      ? window.WILAYAH_INDONESIA
      : [];

  const childrenByParent =
    new Map();

  const provinces = [];

  const locationGroups = {
    ktp: {
      province:
        getElement("provinsiKtp"),

      city:
        getElement("kotaKtp"),

      district:
        getElement("kecamatanKtp"),

      village:
        getElement("kelurahanKtp")
    },

    domicile: {
      province:
        getElement("provinsiDomisili"),

      city:
        getElement("kotaDomisili"),

      district:
        getElement("kecamatanDomisili"),

      village:
        getElement("kelurahanDomisili")
    }
  };

  function getParentCode(code) {
    const parts =
      code.split(".");

    if (parts.length === 1) {
      return null;
    }

    parts.pop();

    return parts.join(".");
  }

  function buildRegionIndex() {
    regionRows.forEach(
      ([code, name]) => {
        const item = {
          code,
          name
        };

        const parentCode =
          getParentCode(code);

        if (parentCode === null) {
          provinces.push(item);
          return;
        }

        if (
          !childrenByParent.has(
            parentCode
          )
        ) {
          childrenByParent.set(
            parentCode,
            []
          );
        }

        childrenByParent
          .get(parentCode)
          .push(item);
      }
    );

    provinces.sort(
      (
        first,
        second
      ) =>
        collator.compare(
          first.name,
          second.name
        )
    );

    childrenByParent.forEach(
      (items) => {
        items.sort(
          (
            first,
            second
          ) =>
            collator.compare(
              first.name,
              second.name
            )
        );
      }
    );
  }

  function resetSelect(
    select,
    placeholder,
    disabled = true
  ) {
    select.innerHTML = "";

    const option =
      document.createElement(
        "option"
      );

    option.value = "";
    option.textContent =
      placeholder;

    option.selected = true;

    select.appendChild(
      option
    );

    select.disabled =
      disabled;

    removeFieldError(
      select
    );
  }

  function populateSelect(
    select,
    items,
    placeholder
  ) {
    resetSelect(
      select,
      placeholder,
      false
    );

    const fragment =
      document.createDocumentFragment();

    items.forEach(
      (item) => {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          item.name;

        option.textContent =
          item.name;

        option.dataset.code =
          item.code;

        fragment.appendChild(
          option
        );
      }
    );

    select.appendChild(
      fragment
    );
  }

  function getSelectedCode(
    select
  ) {
    return (
      select
        .selectedOptions[0]
        ?.dataset.code || ""
    );
  }

  function loadCities(group) {
    resetSelect(
      group.district,
      "Pilih kota dahulu"
    );

    resetSelect(
      group.village,
      "Pilih kecamatan dahulu"
    );

    const provinceCode =
      getSelectedCode(
        group.province
      );

    if (!provinceCode) {
      resetSelect(
        group.city,
        "Pilih provinsi dahulu"
      );

      return;
    }

    populateSelect(
      group.city,
      childrenByParent.get(
        provinceCode
      ) || [],
      "Pilih kota / kabupaten"
    );
  }

  function loadDistricts(group) {
    resetSelect(
      group.village,
      "Pilih kecamatan dahulu"
    );

    const cityCode =
      getSelectedCode(
        group.city
      );

    if (!cityCode) {
      resetSelect(
        group.district,
        "Pilih kota dahulu"
      );

      return;
    }

    populateSelect(
      group.district,
      childrenByParent.get(
        cityCode
      ) || [],
      "Pilih kecamatan"
    );
  }

  function loadVillages(group) {
    const districtCode =
      getSelectedCode(
        group.district
      );

    if (!districtCode) {
      resetSelect(
        group.village,
        "Pilih kecamatan dahulu"
      );

      return;
    }

    populateSelect(
      group.village,
      childrenByParent.get(
        districtCode
      ) || [],
      "Pilih kelurahan / desa"
    );
  }

  function bindRegionListeners(
    group
  ) {
    group.province.addEventListener(
      "change",
      () => {
        loadCities(group);
      }
    );

    group.city.addEventListener(
      "change",
      () => {
        loadDistricts(group);
      }
    );

    group.district.addEventListener(
      "change",
      () => {
        loadVillages(group);
      }
    );
  }

  function initializeRegions() {
    if (!regionRows.length) {
      resetSelect(
        locationGroups.ktp
          .province,
        "Data wilayah tidak ditemukan"
      );

      resetSelect(
        locationGroups
          .domicile
          .province,
        "Data wilayah tidak ditemukan"
      );

      return;
    }

    buildRegionIndex();

    populateSelect(
      locationGroups.ktp
        .province,
      provinces,
      "Pilih provinsi"
    );

    populateSelect(
      locationGroups
        .domicile
        .province,
      provinces,
      "Pilih provinsi"
    );
  }

  /* ==================================================
     PAGE NAVIGATION
     ================================================== */

  function clearStatuses() {
    Object.values(
      statuses
    ).forEach(
      (status) => {
        if (!status) {
          return;
        }

        status.textContent = "";
        status.className =
          "status";
      }
    );
  }

  function showPage(pageNumber) {
    pages.forEach(
      (page) => {
        const visible =
          Number(
            page.dataset
              .formPage
          ) === pageNumber;

        page.classList.toggle(
          "is-visible",
          visible
        );

        page.setAttribute(
          "aria-hidden",
          String(!visible)
        );
      }
    );

    steps.forEach(
      (step) => {
        const stepNumber =
          Number(
            step.dataset
              .stepIndicator
          );

        step.classList.toggle(
          "is-active",
          stepNumber ===
            pageNumber
        );

        step.classList.toggle(
          "is-complete",
          stepNumber <
            pageNumber
        );
      }
    );

    clearStatuses();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }

  document
    .querySelectorAll(
      "[data-next-page]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const currentPage =
              Number(
                button
                  .closest(
                    "[data-form-page]"
                  )
                  .dataset
                  .formPage
              );

            if (
              currentPage > 1 &&
              !validatePage(
                currentPage
              )
            ) {
              return;
            }

            showPage(
              Number(
                button.dataset
                  .nextPage
              )
            );
          }
        );
      }
    );

  document
    .querySelectorAll(
      "[data-prev-page]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            showPage(
              Number(
                button.dataset
                  .prevPage
              )
            );
          }
        );
      }
    );

  /* ==================================================
     CONDITIONAL SECTIONS
     ================================================== */

  function setPanelEnabled(
    panel,
    enabled
  ) {
    panel.classList.toggle(
      "is-hidden",
      !enabled
    );

    panel
      .querySelectorAll(
        "input, select"
      )
      .forEach(
        (field) => {
          field.disabled =
            !enabled;

          if (!enabled) {
            field.required = false;

            field.setCustomValidity(
              ""
            );

            removeFieldError(
              field
            );
          }
        }
      );
  }

  function updateToggleText(
    toggleId
  ) {
    const toggle =
      getElement(toggleId);

    const state =
      document.querySelector(
        `[data-toggle-state="${toggleId}"]`
      );

    state.textContent =
      toggle.checked
        ? "YA"
        : "TIDAK";
  }

  /* DOMISILI */

  const sameAsKtpToggle =
    getElement(
      "alamatSamaDenganKtp"
    );

  const domicileFields =
    getElement(
      "domicileFields"
    );

  function updateDomicile() {
    const sameAsKtp =
      sameAsKtpToggle.checked;

    updateToggleText(
      "alamatSamaDenganKtp"
    );

    domicileFields.classList.toggle(
      "is-hidden",
      sameAsKtp
    );

    domicileFields
      .querySelectorAll(
        "input, select"
      )
      .forEach(
        (field) => {
          field.required =
            !sameAsKtp;

          field.disabled =
            sameAsKtp;

          if (sameAsKtp) {
            removeFieldError(
              field
            );
          }
        }
      );

    if (!sameAsKtp) {
      const group =
        locationGroups.domicile;

      group.province.disabled =
        false;

      group.city.disabled =
        !getSelectedCode(
          group.province
        );

      group.district.disabled =
        !getSelectedCode(
          group.city
        );

      group.village.disabled =
        !getSelectedCode(
          group.district
        );
    }
  }

  sameAsKtpToggle.addEventListener(
    "change",
    updateDomicile
  );

  /* PASANGAN */

  const partnerToggle =
    getElement(
      "memilikiPasangan"
    );

  const partnerPanel =
    getElement(
      "partnerFields"
    );

  const partnerFields = [
    getElement("namaPasangan"),
    getElement("nomorKtpPasangan"),
    getElement("lampiranKtpPasangan")
  ];

  function updatePartner() {
    const enabled =
      partnerToggle.checked;

    updateToggleText(
      "memilikiPasangan"
    );

    setPanelEnabled(
      partnerPanel,
      enabled
    );

    partnerFields.forEach(
      (field) => {
        field.required =
          enabled;

        if (!enabled) {
          field.setCustomValidity(
            ""
          );
        }
      }
    );
  }

  partnerToggle.addEventListener(
    "change",
    updatePartner
  );

  /* ANAK */

  const childrenToggle =
    getElement(
      "memilikiAnak"
    );

  const childrenPanel =
    getElement(
      "childrenFields"
    );

  const childRows = [
    {
      name:
        getElement(
          "namaAnakPertama"
        ),

      file:
        getElement(
          "lampiranAnakPertama"
        )
    },
    {
      name:
        getElement(
          "namaAnakKedua"
        ),

      file:
        getElement(
          "lampiranAnakKedua"
        )
    },
    {
      name:
        getElement(
          "namaAnakKetiga"
        ),

      file:
        getElement(
          "lampiranAnakKetiga"
        )
    }
  ];

  function clearChildCustomValidity() {
    childRows.forEach(
      ({
        name,
        file
      }) => {
        name.setCustomValidity(
          ""
        );

        file.setCustomValidity(
          ""
        );
      }
    );
  }

  function updateChildren() {
    const enabled =
      childrenToggle.checked;

    updateToggleText(
      "memilikiAnak"
    );

    setPanelEnabled(
      childrenPanel,
      enabled
    );

    clearChildCustomValidity();
  }

  childrenToggle.addEventListener(
    "change",
    updateChildren
  );

  function validateChildrenSection() {
    clearChildCustomValidity();

    if (!childrenToggle.checked) {
      return true;
    }

    let completeChildren = 0;
    let valid = true;

    childRows.forEach(
      ({
        name,
        file
      }) => {
        const hasName =
          name.value.trim() !== "";

        const hasFile =
          file.files.length > 0;

        if (
          hasName &&
          hasFile
        ) {
          completeChildren += 1;
          return;
        }

        if (
          hasName &&
          !hasFile
        ) {
          file.setCustomValidity(
            "Lampiran anak wajib diisi jika nama anak diisi."
          );

          showFieldError(
            file
          );

          valid = false;
        }

        if (
          !hasName &&
          hasFile
        ) {
          name.setCustomValidity(
            "Nama anak wajib diisi jika lampiran anak dipilih."
          );

          showFieldError(
            name
          );

          valid = false;
        }
      }
    );

    if (completeChildren === 0) {
      const firstChild =
        childRows[0];

      if (
        !firstChild.name
          .value
          .trim()
      ) {
        firstChild.name.setCustomValidity(
          "Minimal isi data satu anak."
        );

        showFieldError(
          firstChild.name
        );
      }

      if (
        !firstChild.file
          .files
          .length
      ) {
        firstChild.file.setCustomValidity(
          "Minimal lampirkan dokumen satu anak."
        );

        showFieldError(
          firstChild.file
        );
      }

      valid = false;
    }

    return valid;
  }

  /* ==================================================
     BANK LAINNYA
     ================================================== */

  const bankSelect =
    getElement(
      "namaBank"
    );

  const otherBankField =
    getElement(
      "otherBankField"
    );

  const otherBankInput =
    getElement(
      "namaBankLainnya"
    );

  function updateOtherBank() {
    const showOther =
      bankSelect.value ===
      "Lainnya";

    otherBankField.classList.toggle(
      "is-hidden",
      !showOther
    );

    otherBankInput.disabled =
      !showOther;

    otherBankInput.required =
      showOther;

    if (!showOther) {
      otherBankInput.value = "";

      otherBankInput.setCustomValidity(
        ""
      );

      removeFieldError(
        otherBankInput
      );
    }
  }

  bankSelect.addEventListener(
    "change",
    updateOtherBank
  );

  /* ==================================================
     CSV
     ================================================== */

  function parseCsvLine(line) {
    const values = [];

    let currentValue = "";
    let insideQuotes = false;

    for (
      let index = 0;
      index < line.length;
      index += 1
    ) {
      const character =
        line[index];

      const nextCharacter =
        line[index + 1];

      if (character === '"') {
        if (
          insideQuotes &&
          nextCharacter === '"'
        ) {
          currentValue += '"';
          index += 1;
        } else {
          insideQuotes =
            !insideQuotes;
        }

        continue;
      }

      if (
        character === "," &&
        !insideQuotes
      ) {
        values.push(
          currentValue.trim()
        );

        currentValue = "";

        continue;
      }

      currentValue += character;
    }

    values.push(
      currentValue.trim()
    );

    return values;
  }

  function parseCsv(csvText) {
    const lines =
      csvText
        .replace(/^\uFEFF/, "")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .filter(
          (line) =>
            line.trim() !== ""
        );

    if (lines.length < 2) {
      return [];
    }

    const headers =
      parseCsvLine(
        lines[0]
      );

    return lines
      .slice(1)
      .map(
        (line) => {
          const values =
            parseCsvLine(
              line
            );

          const row = {};

          headers.forEach(
            (
              header,
              index
            ) => {
              row[header] =
                values[index] ||
                "";
            }
          );

          return row;
        }
      );
  }

  async function loadCsv(
    path,
    fallbackData
  ) {
    try {
      if (
        window.location
          .protocol ===
        "file:"
      ) {
        return fallbackData;
      }

      const response =
        await fetch(
          path,
          {
            cache:
              "no-store"
          }
        );

      if (!response.ok) {
        return fallbackData;
      }

      const parsedData =
        parseCsv(
          await response.text()
        );

      return parsedData.length
        ? parsedData
        : fallbackData;
    } catch {
      return fallbackData;
    }
  }

  const directorateSelect =
    getElement(
      "direktorat"
    );

  const groupUnitSelect =
    getElement(
      "groupUnit"
    );

  const otherUnitField =
    getElement(
      "otherUnitField"
    );

  const otherUnitInput =
    getElement(
      "groupUnitLainnya"
    );

  const recruiterSelect =
    getElement(
      "recruiter"
    );

  let organizationRows = [];

  function fillSimpleSelect(
    select,
    values,
    placeholder
  ) {
    select.innerHTML = "";

    const placeholderOption =
      document.createElement(
        "option"
      );

    placeholderOption.value = "";

    placeholderOption.textContent =
      placeholder;

    placeholderOption.selected =
      true;

    select.appendChild(
      placeholderOption
    );

    values.forEach(
      (value) => {
        const option =
          document.createElement(
            "option"
          );

        option.value =
          value;

        option.textContent =
          value;

        select.appendChild(
          option
        );
      }
    );
  }

  function updateOtherUnit() {
    const showOther =
      groupUnitSelect.value ===
      "Other";

    otherUnitField.classList.toggle(
      "is-hidden",
      !showOther
    );

    otherUnitInput.disabled =
      !showOther;

    otherUnitInput.required =
      showOther;

    if (!showOther) {
      otherUnitInput.value = "";

      otherUnitInput.setCustomValidity(
        ""
      );

      removeFieldError(
        otherUnitInput
      );
    }
  }

  function updateGroupUnits() {
    const selectedDirectorate =
      directorateSelect.value;

    if (!selectedDirectorate) {
      fillSimpleSelect(
        groupUnitSelect,
        [],
        "Pilih direktorat dahulu"
      );

      groupUnitSelect.disabled =
        true;

      updateOtherUnit();

      return;
    }

    const units =
      Array.from(
        new Set(
          organizationRows
            .filter(
              (row) =>
                String(
                  row.directorate ||
                  ""
                ).trim() ===
                selectedDirectorate
            )
            .map(
              (row) =>
                String(
                  row.unit ||
                  ""
                ).trim()
            )
            .filter(Boolean)
        )
      )
        .sort(
          (
            first,
            second
          ) => {
            if (
              first ===
              "Other"
            ) {
              return -1;
            }

            if (
              second ===
              "Other"
            ) {
              return 1;
            }

            return collator.compare(
              first,
              second
            );
          }
        );

    fillSimpleSelect(
      groupUnitSelect,
      units,
      "Pilih group / unit / sub-unit"
    );

    groupUnitSelect.disabled =
      false;

    updateOtherUnit();
  }

  directorateSelect.addEventListener(
    "change",
    updateGroupUnits
  );

  groupUnitSelect.addEventListener(
    "change",
    updateOtherUnit
  );

  async function initializeCsvData() {
    const [
      loadedOrganization,
      loadedRecruiters
    ] =
      await Promise.all([
        loadCsv(
          "data/organization.csv",
          DEFAULT_ORGANIZATION
        ),

        loadCsv(
          "data/recruiters.csv",
          DEFAULT_RECRUITERS
        )
      ]);

    organizationRows =
      loadedOrganization;

    const directorates =
      Array.from(
        new Set(
          organizationRows
            .map(
              (row) =>
                String(
                  row.directorate ||
                  ""
                ).trim()
            )
            .filter(Boolean)
        )
      )
        .sort(
          (
            first,
            second
          ) =>
            collator.compare(
              first,
              second
            )
        );

    fillSimpleSelect(
      directorateSelect,
      directorates,
      "Pilih direktorat"
    );

    fillSimpleSelect(
      groupUnitSelect,
      [],
      "Pilih direktorat dahulu"
    );

    groupUnitSelect.disabled =
      true;

    const recruiterNames =
      Array.from(
        new Set(
          loadedRecruiters
            .map(
              (row) =>
                String(
                  row.name ||
                  ""
                ).trim()
            )
            .filter(Boolean)
        )
      )
        .sort(
          (
            first,
            second
          ) =>
            collator.compare(
              first,
              second
            )
        );

    fillSimpleSelect(
      recruiterSelect,
      recruiterNames,
      "Pilih recruiter"
    );
  }

  /* ==================================================
     FILE UPLOAD
     ================================================== */

  function getUploadElements(
    input
  ) {
    const uploadField =
      input.closest(
        ".upload-field"
      );

    return {
      uploadField,

      uploadBox:
        uploadField.querySelector(
          ".upload-box"
        ),

      fileName:
        uploadField.querySelector(
          "[data-file-name]"
        ),

      help:
        uploadField.querySelector(
          "small"
        ),

      removeButton:
        uploadField.querySelector(
          `[data-remove-file="${input.id}"]`
        )
    };
  }

  function resetUploadDisplay(
    input
  ) {
    const {
      uploadField,
      fileName,
      help,
      removeButton
    } =
      getUploadElements(
        input
      );

    uploadField.classList.remove(
      "has-file",
      "has-error"
    );

    fileName.textContent =
      "Belum ada file";

    help.textContent =
      help.dataset
        .defaultText || "";

    if (removeButton) {
      removeButton.hidden =
        true;
    }

    input.setCustomValidity(
      ""
    );
  }

  function showUploadError(
    input,
    message
  ) {
    const {
      uploadField,
      fileName,
      help,
      removeButton
    } =
      getUploadElements(
        input
      );

    uploadField.classList.remove(
      "has-file"
    );

    uploadField.classList.add(
      "has-error"
    );

    fileName.textContent =
      "File tidak valid";

    help.textContent =
      message;

    if (removeButton) {
      removeButton.hidden =
        !input.files.length;
    }

    input.setCustomValidity(
      message
    );
  }

  function validateFile(
    input
  ) {
    const file =
      input.files[0];

    if (!file) {
      resetUploadDisplay(
        input
      );

      if (
        input.required &&
        !input.disabled
      ) {
        showUploadError(
          input,
          "Silakan pilih file PDF."
        );

        return false;
      }

      return true;
    }

    const isPdf =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      showUploadError(
        input,
        "File harus menggunakan format PDF."
      );

      return false;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      showUploadError(
        input,
        "Ukuran file melebihi batas maksimal 5 MB."
      );

      return false;
    }

    const {
      uploadField,
      fileName,
      help,
      removeButton
    } =
      getUploadElements(
        input
      );

    uploadField.classList.remove(
      "has-error"
    );

    uploadField.classList.add(
      "has-file"
    );

    fileName.textContent =
      file.name;

    help.textContent =
      `PDF • ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)} MB`;

    if (removeButton) {
      removeButton.hidden =
        false;
    }

    input.setCustomValidity(
      ""
    );

    return true;
  }

  function clearFileInput(
    input
  ) {
    input.value = "";

    resetUploadDisplay(
      input
    );

    input.dispatchEvent(
      new Event(
        "change",
        {
          bubbles: true
        }
      )
    );
  }

  document
    .querySelectorAll(
      ".file-input"
    )
    .forEach(
      (input) => {
        const {
          uploadBox
        } =
          getUploadElements(
            input
          );

        input.addEventListener(
          "change",
          () => {
            validateFile(
              input
            );
          }
        );

        uploadBox.addEventListener(
          "dragover",
          (event) => {
            event.preventDefault();

            if (!input.disabled) {
              uploadBox.classList.add(
                "is-dragging"
              );
            }
          }
        );

        uploadBox.addEventListener(
          "dragleave",
          () => {
            uploadBox.classList.remove(
              "is-dragging"
            );
          }
        );

        uploadBox.addEventListener(
          "drop",
          (event) => {
            event.preventDefault();

            uploadBox.classList.remove(
              "is-dragging"
            );

            if (input.disabled) {
              return;
            }

            const droppedFile =
              event
                .dataTransfer
                .files[0];

            if (!droppedFile) {
              return;
            }

            try {
              const transfer =
                new DataTransfer();

              transfer.items.add(
                droppedFile
              );

              input.files =
                transfer.files;

              validateFile(
                input
              );
            } catch {
              /*
               * Browser lama mungkin tidak mendukung
               * assignment FileList.
               */
            }
          }
        );
      }
    );

  document
    .querySelectorAll(
      "[data-remove-file]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const input =
              getElement(
                button.dataset
                  .removeFile
              );

            if (input) {
              clearFileInput(
                input
              );
            }
          }
        );
      }
    );

  /* ==================================================
     INPUT FORMATTERS
     ================================================== */

  function setupNumericInput(
    elementId,
    maxLength
  ) {
    const input =
      getElement(
        elementId
      );

    if (!input) {
      return;
    }

    input.addEventListener(
      "input",
      () => {
        input.value =
          input.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              maxLength
            );
      }
    );
  }

  function setupRtRwInput(
    elementId
  ) {
    const input =
      getElement(
        elementId
      );

    if (!input) {
      return;
    }

    input.addEventListener(
      "input",
      () => {
        let value =
          input.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              6
            );

        if (
          value.length >
          3
        ) {
          value =
            `${value.slice(
              0,
              3
            )}/${value.slice(
              3
            )}`;
        }

        input.value =
          value;
      }
    );
  }

  setupRtRwInput(
    "rtRwKtp"
  );

  setupRtRwInput(
    "rtRwDomisili"
  );

  [
    ["kodePosKtp", 5],
    ["kodePosDomisili", 5],
    ["nomorHandphone", 13],
    ["nomorLinkAja", 13],
    ["nomorEmergencyContact", 13],
    ["nomorKtp", 16],
    ["nomorKk", 16],
    ["nomorNpwp", 16],
    ["nomorKtpPasangan", 16],
    ["nomorRekening", 20],
    ["nomorBpjsKetenagakerjaan", 16],
    ["nomorBpjsKesehatan", 16]
  ].forEach(
    ([
      elementId,
      maxLength
    ]) => {
      setupNumericInput(
        elementId,
        maxLength
      );
    }
  );

  /* ==================================================
     VALIDATION
     ================================================== */

  function removeFieldError(
    field
  ) {
    if (!field) {
      return;
    }

    field.classList.remove(
      "field-error"
    );

    if (
      field.classList.contains(
        "file-input"
      )
    ) {
      field
        .closest(
          ".upload-field"
        )
        ?.classList.remove(
          "has-error"
        );
    }

    if (
      field.type ===
      "radio"
    ) {
      field
        .closest(
          ".radio-row"
        )
        ?.classList.remove(
          "field-error"
        );
    }
  }

  function showFieldError(
    field
  ) {
    if (
      field.classList.contains(
        "file-input"
      )
    ) {
      if (
        !field.validationMessage
      ) {
        validateFile(
          field
        );
      }

      field
        .closest(
          ".upload-field"
        )
        ?.classList.add(
          "has-error"
        );

      return;
    }

    if (
      field.type ===
      "radio"
    ) {
      field
        .closest(
          ".radio-row"
        )
        ?.classList.add(
          "field-error"
        );

      return;
    }

    field.classList.add(
      "field-error"
    );
  }

  function focusInvalidField(
    field
  ) {
    const target =
      field.closest(
        ".upload-field"
      ) ||
      field.closest(
        ".field"
      ) ||
      field;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    if (
      !field.classList.contains(
        "file-input"
      )
    ) {
      field.focus({
        preventScroll: true
      });
    }
  }

  function validatePage(
    pageNumber
  ) {
    const page =
      document.querySelector(
        `[data-form-page="${pageNumber}"]`
      );

    const fields =
      Array.from(
        page.querySelectorAll(
          "input, select"
        )
      )
        .filter(
          (field) =>
            !field.disabled
        );

    const checkedRadioGroups =
      new Set();

    let firstInvalidField =
      null;

    fields.forEach(
      (field) => {
        removeFieldError(
          field
        );

        if (
          field.type ===
          "radio"
        ) {
          if (
            checkedRadioGroups.has(
              field.name
            )
          ) {
            return;
          }

          checkedRadioGroups.add(
            field.name
          );
        }

        const valid =
          field.classList
            .contains(
              "file-input"
            )
            ? validateFile(
              field
            )
            : field
              .checkValidity();

        if (!valid) {
          showFieldError(
            field
          );

          if (
            !firstInvalidField
          ) {
            firstInvalidField =
              field;
          }
        }
      }
    );

    if (
      pageNumber === 3 &&
      !validateChildrenSection()
    ) {
      const childInvalid =
        childRows
          .flatMap(
            ({
              name,
              file
            }) => [
              name,
              file
            ]
          )
          .find(
            (field) =>
              !field
                .checkValidity()
          );

      if (
        !firstInvalidField &&
        childInvalid
      ) {
        firstInvalidField =
          childInvalid;
      }
    }

    const status =
      statuses[
        pageNumber
      ];

    if (firstInvalidField) {
      status.textContent =
        "Mohon lengkapi seluruh field wajib dan pastikan formatnya benar.";

      status.className =
        "status is-error";

      focusInvalidField(
        firstInvalidField
      );

      return false;
    }

    status.textContent = "";
    status.className =
      "status";

    return true;
  }

  form.addEventListener(
    "input",
    (event) => {
      if (
        event.target
          .classList
          ?.contains(
            "file-input"
          )
      ) {
        return;
      }

      event.target
        .setCustomValidity
        ?.("");

      removeFieldError(
        event.target
      );
    }
  );

  form.addEventListener(
    "change",
    (event) => {
      if (
        event.target
          .classList
          ?.contains(
            "file-input"
          )
      ) {
        return;
      }

      event.target
        .setCustomValidity
        ?.("");

      removeFieldError(
        event.target
      );
    }
  );

  /* ==================================================
     PAYLOAD
     ================================================== */

  function getValue(
    elementId
  ) {
    return (
      getElement(
        elementId
      )
        ?.value
        .trim() || ""
    );
  }

  function buildPayload() {
    const formData =
      new FormData(form);

    const payload = {};

    for (
      const [
        key,
        value
      ] of formData.entries()
    ) {
      if (
        value instanceof
        File
      ) {
        if (
          value.size >
          0
        ) {
          payload[key] = {
            fileName:
              value.name,

            fileType:
              value.type,

            fileSize:
              value.size,

            file:
              value
          };
        }
      } else {
        payload[key] =
          value;
      }
    }

    payload.AlamatSamaDenganKTP =
      sameAsKtpToggle.checked
        ? "YA"
        : "TIDAK";

    payload.MemilikiPasangan =
      partnerToggle.checked
        ? "YA"
        : "TIDAK";

    payload.MemilikiAnak =
      childrenToggle.checked
        ? "YA"
        : "TIDAK";

    if (
      sameAsKtpToggle
        .checked
    ) {
      payload.AlamatDomisili =
        getValue(
          "alamatKtp"
        );

      payload.ProvinsiDomisili =
        getValue(
          "provinsiKtp"
        );

      payload.KotaDomisili =
        getValue(
          "kotaKtp"
        );

      payload.KecamatanDomisili =
        getValue(
          "kecamatanKtp"
        );

      payload.KelurahanDomisili =
        getValue(
          "kelurahanKtp"
        );

      payload.RTRWDomisili =
        getValue(
          "rtRwKtp"
        );

      payload.KodePosDomisili =
        getValue(
          "kodePosKtp"
        );
    }

    payload.Timestamp =
      new Date()
        .toISOString();

    return payload;
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (
        !validatePage(4)
      ) {
        return;
      }

      const payload =
        buildPayload();

      console.log(
        "Power Automate-ready payload:",
        payload
      );

      statuses[4].textContent =
        "Form lengkap. Data siap dikirim ke Power Automate.";

      statuses[4].className =
        "status is-success";

      statuses[4]
        .scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
    }
  );

  /* ==================================================
     INITIALIZATION
     ================================================== */

  bindRegionListeners(
    locationGroups.ktp
  );

  bindRegionListeners(
    locationGroups.domicile
  );

  initializeRegions();

  updateDomicile();

  updatePartner();

  updateChildren();

  updateOtherBank();

  initializeCsvData();

  showPage(1);
})();