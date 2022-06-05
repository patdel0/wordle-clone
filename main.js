import randomWord from "./randomWord.js";

console.log("winning word:", randomWord);

const bodyEl = document.querySelector("body");

// o---------------o
// | Game settings |
// o---------------o

const WORD_LENGTH = 5;
const NUM_OF_ATTEMPTS = 6;
let isGameWon = false;

class Word {
  constructor(parent) {
    this.word = "";
    this.parent = parent;
    this.container = document.createElement("div");
    this.container.classList.add("word");
  }

  createWordRow() {
    this.createLetters();
    this.parent.append(this.container);
  }

  createLetters() {
    for (let i = 0; i < WORD_LENGTH; i++) {
      createNewDOMElement({
        tag: "div",
        className: "letter-container",
        parent: this.container,
      });
    }
  }

  update() {
    const letterNodeList = this.container.querySelectorAll(".letter-container");
    const wordArr = Array.from(this.word);

    // Emptying the innerHTML of the nodeList items allows us to replace the current with new content
    emptyNodeListInnerHTML(letterNodeList);

    wordArr.forEach((letter, index) => {
      const newLetterEl = createNewDOMElement({
        tag: "p",
        className: "letter",
        text: letter,
      });

      letterNodeList[index].append(newLetterEl);
    });
  }
}
const wordsDiv = document.querySelector(".words-container");
const wordsRowsArr = new Array(NUM_OF_ATTEMPTS)
  .fill("")
  .map((item) => new Word(wordsDiv));
let currentWordRowIndex = 0;

wordsRowsArr.forEach((word) => word.createWordRow());

highlightCurrentWordRow();

function highlightCurrentWordRow() {
  const letterNodeList =
    wordsRowsArr[currentWordRowIndex].container.querySelectorAll(
      ".letter-container"
    );
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
    const keyCodeInAlphabetRange = 69; // Arbitrary MEME number chosen. As long as it's within the alphabet keycode range, it will work.
    runGame({ keyCode: keyCodeInAlphabetRange, key: this.value });
  }
}

const keyboard = [];
const keyboardKeysArr = Array.from("qwertyuiop'asdfghjkl'zxcvbnm").concat(
  "Enter",
  "Backspace"
);
const keyboardRowsClassList = ["first-row", "second-row", "third-row"];
let keyboardRowIndex = 0;

keyboardKeysArr.forEach((value, index) => {
  if (value === "'") return keyboardRowIndex++;

  keyboard.push(
    new KeyboardKey({
      value,
      parentRow: keyboardRowsClassList[keyboardRowIndex],
    })
  );

  const currentKeyIndex = keyboard.length - 1;
  keyboard[currentKeyIndex].create();
});

// Keyboard input
document.addEventListener("keydown", runGame);

function runGame({ keyCode, key }) {
  const wordObj = wordsRowsArr[currentWordRowIndex];
  const isWordShort = wordObj.word.length < WORD_LENGTH;
  const isGameOver = currentWordRowIndex > NUM_OF_ATTEMPTS;
  const isKeyValid =
    keyCode == 13 || // Return/Enter
    keyCode == 8 || // Backspace
    (keyCode > 64 && keyCode < 91); // Letters range

  if (isGameOver || isGameWon || !isKeyValid) return;
  if (key === "Enter") return validateWord(wordObj, isWordShort);
  if (key === "Backspace") return deleteLastLetter(wordObj);
  if (!isWordShort) return;

  wordObj.word += key;
  wordObj.update();
}

async function validateWord(wordObj, isWordShort) {
  if (isWordShort) return createNotification("Too short");

  if (!(await isWordInDictionary(wordObj.word)))
    return createNotification("Not in wordlist");

  if (wordObj.word === randomWord) {
    isGameWon = true;
    createNotification(`You won! The word was "${randomWord.toUpperCase()}"`);
  }

  applyLetterStyling(keyboard, wordObj.container);
  currentWordRowIndex++;
  highlightCurrentWordRow();
}

function deleteLastLetter(wordObj) {
  wordObj.word = wordObj.word.slice(0, -1);
  wordObj.update();
  return;
}

function createNotification(text) {
  const notificationsDiv = document.querySelector(".notifications");
  const notification = createNewDOMElement({
    tag: "div",
    className: "notification",
    parent: notificationsDiv,
    text: text,
  });

  setTimeout(() => notification.remove(), 3000);
}

async function isWordInDictionary(word) {
  // Show user that we are fetching the data
  bodyEl.style = "cursor: wait !important";

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();

    // Remove 'loading' styling
    bodyEl.style.cursor = "default";

    return data.title !== "No Definitions Found";
  } catch (error) {
    console.error(`Error found ${e}`);
  }
}

function applyLetterStyling(keyboard, wordObj) {
  const letterNodeList = wordObj.querySelectorAll(".letter-container");

  letterNodeList.forEach((letter, index) => {
    const letterInnerText = letter.innerText.toLowerCase();
    const keyboardKeyContainer = keyboard.find(
      (key) => key.value === letterInnerText
    ).container;

    if (letterInnerText === randomWord[index]) {
      letter.classList.add("letter-container--correct");

      // Remove out of order modifier to allow replacement with updated class
      keyboardKeyContainer.classList.remove("keyboard__key--out-of-order");
      keyboardKeyContainer.classList.add("keyboard__key--correct");

      return;
    }
    if (randomWord.includes(letterInnerText)) {
      letter.classList.add("letter-container--out-of-order");
      keyboardKeyContainer.classList.add("keyboard__key--out-of-order");
      return;
    }

    letter.classList.add("letter-container--not-present");
    keyboardKeyContainer.classList.add("keyboard__key--not-present");
  });
}

// Helper functions

function createNewDOMElement({
  tag,
  className,
  parent,
  parentSelector,
  text = "",
}) {
  const parentEl = parent || document.querySelector(parentSelector);
  const newElement = document.createElement(tag);

  if (text) newElement.innerText = text;
  if (className) newElement.classList.add(className);
  if (parentEl) parentEl.append(newElement);

  return newElement;
}

function emptyNodeListInnerHTML(nodeList) {
  nodeList.forEach(emptyElementInnerHTML);
}

function emptyElementInnerHTML(element) {
  element.innerHTML = "";
}
