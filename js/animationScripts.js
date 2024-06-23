// constant values
const optionsScrollTransition = 500; // 100 = very fast, 500 = slower

// elements
const sliderElement = document.getElementById('slider');
const table = document.querySelector('.options-table');
const totalColumns = table.rows[0].cells.length;
const checkboxElement = document.querySelector('.switch input[type="checkbox"]');

// functions
const toggleTableAndSlider = () => {
    if (checkboxElement.checked) {
        table.style.display = 'table';
        sliderElement.style.display = 'block';
    } else {
        table.style.display = 'none';
        sliderElement.style.display = 'none';
    }
};

// events
checkboxElement.addEventListener('change', () => {
    toggleTableAndSlider();
});

sliderElement.addEventListener('input', () => {
    const value = parseInt(sliderElement.value);

    const gradientPercentage = (value - 1) / (sliderElement.max - 1) * 100;
    sliderElement.style.background = `linear-gradient(to right, #BC002D ${gradientPercentage}%, #ccc ${gradientPercentage}%)`;

    // hide all
    table.querySelectorAll('td').forEach(cell => {
        cell.style.transition = 'opacity 0.3s ease-out';
        cell.style.opacity = '0';
        setTimeout(() => {
            cell.style.display = 'none';
        }, optionsScrollTransition);
    });

    // display 3
    setTimeout(() => {
        for (let i = value - 1; i < value + 2; i++) {
            if (i < totalColumns) {
                table.querySelectorAll(`td:nth-child(${i + 1})`).forEach(cell => {
                    cell.style.display = 'table-cell';
                    setTimeout(() => {
                        cell.style.opacity = '1';
                    }, 25);
                });
            }
        }
    }, optionsScrollTransition);
});
