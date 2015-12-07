import assert  from 'assert'
import HashLog from '../hashlog'

it('can make hashlogs', () => {
    let log = new HashLog()
    assert(log.tip == null)
    assert(log.length == 0)
})

it('can insert data', () => {
    let log = new HashLog()
    log.push('data0')
    log.push('data1')
    log.push('data2')
    assert(log.tip != null)
    assert(log.length == 3)
})

it('can take initial data - snapshot?', () => {
    let log = new HashLog(['1','2','3'])
    assert(log.length == 3)
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
    assert(log1.contains(log2.getBlockAtIndex(0).sequence))
    assert(log2.contains(log1.getBlockAtIndex(1).sequence))
    assert(!log1.contains(log2.getBlockAtIndex(2).sequence))
    assert(!log2.contains(log1.getBlockAtIndex(2).sequence))
})

it('can merge logs', (done) => {
    let base = ['data0','data1','data2']

    let log1 = new HashLog(base)
    let log2 = new HashLog(base)
    log1.push('data3')
    setTimeout(() => {
        log2.push('data4')
        setTimeout(() => {
            log2.push('data5')
            setTimeout(() => {
                log1.push('data6')
                log1.merge(log2)
                assert(log1.length == 7)
                assert(log1.tip.value == 'data6')
                assert(log1.getBlockAtIndex(5).value == 'data5')
                assert(log1.getBlockAtIndex(4).value == 'data4')
                assert(log1.getBlockAtIndex(3).value == 'data3')
                assert(log1.getBlockAtIndex(2).value == 'data2')
                assert(log1.getBlockAtIndex(1).value == 'data1')
                assert(log1.getBlockAtIndex(0).value == 'data0')

                log2.merge(log1)
                assert(log2.length == 7)
                assert(log2.tip.value == 'data6')
                assert(log2.getBlockAtIndex(5).value == 'data5')
                assert(log2.getBlockAtIndex(4).value == 'data4')
                assert(log2.getBlockAtIndex(3).value == 'data3')
                assert(log2.getBlockAtIndex(2).value == 'data2')
                assert(log2.getBlockAtIndex(1).value == 'data1')
                assert(log2.getBlockAtIndex(0).value == 'data0')
                done()
            })
        })
    })
})
