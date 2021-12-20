import got from 'got';
import es from 'event-stream';
import { StaticPool } from 'node-worker-threads-pool';
import os from 'os';

const poolMaker = () => {
	const cpuCount = os.cpus().length;
	const MAX_CONCURRENT = cpuCount * 2 - 1;
	return new StaticPool({
		size: MAX_CONCURRENT,
		task: './matcher.js'
	});
};

const textSearchHandler = (url, stringToCheck) => {
	const MAX_LINES_PER_WORKER = 1000;
	const downloadStream = got.stream(url);
	const pool = poolMaker();
	let linesArr = [];
	let linesCounter = 0;

	downloadStream
		.pipe(es.split())
		.pipe(
			es
				.mapSync(function (line) {
					linesArr.push(line);
					linesCounter++;
					if (linesCounter % MAX_LINES_PER_WORKER == 0) {
						pool.exec({ linesArr, linesCounter, stringToCheck }).then(({ linesCounter }) => {
							// console.log(`FINISHED: ${linesCounter}`);
						});
						linesArr = [];
					}
				})
				.on('end', () => {
					console.log(`File downloaded to ${linesCounter}`);
				})
		)
		.on('end', () => {
			console.log('finished!');
			return;
		});
};

const stringInTextSearch = async (url, stringToCheck) => {
	const arrToCheck = stringToCheck.split(',');
	const result = textSearchHandler(url, arrToCheck);
	console.log(result);
};
const s = `James,John,Robert,Michael,William,David,Richard,Charles,Joseph,Thomas,Christopher,Dani
el,Paul,Mark,Donald,George,Kenneth,Steven,Edward,Brian,Ronald,Anthony,Kevin,Jason,Matt
hew,Gary,Timothy,Jose,Larry,Jeffrey,Frank,Scott,Eric,Stephen,Andrew,Raymond,Gregory,Jo
shua,Jerry,Dennis,Walter,Patrick,Peter,Harold,Douglas,Henry,Carl,Arthur,Ryan,Roger`;
const URL = 'http://norvig.com/big.txt';
stringInTextSearch(URL, s);
// const rl = readline.createInterface(got.stream(URL), process.stdout)
// rl.on('line', line=>{
// 	lines++;
// 	str += `${line} -- ***${lines}`
// 	if(lines===1000){
// 		rl.pause();
// 		console.log(str)
// 		str = ''
// 		console.log('----------------------------------------------------------------------');
// 		lines = 0;
// 		rl.resume();
// 	}

// });
// rl.on('close',()=>{
// 	// console.log('lines', lines);
// })
