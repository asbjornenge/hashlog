import assert from 'assert'
import HashLog from '../hashlog'

let we = it

we('can make hashlogs', () => {
    let log = new HashLog()
    assert(log.tip == null)
    assert(log.blocks.length == 0)
})

we('can insert data', () => {
    let log = new HashLog()
    log.push('data0')
    log.push('data1')
    log.push('data2')
    assert(log.tip != null)
    assert(log.blocks.length == 3)
})

we('can check if a log contains a hash', () => {
    let log1 = new HashLog()
    log1.push('data0')
    log1.push('data1')
    log1.push('data2')
    let log2 = new HashLog()
    log2.push('data0')
    log2.push('data1')
    log2.push('data3')
    assert(log1.contains(log2.blocks[0].key))
    assert(log2.contains(log1.blocks[1].key))
    assert(!log1.contains(log2.blocks[2].key))
    assert(!log2.contains(log1.blocks[2].key))
})
