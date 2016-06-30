'use strict';

const Benchmark = require('benchmark');
const toBuffer = require('typedarray-to-buffer');
const Suite = Benchmark.Suite;
const ROWS = 1;
const COLUMNS = 75;
const DataGenerator = require('./DataGenerator');
const gen = new DataGenerator();
const jsonGen = require('./lolomo-json');
const fbGen = require('./lolomo-fbs');
const Lolomo = require('../test_generated').Netflix.Lolomo;
const flatbuffers = require('../flatbuffers').flatbuffers;
const fs = require('fs');

const suite = new Suite();

let bName;
let jName;
let binData;
let jsonData;
let lolomo;
for (var rows = 1; rows <= ROWS; ++rows) {
    lolomo = gen.createLolomo(rows, COLUMNS, 0);
    console.log('LOLOMO', lolomo);
    bName = 'b' + rows + '_' + COLUMNS;
    jName = 'j' + rows + '_' + COLUMNS;

    binData = fbGen(lolomo, false);
    jsonData = JSON.stringify(jsonGen(lolomo, false));
    suite.
        add(bName, getBinary(binData)).
        add(jName, getJSON(jsonData));

    fs.writeFile(__dirname + '/data/' + bName + '.data', toBuffer(binData));
    fs.writeFile(__dirname + '/data/' + jName + '.data', jsonData);
}

suite.
    on('cycle', function cycle(e) {
        const bench = e.target;
        console.log('Next Benchmark', bench.name, bench.hz);
        fs.writeFile(__dirname + '/data/' + bench.name, '' + bench.hz);
    }).
    on('error', function error(e) {
        console.log(e);
    }).
    run();

function getBinary(binaryData) {
    return function _binRunner() {
        const lolomo = Lolomo.getRootAsLolomo(new flatbuffers.ByteBuffer(binaryData));
        return lolomo.bytes_;
    };
}

function getJSON(jsonStr) {
    return function _jsonRunner() {
        return JSON.stringify(JSON.parse(jsonStr));
    };
}
