const wordForm = document.getElementById('wordForm');
const searchInput = document.getElementById('searchInput');
const message = document.getElementById('message');
const resultSection = document.getElementById('resultSection');
const resultWord = document.getElementById('resultWord');
const resultPhonetic = document.getElementById('resultPhonetic');
const meaningsContainer = document.getElementById('meanings');
const randomBtn = document.getElementById('randomBtn');

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const RANDOM_WORD_API = 'https://random-word-api.herokuapp.com/word?number=1';

wordForm.addEventListener('submit', event => {
  event.preventDefault();
  const word = searchInput.value.trim();
  if (!word) {
    showMessage('Please type a word before searching.');
    return;
  }
  fetchAndRenderWord(word);
});

randomBtn.addEventListener('click', () => {
  fetchRandomWord();
});

async function fetchAndRenderWord(word) {
  showMessage('Looking up the word...');
  hideResult();

  try {
    const data = await fetchWordData(word);
    renderDefinition(data);
    showMessage('Here is the latest result.', false);
  } catch (error) {
    showMessage(error.message || 'Unable to fetch the word definition.');
  }
}

async function fetchWordData(word) {
  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(word)}`);

    if (!response.ok) {
      throw new Error('Word not found. Try another word.');
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Network issue or blocked request. Check your connection.');
    }
    throw error;
  }
}

async function fetchRandomWord() {
  showMessage('Fetching a random word...');
  hideResult();

  try {
    const response = await fetch(RANDOM_WORD_API);
    if (!response.ok) {
      throw new Error('Unable to retrieve a random word right now.');
    }
    const [randomWord] = await response.json();
    searchInput.value = randomWord;
    await fetchAndRenderWord(randomWord);
  } catch (error) {
    showMessage(error.message || 'Random word request failed.');
  }
}

function renderDefinition(entry) {
  resultWord.textContent = entry.word;
  resultPhonetic.textContent = entry.phonetic || entry?.phonetics?.find(phonetic => phonetic.text)?.text || '';

  meaningsContainer.innerHTML = '';
  entry.meanings.forEach(meaning => {
    const meaningCard = document.createElement('article');
    meaningCard.className = 'meaning-card';

    const meaningTitle = document.createElement('h3');
    meaningTitle.textContent = `${meaning.partOfSpeech}`;
    meaningCard.appendChild(meaningTitle);

    const definitionList = document.createElement('ul');
    meaning.definitions.slice(0, 4).forEach(definition => {
      const listItem = document.createElement('li');
      listItem.textContent = definition.definition;
      definitionList.appendChild(listItem);
    });

    meaningCard.appendChild(definitionList);
    meaningsContainer.appendChild(meaningCard);
  });

  resultSection.classList.remove('hidden');
}

function showMessage(text, isHint = true) {
  message.textContent = text;
  message.className = isHint ? 'message' : 'message active';
}

function hideResult() {
  resultSection.classList.add('hidden');
}
