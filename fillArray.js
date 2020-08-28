const { Worker, isMainThread, parentPort , workerData } = require('worker_threads');

const workers = [];

if(isMainThread){
    console.log('Main thread');
    const startTime = Date.now();
    const size = 1_000_000_000;
    // const size = 100000000;
    const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT*size);
    const arr = new Int32Array(sharedBuffer);

    for(let i = 0;  i < size ; i++){
        arr[i] = i + 2;
    }
    const endTime = Date.now();
    console.log((endTime - startTime)/1000, 'seconds to complete');    

    console.log(arr);

    while(workers.length < 4){
        const worker = new Worker(__filename);
        workers.push(worker);
    }
}

else{
    console.log("worker thread");
    
}


console.log('No of worker threads as of now ----> ',workers.length);
