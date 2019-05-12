import React from 'react';
import ReactDOM from 'react-dom';
import IndexReactBase from './IndexReactBase';
import DedalusReactBase from './DedalusReactBase';

if (document.getElementById('app-index')) {
  const topLevelPage = window.location.pathname.slice(1);
  ReactDOM.hydrate(
    <IndexReactBase topLevelPage={topLevelPage} />,
    document.getElementById('app-index')
  );
} else if (document.getElementById('app-dedalus')) {
  ReactDOM.hydrate(<DedalusReactBase />, document.getElementById('app-dedalus'));
}
