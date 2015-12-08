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
    getBlockAtIndex(index) {
        return this.blocks[this.chain[index]]
    }
}
