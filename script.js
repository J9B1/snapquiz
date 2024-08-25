let playableCards = [];
let currentCardIndex = 0;
let shownCardIndices = [];
let correctCount = 0;
let wrongCount = 0;
let isHardMode = false;

async function fetchCards() {
    try {
        const response = await fetch('https://j9b1.github.io/snapquiz/PlayableCards.json');
        playableCards = await response.json();
        shuffleArray(playableCards);
        startQuiz();
    } catch (error) {
        console.error("Failed to load cards data:", error);
    }
}

function startQuiz() {
    loadCard();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadCard() {
    const imgElement = document.getElementById('card-image');
    const descriptionElement = document.getElementById('card-description');
    const resultElement = document.getElementById('result');
    const nextButton = document.getElementById('next-button');
    const choicesContainer = document.getElementById('choices');
    const cardArtContainer = document.getElementById('card-art');

    if (playableCards.length === 0) {
        resultElement.textContent = 'No cards available.';
        return;
    }

    if (shownCardIndices.length === playableCards.length) {
        resultElement.textContent = 'All cards have been shown.';
        return;
    }

    let cardData;
    do {
        cardData = playableCards[currentCardIndex];
        currentCardIndex = (currentCardIndex + 1) % playableCards.length;
    } while (shownCardIndices.includes(playableCards.indexOf(cardData)) && shownCardIndices.length < playableCards.length);

    if (shownCardIndices.length === playableCards.length) {
        resultElement.textContent = 'No more unique cards.';
        return;
    }

    shownCardIndices.push(playableCards.indexOf(cardData));

    if (isHardMode) {
        imgElement.style.display = "none";
        descriptionElement.style.display = "block";
        cardArtContainer.style.height = "auto";
        descriptionElement.innerHTML = formatDescription(cardData.ability || cardData.flavor || "No description available.");
    } else {
        imgElement.classList.remove('full');
        imgElement.src = cardData.art;
        imgElement.style.display = "block";
        imgElement.style.filter = "blur(10px)";
        cardArtContainer.style.height = "300px";
        descriptionElement.style.display = "none";
    }

    resultElement.textContent = '';
    nextButton.style.display = 'none';
    choicesContainer.innerHTML = '';

    const correctAnswer = cardData.name;
    let choices = [correctAnswer];

    while (choices.length < 4) {
        const randomIndex = Math.floor(Math.random() * playableCards.length);
        const randomChoice = playableCards[randomIndex].name;
        if (!choices.includes(randomChoice)) {
            choices.push(randomChoice);
        }
    }

    shuffleArray(choices);

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.classList.add('choice-button');
        button.onclick = () => checkAnswer(choice, correctAnswer, button);
        choicesContainer.appendChild(button);
    });

    updateScoreSummary();
}

function checkAnswer(selected, correct, button) {
    const resultElement = document.getElementById('result');
    const nextButton = document.getElementById('next-button');
    const imgElement = document.getElementById('card-image');
    const successSound = document.getElementById('success-sound');
    const wrongSound = document.getElementById('wrong-sound');

    if (selected === correct) {
        successSound.currentTime = 0;
        successSound.play();
        if (!isHardMode) {
            imgElement.style.filter = "none";
            imgElement.classList.add('full');
        }
        button.classList.add('correct');
        disableAllButtons();
        nextButton.style.display = 'block';
        correctCount++;
    } else {
        wrongSound.currentTime = 0;
        wrongSound.play();
        button.classList.add('disabled');
        button.disabled = true;
        wrongCount++;
    }

    updateScoreSummary();
}

function formatDescription(description) {
    return description.replace(/<span>/g, '<strong>').replace(/<\/span>/g, '</strong>');
}

function disableAllButtons() {
    const buttons = document.querySelectorAll('.choice-button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

function updateScoreSummary() {
    const correctCountElement = document.getElementById('correct-count');
    const wrongCountElement = document.getElementById('wrong-count');
    
    correctCountElement.textContent = correctCount;
    wrongCountElement.textContent = wrongCount;
}

document.getElementById('next-button').onclick = () => {
    loadCard();
};

function initializeScoreSummary() {
    const scoreSummary = document.getElementById('score-summary');
    scoreSummary.innerHTML = `
        <div class="score-item correct-score">
            <span id="correct-count">0</span>
        </div>
        <div class="score-item wrong-score">
            <span id="wrong-count">0</span>
        </div>
    `;
}

function setupModeToggle() {
    const modeToggle = document.getElementById('mode-toggle');
    modeToggle.addEventListener('change', () => {
        isHardMode = modeToggle.checked;
        loadCard();
    });
}

initializeScoreSummary();
fetchCards();
setupModeToggle();
