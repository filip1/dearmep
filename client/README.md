# DearMEP Client

This Project contains the client implementation of DearMEP.

## Embedding DearMEP

The **DearMEP** Client component can be embedded into any HTML page using the following code snippet:

```html
<link rel="stylesheet" href="https://dear-mep-server.org/static/dear-mep.css" />
<dear-mep host="https://dear-mep-server.org/"></dear-mep>
<script src="https://dear-mep-server.org/static/dear-mep.js" async></script>
```

## Installing Dependencies

To set up the project for local development, run:

```bash
npm install
```

## Generating the API Client

Before building the frontend, you must generate the API client. Follow these steps:

1. Retrieve the current OpenAPI specification from the backend using one of the methods described [here](../server/README.md#retrieving-the-openapi-specification).
2. Save the specification as a file named `openapi.json` in the root directory of the repository.
3. Generate the API client by running:

   ```bash
   npm run generate-client
   ```

> **Note:** You must regenerate the client whenever there are API changes, or you may encounter build errors.

## Running the Development Server

To start the development server, run:

```bash
npm start
```

Navigate to [http://localhost:4200](http://localhost:4200/). The application will automatically reload if you make changes to the source files.

## Serving the Embedding Test Page

To serve a test page showcasing an embedded version of DearMEP:

1. Build the project:

   ```bash
   npm run build
   ```

2. Start the test server:

   ```bash
   npm run start:test-page
   ```

3. Navigate to [http://localhost:8080](http://localhost:8080).

## Analyzing Bundle Size

To analyze the bundle size:

1. Build the application (if not already done):

   ```bash
   npm run build
   ```

2. Open the [esbuild Bundle Size Analyzer](https://esbuild.github.io/analyze/) and upload the file located at `dist/dear-mep/stats.json`.

## Code Scaffolding

To generate a new component, use:

```bash
npx ng generate component component-name
```

You can also generate other entities:

```bash
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## Building the Project

To build the project, run:

```bash
npm run build
```

The build artifacts will be stored in the `dist/dear-mep-bundle/` directory.

## Formatting & Linting

- **Format Code**: Run the following command to format the project using [Prettier](https://prettier.io/):

  ```bash
  npm run format
  ```

- **Lint Code**: Run the following commands to lint (and fix) the code:

  ```bash
  npm run lint
  npm run lint:fix
  ```

> **VSCode Users**: If you're using VSCode, install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and enable `"editor.formatOnSave": true` in your settings for automatic formatting on save.
