const aggregateResult = (finalResultObj, tempResultObj) => {
    const wordsArray = Object.keys(tempResultObj);
    wordsArray.forEach(word => {
        if (!finalResultObj[word]) {
            finalResultObj[word] = [];
        }
        finalResultObj[word].push(...tempResultObj[word])
    })
}

export {aggregateResult}