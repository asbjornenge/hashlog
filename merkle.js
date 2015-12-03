//import { tree } from './tree'
import { createHash } from 'crypto'

export default class MerkleTree {
    constructor(args) {
        super(args)
        this.root = null
        this.nodes = {}
    }
    hash(s) {
        return createHash('sha256').update(s).digest()
    }
    storeNode({key,obj,obj_s}, cb) {
        // Re-parse the object in case the caller changes it out from underneath us,
        // which they really shouldn't do, but it's very possible....
        this.nodes[key] = { obj : JSON.parse(obj_s), obj_s }
        cb(null)
    }
    lookupNode({key}, cb) {
        let err = this.nodes[key] ? null : new Error('not found')
        cb(err, this.nodes[key])
    }
    lookupRoot(cb) {
        cb(null, this.root)
    }
    commitRoot({key}, cb) {
        this.root = key
        cb(null)
    }
    getRootNode() {
        this.nodes[this.root]
    }
}
