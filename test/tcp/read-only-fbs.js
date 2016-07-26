'use strict';

const fbNodeGenerator = require('fb-node-generator');
const DataGenerator = fbNodeGenerator.DataGenerator;
const lolomoFBS = fbNodeGenerator.fbs;
const flatbuffers = fbNodeGenerator.flatbuffers;

/**
 */
module.exports = function responder(rows, cols, percentSim) {
    return function _responder(client, buffer) {
        let lolomo;

        // Generate the new lolomo and create the fbs.
        if (!buffer) {
            const dg = new DataGenerator();
            lolomo = dg.createLolomo(rows, cols, percentSim);
            lolomo = lolomoFBS(lolomo, true);
        }

        // read in the lolomo.
        else {
            const ab = buffer.buffer.
                    slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
            const int8array = new Uint8Array(buffer.buffer,
                                             buffer.byteOffset,
                                             buffer.byteLength);
            hello = Hi.getRootAsHi(new flatbuffers.ByteBuffer(int8array));
        }
    }
};
