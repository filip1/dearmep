<!--
SPDX-FileCopyrightText: © 2024 Tobias Mühlberger

SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Theming the Client

The appearance of the DearMEP client can be customized using CSS, allowing you to adjust its look and feel to better fit your needs.

## CSS Custom Properties

The simplest way to customize the DearMEP client is by modifying its pre-defined CSS custom properties (variables). This approach enables you to change visual aspects such as colors, fonts, and spacing without needing to recompile the SCSS files.

### Where to Find Variables

The list of available variables is defined in [`variables.scss`](../client/src/style/themes/variables.scss). Additionally, you can explore custom properties with the `--dmep-` prefix using your browser’s developer tools.

### Example

Here's an example of how to adjust the client’s appearance by setting custom properties:

```scss
:host {
  --dmep-text-color: rgba(255, 255, 255, 0.9);
  --dmep-footer-text-color: rgba(255, 255, 255, 0.75);
  --dmep-primary-color: rgba(250, 128, 114, 1);
  --dmep-success-color: rgba(92, 184, 92, 1);
  /* Add more customizations as needed */
}
```

### How It Works

To apply your custom styles, simply load an additional stylesheet with the updated variables. This approach does not require recompiling the SCSS files. However, it is somewhat limited in scope, as it only allows you to adjust predefined properties.

## Customizing UI Components with Angular Material

The DearMEP client uses **Angular Material** components, allowing for deeper customization through theming. If you need more control over the visual appearance, you can create a new theme following the [Angular Material Theming Guide](https://material.angular.io/guide/theming).

### Current Theme

The current theme used in the client is defined in [`default-dark.scss`](../client/src/style/themes/default-dark.scss). Currently, only a dark theme is provided, but more themes may be added in the future.

### Building a Custom Angular Material Theme

If you wish to build a new theme for Angular Material components:

1. Modify the SCSS files as needed.
2. Compile the SCSS as part of the application build process. The theme is included in the [dear-mep-inner.scss](../client/src/style/dear-mep-inner.scss) file.

> **Note**: When creating a custom theme, it's recommended to replace the existing stylesheet rather than loading an additional theme on top of it. This avoids duplicating styles, which can lead to performance issues.

## Overriding CSS

If the previous approaches are insufficient for your requirements, you can always override specific styles using custom CSS. However, this approach should be used with caution.

### Considerations for Overriding Styles

- **Stability**: There is no guarantee that internal selectors will remain consistent across future releases of the DearMEP client or its underlying component library.
- **Responsiveness**: Overriding styles can affect the client’s responsive behavior, potentially causing issues on different screen sizes and languages.

> **Recommendation**: When overriding styles, aim to modify as few elements as possible. Thoroughly test your changes across various screen sizes and languages to ensure compatibility.
