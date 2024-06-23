
// constant values

// elements
const inputElement = document.getElementById("guess-input");

// functions
const kanaNFix = (text) => {
    return text.includes('nn') ||
            text.includes('na') ||
            text.includes('ni') ||
            text.includes('nu') ||
            text.includes('ne') ||
            text.includes('no');
};

// events
inputElement.addEventListener("input", (event) => {
    if (kanaNFix(inputElement.value)) {
        let txt = wanakana.toHiragana(inputElement.value, {passRomaji: false});
        txt = txt.replace('んん', 'ん');
        inputElement.value = txt;
    }
    else if (!inputElement.value.includes('n')) {
        inputElement.value = wanakana.toHiragana(inputElement.value, {passRomaji: false});
    }
    else if (inputElement.value.includes('n')) {
        inputElement.value = wanakana.toHiragana(inputElement.value, {passRomaji: true});
    }
});
