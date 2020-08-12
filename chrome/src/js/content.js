import { MIN_CONTEXT_LENGTH } from './constants';
import { Component, MessageType } from './types';

import $ from 'jquery';

const search = (query) => {
  console.log('Query:', query);

  $('p').each((idx, element) => {
    const context = $(element).text();
    if (context.length < MIN_CONTEXT_LENGTH) {
      return;
    }

    const message = {
      question: query,
      context: context
    };

    chrome.runtime.sendMessage(message, (response) => {
      if (response.type === 'success') {
        if (response.answers.length > 0) {
          console.log('Answers: ', response.answers);
        }
      } else if (response.type === 'error') {
        console.log('Error: ', response);
      } else {
        console.log('Did not recognize response: ', response);
      }
    });
  });
};

const test = () => {
  const message = {
    context: `A Pod (as in a pod of whales or pea pod) is a group of one or more containers, with shared storage/network resources, and a specification for how to run the containers. A Pod's contents are always co-located and co-scheduled, and run in a shared context. A Pod models an application-specific "logical host": it contains one or more application containers which are relatively tightly coupled. In non-cloud contexts, applications executed on the same physical or virtual machine are analogous to cloud applications executed on the same logical host.`,
    question: 'What is a pod?'
  };

  chrome.runtime.sendMessage(message, (response) => {
    console.log('Got response: ', response);
  });
};

chrome.runtime.onMessage.addListener((request, sender, response) => {
  console.log('Recieved message: ', request, 'from:', sender);
  if (request.to !== Component.CONTENT_SCRIPT) {
    return;
  }

  switch (request.type) {
    case MessageType.QUERY:
      search(request.query);
    default:
      console.assert(False);
  }
});

//search('What is a pod?');
// test();
