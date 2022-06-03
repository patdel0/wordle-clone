import randomWord from "./randomWord.js";

console.log("random word:", randomWord);

const body = document.querySelector("body");
const wordsDiv = document.querySelector(".words");

// Game settings
const WORD_LENGTH = 5;
const NUM_OF_ATTEMPTS = 6;
let isGameWon = false;

// Board creation
class Word {
  constructor() {
    this.word = "";
    this.container = document.createElement("div");
    this.container.classList.add("words__word");
  }

  create() {
    for (let i = 0; i < WORD_LENGTH; i++) {
      const newLetter = document.createElement("li");
      newLetter.classList.add("letter-container");
      this.container.append(newLetter);
    }
    wordsDiv.append(this.container);
    this.addEventListeners();
  }

  update() {
    const letterNodeList = this.container.querySelectorAll(".letter-container");
    letterNodeList.forEach((letter) => (letter.innerHTML = ""));
    for (let letterIndex = 0; letterIndex < this.word.length; letterIndex++) {
      letterNodeList[
        letterIndex
      ].innerHTML = `<p class='letter'>${this.word[letterIndex]}</p>`;
    }
  }

  validate() {
    const letterNodeList = this.container.querySelectorAll(".letter-container");
    letterNodeList.forEach((letter, index) => {
      const letterInnerText = letter.innerText.toLowerCase();

      if (letterInnerText === randomWord[index])
        return letter.classList.add("letter-container--correct");
      if (randomWord.includes(letterInnerText))
        return letter.classList.add("letter-container--out-of-order");
      letter.classList.add("letter-container--not-present");
    });
  }

  addEventListeners() {}
}

const wordsArr = new Array(NUM_OF_ATTEMPTS).fill("").map((item) => new Word());
wordsArr.forEach((word) => word.create());

// Word validation
let currentWordIndex = 0;
highlightWordRow();

async function isWordInDictionary(word) {
  body.style = "cursor: wait !important";
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

// Keyboard input
document.addEventListener("keydown", runGame);

async function runGame({ keyCode, key }) {
  const wordObj = wordsArr[currentWordIndex];
  const word = wordObj.word;
  const isKeyValid =
    keyCode == 13 || // Return/Enter
    keyCode == 8 || // Backspace
    (keyCode > 64 && keyCode < 91); // Letters range
  const isWithinRange = word.length < WORD_LENGTH;
  const isGameOver = currentWordIndex > NUM_OF_ATTEMPTS;
  if (isGameOver) return;
  if (isGameWon) return;

  if (key === "Enter") {
    if (isWithinRange) return createNotification("Too short");
    if (!(await isWordInDictionary(word)))
      return createNotification("Not in wordlist");
    {
      currentWordIndex++;
      wordObj.validate();
      highlightWordRow();
      if (word === randomWord) {
        isGameWon = true;
        createNotification(
          `You won! The word was "${randomWord.toUpperCase()}"`
        );
      }
      return;
    }
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

function highlightWordRow() {
  const letterNodeList =
    wordsArr[currentWordIndex].container.querySelectorAll(".letter-container");
  letterNodeList.forEach((item) =>
    item.classList.add("letter-container--active")
  );
}

class KeyboardKey {
  constructor({ value, parentRow }) {
    this.value = value;
    this.parentRow = parentRow;
    this.container = document.createElement("span");
  }
  create() {
    const row = document.querySelector(`#keyboard__${this.parentRow}`);
    this.container.classList.add("keyboard__key");
    this.container.innerText =
      this.value === "Backspace"
        ? "⌫"
        : this.value === "Enter"
        ? "⏎"
        : this.value;
    this.container.id = this.value.toLowerCase();
    row.append(this.container);
    this.addEventListeners();
  }

  addEventListeners() {
    this.container.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick() {
    // 69 used as it's within range of alphabet. Seeing that only valid key values are provided in the virtual keyboard, the validation of input in rungame is not required.
    runGame({ keyCode: 69, key: this.value });
  }
}

const keyboard = [];
const keyboardKeysArr = "qwertyuiop'asdfghjkl'zxcvbnm"
  .split("")
  .concat("Enter", "Backspace");
const rowClassList = {
  0: "first-row",
  1: "second-row",
  2: "third-row",
};
let rowIndex = 0;
keyboardKeysArr.forEach((value, index) => {
  if (value === "'") return rowIndex++;
  keyboard.push(new KeyboardKey({ value, parentRow: rowClassList[rowIndex] }));
  keyboard[keyboard.length - 1].create();
});
