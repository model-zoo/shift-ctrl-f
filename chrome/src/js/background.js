import './hot-reload';

import { Component, MessageType } from './types';

import * as tf from '@tensorflow/tfjs';
const qna = require('@tensorflow-models/qna');

const sendMessageToContent = (message) => {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab) {
      console.log('Send msg to content:', message);
      chrome.tabs.sendMessage(activeTab.id, message);
    } else {
      console.log('Unable to send msg, no active tab:', message);
    }
  });
};

const sendMessageToPopup = (message) => {
  console.log('Send msg to popup:', message);
  chrome.runtime.sendMessage(message);
};

qna.load({ modelUrl: 'models/mobilebert_1', fromTFHub: true }).then((model) => {
  window.__qna_model = model;
  sendMessageToPopup({
    type: MessageType.MODEL_LOADED
  });
  console.log('Model loaded');
});

const handleAnswer = (model, msg) => {
  model
    .findAnswers(msg.question, msg.context)
    .then((answers) => {
      sendMessageToContent({
        type: MessageType.QUESTION_RESULT,
        question: msg,
        answers: answers
      });
    })
    .catch((error) => {
      sendMessageToContent({
        type: MessageType.QUESTION_ERROR,
        question: msg,
        answers: [],
        error: error
      });
    });

  return true;
};

chrome.runtime.onMessage.addListener((msg, sender, callback) => {
  console.log('recieve msg:', msg);
  switch (msg.type) {
    case MessageType.QUERY:
    case MessageType.QUERY_RESULT:
    case MessageType.QUERY_ERROR:
    case MessageType.QUERY_DONE:
      break;

    case MessageType.POPUP_LOADED:
      // If model is loaded, respond with a "model loaded"
      // message. Otherwise, wait for the model to load.
      if (window.__qna_model) {
        sendMessageToPopup({
          type: MessageType.MODEL_LOADED
        });
      }
      break;

    case MessageType.QUESTION:
      if (!window.__qna_model) {
        sendMessageToContent({
          type: MessageType.QUESTION_ERROR,
          question: msg,
          answers: [],
          error: 'Model not loaded'
        });
        return true;
      } else {
        return handleAnswer(window.__qna_model, msg, callback);
      }

    default:
      console.error('Did not recognize message type: ', msg);
      return true;
  }
});
