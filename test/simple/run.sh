#!/bin/bash
COUNTER=1
while [  $COUNTER -lt 41 ]; do
    echo "Running $COUNTER"
    node --expose-gc ./encode-decode-simple.js $COUNTER 75
    let COUNTER=COUNTER+4
done
