var merkleStream = require('merkle-tree-stream')
var crypto = require('crypto')

var stream = merkleStream({
  data: function (data, roots, index) {
    // this function should hash incoming data
    // roots in the current partial roots of the merkle tree
    // index is the index of this node
    return crypto.createHash('sha256').update(data).digest()
  },
  tree: function (a, b) {
    // hash two merkle tree node hashes into a new parent hash
    return crypto.createHash('sha256').update(a).update(b).digest()
  }
})

stream.write('hello')
stream.write('hashed')
stream.write('world')

stream.on('data', function (data) {
  console.log(data)
})
