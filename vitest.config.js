import { defineConfig } from "vitest/config";


export default defineConfig({

  test: {

    environment:
      "jsdom",


    environmentOptions: {

      jsdom: {

        url:
          "http://localhost:5500/"

      }

    },


    setupFiles: [

      "./tests/setup.js"

    ],


    clearMocks:
      true,


    restoreMocks:
      true,


    coverage: {

      provider:
        "v8",


      reporter: [

        "text",
        "html"

      ],


      include: [

        "js/**/*.js"

      ],


      exclude: [

        "data/**",
        "tests/**"

      ]

    }

  }

});