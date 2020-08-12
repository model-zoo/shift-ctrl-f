import './content/hot-reload';
import './content/icons';

import { Component, MessageType } from './types';

import * as tf from '@tensorflow/tfjs';
const qna = require('@tensorflow-models/qna');

qna.load({ modelUrl: 'models/mobilebert_1', fromTFHub: true }).then((model) => {
  console.log('Model loaded');

  chrome.runtime.onMessage.addListener((request, sender, callback) => {
    console.log('Recieved message: ', request, 'from:', sender);
    if (request.to !== Component.BACKGROUND) {
      return;
    }

    model
      .findAnswers(request.question, request.context)
      .then((answers) => {
        callback({
          type: 'success',
          answers: answers
        });
      })
      .catch((error) => {
        callback({
          type: 'error',
          error: error
        });
      });

    return true; // https://stackoverflow.com/a/56483156
  });
});
