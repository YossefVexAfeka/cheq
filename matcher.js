
const matcher = ({linesArr, linesCounter, stringToCheck}) => {
    try {
        // if(p){
        //     console.log(p)
        // }
        const finalArr = {};
        for (let lineNumber = 0; lineNumber < linesArr.length; lineNumber++) {
            stringToCheck.forEach((word) => {
                const regex = new RegExp(`${word}`, 'gmi');
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
                    finalArr[word].push(...indices);
                }
            });
        }
        return finalArr;
    } catch (e) {
        console.log(e);
    }
};

export {matcher}