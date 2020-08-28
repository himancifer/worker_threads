const { Worker, isMainThread, parentPort, MessageChannel , workerData } = require('worker_threads');

const { port1 : mainPort, port2 : workerPort} = new MessageChannel();
const os = require('os'); 

if(isMainThread){
    const startTime = Date.now();
    console.log(os.cpus().length);
    const workers = [];
    console.log('Main thread');
    
    const numberOfElements = 1_000_000_000;
    const numberOfThreads =  4; //os.cpus().length;
    
    const sharedBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT*numberOfElements);
    const arr = new Int32Array(sharedBuffer);

    let completed = 0;
    
    const numberOfElementsPerThread = Math.ceil(numberOfElements/numberOfThreads);

    while(workers.length < numberOfThreads){
        const start = workers.length * numberOfElementsPerThread;
        const end  = start + numberOfElementsPerThread;
        const worker = new Worker(__filename, {
            workerData : {
                index : workers.length,
                arr,
                start,
                end
            }
        });
        worker.on('message',(message) => {
            if(message.completed)
                completed++;
            if(completed === numberOfThreads){
                console.log("Totally Done");
                console.log(arr);
                const endTime = Date.now();
                console.log((endTime - startTime)/1000,'seconds to complete');
            }
        });
        workers.push(worker);
    }
}

else{
    console.log(workerData.index,workerData.start,workerData.end);
    for(let i = workerData.start;  i < workerData.end ; i++){
        workerData.arr[i] = i + 2;
    }

    parentPort.postMessage({ completed : true }); 
}

