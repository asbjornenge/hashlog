import { fingerprint64 } from 'farmhash'

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
        return fingerprint64(data) 
    }
    push(data, preComputedDelta, preComputedCommit) {
        let tiphash   = this.tip ? this.tip.chainhash : ''
        let chainhash = this.hash(data+tiphash)
        let commit    = chainhash
        let delta     = this.getPushDelta(preComputedDelta)

        let block = {
            chainhash : chainhash, 
            commit    : preComputedCommit || commit,
            value     : data,
            delta     : delta 
        }

        this.blocks[chainhash] = block
        this.commits[commit] = block
        this.chain.push(chainhash)
        this.tip = block
        this.tipseen = process.hrtime() 
    }
    getPushDelta(preComputedDelta) {
        if (this.length == 0) return 0
        if (preComputedDelta) return preComputedDelta
        let delta = process.hrtime(this.tipseen)
        return delta[0] * 1e9 + delta[1]
    }
    contains(hash) {
        return this.blocks[hash] != undefined
    }
    containsCommit(hash) {
        return this.commits[hash] != undefined
    }
    getBlockAtIndex(index) {
        return this.blocks[this.chain[index]]
    }
}
