'use strict';
const {
    Worker, isMainThread , parentPort , workerData 
} = require('worker_threads');

const min = 2;
let primes = [];
function generatePrimes(start,range) {
    let isPrime  = true;
    let end = start + range;
    for(let i = start; i< end; i++ ){
        for(let j = min ; j <= Math.sqrt(i) ; j++){
            if(i !== j && i%j === 0){
                isPrime  = false;
                break;
            }
        }
        if(isPrime)
            primes.push(i);
        
        isPrime = true;
    }
}

if(isMainThread){
    console.log(`In main thread`);
    const max  = 1e2;
    const availableThreads = process.argv[2] || 2;
    const workers = new Set();
    console.log(`Exploiting your ${availableThreads} threads.... `);
    const range  = Math.ceil((max-min)/availableThreads);
    let start = min;
    for(let i = 0; i < availableThreads - 1; i++){
        const startWith = start;
        workers.add(new Worker(__filename,
            {
                workerData : {
                    workerNo : i+1,
                    start : startWith,
                    range
                }
            }));

            start += range;
    }

    workers.add(new Worker(__filename,{
        workerData : {
            workerNo : availableThreads,
            start,
            range : range + ((max - min + 1) % availableThreads)
        }
    }));

    for(let worker of workers){
        worker.on('error',(err) =>{
            throw err;
        });
        worker.on('exit',() =>{
            workers.delete(worker);
            // console.log(worker);
            console.log(`exiting ......`);
            if(workers.size === 0){
                console.log(primes.join('\n'));
            }
        });

        worker.on('message',(msg) => {
            primes = primes.concat(msg);
        });
    }
}
else{
    console.log(`Worker ${workerData.workerNo} running ......`);
    generatePrimes(workerData.start,workerData.range);
    parentPort.postMessage(primes);
}




//credits to Rich Trott
