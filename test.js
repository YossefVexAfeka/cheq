import {stringInTextSearch} from "./main.js";

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

const s = `James,John,Robert,Michael,William,David,Richard,Charles,Joseph,Thomas,Christopher,Dani
el,Paul,Mark,Donald,George,Kenneth,Steven,Edward,Brian,Ronald,Anthony,Kevin,Jason,Matt
hew,Gary,Timothy,Jose,Larry,Jeffrey,Frank,Scott,Eric,Stephen,Andrew,Raymond,Gregory,Jo
shua,Jerry,Dennis,Walter,Patrick,Peter,Harold,Douglas,Henry,Carl,Arthur,Ryan,Roger`;
const URL = 'http://norvig.com/big.txt';

const result = await stringInTextSearch(URL, s);
printResult(result)
