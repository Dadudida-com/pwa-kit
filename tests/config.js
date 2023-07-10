/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
  GET_GIT_SHA_CMD: "git rev-parse HEAD",
  GENERATE_PROJECTS: [
    // "RETAIL_REACT_APP_DEMO",
    "RETAIL_REACT_APP_EXT",
    // "RETAIL_REACT_APP_NO_EXT",
  ],
  GENERATOR_CMD:
    "node packages/pwa-kit-create-app/scripts/create-mobify-app-dev.js --outputDir",
  CLI_RESPONSES: {
    RETAIL_REACT_APP_DEMO: [
      {
        expectedPrompt: /Choose a project preset to get started:/i,
        response: "2\n",
      },
    ],
    RETAIL_REACT_APP_EXT: [
      {
        expectedPrompt: /Choose a project preset to get started:/i,
        response: "1\n",
      },
      {
        expectedPrompt: /Do you wish to use template extensibility?/i,
        response: "2\n",
      },
      {
        expectedPrompt: /What is the name of your Project?/i,
        response: "scaffold-pwa\n",
      },
      {
        expectedPrompt: /What is the URL for your Commerce Cloud instance?/i,
        response: "https://zzte-053.dx.commercecloud.salesforce.com\n",
      },
      {
        expectedPrompt: /What is your SLAS Client ID?/i,
        response: "1d763261-6522-4913-9d52-5d947d3b94c4\n",
      },
      {
        expectedPrompt: /What is your Site ID in Business Manager?/i,
        response: "RefArch\n",
      },
      {
        expectedPrompt:
          /What is your Commerce API organization ID in Business Manager?/i,
        response: "f_ecom_zzte_053\n",
      },
      {
        expectedPrompt:
          /What is your Commerce API short code in Business Manager?/i,
        response: "kv7kzm78\n",
      },
    ],
    RETAIL_REACT_APP_NO_EXT: [
      {
        expectedPrompt: /Choose a project preset to get started:/i,
        response: "1\n",
      },
      {
        expectedPrompt: /Do you wish to use template extensibility?/i,
        response: "1\n",
      },
      {
        expectedPrompt: /What is the name of your Project?/i,
        response: "scaffold-pwa\n",
      },
      {
        expectedPrompt: /What is the URL for your Commerce Cloud instance?/i,
        response: "https://zzte-053.dx.commercecloud.salesforce.com\n",
      },
      {
        expectedPrompt: /What is your SLAS Client ID?/i,
        response: "1d763261-6522-4913-9d52-5d947d3b94c4\n",
      },
      {
        expectedPrompt: /What is your Site ID in Business Manager?/i,
        response: "RefArch\n",
      },
      {
        expectedPrompt:
          /What is your Commerce API organization ID in Business Manager?/i,
        response: "f_ecom_zzte_053\n",
      },
      {
        expectedPrompt:
          /What is your Commerce API short code in Business Manager?/i,
        response: "kv7kzm78\n",
      },
    ],
  },
};
