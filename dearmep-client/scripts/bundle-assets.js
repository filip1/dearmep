const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
  const files = [
    './dist/dear-mep/runtime.js',
    './dist/dear-mep/polyfills.js',
 //   './dist/dear-mep/scripts.js',
    './dist/dear-mep/main.js',
  ]
  await fs.remove('./dist/dear-mep-bundle')
  await fs.ensureDir('./dist/dear-mep-bundle')
  await concat(files, './dist/dear-mep-bundle/dear-mep.js');
  await fs.copyFile('./dist/dear-mep/styles.css', './dist/dear-mep-bundle/styles.css')
  await fs.copy('./dist/dear-mep/assets/', './dist/dear-mep-bundle/assets/' )
})()
