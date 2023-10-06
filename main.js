const Brain = require('Brain.js');
const fs = require('fs');
const { triggers, outputs } = require('./data.js');
const lstm = new Brain.recurrent.LSTM();

var config = {
  read: true,
  train: true,
  iterations: -5
}
var logData = {
  status: "Waiting...",
  details: null,
  testResults: "None"
}
var logDataProxy = new Proxy(logData, {
  set: function (target, key, value) {
      target[key] = value;
      console.clear();
      console.log(`Status: ${logData.status}\nDetails: ${logData.details}\n\nLast test results:\n${logData.testResults}`);
    
      return true;
  }
});

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
    logDataProxy.status = "Loading model...";
    lstm.fromJSON(JSON.parse(fs.readFileSync('model.json')));
    logDataProxy.status = "Model loaded.";
  }
  if (!config.train) return;
  logDataProxy.status = "Training";
  lstm.train(trainingData, {
    iterations: Infinity,
    logPeriod: 1,
    log: details => {
      logDataProxy.details = details;
    },
    callback: () => {
      config.iterations += 5;
      logDataProxy.status = "Autosaving";
      const json = lstm.toJSON();
      fs.writeFileSync('model.json', JSON.stringify(json));
      logDataProxy.status = "Autosave Complete";
      if (config.iterations % 10 == 0) {
        test();
      }
    },
    callbackPeriod: 5,
    errorThresh: 0.011
  });
}

function test() {
  logDataProxy.status = "Running tests";
  logDataProxy.testResults = "";
  query('hello');
  query('test');
  query('bye');
}

function query(text) {
  logDataProxy.testResults += `${text}: ${lstm.run(text)}\n`;
}

initialize();
train();
test();