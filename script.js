class Word {
    constructor(wordText = "", ipa = "", syll = 0, freq = 0.0, score = 0) {
        this.wordText = wordText;
        this.ipa = ipa;
        this.freq = freq;
        this.syll = syll; 
        this.score = score;
    }
}

// Word array

let wordList = [new Word("lorem"), new Word("ipsum"), new Word("dolor"), new Word("sit"), new Word("amet")];


// Word Grid

const wordGrid = document.querySelector(".word-grid");
updateWordGrid();

function updateWordGrid() {
    resetGrid();
    for (let word of wordList) {
        createWordCard(word);
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

    text.textContent = word.wordText;
    
    wordCard.appendChild(text);
    wordGrid.appendChild(wordCard);
}

