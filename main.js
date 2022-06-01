// Global DOM containers
const body = document.querySelector("body");

// Game settings
const WORD_LENGTH = 5;
const NUM_OF_ATTEMPTS = 6;

class Word {
  constructor() {
    this.word = "";
    this.container = document.createElement("div");
    this.container.classList.add("words__word");
  }

  create() {
    for (let letterIndex = 0; letterIndex < WORD_LENGTH; letterIndex++) {
      const newLetter = document.createElement("li");
      newLetter.classList.add("words__letter-container");
      this.container.append(newLetter);
    }
    wordsDiv.append(this.container);
    this.addEventListeners();
  }
  update() {
    const letterNodeList = this.container.querySelectorAll(
      ".words__letter-container"
    );
    letterNodeList.forEach((letter) => (letter.innerHTML = ""));
    for (let letterIndex = 0; letterIndex < this.word.length; letterIndex++) {
      letterNodeList[
        letterIndex
      ].innerHTML = `<p class='words__letter'>${this.word[letterIndex]}</p>`;
    }
  }

  addEventListeners() {}
}

async function isWordInDictionary(word) {
  body.style.cursor = "wait";
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();
    body.style.cursor = "default";
    return data.title !== "No Definitions Found";
  } catch (error) {
    console.error(`Error found ${e}`);
  }
}

// Board creation
const wordsDiv = document.querySelector(".words");
const wordsList = new Array(NUM_OF_ATTEMPTS).fill("").map((item) => new Word());
wordsList.forEach((word) => word.create());

// Word validation
let currentWordIndex = 0;
applyStylingToCurrentWord();

// Keyboard input
document.addEventListener("keydown", handleKeydown);

async function handleKeydown({ keyCode, key }) {
  const wordObj = wordsList[currentWordIndex];
  const word = wordObj.word;
  const isKeyValid =
    keyCode == 13 || // Return/Enter
    keyCode == 8 || //Tab
    (keyCode > 64 && keyCode < 91); // Letters range
  const isWithinRange = word.length < WORD_LENGTH;

  if (key === "Enter") {
    if (isWithinRange) return createNotification("Too short");
    if (await isWordInDictionary(word)) {
      currentWordIndex++;
      if (currentWordIndex < NUM_OF_ATTEMPTS)
        return applyStylingToCurrentWord();
      return;
    }
    createNotification("Not in wordlist");
    return;
  }

  if (key === "Backspace") {
    wordObj.word = wordObj.word.slice(0, -1);
    wordObj.update();
    return;
  }

  if (!isKeyValid || !isWithinRange) return;

  wordObj.word += key;
  wordObj.update();
}

function createNotification(text) {
  const notificationsWrapper = document.querySelector(".notifications");
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerText = text;
  notificationsWrapper.append(notification);
  setTimeout(() => notification.remove(), 3000);
}

function applyStylingToCurrentWord() {
  wordsList[currentWordIndex].container.classList.add("words__word--active");
}
