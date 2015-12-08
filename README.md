# HashLog

HashLog is an experimental data structure using merkle-style hashing to ensure order.

FYI: This is totally en experiment for now!

Lamport counter...?

## Install

```sh
npm install --save hashlog
```

## Use

```js
import HashLog   from 'hashlog'
import { merge } from 'hashlog/utils'

let log1 = new HashLog(['data1','data2'])
let log2 = new HashLog(['data1','data2'])

log1.push('data3')
setTimeout(() => {
    log2.push('data4')
    merge(log1, log2) // Merge log2 into log1
    merge(log2, log1) // Merge log1 into log2
    assert(log1.tip.chainhash == log2.tip.chainhash)
})
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
