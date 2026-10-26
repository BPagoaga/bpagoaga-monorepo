#!/usr/bin/env node
import { ensureDevCerts } from './index.mjs';

// `dev-certs [--force]`: creates the shared localhost certificate, for servers that take
// file paths on the command line (Storybook) instead of a Vite plugin.
const { cert, key } = ensureDevCerts({ force: process.argv.includes('--force') });
console.log(`[dev-certs] ${cert}\n[dev-certs] ${key}`);
