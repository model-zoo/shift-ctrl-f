import '../css/inject.css';
import Mark from 'mark.js';
import { MIN_CONTEXT_LENGTH } from './constants';
import { Component, MessageType } from './types';

import $ from 'jquery';
import { v4 as uuidv4 } from 'uuid';

const DATA_ATTR_ELEMENT_ID = 'data-ctrlf-element-uuid';
const DATA_ATTR_SUCCESS = 'data-ctrlf-success';
const DATA_ATTR_SELECTED = 'data-ctrlf-selected';

const findAllElements = () => {
  return $('[' + DATA_ATTR_ELEMENT_ID + ']');
};

const findElementById = (elementId) => {
  const q = $('[' + DATA_ATTR_ELEMENT_ID + '=' + elementId + ']');
  return q.length > 0 ? $(q[0]) : null;
};

const checkIfQueryDone = () => {
  const allElements = findAllElements();
  const waitingElements = allElements.filter((idx, node) => {
    return $(node).attr(DATA_ATTR_SUCCESS) === undefined;
  });

  if (waitingElements.length === 0) {
    console.log('Query done');
    chrome.runtime.sendMessage({
      type: MessageType.QUERY_DONE
    });
  }
};

const handleQuery = (msg) => {
  console.log('Searching query:', msg.query);

  const paragraphs = $('p');
  const longParagraphs = paragraphs.filter(
    (idx, el) => $(el).text().length >= MIN_CONTEXT_LENGTH
  );

  console.log('Searching', longParagraphs.length, 'paragraphs');
  if (longParagraphs.length === 0) {
    return chrome.runtime.sendMessage({
      type: MessageType.QUERY_DONE
    });
  }

  longParagraphs.each((idx, element) => {
    const context = $(element).text();
    const elementId = uuidv4();
    $(element).attr(DATA_ATTR_ELEMENT_ID, elementId);
    chrome.runtime.sendMessage(
      {
        type: MessageType.QUESTION,
        elementId: elementId,
        question: msg.query,
        context: context
      },
      handleMsg
    );
  });
};

const handleModelSuccess = (msg) => {
  // Mark question on dom.
  const element = findElementById(msg.question.elementId);
  element.attr(DATA_ATTR_SUCCESS, 'true');

  for (const answer of msg.answers) {
    chrome.runtime.sendMessage({
      type: MessageType.QUERY_RESULT,
      answer: answer,
      elementId: msg.question.elementId
    });
  }

  checkIfQueryDone();
};

const handleModelErr = (msg) => {
  console.log('Model error: ', msg);

  // Mark question on dom.
  const element = findElementById(msg.question.elementId);
  element.attr(DATA_ATTR_SUCCESS, 'false');

  chrome.runtime.sendMessage({
    type: MessageType.QUERY_ERROR,
    error: msg.error,
    elementId: msg.elementId
  });

  checkIfQueryDone();
};

const clearSelection = () => {
  // Remove old highlight if it exists.
  const oldElement = $('[' + DATA_ATTR_SELECTED + ']');
  if (oldElement.length > 0) {
    oldElement.removeAttr(DATA_ATTR_SELECTED);
    var instance = new Mark(oldElement[0]);
    instance.unmark();
  }
};

const handleSelection = (msg) => {
  clearSelection();

  // Add new highlight;
  const element = findElementById(msg.elementId);
  element.attr(DATA_ATTR_SELECTED, 'true');
  element[0].scrollIntoView({
    block: 'end',
    inline: 'nearest'
  });
  var instance = new Mark(element[0]);
  instance.mark(msg.answer.text, {
    acrossElements: true,
    separateWordSearch: false
  });
};

const handleClear = () => {
  clearSelection();
  findAllElements()
    .removeAttr(DATA_ATTR_SUCCESS)
    .removeAttr(DATA_ATTR_ELEMENT_ID);
};

const handleMsg = (msg, sender, callback) => {
  if (!msg) {
    console.log('Invalid msg: ', msg);
    return;
  }

  switch (msg.type) {
    case MessageType.QUERY:
      handleQuery(msg);
      break;
    case MessageType.MODEL_SUCCESS:
      handleModelSuccess(msg);
      break;
    case MessageType.MODEL_ERROR:
      handleModelErr(msg);
      break;
    case MessageType.SELECT:
      handleSelection(msg);
      break;
    case MessageType.CLEAR:
      handleClear();
      break;

    default:
      console.error('Did not recognize message type:', msg);
  }
};

chrome.runtime.onMessage.addListener(handleMsg);
