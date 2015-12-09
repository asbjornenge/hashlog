# HashLog

HashLog is an experimental data structure using [merkle-style](https://en.wikipedia.org/wiki/Merkle_tree) hashing and a time-delta inspired by [lamport timestamp](https://en.wikipedia.org/wiki/Lamport_timestamps) to ensure order on merge.

FYI: This is totally an experiment!

## Install

```sh
npm install --save hashlog
```

## Use

```js
import HashLog   from 'hashlog'
import { merge } from 'hashlog/utils'

let log1 = new HashLog()
let log2 = new HashLog(['data1','data2'])

log1.push('data3')
merge(log1, log2) // Merge log2 into log1 
merge(log2, log1) // Merge log1 into log2
assert(log1.tip.chainhash == log2.tip.chainhash)
assert(log1.tip.value == log2.tip.value)
assert(log1.tip.value == 'data3')
```

## Benchmark

```sh
$ babel-node bench/bigmerge.js
mock: 581ms
init: 15043ms
push: 419ms
merge1: 606ms
merge2: 331ms
17869837359133814333 1050000 datr442t9
17869837359133814333 1050000 datr442t9
```

enjoy.
