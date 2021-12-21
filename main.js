import got from 'got';
import es from 'event-stream';
import {StaticPool} from 'node-worker-threads-pool';
import os from 'os';
import {aggregateResult} from './aggregator.js'
import {matcher} from './matcher.js'

const MAX_LINES_PER_WORKER = 1000;

const poolMaker = () => {
    const cpuCount = os.cpus().length;
    const MAX_CONCURRENT = cpuCount * 2 - 1;
    return new StaticPool({
        size: MAX_CONCURRENT,
        task: './child.js'
    });
};

const textSearchPoolHandler = async (es, stringToCheck, finalWordsDic) => {
    const pool = poolMaker();
    let linesArr = [];
    let linesCounter = 0;
    const result = es
        .mapSync(async (line) => {
            linesArr.push(line);
            linesCounter++;
            if (linesCounter % MAX_LINES_PER_WORKER == 0) {
                pool.exec({linesArr, linesCounter, stringToCheck}).then(({wordsResultObj}) => {
                    aggregateResult(finalWordsDic, wordsResultObj)
                });
                linesArr = [];
            }
        })
        .on('end', async () => {
            /** this is for the last round which < 1000 lines */
            const wordsResultObj = matcher({linesArr, linesCounter, stringToCheck});
            aggregateResult(finalWordsDic, wordsResultObj)
        })
    return result
}
const textSearchHandler = async (url, stringToCheck) => {
    const downloadStream = got.stream(url);
    const finalWordsDic = {};
    await new Promise(async (resolve, reject) => {
        downloadStream
            .pipe(es.split())
            .pipe(await textSearchPoolHandler(es, stringToCheck, finalWordsDic, downloadStream))
            .on('end', () => {
                downloadStream.destroy();
                resolve();
            });
    });
    return finalWordsDic;
};

const stringInTextSearch = async (url, stringToCheck) => {
    return await new Promise(async (resolve, reject)=>{
        const arrToCheck = stringToCheck.split(',');
        const finalWordsDic = await textSearchHandler(url, arrToCheck);
        resolve(finalWordsDic);
    })

};

export {stringInTextSearch}
