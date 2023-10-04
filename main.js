const Brain = require('Brain.js');
const fs = require('fs');
const { triggers, outputs } = require('./data.js');
const lstm = new Brain.recurrent.LSTM();

var config = {
  read: true,
  train: false
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
    console.log("Reading from file....");
    lstm.fromJSON(JSON.parse(fs.readFileSync('model.json')));
  }
  if (!config.train) return;
  console.log("Training model...");
  lstm.train(trainingData, {
    iterations: 100,
    logPeriod: 1,
    log: details => console.log(details),
    callback: () => {
      console.log("Autosave...");
      const json = lstm.toJSON();
      fs.writeFileSync('model.json', JSON.stringify(json));
    },
    callbackPeriod: 5,
    errorThresh: 0.011
  });

  const json = lstm.toJSON();
  fs.writeFileSync('model.json', JSON.stringify(json));
}

function test() {
  query('hello');
  query('test');
  query('bye');
}

function query(text) {
  console.log(`${text}: ${lstm.run(text)}`);
}

initialize();
train();
test();