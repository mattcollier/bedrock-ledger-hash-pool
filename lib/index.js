/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// require('./worker-test.js');

const _chunk = require('lodash.chunk');
const bedrock = require('bedrock');
const {config: {constants: {CONTEXTS}}} = bedrock;
const path = require('path');
const {StaticPool} = require('node-worker-threads-pool');

const cpuCount = require('os').cpus().length;

const pools = [];

bedrock.events.on('bedrock.ready', () => {
  for(let i = 0; i < cpuCount; ++i) {
    pools.push(new StaticPool({
      size: i + 1,
      task: path.join(__dirname, 'worker2.js'),
      workerData: {CONTEXTS}
    }));
  }
});

exports.hash = async ({docs, workerCount}) => {
  const chunks = _chunk(docs, Math.floor(docs.length / workerCount));
  return Promise.all(chunks.map(chunk => pools[workerCount - 1].exec(chunk)));
};

// exports.hash2 = async ({docs}) => {
//   const chunks = _chunk(docs, Math.floor(docs.length / workerPoolSize));
//   return Promise.all(chunks.map(chunk => pool2.exec(chunk)));
// };
//
// exports.hash3 = async ({docs}) => {
//   const chunks = _chunk(docs, Math.floor(docs.length / workerPoolSize));
//   return Promise.all(chunks.map(chunk => pool3.exec(chunk)));
// };
