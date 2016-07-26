'use strict';

const Benchmark = require('benchmark');
const toBuffer = require('typedarray-to-buffer');
const Suite = Benchmark.Suite;
const ROWS = process.argv[2];
const COLUMNS = process.argv[3];
const fbGenerator = require('fb-node-generator');
const DataGenerator = fbGenerator.DataGenerator;
const jsonGen = fbGenerator.json;
const fbGen = fbGenerator.fbs;
const NetflixFBS = fbGenerator.NetflixFBS;
const Lolomo = NetflixFBS.Lolomo;
const flatbuffers = fbGenerator.flatbuffers;
const fs = require('fs');
const suite = new Suite();

// GLOBAL STATE, If I don't do this, we run out of memory! :)
let jsonStr, binaryData;

/* lolomo = gen.createLolomo(1, COLUMNS, 0.75);
binData = fbGen(lolomo, true);
const testLolomo = Lolomo.getRootAsLolomo(new flatbuffers.ByteBuffer(binData));

fbGen.compare(lolomo, testLolomo);
*/

const benches = [];
const globalState = {};
[0, 0.2, 0.4, 0.6, 0.8, 1].forEach(function _similarEach(simPercent) {
    const bName = ['b', ROWS, COLUMNS, simPercent].join('_');
    const jName = ['j', ROWS, COLUMNS, simPercent].join('_');
    const binBench = new Benchmark(bName, getBinary, {
        setup: getSetup(ROWS, COLUMNS, simPercent),
        gen: new DataGenerator(),
        fbGen: fbGen,
        jsonGen: jsonGen,
        rows: ROWS,
        percent: simPercent,
        cols: COLUMNS,
        __dirname: __dirname,
        toBuffer: toBuffer,
        fs: fs
    });
    const jsonBench = new Benchmark(jName, getJSON, {
        setup: getSetup(ROWS, COLUMNS, simPercent),
        gen: new DataGenerator(),
        fbGen: fbGen,
        jsonGen: jsonGen,
        rows: ROWS,
        percent: simPercent,
        cols: COLUMNS,
        __dirname: __dirname,
        toBuffer: toBuffer,
        fs: fs
    });

    benches.push(binBench);
    benches.push(jsonBench);
});

function runBenches(index) {
    const bench = benches[index];
    if (!bench) {
        return;
    }

    console.log('start, running ' + bench.name);
    bench.
        on('error', function error(e) {
            console.log('error', bench.name);
            console.log(e.target.error.stack);
        }).
        on('complete', function _completed(e) {
            console.log('completed', bench.name, e.target.hz);
            fs.writeFileSync(bench.__dirname + '/eds/' + bench.name, e.target.hz);

            // Free memory?
            runBenches(index + 1);
        }).
        run();
}

runBenches(0);

function getBinary(globalState) {
    const binaryData = this.binaryData;
    const fbLolomo = Lolomo.getRootAsLolomo(new flatbuffers.ByteBuffer(binaryData));
    return fbLolomo.bytes_;
}

function getJSON() {
    const jsonStr = this.jsonStr;
    return JSON.stringify(JSON.parse(jsonStr));
}

function getSetup(row, cols, percent) {
    return function __setGlobalState() {
        const rows = this.rows;
        const cols = this.cols;
        const percent = this.percent;
        const gen = this.gen;
        const fbGen = this.fbGen;
        const jsonGen = this.jsonGen;
        const __dirname = this.__dirname;
        const toBuffer = this.toBuffer;
        const fs = this.fs;
        const lolomo = gen.createLolomo(rows, cols, percent);
        const binData = fbGen(lolomo, true);
        try {
            const jsonData = JSON.stringify(jsonGen(lolomo, true));
        } catch (e) {
            console.log(e);
        }
        const dirLoc = __dirname + '/eds/';
        const bName = ['b', rows, cols, percent].join('_');
        const jName = ['j', rows, cols, percent].join('_');

        this.binaryData = binData;
        this.jsonStr = jsonData;

        fs.writeFileSync(dirLoc + bName + '.data', toBuffer(binData));
        fs.writeFileSync(dirLoc + jName + '.data', jsonData);
    }
}
