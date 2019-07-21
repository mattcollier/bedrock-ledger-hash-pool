/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const {config: {constants}, util: {uuid}} = bedrock;
const brLedgerNode = require('bedrock-ledger-node');
const brHashPool = require('bedrock-ledger-hash-pool');
const cpuCount = require('os').cpus().length;

const targetNode = 'https://example.com/foo';
/* eslint-disable max-len */
const operation = {
  '@context': constants.WEB_LEDGER_CONTEXT_V1_URL,
  type: 'CreateWebLedgerRecord',
  creator: targetNode,
  record: {
    '@context': constants.TEST_CONTEXT_V1_URL,
    id: `https://example.com/transaction/${uuid()}`,
    price: Math.floor(Math.random() * 1000000000000),
  },
  proof: {
    type: 'Ed25519Signature2018',
    created: '2018-02-19T14:48:48Z',
    creator: 'did:v1:test:nym:8IyxSpzUFcby2pe_oSdsbjb_1hLjo0eqaQSNRPrpUxw#ocap-invoke-key-1',
    capability: 'did:v1:test:nym:8IyxSpzUFcby2pe_oSdsbjb_1hLjo0eqaQSNRPrpUxw',
    capabilityAction: 'CreateWebLedgerRecord',
    jws: 'eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..u-alElcqe_xri6GLL10Ozi1LwLO9HpUXmsRqnjTa7jhAf1pFbAjdGDNhDjg0QvCIw',
    proofPurpose: 'invokeCapability'
  }
};
/* eslint-enable */

const iterations = 50000;
const docs = [];
for(let i = 0; i < iterations; ++i) {
  const o = bedrock.util.clone(operation);
  o.record.id = `https://example.com/transaction/${uuid()}`;
  docs.push(o);
}
describe('api', () => {
  for(let workerCount = 1; workerCount <= cpuCount; ++workerCount) {
    it(`pool hashing, ${workerCount} workers`, async function() {
      this.timeout(30000);
      await brHashPool.hash({docs, workerCount});
    });
  }
});
