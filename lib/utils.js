'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.merge = merge;
// Merge right into left
function merge(left, right) {
    // If left contains right, return
    if (!right.tip) return;
    if (left.tip && right.tip) {
        if (left.tip.chainhash == right.tip.chainhash) return;
        if (left.contains(right.tip.key)) return;
    }
    var commonChainRight = findCommonChain(left, right);
    var commonChainLeft = left.chain.indexOf(right.chain[commonChainRight]);
    var common = left.blocks[left.chain[commonChainLeft]];

    // No common hash found :-(
    if (commonChainRight == -1) {
        // If left is empty - allow
        if (left.length == 0) {
            // TODO: Would it not be smarter in this case to
            // clone all the properties of right into left instead of recompute?
            // Test what is faster.
            commonChainRight = -1;
            commonChainLeft = -1;
        } else {
            throw new Error('Unable to merge. Left side is not empty and has no common commit with right side.');
        }
    }

    // Compute the Right hand blocks
    var mergeblocksRight = [];
    var deltaFromCommonParentRight = 0;
    for (var i = commonChainRight + 1; i < right.length; i++) {
        var mhash = right.chain[i];
        var mblock = right.blocks[mhash];
        deltaFromCommonParentRight += mblock.delta;
        mblock.deltaFromCommonParent = deltaFromCommonParentRight;
        mergeblocksRight.push(mblock);
    }
    // Remove already-merged commits
    mergeblocksRight = mergeblocksRight.filter(function (block) {
        return !left.containsCommit(block.commit);
    });

    // Compute the Left hand blocks
    var mergeBlocksLeft = [];
    var deltaFromCommonParentLeft = 0;
    for (var i = commonChainLeft + 1; i < left.length; i++) {
        var mhash = left.chain[i];
        var mblock = left.blocks[mhash];
        deltaFromCommonParentLeft += mblock.delta;
        mblock.deltaFromCommonParent = deltaFromCommonParentLeft;
        mergeBlocksLeft.push(mblock);
    }

    var mergeBlocks = mergeBlocksLeft.concat(mergeblocksRight);
    sortBlocksByDeltaFromCommonParent(mergeBlocks);

    // Reset left to common
    left.chain.splice(commonChainLeft + 1);
    left.tip = common;

    // Recompute chain
    var deltaFromCommonParentForPrevNode = 0;
    mergeBlocks.forEach(function (block, index) {
        var newDelta = block.deltaFromCommonParent - deltaFromCommonParentForPrevNode;
        deltaFromCommonParentForPrevNode += newDelta;
        delete left.blocks[block.chain];
        left.push(block.value, newDelta, block.commit);
    });
}

function sortBlocksByDeltaFromCommonParent(blocks) {
    blocks.sort(function (a, b) {
        if (a.deltaFromCommonParent < b.deltaFromCommonParent) return -1;
        if (a.deltaFromCommonParent > b.deltaFromCommonParent) return 1;
        return 0;
    });
}

function sortBlocksByDelta(blocks) {
    blocks.sort(function (a, b) {
        var anano = a.delta[0] * 1e9 + a.delta[1];
        var bnano = b.delta[0] * 1e9 + b.delta[1];
        if (anano < bnano) return -1;
        if (anano > bnano) return 1;
        return 0;
    });
}

function findCommonChain(left, right) {
    // TODO: Probably should use binary
    // Loop backwards looking for common chainhash
    var index = -1;
    for (var i = right.chain.length - 1; i > -1; i--) {
        if (left.contains(right.chain[i])) {
            index = i;
            break;
        }
    }
    return index;
}