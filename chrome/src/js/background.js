import './content/hot-reload';
import './content/icons';

import { Component, MessageType } from './types';

import * as tf from '@tensorflow/tfjs';
const qna = require('@tensorflow-models/qna');

qna.load({ modelUrl: 'models/mobilebert_1', fromTFHub: true }).then((model) => {
  window.__qna_model = model;
  console.log('Model loaded');
});

const answer = (model, msg, callback) => {
  model
    .findAnswers(msg.question, msg.context)
    .then((answers) => {
      callback({
        type: MessageType.MODEL_SUCCESS,
        question: msg,
        answers: answers
      });
    })
    .catch((error) => {
      console.log('Send error:', error);
      callback({
        type: MessageType.MODEL_ERROR,
        question: error,
        answers: [],
        error: error
      });
    });

  return true;
};

chrome.runtime.onMessage.addListener((msg, sender, callback) => {
  console.log('Recieved message: ', msg, 'from:', sender);

  switch (msg.type) {
    case MessageType.QUERY:
    case MessageType.QUERY_RESULT:
    case MessageType.QUERY_ERROR:
    case MessageType.QUERY_DONE:
      break;

    case MessageType.QUESTION:
      if (!window.__qna_model) {
        callback({
          type: MessageType.MODEL_ERROR,
          question: msg,
          answers: [],
          error: 'Model not loaded'
        });
        return true;
      } else {
        return answer(window.__qna_model, msg, callback);
      }

    default:
      console.error('Did not recognize message type: ', msg);
      return true;
  }
});

// Open the popup
chrome.commands.onCommand.addListener(function (command) {
  console.log('onCommand event received for message: ', command);
});
