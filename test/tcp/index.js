'use strict';

const fbNodeHello = require('fb-node-hello');

const PORT = process.env.PORT || 33000;
const HOST = process.env.HOST || 'localhost';
const ROWS = process.env.LOLOMO_ROWS || 1;
const COLS = process.env.LOLOMO_COLS || 1;
const PERCENT_SIM = process.env.PERCENT_SIM || 0.0;

const server = fbNodeHello.createServer;
