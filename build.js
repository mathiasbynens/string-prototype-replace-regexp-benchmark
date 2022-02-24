// Copyright 2021 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the “License”);
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// <https://apache.org/licenses/LICENSE-2.0>.
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an “AS IS” BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.

const fs = require('fs');
const jsesc = require('jsesc');

const EMOJI_TEST_PATH = './node_modules/emoji-test-regex-pattern/dist/latest';
const index = fs.readFileSync(`${EMOJI_TEST_PATH}/index.txt`, 'utf8').toString().trim();
const patternWithoutU = fs.readFileSync(`${EMOJI_TEST_PATH}/javascript.txt`, 'utf8').toString().trim();
const patternWithU = fs.readFileSync(`${EMOJI_TEST_PATH}/javascript-u.txt`, 'utf8').toString().trim();

const toStringLiteral = (string) => {
  // We’d have used JSON.stringify() if it were ASCII-safe.
  return jsesc(string, { wrap: true });
};

const generateSource = ({ method, flags }) => {
  const id = `${ method }-${ flags }`;
  const pattern = flags.includes('u') ? patternWithU : patternWithoutU;
  return `
// Copyright 2021 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

const re = /${ pattern }/${ flags };
const string = ${ toStringLiteral(index) };
console.time(${ toStringLiteral(id) });
const result = string.${ method }(re, (match) => {
  return '_';
});
console.timeEnd(${ toStringLiteral(id) });
`.trim() + '\n';
};

const writeFile = ({ method, flags }) => {
  fs.writeFileSync(
    `./dist/${method}-${flags}.js`,
    generateSource({ method, flags })
  );
};

writeFile({ method: 'replace',    flags: 'g'  });
writeFile({ method: 'replace',    flags: 'gu' });
writeFile({ method: 'replaceAll', flags: 'g'  });
writeFile({ method: 'replaceAll', flags: 'gu' });
