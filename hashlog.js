import { createHash } from 'crypto'
import { hash64, fingerprint64 } from 'farmhash'
import uuid from 'node-uuid'

export default class HashLog {
    constructor(data) {
        this.tip     = null
        this.chain   = []
        this.blocks  = {}
        this.commits = {}
        if(data) data.forEach(block => this.push(block))
    }
    get length() { return this.chain.length  }
    hash(data) {
        // TODO: Add hash prefix?
        // return fingerprint64(data)
        return createHash('sha256').update(data).digest().toString('hex')
    }
    push(data, preComputedDelta, preComputedCommit) {
        let tiphash   = this.tip ? this.tip.chainhash : ''
        let chainhash = this.hash(data+tiphash)
        let commit    = uuid.v4()
        let tipseen   = this.tipseen || [0,0]
        let delta     = process.hrtime(tipseen)

        let block = {
            chainhash : chainhash, 
            commit    : preComputedCommit || commit,
            value     : data,
            delta     : preComputedDelta || (delta[0] * 1e9 + delta[1])
        }

        this.blocks[chainhash] = block
        this.commits[commit] = block
        this.chain.push(chainhash)
        this.tip = block
        this.tipseen = process.hrtime() 
    }
    contains(hash) {
        if (!hash) return false
        return this.blocks[hash] != undefined
    }
    containsCommit(hash) {
        if (!hash) return false
        return this.commits[hash] != undefined
    }
    merge(hashlog) {
        // Merge hashlog into this
        // If this contains hashlog, not worries
        if (this.tip.chainhash == hashlog.tip.chainhash) return
        if (this.contains(hashlog.tip.key)) return
        let commonChainRight = findCommonChain(this, hashlog)
        let commonChainLeft = this.chain.indexOf(hashlog.chain[commonChainRight])
        let common = this.blocks[this.chain[commonChainLeft]]

        // Compute the Right hand blocks
        let mergeblocksRight = []
        let deltaFromCommonParentRight = 0
        for (var i = commonChainRight+1; i < hashlog.length; i++) {
            let mhash  = hashlog.chain[i]
            let mblock = hashlog.blocks[mhash]
            deltaFromCommonParentRight += mblock.delta
            mblock.deltaFromCommonParent = deltaFromCommonParentRight
            mergeblocksRight.push(mblock)
        }
        // Remove already-merged commits
        mergeblocksRight = mergeblocksRight.filter(block => {
            return !this.containsCommit(block.commit)
        })

        // Compute the Left hand blocks
        let mergeBlocksLeft = []
        let deltaFromCommonParentLeft = 0
        for (var i = commonChainLeft+1; i < this.length; i++) {
            let mhash = this.chain[i]
            let mblock = this.blocks[mhash]
            deltaFromCommonParentLeft += mblock.delta
            mblock.deltaFromCommonParent = deltaFromCommonParentLeft
            mergeBlocksLeft.push(mblock)
        }

        let mergeBlocks = mergeBlocksLeft.concat(mergeblocksRight)
        sortBlocksByDeltaFromCommonParent(mergeBlocks)

        this.chain.splice(commonChainLeft+1)
        this.tip = common
        let deltaFromCommonParentForPrevNode = 0

        // Recompute chain 
        mergeBlocks.forEach((block, index) => {
            let newDelta = block.deltaFromCommonParent - deltaFromCommonParentForPrevNode
            delete this.blocks[block.chain]
            this.push(block.value, newDelta, block.commit)
        })
    }
    getBlockAtIndex(index) {
        return this.blocks[this.chain[index]]
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

function findCommonChain(left, right) {
    // TODO: Probably should use binary
    // Loop backwards and check nodes
    let index = 0;
    for (var i=right.chain.length-1; i > -1; i--) {
        if (left.contains(right.chain[i])) {
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
