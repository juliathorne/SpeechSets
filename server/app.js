const datamuse = require('datamuse');
const express = require('express');
const cors = require('cors');
const path = require('path');
const PDFdocument = require('pdfkit');
const fs = require('fs');
const port = 3000;

var app = express();
app.use(express.json());
app.use(cors());

/* Storage for user searches */
var search;
var word;
var sound;
var syll;
var max;
var maxPlus;
var wordArray = [];
var userList = [];

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
  wordArray = [];
  getRelatedWords(word, wordArray).then(function(result) {
    wordArray = returnWordList(wordArray, sound, syll, max);
    res.json(wordArray);
  })
})

/* Save new modified word list from client to wordArray */
app.post('/post-list', cors(), async (req, res) => {
  userList = req.body;
  res.json(userList);
})

/* Download PDF of word list */
app.get('/download-results', cors(), async (req, res) => {
  var pdfDoc = new PDFdocument;
  var stream = fs.createWriteStream('SpeechSet.pdf')
  var count = 1;
  pdfDoc.pipe(stream);
  pdfDoc.fontSize(20);
  pdfDoc.lineGap(20);
  for (let word of userList) {
    if (count > max) {
      break;
    }
    pdfDoc.text(word.wordText);
    count++;
  }
  pdfDoc.end();
  stream.on("close", () => {
    let file = path.resolve('SpeechSet.pdf');
    res.download(file, 'SpeechSet.pdf', function(err){
    })
  })
  
})

/* Gets basic list of related words */
async function getRelatedWords(word, wordArray) {

  let response = await datamuse.request('words?ml=' + word + '&md=srf&ipa=1&max=1000');
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
    maxPlus = parseInt(max) + 10;


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
