import { createHash } from 'crypto'

export default class HashLog {
    constructor(snapshot) {
        this.tip = null
        this.hashes = []
        this.blocks = {}
        // Snapshot blocks most likely already exist with deltas etc.?
        // This builds a new log from raw data...
        if(snapshot) snapshot.forEach(block => this.push(block))
    }
    hash(data) {
        // TODO: Add hash prefix?
        return createHash('sha256').update(data).digest().toString('hex')
    }
    push(data) {
        let tiphash   = this.tip ? this.tip.key : ''
        let tiplink   = this.tip ? this.tip.key : null
        let blockhash = this.hash(data+tiphash)
        let tipseen   = this.tipseen || [0,0]
        let block = {
            key   : blockhash, 
            value : data,
            link  : tiplink,
            delta : process.hrtime(tipseen)
        }
        this.blocks[blockhash] = block
        this.hashes.push(blockhash)
        this.tip = block
        this.tipseen = block.delta
    }
    contains(hash) {
        if (!hash) return false
        return this.blocks[hash]
    }
    merge(hashlog) {
        // Merge hashlog into this
        // If this contains hashlog, not worries
        if (this.tip.key == hashlog.tip.key) return
        if (this.contains(hashlog.tip.key)) return
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
        let mergeBlocks = mergeBlocksLeft.concat(mergeblocksRight)
        sortBlocksByDelta(mergeBlocks)
        console.log(mergeBlocks)
        // Find new nodes
        // for each
        //   determine location
        //   insert
        //   update parents?
        //   remove dead leafs - mergeblockleft hashes ?
    }
}

function sortBlocksByDelta(blocks) {
    blocks.sort((a,b) => {
        let anano = a.delta[0] * 1e9 + a.delta[1]
        let bnano = b.delta[0] * 1e9 + b.delta[1]
        if (anano < bnano) return -1
        if (anano > bnano) return 1
        return 0
    })
}

function findCommonIndex(left, right) {
    // TODO: Probably should use binary
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
