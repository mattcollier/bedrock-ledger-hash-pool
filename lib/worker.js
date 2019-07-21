/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const crypto = require('crypto');
const jsonld = require('jsonld');

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
  const canonized = await jsonld.canonize(data, {
    algorithm: 'URDNA2015',
    format: 'application/n-quads'
  });
  // console.log(typeof canonized);
  // const canonizedBuffer = Buffer.from(canonized, 'utf8');
  // const canonizedBytes = canonizedBuffer.length;
  const hash = crypto.createHash('sha256').update(canonized).digest();

  // return the result to main thread.

  // TODO: hash should be multibase encoded etc.

  parentPort.postMessage(hash.toString('base64'));
});
