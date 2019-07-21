const {Worker, isMainThread, parentPort} = require('worker_threads');
if(isMainThread) {
  // This code is executed in the main thread and not in the worker.

  // Create the worker.
  const worker = new Worker(__filename);
  // Listen for messages from the worker and print them.
  worker.on('message', msg => {console.log(msg);});
} else {
  const path = require('path');
  const brLedgerNode = require(path.join(
    __dirname, '..', 'test', 'node_modules', 'bedrock-ledger-node'));
  // This code is executed in the worker and not in the main thread.
  brLedgerNode.consensus._hasher({}).then(result => {
    parentPort.postMessage(result);
  }).catch(e => {
    console.error(e);
    throw e;
  });
  // Send a message to the main thread.
}
