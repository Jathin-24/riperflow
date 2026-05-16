#!/usr/bin/env node
// Copies README + LICENSE from the repo root into cli/ so that npmjs.com
// renders the README on the package page and ships the license inside the
// tarball. Runs from `npm publish` via the `prepublishOnly` script hook.
//
// We refuse to publish if either source file is missing — an unlicensed
// npm package is a legal landmine for everyone who installs it, and a
// missing README is an instant credibility hit on a fresh launch.

import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const PKG = path.resolve(__dirname, '..');

const REQUIRED = ['README.md', 'LICENSE'];

let failed = false;
for (const name of REQUIRED) {
  const src = path.join(ROOT, name);
  const dst = path.join(PKG, name);
  if (!fs.existsSync(src)) {
    console.error(`prepublish: missing ${src} — refusing to publish.`);
    failed = true;
    continue;
  }
  fs.copySync(src, dst);
  console.log(`prepublish: copied ${path.relative(PKG, src)} -> ${name}`);
}

if (failed) process.exit(1);
