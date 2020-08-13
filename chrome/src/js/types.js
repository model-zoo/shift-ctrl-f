export const Component = {
  CONTENT_SCRIPT: 'CONTENT_SCRIPT',
  BACKGROUND: 'BACKGROUND',
  POPUP: 'POPUP'
};

export const MessageType = {
  // Query from popup -> content script.
  QUERY: 'QUERY',
  // Select from popup -> content script.
  SELECT: 'SELECT',
  // Clear selection and search from popup -> content script.
  CLEAR: 'CLEAR',
  // Query result from content script -> popup.
  QUERY_RESULT: 'QUERY_RESULT',
  // Query error from content script -> popup.
  QUERY_ERROR: 'QUERY_ERROR',
  // Query is done when content script -> popup sends this.
  QUERY_DONE: 'QUERY_DONE',

  // Question from content script -> background model.
  QUESTION: 'QUESTION',
  // Answer from background model -> content.
  MODEL_SUCCESS: 'MODEL_SUCCESS',
  // Error from background model -> content.
  MODEL_ERROR: 'MODEL_ERROR'
};
