import '../css/popup.css';

import React from 'react';
import { render } from 'react-dom';
import SearchBar from './popup/search_bar';

render(<SearchBar />, window.document.getElementById('app-container'));
