export const MessageType = {
  // User types in a query.
  // From: Popup
  // To: Content Script
  QUERY: 'QUERY',

  // User selects a query result.
  // From: Popup
  // To: Content Script
  SELECT: 'SELECT',

  // User clears selection.
  // From: Popup
  // To: Content Script
  CLEAR: 'CLEAR',

  // Query has resulted in a match for an element on the page.
  // From: Content Script
  // To: Popup
  QUERY_RESULT: 'QUERY_RESULT',
  QUERY_ERROR: 'QUERY_ERROR',
  // Indicates that all the elements of the page have been analyzed and the
  // query is "done"
  // From: Content Script
  // To: Popup
  QUERY_DONE: 'QUERY_DONE',

  // Model request for a question-answer pair.
  // From: Content Script
  // To: Background
  QUESTION: 'QUESTION',
  // Model responds to a question-answer pair with success or error.
  // From: Background
  // To: Content Script
  QUESTION_RESULT: 'QUESTION_RESULT',
  QUESTION_ERROR: 'QUESTION_ERROR',

  // Popup sends this message when opened.
  // From: Popup
  // To: Background
  POPUP_LOADED: 'POPUP_LOADED',
  // Background sends this message on successful model load or error. Used to
  // indicate that the model is ready to the user.
  // From: Background
  // To: Popup
  MODEL_LOADED: 'MODEL_LOADED',
  MODEL_ERROR: 'MODEL_ERROR'
};
