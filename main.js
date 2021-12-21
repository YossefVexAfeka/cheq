import got from 'got';
import es from 'event-stream';
import {StaticPool} from 'node-worker-threads-pool';
import os from 'os';
import {aggregateResult} from './aggregator.js'

const MAX_LINES_PER_WORKER = 1000;

const poolMaker = () => {
    const cpuCount = os.cpus().length;
    const MAX_CONCURRENT = cpuCount * 2 - 1;
    return new StaticPool({
        size: MAX_CONCURRENT,
        task: './matcher.js'
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
            console.log(`File downloaded with ${finalWordsDic['Michael'].length} lines`);
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

const printResult = (finalWordsDic) => {
    const keys = Object.keys(finalWordsDic)
    keys.forEach(key => {
        process.stdout.write(`${key} --> [`);
        for (let i = 0; i < finalWordsDic[key].length; i++) {
            const obj = finalWordsDic[key][i]
            process.stdout.write(`[lineOffset=${obj.lineOffset}, charOffset=${obj.charOffset}]`);
            if (i !== finalWordsDic[key].length - 1) {
                process.stdout.write(`, `);
            }
        }
        process.stdout.write(`]\n`);
    })
}
const stringInTextSearch = async (url, stringToCheck) => {
    const arrToCheck = stringToCheck.split(',');
    const finalWordsDic = await textSearchHandler(url, arrToCheck);
    printResult(finalWordsDic)
    return finalWordsDic
};

const s = `James,John,Robert,Michael,William,David,Richard,Charles,Joseph,Thomas,Christopher,Dani
el,Paul,Mark,Donald,George,Kenneth,Steven,Edward,Brian,Ronald,Anthony,Kevin,Jason,Matt
hew,Gary,Timothy,Jose,Larry,Jeffrey,Frank,Scott,Eric,Stephen,Andrew,Raymond,Gregory,Jo
shua,Jerry,Dennis,Walter,Patrick,Peter,Harold,Douglas,Henry,Carl,Arthur,Ryan,Roger`;

const URL = 'http://norvig.com/big.txt';

stringInTextSearch(URL, s);
