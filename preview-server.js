const proxy = require('express-http-proxy');
const app = require('express')();

const { doSync } = require('./sync-contentful');

let syncQueue = 0;
const forwardToGatsby = () => {
    syncQueue++;
    return 'http://localhost:8000';
}

function startSyncQueueWorker() {
    setInterval(async () => {
        if (syncQueue > 0) {
            await doSync(true);
            syncQueue--;
        }
        if (syncQueue > 3) syncQueue = 0;
    }, 5000);
}

app.use('/', proxy(forwardToGatsby));

app.listen(3000, () => {
    startSyncQueueWorker();
    console.log('preview-sever listening on port 3000')
})