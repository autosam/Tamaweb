const fs = require('fs');

// List of named colors to exclude
const excludedWords = new Set(["grayscale", "transparent", "gold"]);

// Regular expression to match colors (with extended color support)
const colorRegex = /#([a-fA-F0-9]{3,8})\b|rgba?\([\d\s,%.]+\)|\b(wheat|black|white|blue|green|yellow|purple|orange|pink|gray|grey|brown|cyan|magenta|lime|teal|navy|gold|silver|beige|maroon|olive|coral|indigo|violet|chocolate|navajowhite|azure|ivory|khaki|orchid|plum|salmon|tan|turquoise|lightgray|darkgray|lightblue|darkblue|lightgreen|darkgreen|lightyellow|darkred|mediumblue|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred)\b/gi;

// File paths
const cssFilePath = "styles.css"; // Input CSS file
const jsonOutputPath = "extracted_colors.json"; // Output JSON file
const cssOutputPath = "theme.css"; // Output CSS theme file
const cssOutputUpdatedPath = "styles_updated-v2.css"; // Output CSS theme file

fs.readFile(cssFilePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading CSS file:", err);
        return;
    }

    // Extract colors from CSS
    const matches = data.match(colorRegex) || [];

    // Filter out excluded words
    const filteredColors = matches.filter(color => !excludedWords.has(color.toLowerCase()));

    // Remove duplicates
    const uniqueColors = [...new Set(filteredColors)];

    // Save extracted colors to JSON (for reference)
    fs.writeFile(jsonOutputPath, JSON.stringify(uniqueColors, null, 2), "utf8", err => {
        if (err) console.error("Error writing JSON file:", err);
    });

    let nData = data;
    uniqueColors.forEach((color, index) => {
        const varName = `--color-${String.fromCharCode(97 + Math.floor(index / 10))}-${(index % 10) + 1}`; 
        // nData = nData.replaceAll(color, `var(${varName})`);
        const regex = new RegExp(`${color}(?!\\s*{)`, 'gi');
        nData = nData.replace(regex, ` var(${varName})`);
    })
    fs.writeFile(cssOutputUpdatedPath, nData, "utf8", err => {
        if (err) {
            console.error("Error writing theme CSS file:", err);
        } else {
            console.log(`✅ Theme CSS file saved as ${cssOutputUpdatedPath}`);
        }
    });

    // Generate CSS variables
    let cssVariables = ":root {\n";
    uniqueColors.forEach((color, index) => {
        const varName = `--color-${String.fromCharCode(97 + Math.floor(index / 10))}-${(index % 10) + 1}`; // Generates --color-a-1, --color-a-2, ..., --color-b-1
        cssVariables += `    ${varName}: ${color};\n`;
    });
    cssVariables += "}\n\n.theme {\n    /* Apply this class to use the theme */\n}";

    // Save the theme CSS file
    fs.writeFile(cssOutputPath, cssVariables, "utf8", err => {
        if (err) {
            console.error("Error writing theme CSS file:", err);
        } else {
            console.log(`✅ Theme CSS file saved as ${cssOutputPath}`);
        }
    });
});
