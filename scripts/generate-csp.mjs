import { createHash } from 'node:crypto';
import { globSync, readFileSync, writeFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import path from 'node:path';

const CSP_HEADER = `Content-Security-Policy: default-src 'self'; script-src 'self' <js-hashes-placeholder>; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`;
const BUILD_DIR = 'build/client';

const htmlFiles = globSync(`${BUILD_DIR}/**/*.html`);

const jsHashes = new Set();

for (const filePath of htmlFiles) {
  const html = readFileSync(filePath, { encoding: 'utf8' });
  const $ = cheerio.load(html);
  const scriptContents = $('script:not([src])')
    .map((_i, el) => $(el).html())
    .get();

  for (const script of scriptContents) {
    const sha256 = createHash('sha256').update(script).digest('base64');
    jsHashes.add(`'sha256-${sha256}'`);
  }
}

const cspHeaderWithHashes = CSP_HEADER.replace('<js-hashes-placeholder>', [...jsHashes].join(' '));

const headerFile = `/*
	${cspHeaderWithHashes}
`;

const headerFilePath = path.join(process.cwd(), `${BUILD_DIR}/_headers`);

writeFileSync(headerFilePath, headerFile, { encoding: 'utf8' });

console.log(`\n✅ Successfully wrote CSP header to ${path.join(BUILD_DIR, '_headers')}`);
