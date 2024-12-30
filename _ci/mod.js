const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

// Input and output directories
const inputDir = 'src/';
const outputBaseDir = 'modules/';

// Clean and recreate the output directory
if (fs.existsSync(outputBaseDir)) {
  console.log(`Cleaning up the output directory: ${outputBaseDir}`);
  fs.rmSync(outputBaseDir, { recursive: true, force: true });
}
fs.mkdirSync(outputBaseDir, { recursive: true });

// Parse script content using Acorn
function parseScript(content) {
  return acorn.parse(content, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ranges: true,
  });
}

// Extract definitions: functions, classes, constants, and objects
function extractDefinitions(content) {
  const functions = {};
  const constants = {};
  const classes = {};
  const objects = {};

  const ast = parseScript(content);

  ast.body.forEach((node) => {
    // Handle constants
    if (
      node.type === 'VariableDeclaration' &&
      node.declarations.length === 1 &&
      node.declarations[0].init &&
      node.declarations[0].id.type === 'Identifier'
    ) {
      const constName = node.declarations[0].id.name;
      const constCode = content.slice(node.start, node.end);
      constants[constName] = constCode;
    }

    // Handle standalone functions
    if (node.type === 'FunctionDeclaration' && node.id && node.id.name) {
      const funcName = node.id.name;
      const funcCode = content.slice(node.start, node.end);
      functions[funcName] = `export default ${funcCode}`;
    }

    // Handle classes
    if (node.type === 'ClassDeclaration') {
      const className = node.id.name;
      const classMethods = {};
      node.body.body.forEach((method) => {
        if (method.type === 'MethodDefinition') {
          const methodName = method.key.name;
          const methodCode = content.slice(method.start, method.end);
          classMethods[methodName] = `export default ${methodCode}`;
        }
      });
      classes[className] = { methods: classMethods };
    }

    // Handle object definitions
    if (
      node.type === 'VariableDeclaration' &&
      node.declarations.length === 1 &&
      node.declarations[0].init &&
      node.declarations[0].init.type === 'ObjectExpression'
    ) {
      const objectName = node.declarations[0].id.name;
      const objectProperties = {};
      node.declarations[0].init.properties.forEach((prop) => {
        if (prop.value.type === 'FunctionExpression') {
          const methodName = prop.key.name;
          const methodCode = content.slice(prop.value.start, prop.value.end);
          objectProperties[methodName] = `export default ${methodCode}`;
        } else {
          const propertyName = prop.key.name;
          const propertyCode = content.slice(prop.value.start, prop.value.end);
          objectProperties[propertyName] = propertyCode;
        }
      });
      objects[objectName] = { properties: objectProperties };
    }
  });

  return { functions, constants, classes, objects };
}

// Split definitions into files
function splitDefinitions(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const objectName = path.basename(fileName, '.js');
  const { functions, constants, classes, objects } = extractDefinitions(content);

  const objectDir = path.join(outputBaseDir, objectName);

  // Create subdirectory for the object
  if (!fs.existsSync(objectDir)) {
    fs.mkdirSync(objectDir, { recursive: true });
  }

  // Write functions to separate files
  Object.entries(functions).forEach(([funcName, funcCode]) => {
    const funcFilePath = path.join(objectDir, `${funcName}.js`);
    fs.writeFileSync(funcFilePath, funcCode, 'utf-8');
  });

  // Write constants to the index file
  const constantsContent = Object.values(constants).join('\n');

  // Write class methods to separate files
  Object.entries(classes).forEach(([className, classData]) => {
    const classDir = path.join(objectDir, className);
    if (!fs.existsSync(classDir)) {
      fs.mkdirSync(classDir, { recursive: true });
    }

    Object.entries(classData.methods).forEach(([methodName, methodCode]) => {
      const methodFilePath = path.join(classDir, `${methodName}.js`);
      fs.writeFileSync(methodFilePath, methodCode, 'utf-8');
    });
  });

  // Write object properties to the index file
  Object.entries(objects).forEach(([objectName, objectData]) => {
    Object.entries(objectData.properties).forEach(([propertyName, propertyCode]) => {
      if (propertyCode.includes('function')) {
        const propertyFilePath = path.join(objectDir, `${propertyName}.js`);
        fs.writeFileSync(propertyFilePath, propertyCode, 'utf-8');
      }
    });
  });

  return { objectName, functions, constants, classes, objects, objectDir };
}

// Generate the index.js file for each object
function generateIndexFile(objectDir, objectName, functions, constants, classes, objects) {
  const indexFilePath = path.join(objectDir, 'index.js');

  // Import functions
  const functionImports = Object.keys(functions)
    .map((func) => `import ${func} from './${func}.js';`)
    .join('\n');

  // Import class methods
  const classImports = Object.entries(classes)
    .map(([className, classData]) =>
      Object.keys(classData.methods)
        .map(
          (method) =>
            `import ${method} from './${className}/${method}.js';`
        )
        .join('\n')
    )
    .join('\n');

  // Import constants
  const constantsContent = Object.values(constants).join('\n');

  // Import object properties
  const objectProperties = Object.entries(objects)
    .map(([objectName, objectData]) =>
      Object.entries(objectData.properties)
        .map(([propertyName, propertyCode]) => {
          if (propertyCode.includes('function')) {
            return `import ${propertyName} from './${objectName}/${propertyName}.js';`;
          }
          return `const ${propertyName} = ${propertyCode};`;
        })
        .join('\n')
    )
    .join('\n');

  // Reconstruct functions
  const functionsObject = Object.keys(functions).join(',\n  ');

  // Reconstruct classes
  const classDefinitions = Object.entries(classes)
    .map(([className, classData]) => {
      const methods = Object.keys(classData.methods).join(',\n  ');
      return `class ${className} {\n  ${methods}\n}\nexport default ${className};`;
    })
    .join('\n\n');

  const content = `${functionImports}\n${classImports}\n\n${constantsContent}\n\n${objectProperties}\n\n${functionsObject}\n\n${classDefinitions}`;
  fs.writeFileSync(indexFilePath, content, 'utf-8');
}

// Generate the main.js file for the entire project
function generateMainFile(outputBaseDir) {
  const mainFilePath = path.join(outputBaseDir, 'main.js');

  // Find all index files
  const indexFiles = fs.readdirSync(outputBaseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .map((dirName) => `import ${dirName} from './${dirName}/index.js';`);

  // Generate modules object
  const modules = indexFiles
    .map((importLine) => {
      const moduleName = importLine.match(/import (.+) from/)[1];
      return moduleName;
    })
    .join(',\n  ');

  const content = `${indexFiles.join('\n')}\n\nconst modules = {\n  ${modules}\n};\n\nexport default modules;`;
  fs.writeFileSync(mainFilePath, content, 'utf-8');
}

// Process all files in the `src` directory
function processFiles() {
  const files = fs.readdirSync(inputDir).filter((file) => file.endsWith('.js'));

  files.forEach((fileName) => {
    const filePath = path.join(inputDir, fileName);

    console.log(`Processing file: ${fileName}`);
    const { objectName, functions, constants, classes, objects, objectDir } =
      splitDefinitions(filePath, fileName);

    console.log(`Generating index file for: ${objectName}`);
    generateIndexFile(objectDir, objectName, functions, constants, classes, objects);
  });

  console.log('Generating main.js file...');
  generateMainFile(outputBaseDir);

  console.log('Processing complete!');
}

processFiles();
