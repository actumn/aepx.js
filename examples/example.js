const fs = require('fs');
const path = require('path');
const aepx = require('../');

const inputPath = './input';
const outputPath = './output';

fs.readdirSync(inputPath)
  .filter(filename => filename.match(/.*\.aepx/i))
  .forEach((filename) => {
    console.log(filename);
    const file = path.join(inputPath, filename);
    const aepxJson = aepx.parseFileSync(file);
    fs.writeFileSync(`${path.join(outputPath, filename)}.json`, JSON.stringify(aepxJson));
  });