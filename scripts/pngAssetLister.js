const fs = require('fs');
const path = require('path');

const resourcesPath = path.join('resources');
function findPngFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findPngFiles(filePath, fileList);
        } else if (path.extname(file).toLowerCase() === '.png') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

const excludedPaths = [
    'character\\',
    'animal\\',
]

try {
    (async function(){
        const pngFiles = findPngFiles(resourcesPath);
        const template = await fs.readFileSync(path.join(__dirname, 'template.js'), {encoding: 'utf8', flag: 'r'})
        const transformed = 
            pngFiles
            .filter(str => !excludedPaths.some(path => str.includes(path)))
            .map(line => `"${line}",`)
            .join('\n')
            .replaceAll('\\', '/')
            .replaceAll('resources/img/', '');

        const output = template.replace('$', transformed);
        // fs.writeFileSync(path.join(__dirname, 'output.js'), output);
        fs.writeFileSync("resources/data/SpriteDefinitions.js", output);
    })()
} catch (error) {
    console.error(error.message);
}
