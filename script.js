class Word {
    constructor(wordText = "", ipa = "", syll = 0, freq = 0.0, score = 0) {
        this.wordText = wordText;
        this.ipa = ipa;
        this.freq = freq;
        this.syll = syll;
        this.score = score;
    }
}

/* Word Storage */

let wordList = []
let randomWords = ["gardening", "car repair", "cooking", "crafts", "television", "movies", "computers", "family", "sports", "travel", "birding", "think", "speak"];
let listSize;

/* Word Grid */

const wordGrid = document.querySelector(".word-grid");
// default is viewing word cards as grid
let gridView = true;

// updates word grid w/ current word list depending on whether card view or grid view is selected
function updateWordGrid() {
    if (!gridView && wordGrid != null) {
        document.querySelector(".word-grid").style.cssText = "width:400px;margin:auto;grid-template-columns:400px;grid-gap: 4rem;";
        // document.querySelector(".word-grid__word-card").style.cssText = "width:500px;border: 2px solid #E5E5E5;border-radius: 5px;background-color: #FFF;color: #160000;text-align: center;";
        document.querySelector(".card-view-button").style.cssText = "margin:auto;display:grid;grid-template-columns: repeat(2, 50px);grid-gap: 2px;";
    } else if (gridView && wordGrid != null) {
        document.querySelector(".word-grid").style.cssText = "margin:auto;display: grid;grid-template-columns: repeat(4, 1fr);grid-gap: 2rem;padding: 2rem 4rem 4rem 4rem;";
        // document.querySelector(".word-grid__word-card").style.cssText = "border: 2px solid #E5E5E5;border-radius: 5px;background-color: #FFF;color: #160000;text-align: center;";
        document.querySelector(".card-view-button").style.cssText = "display:grid;grid-template-columns: repeat(2, 50px);grid-gap: 2px;margin-left: 85%;width:fit-content;vertical-align: middle;";
    }
    resetGrid();
    for (let i = 0; i < listSize - 10; i++) {
        if (wordList[i] === undefined) {
            break;
        }
        createWordCard(wordList[i]);
    }
}

// clears contents of grid
function resetGrid() {
    wordGrid.innerHTML = "";
}

// creates individual word cards for grid
function createWordCard(word) {
    const wordCard = document.createElement("div");
    const text = document.createElement("h2");
    const removeButton = document.createElement("button");

    wordCard.classList.add("word-grid__word-card");
    text.classList.add("word-grid__word-text");
    removeButton.classList.add("button");
    removeButton.classList.add("js-remove-button");
    removeButton.onclick = removeWord;

    text.textContent = word.wordText;
    removeButton.textContent = 'x';

    wordCard.appendChild(removeButton);
    wordCard.appendChild(text);
    wordGrid.appendChild(wordCard);
}

// removes word from grid
let removeWord = function (e) {
    let targetWord = e.target.parentNode.childNodes[1].textContent;
    console.log(targetWord);
    let ind = getIndex(targetWord);
    console.log(ind);
    wordList.splice(ind, 1);
    updateWordGrid();
}

// gets index of input word in wordList
function getIndex(targetWord) {
    for (let i = 0; i < wordList.length; i++) {
        if (wordList[i].wordText === targetWord) {
            return i;
        }
    }
}

/* Search */

// if search page, listens for search click and calls api
if (document.getElementById("search-click") != null) {
    const searchForm = document.getElementById("search-click");
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        let word = searchForm.elements["word"].value;
        // use random word if topic not specified
        if (word === "" || word === null) {
            word = randomWords[Math.floor(Math.random() * randomWords.length)];
        }
        let sound = searchForm.elements["sound"].value;
        let syll = searchForm.elements["syll"].value;
        let max = searchForm.elements["max"].value;

        searchWords(`?word=${word}&sound=${sound}&syll=${syll}&max=${max}`);
    })
}

// returns list of words from local server from most recent search and updates the word grid
async function getWords() {
    fetch(`http://localhost:3000/search-results`)
        .then(response => response.json())
        .then(function (data) {
            wordList = [];
            for (let word of data) {
                wordList.push(new Word(word.word, word.tags.ipa_pron, word.numSyllables, word.tags.f, word.score))
            };
            listSize = wordList.length;
            updateWordGrid();
        });
}

// sends search parameters to local server
async function searchWords(qs) {
    fetch(`http://localhost:3000/search/${qs}`)
        .then(async function (response) {
            window.location.href = '/search-results.html'
        });
}


/* Word Grid Setup */

// gets list of words from most recent search
if (wordGrid != null) {
    getWords();
}

// search buttons used to set whether grid or card view
const gridViewButton = document.getElementById("grid-view");
const cardViewButton = document.getElementById("card-view");
if (gridViewButton != null) {
    gridViewButton.addEventListener("click", function() {
        gridView = true;
        updateWordGrid();
    })
    cardViewButton.addEventListener("click", function() {
        gridView = false;
        updateWordGrid();
    })
}


/* Download Button */

// sends current wordList to server, then downloads file returned as response
// (PDF of word list)
async function sendWords(data) {
    fetch("http://localhost:3000/post-list", {
        method: "POST",
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    }).then(window.open("http://localhost:3000/download-results"));
}

// download button listens for click to initiate sending current list to server
if (document.getElementById("download-button") != null) {
    const downloadButton = document.getElementById("download-button");
    downloadButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.returnValue = '';
        sendWords(wordList)
    })
}
