# DearMEP

## Embeding

**DearMEP** is embeded into arbitrary html pages using the following code snippet:

    <link rel="stylesheet" href="https://dear-mep-server.org/static/dear-mep.css" />
    <dear-mep host="https://dear-mep-server.org/"></dear-mep>
    <script src="https://dear-mep-server.org/static/dear-mep.js" async></script>

## Installing dependencies

Run `npm install` to install dependencies for local development.

## Generating the API Client

Before the frontend can be built it is neccessary to generate the the API-Client.

To do so, first get the current OpenAPI specification from the backend using one of the methods described [here](../server/README.md#retrieving-the-openapi-specification). Store the content in a file named `openapi.json` in the root of the repository.

After that the API client can simpy be generated using the command `npm run generate-client`.

> **_NOTE:_** it is necessary to repeat these steps whenever API changes occur, you will run into build errors otherwise.

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Serve Embeding-Test-Page

Run `npm run build` and `npm run start:test-page`. Navigate to `http://localhost:8080` to see a test-page with an embeded version of DearMEP

### Analyze bundle size

Run `npm run build` to build the application if you have not already done so.

Open [esbuild Bundle Size Analyzer](https://esbuild.github.io/analyze/) and upload the file `dist/dear-mep/stats.json`.

## Code scaffolding

Run `npx ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/dear-mep-bundle/` directory.

## Format & Lint

Run `npm run format` to format the whole project using [prettier](https://prettier.io/).

Run `npm run lint` or `npm run lint:fix` to lint (and fix) the code.

> **VSCode:**
> If you are using VSCode, install the [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension and set `"editor.formatOnSave": true` in the settings.

## Running unit tests

Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npx ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
