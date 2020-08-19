import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Divider,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  SvgIcon,
  TextField
} from '@material-ui/core';
import EmailIcon from '@material-ui/icons/Email';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';

import { Component, MessageType } from '../message_types';
import { useTimeout } from './timeout';
import { hot } from 'react-hot-loader';

const SearchBarState = {
  MODEL_LOADING: 'MODEL_LOADING',
  READY: 'READY',
  LOADING: 'LOADING',
  DONE: 'DONE'
};

const sendMessageToContent = (message) => {
  console.log('send msg to content:', message);
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
  });
};

const sendMessageToBackground = (message) => {
  console.log('send msg to background:', message);
  chrome.runtime.sendMessage(message);
};

const registerListener = (setState, setAnswers, setErrors) => {
  chrome.runtime.onMessage.addListener((msg, sender, callback) => {
    console.log('recieved msg:', msg, 'from:', sender);
    switch (msg.type) {
      // Do nothing, these msgs are handled by the content script.
      case MessageType.QUESTION_RESULT:
      case MessageType.QUESTION_ERROR:
      case MessageType.QUESTION:
        break;

      case MessageType.MODEL_LOADED:
        setState(SearchBarState.READY);
        break;

      case MessageType.QUERY_RESULT:
        setAnswers((answers) =>
          [...answers, msg].sort((msg1, msg2) => {
            if (msg1.answer.score < msg2.answer.score) {
              return 1;
            } else {
              return -1;
            }
          })
        );
        break;

      case MessageType.QUERY_ERROR:
        setErrors((errors) => [...errors, msg]);
        break;

      case MessageType.QUERY_DONE:
        setState(SearchBarState.DONE);
        break;

      default:
        console.error('Did not recognize message type:', msg);
        break;
    }
  });
};

const SearchBarInput = (props) => {
  const inputRef = useRef();

  useEffect(() => {
    if (props.state === SearchBarState.READY) {
      inputRef.current.focus();
    }
  }, [props.state]);

  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      input={props.input}
      onChange={(e) => {
        props.setInput(e.target.value);
      }}
      disabled={props.state !== SearchBarState.READY}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          props.search();
        }
      }}
    />
  );
};

const SearchBarControl = (props) => {
  if (props.state === SearchBarState.MODEL_LOADING) {
    return (
      <Grid container spacing={2}>
        <Grid item>
          <CircularProgress size={22} />
        </Grid>
        <Grid item style={{ margin: 'auto auto' }}>
          <span>Model Loading</span>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container>
      <Grid item>
        <IconButton
          size="small"
          disabled={props.selectionIdx >= props.answers.length - 1}
          onClick={() => {
            props.setSelectionIdx((idx) => idx + 1);
          }}>
          <KeyboardArrowDownIcon />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          size="small"
          disabled={props.selectionIdx === 0}
          onClick={() => {
            props.setSelectionIdx((idx) => idx - 1);
          }}>
          <KeyboardArrowUpIcon />
        </IconButton>
      </Grid>
      {props.state === SearchBarState.READY && (
        <Grid item>
          <IconButton size="small" onClick={props.search}>
            <SearchIcon />
          </IconButton>
        </Grid>
      )}
      {props.state === SearchBarState.LOADING && (
        <Grid item>
          <IconButton size="small" disabled>
            <CircularProgress size={22} />
          </IconButton>
        </Grid>
      )}
      {props.state === SearchBarState.DONE && (
        <Grid item>
          <IconButton size="small" onClick={props.reset}>
            <CloseIcon />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
};

const SearchIndicator = (props) => {
  if (props.state === SearchBarState.DONE && props.answers.length === 0) {
    return <span style={{ textAlign: 'center' }}>No Results</span>;
  }

  if (props.answers.length === 0) {
    return null;
  }

  return (
    <span>
      {props.selectionIdx + 1}/{props.answers.length}
    </span>
  );
};

const SearchBar = (props) => {
  var [answers, setAnswers] = useState([]);
  var [errors, setErrors] = useState([]);
  var [state, setState] = useState(SearchBarState.MODEL_LOADING);
  var [selectionIdx, setSelectionIdx] = useState(0);
  var [input, setInput] = useState('');

  // Register event listeners for recieving answers and errors
  // from the content script.
  useEffect(() => {
    registerListener(setState, setAnswers, setErrors);
  }, [setState, setAnswers, setErrors]);

  // Fire a selection event any time answers or selected index
  // changes.
  useEffect(() => {
    if (selectionIdx >= answers.length) {
      return;
    }

    sendMessageToContent({
      type: MessageType.SELECT,
      answer: answers[selectionIdx].answer,
      elementId: answers[selectionIdx].elementId
    });
  }, [selectionIdx, answers]);

  useEffect(() => {
    sendMessageToBackground({
      type: MessageType.POPUP_LOADED
    });
  }, []);

  const search = () => {
    sendMessageToContent({
      type: MessageType.QUERY,
      query: input
    });

    setState(SearchBarState.LOADING);
  };

  const reset = () => {
    sendMessageToContent({
      type: MessageType.CLEAR
    });

    setAnswers([]);
    setErrors([]);
    setSelectionIdx(0);
    setState(SearchBarState.READY);
  };

  const gridStyle = {
    width: '450px',
    padding: '10px',
    paddingBottom: '5px'
  };

  const itemStyle = {
    margin: 'auto auto'
  };

  return (
    <Grid container style={gridStyle} spacing={2}>
      <Grid item style={itemStyle} xs={state === SearchBarState.READY ? 9 : 8}>
        <SearchBarInput
          state={state}
          input={input}
          setInput={setInput}
          search={search}
        />
      </Grid>
      {state === SearchBarState.LOADING || state === SearchBarState.DONE ? (
        <Grid item style={itemStyle} answers={answers} xs={1}>
          <SearchIndicator
            state={state}
            answers={answers}
            selectionIdx={selectionIdx}
          />
        </Grid>
      ) : null}
      <Grid item style={itemStyle}>
        <SearchBarControl
          input={input}
          search={search}
          reset={reset}
          state={state}
          answers={answers}
          selectionIdx={selectionIdx}
          setSelectionIdx={setSelectionIdx}
        />
      </Grid>
    </Grid>
  );
};

export default hot(module)(SearchBar);
