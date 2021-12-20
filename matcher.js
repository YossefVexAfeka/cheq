import { parentPort } from 'worker_threads';
import fs from 'fs';
import readline from 'readline';
import events from 'events';

parentPort.on('message', async ({ linesArr, linesCounter, stringToCheck }) => {
	if (linesCounter === 1000) {
		const wordsResultObj = matcher({ linesArr, linesCounter, stringToCheck });
        parentPort.postMessage({ wordsResultObj });
    }
});

const matcher = ({ linesArr, linesCounter, stringToCheck }) => {
	try {
		const finalArr = {};
		for (let lineNumber = 0; lineNumber < linesArr.length; lineNumber++) {
			stringToCheck.forEach((word) => {
				const regex = new RegExp(`${word}`, 'gi');
				const indices = [];
				let result;
				while ((result = regex.exec(linesArr[lineNumber]))) {
					const res = {
						lineOffset: lineNumber + linesCounter - 1000,
						charOffset: result.index
					};
					indices.push(res);
				}
				if (indices.length) {
					if (!finalArr[word]) {
						finalArr[word] = [];
					}
					finalArr[word] = indices;
				}
			});
		}
		return finalArr;
	} catch (e) {
		console.log(333333333333333333);
	}
};
