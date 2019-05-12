// @flow
import React from 'react';
import Header from './components/site/Header';
import Sidebar from './components/site/Sidebar';
import AboutContent from './components/site/AboutContent';
import WIPContent from './components/site/WIPContent';

const PageContent = ({page}: {page: string}) => {
  if (page === 'about') return <AboutContent />;
  return <WIPContent />;
};

const IndexReactBase = ({topLevelPage}: {topLevelPage: string}) => {
  return (
    <React.Fragment>
      <Header />
      <div id="main-content-structure">
        <Sidebar />
        <PageContent page={topLevelPage} />
        {/* <div className="content" /> */}
      </div>
    </React.Fragment>
  );
};
export default IndexReactBase;
