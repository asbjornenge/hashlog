import randomstring from 'randomstring'
import HashLog from '../hashlog'

let commondata = []
let log1data = []
let log2data = []
console.time('mock')
for (var i=0; i<250000; i++) {
    commondata.push(Math.random().toString(36).substring(7))
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
console.time('merge')
log1.merge(log2)
console.timeEnd('merge')
