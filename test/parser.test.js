const fs = require('fs');
const path = require('path');
const aepxParser = require('../src/parser');

describe('parser test', () => {
  describe('aepx files', () => {
    it('write file', () => {
      const inputPath = './test/aepx';
      const outputPath = './test/json';

      fs.readdirSync(inputPath)
        .filter(filename => filename.match(/.*\.aepx/i))
        .forEach((filename) => {
          console.log(filename);
          const file = path.join(inputPath, filename);
          const aepxJson = aepxParser.parseFileSync(file);
          fs.writeFileSync(`${path.join(outputPath, filename)}.json`, JSON.stringify(aepxJson));
        });
    });
  });
});
