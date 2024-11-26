// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { build } from 'vite';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import path from 'path';

(async function bundle() {
  const root = fileURLToPath(new URL('.', import.meta.url));

  await build({
    root: root,
    build: {
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'dear-mep.js',
        },
        input: path.resolve(root, './dear-mep.js'),
      },
      chunkSizeWarningLimit: 10000,
      outDir: path.resolve(root, '../dist/dear-mep-bundle'),
    },
  });

  await fs.copyFile(
    './dist/dear-mep/dear-mep-inner.css',
    './dist/dear-mep-bundle/dear-mep-inner.css'
  );
  await fs.copyFile(
    './dist/dear-mep/dear-mep.css',
    './dist/dear-mep-bundle/dear-mep.css'
  );

  // fonts
  await fs.copyFile(
    './dist/dear-mep/flags.css',
    './dist/dear-mep-bundle/flags.css'
  );
  await fs.copyFile(
    './dist/dear-mep/material-icons-outlined-all-400-normal.woff',
    './dist/dear-mep-bundle/material-icons-outlined-all-400-normal.woff'
  );
  await fs.copyFile(
    './dist/dear-mep/material-icons-outlined-all-400-normal.woff2',
    './dist/dear-mep-bundle/material-icons-outlined-all-400-normal.woff2'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-300-normal.woff',
    './dist/dear-mep-bundle/roboto-latin-300-normal.woff'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-300-normal.woff2',
    './dist/dear-mep-bundle/roboto-latin-300-normal.woff2'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-400-normal.woff',
    './dist/dear-mep-bundle/roboto-latin-400-normal.woff'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-400-normal.woff2',
    './dist/dear-mep-bundle/roboto-latin-400-normal.woff2'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-500-normal.woff',
    './dist/dear-mep-bundle/roboto-latin-500-normal.woff'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-500-normal.woff2',
    './dist/dear-mep-bundle/roboto-latin-500-normal.woff2'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-700-normal.woff',
    './dist/dear-mep-bundle/roboto-latin-700-normal.woff'
  );
  await fs.copyFile(
    './dist/dear-mep/roboto-latin-700-normal.woff2',
    './dist/dear-mep-bundle/roboto-latin-700-normal.woff2'
  );

  // assets
  if (await fs.exists('./dist/dear-mep/assets/')) {
    await fs.copy('./dist/dear-mep/assets/', './dist/dear-mep-bundle/assets/');
  } else {
    await fs.mkdir('./dist/dear-mep-bundle/assets/');
  }
})();
