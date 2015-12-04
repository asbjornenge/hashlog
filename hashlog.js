//import { tree } from './tree'
import { createHash } from 'crypto'

export default class HashLog {
    constructor() {
        this.tip = null
        this.blocks = []
    }
    hash(s) {
        // TODO: Add hash prefix?
        return createHash('sha256').update(s).digest().toString('hex')
    }
    push(data) {
        let block = {
            key   : this.hash(data),
            value : data,
            link  : this.tip ? this.tip.key : null
        }
        this.blocks.push(block)
        this.tip = block
    }
    contains(hash) {
        if (!hash) return false
        // TODO: Super naive loop for now
        return this.blocks.filter(block => block.key == hash).length > 0
    }
    merge(hashlog) {

    }
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
