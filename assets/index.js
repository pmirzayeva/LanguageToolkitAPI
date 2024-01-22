document.addEventListener("DOMContentLoaded", async () => {
    const wordBox = document.querySelector(".wordBox");
    const refreshBtn = document.querySelector("#refreshbtn");

    const getRandomWord = async () => {
        const url = "https://english-fluency-flashcards.p.rapidapi.com/random-set";
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '31e52734bdmshab176c6eee229bdp1418e5jsn20cdd91ff8a8',
                'X-RapidAPI-Host': 'english-fluency-flashcards.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const wordData = await response.json();
            displayWordData(wordData.words.slice(0, 3));
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const displayWordData = (words) => {
        wordBox.innerHTML = '';
        words.forEach(({ tags, word, type, senses }) => {
            wordBox.innerHTML += `<div class="word">
            <h3>${word}</h3></div>
            <div class="details">
            <p>${type}</p>
            </div>
            <div class="meanings">
            <p class="wordMeaning">Tags: ${tags.join(',')}</p>
            <p class="wordExample">${senses.length > 0 ? senses[0].sense : ''}</p>
            </div>`
            ;
        });
    };

    refreshBtn.addEventListener("click", getRandomWord);
    getRandomWord();
});



const inputDropdown = document.querySelector("#inputLanguage");
const outputDropdown = document.querySelector("#outputLanguage");
const inputText = document.querySelector("#inputText");
const outputText = document.querySelector("#outputText");
const TRANSLATION_API_URL = 'https://text-translator2.p.rapidapi.com/translate';
const API_KEY = '31e52734bdmshab176c6eee229bdp1418e5jsn20cdd91ff8a8';

// Function to get languages and populate dropdowns
async function getLanguage() {
    try {
        const response = await fetch('https://text-translator2.p.rapidapi.com/getLanguages', {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data: { languages } } = await response.json();

        displayDropDown(inputDropdown, languages);
        displayDropDown(outputDropdown, languages);
    } catch (error) {
        console.error(error);
    }
}

// Function to display options in dropdowns
function displayDropDown(dropdown, options) {
    const ul = dropdown.querySelector(".dropdownMenu");
    ul.innerHTML = "";

    options.forEach((option) => {
        const li = document.createElement("li");
        li.textContent = option.name;
        li.dataset.value = option.code;
        li.classList.add("option");
        ul.appendChild(li);

        li.addEventListener("click", function() {
            dropdown.querySelector(".selected").textContent = this.textContent;
            dropdown.querySelector(".selected").dataset.value = this.dataset.value;
            ul.classList.remove("active");
            triggerTranslation();
        });
    });
}

// Function to translate text
async function translateText(text, sourceLang, targetLang) {
    const encodedParams = new URLSearchParams();
    encodedParams.append('source_language', sourceLang);
    encodedParams.append('target_language', targetLang);
    encodedParams.append('text', text);

    try {
        const response = await fetch(TRANSLATION_API_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
            },
            body: encodedParams
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Translation error: ${error.message}`);
        return null;
    }
}

// Function to handle translation trigger
async function triggerTranslation() {
    const sourceLang = inputDropdown.querySelector(".selected").dataset.value;
    const targetLang = outputDropdown.querySelector(".selected").dataset.value;
    const text = inputText.value;

    if (text && sourceLang && targetLang) {
        const translationResult = await translateText(text, sourceLang, targetLang);
        if (translationResult && translationResult.data) {
            outputText.value = translationResult.data.translatedText;
        }
    }
}

// Event listener for input text changes
inputText.addEventListener('input', triggerTranslation);

// Initial call to populate dropdowns
getLanguage();

// Dropdown functionality
document.querySelectorAll(".dropdownContainer").forEach((dropdown) => {
    dropdown.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
    document.querySelectorAll(".dropdownContainer").forEach((dropdown) => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("active");
        }
    });
});

document.querySelector("#inputText").addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector("#outputText").addEventListener('click', function (event) {
    event.stopPropagation();
});

// Function to swap languages
function swapLanguages() {
    let inputLang = document.querySelector("#inputLanguage .selected");
    let outputLang = document.querySelector("#outputLanguage .selected");
    [inputLang.textContent, outputLang.textContent] = [outputLang.textContent, inputLang.textContent];
    [inputLang.dataset.value, outputLang.dataset.value] = [outputLang.dataset.value, inputLang.dataset.value];

    triggerTranslation();
}


document.querySelector("#swapButton").addEventListener("click", swapLanguages);
