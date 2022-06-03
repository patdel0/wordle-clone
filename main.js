import randomWord from "./randomWord.js";

console.log("winning word:", randomWord);

const bodyEl = document.querySelector("body");
const wordsDiv = document.querySelector(".words");

// o---------------o
// | Game settings |
// o---------------o

const WORD_LENGTH = 5;
const NUM_OF_ATTEMPTS = 6;
let isGameWon = false;

class Word {
  constructor() {
    this.word = "";
    this.container = document.createElement("div");
    this.container.classList.add("words__word");
  }

  createWordRow() {
    this.createLetters();
    wordsDiv.append(this.container);
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
}

const wordsRowsArr = new Array(NUM_OF_ATTEMPTS)
  .fill("")
  .map((item) => new Word());
wordsRowsArr.forEach((word) => word.createWordRow());

// Word validation
let currentWordRowIndex = 0;
highlightWordRow();

async function isWordInDictionary(word) {
  bodyEl.style = "cursor: wait !important";
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();
    bodyEl.style.cursor = "default";
    return data.title !== "No Definitions Found";
  } catch (error) {
    console.error(`Error found ${e}`);
  }
}

// Keyboard input
document.addEventListener("keydown", runGame);

async function runGame({ keyCode, key }) {
  const wordObj = wordsRowsArr[currentWordRowIndex];
  const word = wordObj.word;
  const isKeyValid =
    keyCode == 13 || // Return/Enter
    keyCode == 8 || // Backspace
    (keyCode > 64 && keyCode < 91); // Letters range
  const isWordShort = word.length < WORD_LENGTH;
  const isGameOver = currentWordRowIndex > NUM_OF_ATTEMPTS;
  if (isGameOver) return;
  if (isGameWon) return;

  if (key === "Enter") {
    if (isWordShort) return createNotification("Too short");
    if (!(await isWordInDictionary(word)))
      return createNotification("Not in wordlist");
    {
      currentWordRowIndex++;
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

  if (!isKeyValid || !isWordShort) return;

  wordObj.word += key;
  wordObj.update();
}

function createNotification(text) {
  const notificationsDiv = document.querySelector(".notifications");
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerText = text;
  notificationsDiv.append(notification);
  setTimeout(() => notification.remove(), 3000);
}

function highlightWordRow() {
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
    // 69 used as it's within range of alphabet. Seeing that only valid key values are provided in the virtual keyboard, the validation of input in rungame is not required.
    runGame({ keyCode: 69, key: this.value });
  }
}

const keyboard = [];
const keyboardKeysArr = Array.from("qwertyuiop'asdfghjkl'zxcvbnm").concat(
  "Enter",
  "Backspace"
);
const rowClassList = {
  0: "first-row",
  1: "second-row",
  2: "third-row",
};
let keyboardRowIndex = 0;
keyboardKeysArr.forEach((value, index) => {
  if (value === "'") return keyboardRowIndex++;
  keyboard.push(
    new KeyboardKey({ value, parentRow: rowClassList[keyboardRowIndex] })
  );
  keyboard[keyboard.length - 1].create();
});

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

  newElement.classList.add(className);
  newElement.innerText = text;
  parentEl && parentEl.append(newElement);

  return newElement;
}

function emptyNodeListInnerHTML(nodeList) {
  nodeList.forEach(emptyElementInnerHTML);
}

function emptyElementInnerHTML(element) {
  element.innerHTML = "";
}
