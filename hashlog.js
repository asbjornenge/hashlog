//import { tree } from './tree'
import { createHash } from 'crypto'

export default class HashLog {
    constructor(snapshot) {
        this.tip = null
        this.hashes = []
        this.blocks = {}
        if(snapshot) snapshot.forEach(block => this.push(block))
    }
    hash(data) {
        // TODO: Add hash prefix?
        return createHash('sha256').update(data).digest().toString('hex')
    }
    push(data) {
        let tiphash = this.tip ? this.tip.key : ''
        let tiplink = this.tip ? this.tip.key : null
        let blockhash = this.hash(data+tiphash)
        let block = {
            key   : blockhash, 
            value : data,
            link  : tiplink
        }
        this.blocks[blockhash] = block
        this.hashes.push(blockhash)
        this.tip = block
    }
    contains(hash) {
        if (!hash) return false
        return this.blocks[hash]
    }
    merge(hashlog) {
        // Merge hashlog into this
        // If this contains hashlog, not worries
        if (this.tip.key == hashlog.tip.key) return true
        if (this.contains(hashlog.tip.key)) return true
        let commonIndexRight = findCommonIndex(this, hashlog)
        let commonIndexLeft = this.hashes.indexOf(hashlog.hashes[commonIndexRight])
        let mergeblocksRight = []
        for (var i = commonIndexRight+1; i < hashlog.hashes.length; i++) {
            let mhash = hashlog.hashes[i]
            let mblock = hashlog.blocks[mhash]
            mergeblocksRight.push(mblock)
        }
        let mergeBlocksLeft = []
        for (var i = commonIndexLeft+1; i < this.hashes.length; i++) {
            let mhash = this.hashes[i]
            let mblock = this.blocks[mhash]
            mergeBlocksLeft.push(mblock)
        }
        console.log(mergeBlocksLeft, mergeblocksRight)
        let mergeBlocks = mergeBlocksLeft.concat(mergeblocksRight)
        console.log(mergeBlocks)
        // Find new nodes
        // for each
        //   determine location
        //   insert
        //   update parents?
        //   remove dead leafs - mergeblockleft hashes ?
    }
}

function findCommonIndex(left, right) {
    // TODO: Should use binary
    // Loop backwards and check nodes
    let index = 0;
    for (var i=right.hashes.length-1; i > -1; i--) {
        if (left.contains(right.hashes[i])) {
            index = i
            break
        }
    }
    return index
}

function binaryIndexOf(searchElement) {
    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];

        if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }

    return -1;
}
