const textInput = document.getElementById('textInput');
const meaningBox = document.getElementById('meaningBox');

// Function to fetch meaning of words
async function fetchMeaning(word) {
    try {
        const response = await fetch(`https://api.dictionary.com/api/v3/references/learners/json/${word}`);
        const data = await response.json();
        // Assuming that the meaning can be found in the first definition
        const meaning = data[0]?.shortdef?.[0];
        return meaning || 'Meaning not found';
    } catch (error) {
        console.error('Error fetching meaning:', error);
        return 'Error fetching meaning';
    }
}

// Function to update meaning box
async function updateMeaningBox() {
    const text = textInput.value.trim();
    if (text === '') {
        meaningBox.innerHTML = '<p>No text entered</p>';
        return;
    }
    const words = text.split(/\s+/);
    let meaningsHTML = '';
    for (const word of words) {
        const meaning = await fetchMeaning(word);
        meaningsHTML += `<div class="meaning"><strong>${word}:</strong> ${meaning}</div>`;
    }
    meaningBox.innerHTML = meaningsHTML;
}

// Listen for input events on textarea
textInput.addEventListener('input', updateMeaningBox);

// Initially update meaning box if there is initial text
updateMeaningBox();