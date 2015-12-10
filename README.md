# HashLog

HashLog is an experimental data structure using [merkle-style](https://en.wikipedia.org/wiki/Merkle_tree) hashing and a time-delta inspired by [lamport timestamp](https://en.wikipedia.org/wiki/Lamport_timestamps) to create a *commit-log* type structure that ensures correct ordering of commits on merge, even for distributed logs (unsynchronized clocks).

FYI: This is totally an experiment!

## Theory

By using merkle-style hashing we can prove the order of the commits to our log. On merge, if we can find a common hash in the past, we can be sure that all data up to this merge-point is the same for both logs. By also storing a time-delta between commits we can calculate deltas from the merge-point and ensure correct ordering of commits made to different logs.

Also; logs are great! You can build any other kind of data structure using a log.

## Install

```sh
npm install --save hashlog
```

## Use

```js
import HashLog   from 'hashlog'
import { merge } from 'hashlog/utils'

let log1 = new HashLog(['data1'])
let log2 = new HashLog(['data1'])

log1.push('data2')
merge(log1, log2) // Merge log2 into log1 
merge(log2, log1) // Merge log1 into log2
assert(log1.tip.chainhash == log2.tip.chainhash)
assert(log1.tip.value == log2.tip.value)
assert(log1.tip.value == 'data2')
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
