import HashLog      from '../hashlog'
import { merge }    from '../utils'

let commondata = []
let log1data = []
let log2data = []
console.time('mock')
for (var i=0; i<1000000; i++) {
    commondata.push(Math.random().toString(36).substring(7))
}
for (var i=0; i<25000; i++) {
    log1data.push(Math.random().toString(36).substring(7))
    log2data.push(Math.random().toString(36).substring(7))
}
console.timeEnd('mock')
console.time('init')
let log1 = new HashLog(commondata)
let log2 = new HashLog(commondata)
console.timeEnd('init')
console.time('push')
log1data.forEach(data => log1.push(data))
log2data.forEach(data => log2.push(data))
console.timeEnd('push')
console.time('merge1')
merge(log1, log2)
console.timeEnd('merge1')
console.time('merge2')
merge(log2, log1)
console.timeEnd('merge2')

console.log(log1.tip.chainhash, log1.length, log1.blocks[log1.tip.chainhash].value)
console.log(log2.tip.chainhash, log2.length, log2.blocks[log2.tip.chainhash].value)

console.log(log1.getBlockAtIndex(1020000))
console.log(log2.getBlockAtIndex(1020000))
console.log(log1.getBlockAtIndex(1020001))
console.log(log2.getBlockAtIndex(1020001))
