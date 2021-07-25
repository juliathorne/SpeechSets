const datamuse = require('datamuse');
const express = require('express');
const cors = require('cors');
const port = 3000;

var app = express();

var search;
let word;
let sound;
let syll;
let max;
let wordArray = [];

/* Set search variables based on inputs */
app.get('/search/*', cors(), async (req, res) => {
  search = req.query;
  word = req.query.word;
  sound = req.query.sound;
  syll = req.query.syll;
  max = req.query.max;
  wordArray = [];
  res.send(word + sound + syll + max);
}) 

/* Return filtered word list for search results */
app.get('/search-results', cors(), async (req, res) => {
  let wordArray = [];
  console.log(word + sound + syll + max);
  getRelatedWords(word, wordArray).then(function(result) {
    wordArray = returnWordList(wordArray, sound, syll, max);
    // console.log(wordArray);
    res.json(wordArray);
  })
})

/* Gets basic list of related words */
async function getRelatedWords(word, wordArray) {

  let response = await datamuse.request('words?ml=' + word + '&md=srf&ipa=1&max=150');
  for (let word of response) {
      wordArray.push(word);
  }
}

/* Returns word list filtered based on inputs */
function returnWordList(relatedWords, sound, syllables, max) {

    count = 0;

    // modified list to return
    let modifiedList = [];

    // convert tag strings to objects
    for (let word of relatedWords) {
      let tags = word.tags;
      let entries = tags.map(pair => pair.split(":"));
      const result = Object.fromEntries(entries);
      tags = result;
      word.tags = tags;
    }
    
    // return 10 words beyond max so that user can delete/replace words
    let maxPlus = parseInt(max) + 10;
    console.log(maxPlus);

    // filter based on inputs
    for (let word of relatedWords) {
      
      if (count >= maxPlus) {
        break;
      }

      if (sound != "" && word.tags.ipa_pron != "") {
        if (!word.tags.ipa_pron.includes(sound)) {
          continue;
        }
      }

      if (syllables != "" && word.numSyllables != "") {
        if (word.numSyllables != syllables) {
          continue;
        }
      }

      modifiedList.push(word);
      count++;

    }
    // console.log(modifiedList);
    return modifiedList;

}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
