# DearMEP Client

This Project contains the client implementation of DearMEP. The client is built as a Web-Component using Angular Elements.

This implementation is designed to support general use cases for DearMEP. It offers a degree of configurability, allowing customization of certain visual elements. For specialized use cases it is always possible to develop a custom implementation to better fit specific needs.

## Features

- Multi-Language support
- Stores user-preferences in Local Storage
- Configurable and Themeable
- Styles are isolated from the host-page using shadow DOM

## Embedding DearMEP

The **DearMEP** client component can be embedded into any HTML page using the following code snippet:

```html
<link rel="stylesheet" href="https://dear-mep-server.org/static/dear-mep.css" />
<dear-mep host="https://dear-mep-server.org/"></dear-mep>
<script src="https://dear-mep-server.org/static/dear-mep.js" async></script>
```

> **Note:**
> In order to be able to add the client to a certain page the URL of the Page needs to be whitelisted in the CORS-Configuration of the DearMEP Server.

> **Note:**
> If the embedding page uses CSP-Headers for security purposes, make sure that the DearMEP script is not blocked.

If DearMEP does not show up on the page check the browser console and dev-tools for errors.

Alternatively the client can also run as a standalone page. In this case the Backend provides a simple HTML-Page containing the client-snipped.

## Configuration

There are multiple ways to configure the client:

**Attributes**

Attributes are configured per embedding page. The following Attributes can be set on the `<dear-mep>` element:


| Attribute | Description |
| --------- | ----------- |
| host\*                   | The URL of the DearMEP-Server. This attribute is required! Only absolute URLs are allowed. |
| api                      | The URL of the dear-mep API-Server. This attribute is used if the API-Server is hosted separately from the server that provides hosts static assets. Relative URLs are interpreted in relation to *host*.                                                                                                                |
| assets                   | The URL of the Assets-Server. This attribute is used if the static assets are hosted separately from the API-Server. Relative URLs are interpreted in relation to *host*.                                                                                                                                                |
| default&#8209;country    | If the user has not (yet) selected a country and the server cannot determine the country (because a VPN or TOR is used for example), this country will be used as fallback. It makes sense for a german campaign to use "DE" for example. Use two-letter country codes according to ISO 639-1 Alpha-2 ("DE", "AT", ...). |
| disable&#8209;calling    | If this attribute is present the calling functionality is hidden.                                                                                                                                                                                                                                                        |
| disable&#8209;scheduling | If this attribute is present the schedule-call functionality is hidden.                                                                                                                                                                                                                                                  |


*(\*) Required Attributes*

Example:

```html
<dear-mep host="https://chatcontrol.dearmep.eu/" default-country="DE"></dear-mep>
```

A more detailed technical description of the different attributes can be found in the source code in [app.component.ts](../client/src/app/app.component.ts).

**Server**

On startup the client loads configurations from the server. These include enabled features as well as the localization strings visible in the UI.

These values are configured in the config file of the server (see: [example-config.yaml](../server/dearmep/example-config.yaml)).

**Build-Time**

Some aspects of the client can be configured at build-time. This allows for different configurations in different environments such as *development* or *production*. This is done in the file [environment.ts](client/src/environments/environment.ts).

## Styling and Theming

The Styles for the client are built using SCSS. They are provided in two separate stylesheets `dear-mep.css` and `dear-mep-inner.css`.

`dear-mep.css` is loaded into the host-page via the link-tag in the embed-snipped. It
contains rules that are applied outside of the shadow root.

`dear-mep-inner.css` is loaded via a link-tag that is generated inside of the shadow root as part of the client.
The shadow DOM ensures that these styles do not leak out into the host-page.

**Theming**

Read more about how the DearMEP client can be customized visually in the documentation for [theming](../doc/theming.md).

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
