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

app.get('/search/*', cors(), async (req, res) => {
  search = req.query;
  word = req.query.word;
  sound = req.query.sound;
  syll = req.query.syll;
  max = req.query.max;
  wordArray = [];
  res.send(word + sound + syll + max);
}) 

app.get('/search-results', cors(), async (req, res) => {
  let wordArray = [];
  console.log(word + sound + syll + max);
  getRelatedWords(word, wordArray).then(function(result) {
    wordArray = returnWordList(wordArray, sound, syll, max);
    console.log(wordArray);
    res.json(wordArray);
  })
})


async function getRelatedWords(word, wordArray) {

  let response = await datamuse.request('words?ml=' + word + '&md=srf&ipa=1&max=150');
  for (let word of response) {
      wordArray.push(word);
  }
}

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

    // relatedWords.sort(function(a, b) {
    //     return parseFloat(b.tags.f) - parseFloat(a.tags.f);
    // })
    
    // filter based on inputs
    for (let word of relatedWords) {

      if (count >= max) {
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

    return modifiedList;

}

// let myArray = []
// getRelatedWords('flower', myArray).then(function(result) {
//   console.log(returnWordList(myArray, null, null, 20));
// });

// const axios = require('axios');
// const res = axios.get('http://localhost:5500/?word=gardening&sound=s&syll=null&max=10');

// res.data;

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
