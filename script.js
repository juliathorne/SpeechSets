class Word {
    constructor(wordText = "", ipa = "", syll = 0, freq = 0.0, score = 0) {
        this.wordText = wordText;
        this.ipa = ipa;
        this.freq = freq;
        this.syll = syll; 
        this.score = score;
    }
}

// Word arrays

let wordList = []
let randomWords = ["gardening", "car repair", "cooking", "crafts", "television", "movies", "computers", "family", "sports", "travel"];
let listSize;

// Word Grid

const wordGrid = document.querySelector(".word-grid");

//updateWordGrid();

function updateWordGrid() {
    resetGrid();
    for (let i = 0; i < listSize - 10; i++) {
        if (wordList[i] === undefined) {
            break;
        }
        createWordCard(wordList[i]);
    }
}

function resetGrid() {
    wordGrid.innerHTML = "";
}

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

let removeWord = function(e) {
    let targetWord = e.target.parentNode.childNodes[1].textContent;
    console.log(targetWord);
    let ind = getIndex(targetWord);
    console.log(ind);
    wordList.splice(ind, 1);
    console.log(wordList);
    updateWordGrid();
}

function getIndex(targetWord) {
    for (let i = 0; i < wordList.length; i++) {
        if (wordList[i].wordText === targetWord) {
            return i;
        }
    }
}

/* Search on search page */
if (document.getElementById("search-click") != null) {

    const searchForm = document.getElementById("search-click");
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        let word = searchForm.elements["word"].value;
        if (word === "" || word === null) {
            word = randomWords[Math.floor(Math.random() * randomWords.length)];
        }
        let sound = searchForm.elements["sound"].value;
        let syll = searchForm.elements["syll"].value;
        let max = searchForm.elements["max"].value;
        
        searchWords(`?word=${word}&sound=${sound}&syll=${syll}&max=${max}`);
    })
}

async function getWords() {
    fetch(`http://localhost:3000/search-results`)
    .then(response => response.json())
    .then(function(data) {
        wordList = [];
        for (let word of data) {
            wordList.push(new Word(word.word, word.tags.ipa_pron, word.numSyllables, word.tags.f, word.score))
        };
        listSize = wordList.length;
        updateWordGrid();
    });
}

async function searchWords(qs) {
    fetch(`http://localhost:3000/search/${qs}`)
    .then(async function(response) {
        console.log(await response.text())
        window.location.href = '/search-results.html'
    });
}

if (wordGrid != null) {
    getWords();
    console.log(wordList);
}