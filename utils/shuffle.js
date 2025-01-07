export function shuffle(length) {
   let array = Array.from({ length }, (_, i) => i);
   for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
}


export function createRandomizedQuestionsSets(countQuestions, countSests) {
   return Array.from({ length: countSests }, () => shuffle(countQuestions))
}

