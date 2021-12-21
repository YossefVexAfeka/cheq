import {parentPort} from 'worker_threads';
import {matcher} from './matcher.js'

parentPort.on('message', async ({linesArr, linesCounter, stringToCheck}) => {
    const wordsResultObj = matcher({linesArr, linesCounter, stringToCheck});
    parentPort.postMessage({wordsResultObj});
});
