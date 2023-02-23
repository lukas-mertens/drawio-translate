// Load the API key from localStorage or prompt the user to enter it
let apiKey = localStorage.getItem("apiKey");
if (apiKey) {
    const apiKeyInput = document.getElementById('apiKey');
    apiKeyInput.value = apiKey;
    document.getElementById("api-key-warning").style.display = "none";
} else {
    document.getElementById("api-key-warning").style.display = "block";
}

function setApiKeyFromInput() {
    const apiKeyInput = document.getElementById('apiKey');
    apiKey = apiKeyInput.value;
    localStorage.setItem("apiKey", apiKey);
    document.getElementById("api-key-warning").style.display = "none";
}

// Set up the source and target language dropdowns
const sourceLangSelect = document.getElementById("sourceLang");
const targetLangSelect = document.getElementById("targetLang");

// Populate the source and target language dropdowns
const languageCodes = [
{ code: "DE", name: "German" },
{ code: "EN", name: "English" },
{ code: "ES", name: "Spanish" },
{ code: "FR", name: "French" },
{ code: "IT", name: "Italian" },
{ code: "JA", name: "Japanese" },
{ code: "NL", name: "Dutch" },
{ code: "PL", name: "Polish" },
{ code: "PT", name: "Portuguese" },
{ code: "RU", name: "Russian" },
{ code: "ZH", name: "Chinese" },
];

for (let i = 0; i < languageCodes.length; i++) {
const languageCode = languageCodes[i];
const sourceLangOption = document.createElement("option");
sourceLangOption.value = languageCode.code;
sourceLangOption.text = languageCode.name;
sourceLangSelect.add(sourceLangOption);

const targetLangOption = document.createElement("option");
targetLangOption.value = languageCode.code;
targetLangOption.text = languageCode.name;
targetLangSelect.add(targetLangOption);
}

// Set the default source and target languages
sourceLangSelect.value = "DE";
targetLangSelect.value = "EN";

function translate(sourceXml, sourceLang, targetLang, apiKey) {
const apiUrl = "https://api-free.deepl.com/v2/translate";

// Parse the source XML to get the text to translate
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(sourceXml, "text/xml");
const mxCells = xmlDoc.getElementsByTagName("mxCell");
const textToTranslate = [];
const originalValues = [];
for (let i = 0; i < mxCells.length; i++) {
    const mxCell = mxCells[i];
    const value = mxCell.getAttribute("value");
    if (value) {
    textToTranslate.push(value);
    originalValues.push(value);
    }
}

// Send the text to DeepL for translation
const requestData = new URLSearchParams();
requestData.append("auth_key", apiKey);
textToTranslate.forEach((text) => {
    requestData.append("text", text);
});
requestData.append("target_lang", targetLang);
requestData.append("source_lang", sourceLang);

return fetch(apiUrl, {
    method: "POST",
    body: requestData,
})
    .then((response) => {
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
    })
    .then((data) => {
    // Parse the translations from the response
    const translations = data.translations.map(
        (translation) => translation.text
    );

    // Replace the text in the source XML with the translations
    for (let i = 0; i < originalValues.length; i++) {
        const originalValue = originalValues[i];
        const translation = translations[i];
        for (let j = 0; j < mxCells.length; j++) {
        const mxCell = mxCells[j];
        const value = mxCell.getAttribute("value");
        if (value === originalValue) {
            mxCell.setAttribute("value", translation);
        }
        }
    }

    // Serialize the modified XML to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
    })
    .catch((error) => {
    console.error("There was a problem with the translation:", error);
    });
}

// Set up the event listener for the translate button
const translateBtn = document.getElementById("translateBtn");
translateBtn.addEventListener("click", async () => {
const sourceXmlTextarea = document.getElementById("sourceXml");
const resultXmlTextarea = document.getElementById("resultXml");
const sourceXml = sourceXmlTextarea.value;
const sourceLang = sourceLangSelect.value;
const targetLang = targetLangSelect.value;
const resultXml = await translate(
    sourceXml,
    sourceLang,
    targetLang,
    apiKey
);
resultXmlTextarea.value = resultXml;
});