import React, { useState, useEffect } from 'react';
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
  TextField,
  Typography
} from '@material-ui/core';
import EmailIcon from '@material-ui/icons/Email';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';

import { Component, MessageType } from '../types';
import { useTimeout } from './timeout';
import { hot } from 'react-hot-loader';

const SearchBarState = {
  READY: 'READY',
  LOADING: 'LOADING',
  DONE: 'DONE'
};

const SearchBarControl = (props) => {
  if (props.state === SearchBarState.READY) {
    return (
      <IconButton size="small">
        <SearchIcon
          onClick={() => {
            props.search();
          }}
        />
      </IconButton>
    );
  } else if (props.state === SearchBarState.LOADING) {
    return (
      <Grid container>
        <Grid item>
          <IconButton size="small">
            <KeyboardArrowDownIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton size="small">
            <KeyboardArrowUpIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton size="small">
            <CloseIcon
              onClick={() => {
                props.setState(SearchBarState.READY);
              }}
            />
          </IconButton>
        </Grid>
      </Grid>
    );
  }
};

const SearchBar = (props) => {
  var [state, setState] = useState(SearchBarState.READY);
  var [input, setInput] = useState('');

  const gridStyle = {
    width: '450px',
    padding: '10px',
    paddingBottom: '5px'
  };

  const itemStyle = {
    margin: 'auto auto'
  };

  const search = () => {
    setState(SearchBarState.LOADING);
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {
        type: MessageType.QUERY,
        to: Component.CONTENT_SCRIPT,
        query: input
      });
    });
  };

  return (
    <Grid container style={gridStyle} spacing={2}>
      <Grid item xs={9}>
        <TextField
          fullHeight
          fullWidth
          input={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          disabled={state !== SearchBarState.READY}
        />
      </Grid>
      <Grid item style={itemStyle}>
        <SearchBarControl state={state} search={search} />
      </Grid>
    </Grid>
  );
};

export default hot(module)(SearchBar);
