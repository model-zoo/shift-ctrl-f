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
  QUESTION_RESULT: 'QUESTION_RESULT',
  // Error from background model -> content.
  QUESTION_ERROR: 'QUESTION_ERROR',

  // Popup broadcast message on load.
  POPUP_LOADED: 'POPUP_LOADED',
  // Model broadcast message when loaded.
  MODEL_LOADED: 'MODEL_LOADED',
  // Model error
  MODEL_ERROR: 'MODEL_ERROR'
};
