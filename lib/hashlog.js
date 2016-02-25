'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _farmhash = require('farmhash');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HashLog = function () {
    function HashLog(data) {
        var _this = this;

        _classCallCheck(this, HashLog);

        this.tip = null;
        this.chain = [];
        this.blocks = {};
        this.commits = {};
        if (data) data.forEach(function (block) {
            return _this.push(block);
        });
    }

    _createClass(HashLog, [{
        key: 'hash',
        value: function hash(data) {
            return (0, _farmhash.fingerprint64)(data);
        }
    }, {
        key: 'push',
        value: function push(data, preComputedDelta, preComputedCommit) {
            var tiphash = this.tip ? this.tip.chainhash : '';
            var chainhash = this.hash(data + tiphash);
            var commit = chainhash;
            var delta = this.getPushDelta(preComputedDelta);

            var block = {
                chainhash: chainhash,
                commit: preComputedCommit || commit,
                value: data,
                delta: delta
            };

            this.blocks[chainhash] = block;
            this.commits[commit] = block;
            this.chain.push(chainhash);
            this.tip = block;
            this.tipseen = process.hrtime();
        }
    }, {
        key: 'getPushDelta',
        value: function getPushDelta(preComputedDelta) {
            if (this.length == 0) return 0;
            if (preComputedDelta) return preComputedDelta;
            var delta = process.hrtime(this.tipseen);
            return delta[0] * 1e9 + delta[1];
        }
    }, {
        key: 'contains',
        value: function contains(hash) {
            return this.blocks[hash] != undefined;
        }
    }, {
        key: 'containsCommit',
        value: function containsCommit(hash) {
            return this.commits[hash] != undefined;
        }
    }, {
        key: 'getBlockAtIndex',
        value: function getBlockAtIndex(index) {
            return this.blocks[this.chain[index]];
        }
    }, {
        key: 'length',
        get: function get() {
            return this.chain.length;
        }
    }]);

    return HashLog;
}();

exports.default = HashLog;