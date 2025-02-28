const fs = require('fs');

// Define the color mappings
const colorMappings = {
    "#ffcf9d": "var(--color-a-1)",
    "#ffb1ee": "var(--color-a-2)",
    "#ffddb8": "var(--color-a-3)",
    "#ffe5ca": "var(--color-a-4)",
    "#ffd7bf": "var(--color-a-5)",
    "#ffb362": "var(--color-a-6)",
    "#ff8400": "var(--color-a-9)",
    "#ff8300": "var(--color-a-10)",
    "#ff9d3a": "var(--color-a-11)",
    "#ff8000": "var(--color-a-12)",
    "#ffcaf4": "var(--color-b-1)",
    "#ffdaf7": "var(--color-b-3)",
    "#fb88ff": "var(--color-b-4)",
    "#ff99cc": "var(--color-b-5)",
    "#ff00c6": "var(--color-b-6)",
    "#d88c9a": "var(--color-b-7)",
    "#fbacbe": "var(--color-b-8)",
    "#d1bdff": "var(--color-c-1)",
    "#222285": "var(--color-c-2)",
    "#3d00ff": "var(--color-c-3)",
    "#99ccff": "var(--color-c-4)",
    "#4E36D3": "var(--color-c-5)",
    "#DBDBF4": "var(--color-c-6)",
    "#b0beff": "var(--color-c-7)",
    "#2f1190": "var(--color-c-8)",
    "#8CD867": "var(--color-d-1)",
    "#fa9189": "var(--color-d-2)",
    "#fcae7c": "var(--color-d-3)",
    "#ffcc99": "var(--color-d-4)",
    "#ffe699": "var(--color-d-5)",
    "#ffe4bc": "var(--color-d-6)",
    "#fff4e8": "var(--color-d-7)",
    "#ffdfa4": "var(--color-d-8)",
    "#f4f0ff": "var(--color-d-9)",
    "#282830": "var(--color-e-1)",
    "#ffffff": "var(--color-e-2)",
    "#ffffffb5": "var(--color-e-3)",
    "#ffffff7a": "var(--color-e-4)",
    "#ffe3c7": "var(--color-e-5)",
    "#ffc280": "var(--color-e-6)",
    "#ffcc97": "var(--color-e-7)",
    "#ff952b": "var(--color-e-8)",
    "#ffd079": "var(--color-e-9)",
    "#ffb4e6": "var(--color-e-10)",
    "#ffffff63": "var(--color-e-11)",
    "#fff7ee": "var(--color-e-12)",
    "#ffd2a1": "var(--color-e-13)",
    "#ffedda": "var(--color-e-14)",
    "#ED254E": "var(--color-f-1)",
    "#180067": "var(--color-f-2)",
    "#a30000": "var(--color-f-3)",
    "#0f8500": "var(--color-f-4)",
    "#6d4600": "var(--color-f-5)",
    "#cf6800": "var(--color-f-6)"
};

// Read the CSS file
const cssFilePath = "styles.css";
const outputFilePath = "styles_updated.css";

fs.readFile(cssFilePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading CSS file:", err);
        return;
    }

    // Replace all colors with their variables
    let updatedCss = data;
    Object.keys(colorMappings).forEach(hexColor => {
        const regex = new RegExp(hexColor, "gi"); // Case insensitive replacement
        updatedCss = updatedCss.replace(regex, colorMappings[hexColor]);
    });

    // Write the updated CSS back to a new file
    fs.writeFile(outputFilePath, updatedCss, "utf8", err => {
        if (err) {
            console.error("Error writing updated CSS file:", err);
        } else {
            console.log(`Updated CSS file saved as ${outputFilePath}`);
        }
    });
});
