import assert  from 'assert'
import HashLog from '../hashlog'

it('can make hashlogs', () => {
    let log = new HashLog()
    assert(log.tip == null)
    assert(log.hashes.length == 0)
})

it('can insert data', () => {
    let log = new HashLog()
    log.push('data0')
    log.push('data1')
    log.push('data2')
    assert(log.tip != null)
    assert(log.hashes.length == 3)
})

it('can take initial data - snapshot?', () => {
    let log = new HashLog(['1','2','3'])
    assert(log.hashes.length == 3)
})

it('can check if a log contains a hash', () => {
    let log1 = new HashLog()
    log1.push('data0')
    log1.push('data1')
    log1.push('data2')
    let log2 = new HashLog()
    log2.push('data0')
    log2.push('data1')
    log2.push('data3')
    assert(log1.contains(log2.hashes[0]))
    assert(log2.contains(log1.hashes[1]))
    assert(!log1.contains(log2.hashes[2]))
    assert(!log2.contains(log1.hashes[2]))
})

it('can merge logs', () => {
    let base = ['data0','data1','data2']
    let tip1 = 'data3'
    let tip2 = 'data4'

    let log1 = new HashLog(base)
    let log2 = new HashLog(base)

    log1.push(tip1)
    log2.push(tip2)

    assert(log1.tip.value == 'data3')
    assert(log2.tip.value == 'data4')

    let log3 = log1.merge(log2)
    
    console.log(log3)

})
