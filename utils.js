// Merge right into left
export function merge(left, right) {
    // If left contains right, return
    if (!right.tip) return
    if (left.tip && right.tip) {
        if (left.tip.chainhash == right.tip.chainhash) return
        if (left.contains(right.tip.key)) return
    }
    let commonChainRight = findCommonChain(left, right)
    let commonChainLeft = left.chain.indexOf(right.chain[commonChainRight])
    let common = left.blocks[left.chain[commonChainLeft]]

    // No common hash found :-( 
    if (commonChainRight == -1) {
        // If left is empty - allow
        if (left.length == 0) {
            // TODO: Would it not be smarter in this case to
            // clone all the properties of right into left instead of recompute?
            // Test what is faster. 
            commonChainRight = -1
            commonChainLeft = -1
        } else {
            throw new Error('Unable to merge. Left side is not empty and has no common commit with right side.')
        }
    }

    // Compute the Right hand blocks
    let mergeblocksRight = []
    let deltaFromCommonParentRight = 0
    for (var i = commonChainRight+1; i < right.length; i++) {
        let mhash  = right.chain[i]
        let mblock = right.blocks[mhash]
        deltaFromCommonParentRight += mblock.delta
        mblock.deltaFromCommonParent = deltaFromCommonParentRight
        mergeblocksRight.push(mblock)
    }
    // Remove already-merged commits
    mergeblocksRight = mergeblocksRight.filter(block => {
        return !left.containsCommit(block.commit)
    })

    // Compute the Left hand blocks
    let mergeBlocksLeft = []
    let deltaFromCommonParentLeft = 0
    for (var i = commonChainLeft+1; i < left.length; i++) {
        let mhash = left.chain[i]
        let mblock = left.blocks[mhash]
        deltaFromCommonParentLeft += mblock.delta
        mblock.deltaFromCommonParent = deltaFromCommonParentLeft
        mergeBlocksLeft.push(mblock)
    }

    let mergeBlocks = mergeBlocksLeft.concat(mergeblocksRight)
    sortBlocksByDeltaFromCommonParent(mergeBlocks)

    // Reset left to common
    left.chain.splice(commonChainLeft+1)
    left.tip = common

    // Recompute chain 
    let deltaFromCommonParentForPrevNode = 0
    mergeBlocks.forEach((block, index) => {
        let newDelta = block.deltaFromCommonParent - deltaFromCommonParentForPrevNode
        deltaFromCommonParentForPrevNode += newDelta
        delete left.blocks[block.chain]
        left.push(block.value, newDelta, block.commit)
    })
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
    // Loop backwards looking for common chainhash 
    let index = -1;
    for (var i=right.chain.length-1; i > -1; i--) {
        if (left.contains(right.chain[i])) {
            index = i
            break
        }
    }
    return index
}
