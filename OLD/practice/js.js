const optionsContainer =
    document.querySelector(".options");
const outputContainer =
    document.querySelector(".output");
const tagsSelect =
    document.getElementById("tags");
const paragraphsSlider =
    document.getElementById(
        "paragraphs"
    );
const wordsSlider =
    document.getElementById("words");
const paragraphsValue =
    document.getElementById(
        "paragraphsValue"
    );


    tagOptions.forEach((tag) => {
        const option =
            document.createElement(
                "option"
            );
        option.value = tag;
        option.textContent = `<${tag}>`;
        tagsSelect.appendChild(option);
    });

//  Event listeners for sliders
    paragraphsSlider.addEventListener(
        "input",
        updateParagraphsValue
    );
    wordsSlider.addEventListener(
        "input",
        updateWordsValue
    );

    const generateButton =
        document.getElementById(
            "generate"
        );
    generateButton.addEventListener(
        "click",
        generateLoremIpsum
    );
}

// Update the displayed value for Paragraphs
function updateParagraphsValue() {
    paragraphsValue.textContent =
        paragraphsSlider.value;
}

// Words per Paragraph have got 
// to be updated on the display
function updateWordsValue() {
    wordsValue.textContent =
        wordsSlider.value;
}