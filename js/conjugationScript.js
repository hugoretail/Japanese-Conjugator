// imports
import { autofurigana } from "./autofurigana.js";
import * as codec from "./kamiya.min.js";

// constant values
const verbsURL = 'https://raw.githubusercontent.com/Hugo445nights/Japanese-Conjugator/main/csv/verbs.csv';
const adjectivesURL = 'https://raw.githubusercontent.com/Hugo445nights/Japanese-Conjugator/main/csv/adjectives.csv';

// variables
let verbs = null; // the verbs csv content
let adjectives = null; // the adjectives csv content
let filters = null;
let expectedAnswer = null; // the current verb good answer, not treated so might contain junk elements
let treatedExpectedAnswer = null; // contains one or multiple correct answers
let state = "guessing";
let verbHistory = [];
let adjHistory = [];
let cpt = 0;

// elements
const inputElement = document.getElementById('guess-input');
const iElement = document.getElementById('iAdj');
const naElement = document.getElementById('naAdj');
const negativeElement = document.getElementById('negativeAdj');
const pastElement = document.getElementById('pastAdj');
const teElement = document.getElementById('teAdj');
const adverbialElement = document.getElementById('adverbialAdj');
const styleElement = document.getElementById('style-info');
const affirmationElement = document.getElementById('affirmation-info');
const timeElement = document.getElementById('time-info');
const XElement = document.getElementById('X-info');
const theVerbElement = document.querySelector('#the-verb span');
const furiganaOptionElement = document.getElementById('display-furigana');
const JLPTElement = document.getElementById('jlpt-info');
const JLPTOptionElement = document.getElementById('jlpt-option');
const notification = document.getElementById('notification');
const conjugationResultElement = document.getElementById('conjugation-result');
const conjugationResultParagraphElement = document.querySelector('#conjugation-result p');

// functions
const addToVerbHistory = (verb, conjugation, auxiliaries) => {
    const verbEntry = {
        verb: verb,
        conjugation: conjugation,
        auxiliaries: auxiliaries
    };

    verbHistory.push(verbEntry);
};

const addToAjdHistory = (adj, conjugation) => {
    const adjEntry = {
        adj: adj,
        conjugation: conjugation,
    };

    adjHistory.push(adjEntry);
};

const treatAnswer = (text) => {
    conjugationResultElement.style.visibility = "visible";
    if (treatedExpectedAnswer.includes(text)) {
        conjugationResultElement.style.backgroundColor = "#c3e6cb";
        conjugationResultElement.style.boxShadow = "0px 0px 5px #218838";
        conjugationResultParagraphElement.textContent = "Good Job!";
    } else {
        conjugationResultElement.style.backgroundColor = "#ecbdc9";
        conjugationResultElement.style.boxShadow = "0px 0px 5px #bc002d";
        if (treatedExpectedAnswer.length === 1) {
            conjugationResultParagraphElement.textContent = `Wrong answer. The correct one was: ${treatedExpectedAnswer[0]}`;
        } else if (treatedExpectedAnswer.length > 1) {
            conjugationResultParagraphElement.textContent = `Wrong answer. The possible answers were: ${treatedExpectedAnswer.join(', ')}`;
        }
    }
    inputElement.disabled = true;
    state = "waiting";
    cpt += 1;
};

const containsRomajiOrKatakana = (text) => {
    return Array.from(text).some(char => wanakana.isRomaji(char) || wanakana.isKatakana(char));
};

const showNotification = (text) => {
    notification.textContent = text;
    const inputRect = inputElement.getBoundingClientRect();
    notification.style.display = 'block';
    notification.style.top = `${inputRect.top - notification.offsetHeight - 10}px`;
    notification.style.left = `${inputRect.left}px`;

    void notification.offsetWidth;
    notification.style.opacity = 1;

    setTimeout(() => {
        notification.style.opacity = 0;
        setTimeout(() => {
            notification.style.display = 'none';
        }, 500);
    }, 2000);
};

const updateExpectedAnswer = (isVerb, expectedAnswer, treatedConjugation, treatedAuxiliaries = null) => {
    if (expectedAnswer.length == 0) {
        newRound();
    } else if (isVerb) {
        if (expectedAnswer.length == 1) {
            treatedExpectedAnswer = [expectedAnswer[0]];
        } else {
            if (treatedConjugation.includes("Negative") && treatedAuxiliaries.includes("Masu")) {
                treatedExpectedAnswer = [expectedAnswer[0]];
            } else if (treatedConjugation.includes("Negative")) {
                treatedExpectedAnswer = [expectedAnswer[1]];
            }
        }
    } else {
        if (expectedAnswer.length == 1) {
            treatedExpectedAnswer = [expectedAnswer[0]];
        } else {
            if (treatedConjugation.includes("Negative")) {
                treatedExpectedAnswer = [expectedAnswer[0],expectedAnswer[1],expectedAnswer[2]];
            } else if (treatedConjugation.includes("ConjunctiveTe")) {
                treatedExpectedAnswer = [expectedAnswer[1]];
            } else if (treatedConjugation.includes("Past")) {
                treatedExpectedAnswer = [expectedAnswer[0]];
            }
        }
    }

    // secure if null
    if (treatedExpectedAnswer == null) {
        newRound();
    }
}

const getVerb = () => {
    
    // get all verbs from the concerned JLPT levels
    const filteredVerbs = verbs.filter(verb => filters.JLPT.includes(verb.JLPT));

    // get a random verb
    let randomVerb = null;
    let randomIndex = null;
    while (randomVerb == null || randomVerb == 'None') {
        randomIndex = Math.floor(Math.random() * filteredVerbs.length);
        randomVerb = filteredVerbs[randomIndex];
    }

    return randomVerb;
    

    /*
    // get all verbs from the concerned JLPT levels
    const filteredVerbs = window.verbs.filter(verb => filters.JLPT.includes(verb.JLPT));

    // get a random verb
    let randomVerb = null;
    let randomIndex = null;
    while (randomVerb == null || randomVerb == 'None') {
        randomIndex = Math.floor(Math.random() * filteredVerbs.length);
        randomVerb = filteredVerbs[randomIndex];
    }

    return randomVerb;
    */
};

const getAdjective = () => {
    
    // get all adjectives from the concerned JLPT levels
    const filteredAdjectives = adjectives.filter(adjective => filters.JLPT.includes(adjective.JLPT));

    // get a random adjective
    let randomAdjective = null;
    let randomIndex = null;
    while (randomAdjective == null || randomAdjective == 'None') {
        randomIndex = Math.floor(Math.random() * filteredAdjectives.length);
        randomAdjective = filteredAdjectives[randomIndex];
    }

    return randomAdjective;
    

    /*
    // get all adjectives from the concerned JLPT levels
    const filteredAdjectives = window.adjectives.filter(adjective => filters.JLPT.includes(adjective.JLPT));

    // get a random adjective
    let randomAdjective = null;
    let randomIndex = null;
    while (randomAdjective == null || randomAdjective == 'None') {
        randomIndex = Math.floor(Math.random() * filteredAdjectives.length);
        randomAdjective = filteredAdjectives[randomIndex];
    }

    return randomAdjective;
    */
};

const getFilters = (isVerb) => {
    let filters = {
        JLPT: [],
        Conjugation: [],
        Auxiliary: [],
        Adjective: [] // can contain い, な, both or nothing
    };

    const tableRows = document.querySelectorAll('.options-table tr');
    
    if (isVerb) {
        tableRows.forEach(row => {
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const labelText = checkbox.parentNode.textContent.trim();
    
                    if (labelText.includes('N5')
                        || labelText.includes('N4')
                        || labelText.includes('N3')
                        || labelText.includes('N2')
                        || labelText.includes('N1')
                        || labelText.includes('Others')) {
                        filters.JLPT.push(labelText);
    
                    } else if (labelText.includes('Affirmative')
                        || labelText.includes('Negative')) {
                        filters.Conjugation.push(labelText);
    
                    } else if (labelText.includes('Past')
                        || labelText.includes('Present/Future')) {
                        filters.Conjugation.push(labelText);
    
                    } else if (labelText.includes('Plain')
                        || labelText.includes('Polite')) {
                        filters.Auxiliary.push(labelText);
    
                    } else if (labelText.includes('～て')) {
                        filters.Conjugation.push(labelText);
                    }
                }
            });
        });
    } else {
        tableRows.forEach(row => {
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const labelText = checkbox.parentNode.textContent.trim();
                    
                    if (labelText.includes('N5')
                        || labelText.includes('N4')
                        || labelText.includes('N3')
                        || labelText.includes('N2')
                        || labelText.includes('N1')
                        || labelText.includes('Others')) {
                        filters.JLPT.push(labelText);

                    }
                }
            });

        });

        if (iElement.checked) {
            filters.Adjective.push('～い');
        }
        if (naElement.checked) {
            filters.Adjective.push('～な');
        }
        if (negativeElement.checked) {
            filters.Conjugation.push('Negative');
        }
        if (pastElement.checked) {
            filters.Conjugation.push('Past');
        }
        if (teElement.checked) {
            filters.Conjugation.push('～て');
        }
        if (adverbialElement.checked) {
            filters.Conjugation.push('Adverbial');
        }
    }

    return filters;
};

const hideAllProperties = () => {
    JLPTElement.style.display = 'none';
    JLPTElement.textContent = '';

    styleElement.style.display = 'none';
    styleElement.textContent = '';

    affirmationElement.style.display = 'none';
    affirmationElement.textContent = '';

    timeElement.style.display = 'none';
    timeElement.textContent = '';

    XElement.style.display = 'none';
    XElement.textContent = '';
};

const displayProperties = () => {
    if (JLPTElement.textContent != '') {
        JLPTElement.style.display = 'block';
    }

    if (styleElement.textContent != '') {
        styleElement.style.display = 'block';
    }
    if (affirmationElement.textContent != '') {
        affirmationElement.style.display = 'block';
    }
    if (timeElement.textContent != '') {
        timeElement.style.display = 'block';
    }
    if (XElement.textContent != '') {
        XElement.style.display = 'block';
    }
};

const updateAdjectiveDisplay = (conjugation, theAdjective) => {

    hideAllProperties();

    // JLPT
    if (JLPTOptionElement.checked) {
        JLPTElement.textContent = theAdjective.JLPT;
    }

    // Affirmation (Positive - Negative)
    if (conjugation.includes('Negative')) {
        affirmationElement.textContent = "Negative";
    } else {
        affirmationElement.textContent = "Positive";
    }

    // Time (Past - Present/Future)
    if (conjugation.includes('Past')) {
        timeElement.textContent = "Past";
    } else {
        timeElement.textContent = "Present";
    }

    // ~X
    if (conjugation.includes('ConjunctiveTe')) {
        XElement.textContent = "～て";
    } else if (conjugation.includes('Adverbial')) {
        XElement.textContent = "Adverbial";
    }

    displayProperties(theAdjective);

    // Furigana ?
    if (furiganaOptionElement.checked) {
        displayWithFurigana(theAdjective);
    } else {
        theVerbElement.textContent = theAdjective.Dictionary;
    }

};

const updateVerbDisplay = (conjugation, auxiliaries, theVerb) => {
    
    hideAllProperties();

    // JLPT
    if (JLPTOptionElement.checked) {
        JLPTElement.textContent = theVerb.JLPT;
    }

    // Style (Plain - Polite - Honorific)
    if (conjugation === 'Dictionary' && !auxiliaries.includes('Masu')) {
        styleElement.textContent = "Plain";
    } else if (auxiliaries.includes('Masu')) {
        styleElement.textContent = "Polite";
    } else {
        styleElement.textContent = "Plain";
    }

    // Affirmation (Positive - Negative)
    if (conjugation.includes('Negative')) {
        affirmationElement.textContent = "Negative";
    } else {
        affirmationElement.textContent = "Affirmative";
    }

    // Time (Past - Present/Future - Progressive)
    if (conjugation.includes('Ta')) {
        timeElement.textContent = "Past";
    } else {
        timeElement.textContent = "Present";
    }

    // ~X
    if (conjugation.includes('Te')) {
        XElement.textContent = "～て";
    }

    displayProperties(theVerb);

    // Furigana ?
    if (furiganaOptionElement.checked) {
        displayWithFurigana(theVerb);
    } else {
        theVerbElement.textContent = theVerb.Dictionary;
    }
};

const displayWithFurigana = (text) => {
    let kanji = text.Dictionary;
    let kana = text.Hiragana;

    let furigana = autofurigana(kanji, kana);

    let theHTML = '';
    furigana.forEach(elt => {
        if (elt[1] != null) {
            theHTML += '<ruby>' + elt[0] + '<rt>' + elt[1] + '</rt></ruby>';
        } else {
            theHTML += elt[0];
        }
        
    });

    theVerbElement.innerHTML = `${theHTML}`;
};

const treatConjugation = (choosenConjugation, isVerb) => {
    if (isVerb) {
        switch (choosenConjugation) {
            case 'Affirmative':
                return "Dictionary";
            case 'Negative':
                return "Negative";
            case 'Past':
                return "Ta";
            case 'Present/Future':
                return "Dictionary";
            case '～て':
                return "Te";
        }
    } else {
        switch (choosenConjugation) {
            case 'Negative':
                return "Negative";
            case 'Past':
                return "Past";
            case '～て':
                return "ConjunctiveTe";
            case 'Adverbial':
                return "Adverbial";
        }
    }
    
};

const treatAuxiliaries = (choosenAuxiliaries) => {
    switch (choosenAuxiliaries[0]) {
        case 'Plain':
            return [];
        case 'Polite':
            return ["Masu"];
    }
};

const newRound = () => {
    let isVerb;
    if (!iElement.checked && !naElement.checked) {
        isVerb = true;
    } else {
        isVerb = Math.floor(Math.random() * 4) >= 1;
    }

    filters = getFilters(isVerb);
    
    if (isVerb) {
        // Verb 75% chance
        let theChoosenVerb = getVerb();

        // UTILISER la variable filters
        const randomConjugation = Math.floor(Math.random() * filters["Conjugation"].length);
        let choosenConjugation = filters["Conjugation"][randomConjugation];
        let treatedConjugation = treatConjugation(choosenConjugation, true);

        // only one can be selected right now : CAN BE CHANGED
        const randomAuxiliary = Math.floor(Math.random() * filters["Auxiliary"].length);
        let choosenAuxiliaries = [filters["Auxiliary"][randomAuxiliary]];

        if (choosenAuxiliaries[0] != "Masu" && filters["Auxiliary"].includes("Polite")) {
            const politeCoinflip = Math.floor(Math.random() * 4);
            if (politeCoinflip == 1) {
                choosenAuxiliaries.push("Masu");
            }
        }
        let treatedAuxiliaries = treatAuxiliaries(choosenAuxiliaries);

        const randomAuxiliaries = Math.floor(Math.random() * 2); // coinflip
        if (randomAuxiliaries == 1 && treatAuxiliaries.length > 0) {
            treatedAuxiliaries = [];
        }
        if (treatedConjugation == 'Dictionary' && treatedAuxiliaries.length == 0) {
            treatedAuxiliaries.push("Masu");
        }

        // typeII ?
        let typeII;
        if (theChoosenVerb["typeII"] === 'false') {
            typeII = false;
        } else {
            typeII = true;
        }

        expectedAnswer = codec.conjugateAuxiliaries(theChoosenVerb["Hiragana"],
            treatedAuxiliaries, treatedConjugation, typeII); // conjugate

        updateVerbDisplay(treatedConjugation, treatedAuxiliaries, theChoosenVerb);
        updateExpectedAnswer(isVerb, expectedAnswer, treatedConjugation, treatedAuxiliaries);
        addToVerbHistory(theChoosenVerb, treatedConjugation, treatedAuxiliaries);

    } else {
        // Adjective 25% chance
        let theChoosenAdjective = getAdjective();

        const randomConjugation = Math.floor(Math.random() * filters["Conjugation"].length);
        let choosenConjugation = filters["Conjugation"][randomConjugation];
        let treatedConjugation = treatConjugation(choosenConjugation, false);

        // い or な
        let iAdj;
        if (theChoosenAdjective["iAdjective"] === 'false') {
            iAdj = false;
        } else {
            iAdj = true;
        }
        
        expectedAnswer = codec.adjConjugate(theChoosenAdjective["Hiragana"],
            treatedConjugation, iAdj);
        
        updateAdjectiveDisplay(treatedConjugation, theChoosenAdjective);
        updateExpectedAnswer(isVerb, expectedAnswer, treatedConjugation);
        addToAjdHistory(theChoosenAdjective, treatedConjugation);
    }

    console.log("Current verb history :",verbHistory);
    console.log("Current adj history :",adjHistory);

};

const loadJSON = async (jsonFile) => {
    try {
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${jsonFile}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${jsonFile}:`, error);
        return null;
    }
};

const loadCSV = async (csvFile) => {
    try {
        const response = await fetch(csvFile);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${csvFile}`);
        }
        const csvData = await response.text();
        return parseCSV(csvData);
    } catch (error) {
        console.error(`Error fetching ${csvFile}:`, error);
        return null;
    }
};

const parseCSV = (csvData) => {
    const lines = csvData.trim().split('\n');
    const headers = lines.shift().split(',');
    const items = lines.map(line => {
        const values = line.split(',');
        const itemObject = {};
        headers.forEach((header, index) => {
            itemObject[header] = values[index];
        });
        return itemObject;
    });
    return items;
};

// events
document.addEventListener("DOMContentLoaded", async (event) => {

    verbs = await loadCSV(verbsURL);
    adjectives = await loadCSV(adjectivesURL);

        
    newRound();
    
    /*
    try {
        const verbs = await loadJSON('../json/verbs.json');
        const adjectives = await loadJSON('../json/adjectives.json');
        
        if (!verbs || !adjectives) {
            throw new Error('Failed to load JSON files');
        }
        window.verbs = verbs;
        window.adjectives = adjectives;
        
        newRound();
    } catch (error) {
        console.error('Error loading JSON files:', error);
        // Handle error: Show user a message or retry loading
    }
    */
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        if (state === "waiting") {
            cpt += 1;
        }
        if (state === "waiting" && cpt == 3) {
            state = "guessing";
            conjugationResultElement.style.visibility = "hidden";
            inputElement.value = "";
            inputElement.disabled = false;
            inputElement.focus();
            cpt = 0;
            newRound();
        }
    }
});

inputElement.addEventListener('keydown', (event) => {
    let text = inputElement.value.trim();
    if (event.key === 'Enter') {
        if (text === '') {
            showNotification("Please write something first.");
        } else if (containsRomajiOrKatakana(text)) {
            showNotification("Hiragana only.");
        }
        else {
            treatAnswer(text);
        }
    }
});