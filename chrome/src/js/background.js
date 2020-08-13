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
        question: msg,
        answers: [],
        error: error
      });
    });

  return true;
};

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.log('Recieved message: ', request, 'from:', sender);

  switch (request.type) {
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
        return answer(window.__qna_model, request, callback);
      }

    default:
      console.error('Did not recognize message type: ', request);
      return true;
  }
});
