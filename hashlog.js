import { createHash } from 'crypto'
import uuid from 'node-uuid'

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
    push(data, preComputedDelta, preComputedCommit) {
        let tiphash   = this.tip ? this.tip.key : ''
        let blockhash = this.hash(data+tiphash)
        let uidhash   = this.hash(uuid.v4()+data)
        let tipseen   = this.tipseen || [0,0]
        let delta     = process.hrtime(tipseen)

        // TODO: Rename key -> orderhash - key is misleading?
        let block = {
            key    : blockhash, 
            commit : preComputedCommit || uidhash,
            value  : data,
            delta  : preComputedDelta || (delta[0] * 1e9 + delta[1])
        }
        this.blocks[blockhash] = block
        this.hashes.push(blockhash)
        this.tip = block
        this.tipseen = process.hrtime() 
    }
    contains(hash) {
        if (!hash) return false
        return this.blocks[hash]
    }
    merge(hashlog) {
        // TODO: Temporarily collect (not process) new events while merging 
        // Merge hashlog into this
        // If this contains hashlog, not worries
        if (this.tip.key == hashlog.tip.key) return
        if (this.contains(hashlog.tip.key)) return
        let commonIndexRight = findCommonIndex(this, hashlog)
        let commonIndexLeft = this.hashes.indexOf(hashlog.hashes[commonIndexRight])
        let common = this.blocks[this.hashes[commonIndexLeft]]
//        console.log(common)

        let mergeblocksRight = []
        let deltaFromCommonParentRight = 0
        for (var i = commonIndexRight+1; i < hashlog.hashes.length; i++) {
            let mhash  = hashlog.hashes[i]
            let mblock = hashlog.blocks[mhash]
            // Check if we have this commit - naive for now, requires rebuild
            let gotit = this.hashes.reduce((val, hash) => {
                if (val) return val
                let block = this.blocks[hash]
                if (block.commit == mblock.commit) return true
                return false
            }, false)
            if (gotit) console.log('got it', mblock.value)
            if (gotit) continue
            deltaFromCommonParentRight += mblock.delta
            mblock.deltaFromCommonParent = deltaFromCommonParentRight
            mergeblocksRight.push(mblock)
        }

        let mergeBlocksLeft = []
        let deltaFromCommonParentLeft = 0
        for (var i = commonIndexLeft+1; i < this.hashes.length; i++) {
            let mhash = this.hashes[i]
            let mblock = this.blocks[mhash]
            deltaFromCommonParentLeft += mblock.delta
            mblock.deltaFromCommonParent = deltaFromCommonParentLeft
            mergeBlocksLeft.push(mblock)
        }

        let mergeBlocks = mergeBlocksLeft.concat(mergeblocksRight)
        sortBlocksByDeltaFromCommonParent(mergeBlocks)

//        console.log(mergeBlocks)
//        console.log('####################')
//        mergeBlocks.forEach((block) => {
//            console.log(block.value, block.links.length)
//            console.log(this.contains(block.key) != undefined)
//            block.links.forEach((link) => {
//                console.log(this.contains(link) != undefined)
//            })
//        })

        this.hashes.splice(commonIndexLeft+1)
        this.tip = common
        let deltaFromCommonParentForPrevNode = 0

        // Recompute hashes

        mergeBlocks.forEach((block, index) => {
            let newDelta = block.deltaFromCommonParent - deltaFromCommonParentForPrevNode
            this.push(block.value, newDelta, block.commit)
        })

        // Keep hashes (immutable commit)

//        mergeBlocks.forEach((block, index) => {
//            let newDelta = block.deltaFromCommonParent - deltaFromCommonParentForPrevNode
//            block.delta = newDelta
//            this.hashes.push(block.key)
//            this.blocks[block.key] = block
//            this.tip = block
//        })
        
        // Find new nodes
        // for each
        //   determine location
        //   insert
        //   update parents?
        //   remove dead leafs - mergeblockleft hashes ?
        //   remove deltaFromCommonParent
    }
    getBlockAtIndex(index) {
        return this.blocks[this.hashes[index]]
    }
}

function sortBlocksByDeltaFromCommonParent(blocks) {
    blocks.sort((a,b) => {
        if (a.deltaFromCommonParent < b.deltaFromCommonParent) return -1
        if (a.deltaFromCommonParent > b.deltaFromCommonParent) return 1
        return 0
    })
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
