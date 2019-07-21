/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const crypto = require('crypto');
const jsonld = require('jsonld');
const pLimit = require('p-limit');

const limit = pLimit(5);

// Access the workerData by requiring it.
const {parentPort, workerData} = require('worker_threads');

const {CONTEXTS} = workerData;

jsonld.documentLoader = async url => {
  if(url in CONTEXTS) {
    return {
      contextUrl: null,
      document: CONTEXTS[url],
      documentUrl: url
    };
  }
  throw new Error('NotFoundError');
};

// Main thread will pass the data you need
// through this event listener.
parentPort.on('message', async data => {
  // canonize ledger event to nquads
  const result = await Promise.all(data.map(d => limit(async () => {
    const canonized = await jsonld.canonize(d, {
      algorithm: 'URDNA2015',
      format: 'application/n-quads'
    });
    const hash = crypto.createHash('sha256').update(canonized).digest();
    return hash.toString('base64');
  })));
  parentPort.postMessage(result);
});
