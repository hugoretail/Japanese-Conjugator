import * as codec from "../node_modules/kamiya-codec/dist/kamiya.min.mjs";

console.log(codec.conjugateAuxiliaries("する", ["Tai"], "Negative"));

// constant values

// variables
let verbs = null; // the verbs csv content
let adjectives = null; // the adjectives csv content
let filters = null;

// elements

// functions
const getFilters = () => {
    let filters = {
        JLPT: [],
        Affirmation: [],
        Time: [],
        XForms: []
    };

    const tableRows = document.querySelectorAll('.options-table tr');

    tableRows.forEach(row => {
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const labelText = checkbox.parentNode.textContent.trim();

                if (labelText.includes('N5') || labelText.includes('N4') || labelText.includes('N3') ||
                    labelText.includes('N2') || labelText.includes('N1')) {
                    filters.JLPT.push(labelText);
                } else if (labelText.includes('Positive') || labelText.includes('Negative')) {
                    filters.Affirmation.push(labelText);
                } else if (labelText.includes('Past') || labelText.includes('Present/Future')) {
                    filters.Time.push(labelText);
                } else if (labelText.includes('～て') || labelText.includes('Plain') ||
                    labelText.includes('Polite')) {
                    filters.XForms.push(labelText);
                }
            }
        });
    });

    return filters;
};

const newRound = () => {
    const random = Math.floor(Math.random() * 2);
    filters = getFilters();
    console.log(filters);
    if (random == 0) {
        // Verb

    } else {
        // Adjective

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
    console.log("Page loaded.");

    // Get the csv values
    verbs = await loadCSV('../csv/verbs.csv');
    console.log("Verbs loaded : ", verbs);

    adjectives = await loadCSV('../csv/adjectives.csv');
    console.log("Adjectives loaded : ", adjectives);

    newRound();
});
