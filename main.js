const Brain = require('Brain.js');
const fs = require('fs');
const { triggers, outputs } = require('./data.js');
const lstm = new Brain.recurrent.LSTM();

var config = {
  read: true,
  train: true,
  iterations: -5 // just ignore this
}
var trainingData = [];

function initialize() {
  for (var i in triggers) {
    var triggerList = triggers[i];
    var outputList = outputs[i];
    for (var trigger of triggerList) {
      for (var output of outputList) {
        trainingData.push({ input: trigger, output: output });
      }
    }
  }
}

function train() {
  if (config.read) {
    console.log("Loading model...");
    lstm.fromJSON(JSON.parse(fs.readFileSync('model.json')));
    console.log("Model loaded.");
  }
  if (!config.train) return;
  console.log("-- Begin training --");
  lstm.train(trainingData, {
    iterations: Infinity,
    learningRate: 0.4,
    logPeriod: 1,
    log: details => console.log(details),
    callback: () => {
      config.iterations += 5;
      console.log("\nAutosaving...");
      console.log("Autosave complete.\n");
      const json = lstm.toJSON();
      fs.writeFileSync('model.json', JSON.stringify(json));
      
      console.log(config.iterations);
      if (config.iterations % 10 == 0) {
        test();
      }
    },
    callbackPeriod: 5,
    errorThresh: 0.011
  });

  const json = lstm.toJSON();
  fs.writeFileSync('model.json', JSON.stringify(json));
}

function test() {
  console.log("\nRun tests.\n=========================");
  query('hello');
  query('test');
  query('bye');
  console.log('=========================\n')
}

function query(text) {
  console.log(`${text}: ${lstm.run(text)}`);
}

initialize();
train();
test();