// run_extractor.js
const { extractStrings } = require('./extractor.js');

async function run() {
  try {
    const results = await extractStrings({
      project: true,
      verbose: true,
      skipVerification: true,
    });
    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error running string extractor:', error);
    process.exit(1);
  }
}

run();
