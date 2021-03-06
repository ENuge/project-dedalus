// @flow
import React from 'react';
import Header from './components/site/Header';
import Sidebar from './components/site/Sidebar';
import AboutContent from './components/site/AboutContent';
import TechContent from './components/site/TechContent';
import WIPContent from './components/site/WIPContent';
import NotesContent from './components/site/NotesContent';
import ThoughtsContent from './components/site/ThoughtsContent';

const PageContent = ({ page }: { page: string }) => {
  if (page === '') return <AboutContent />;
  if (page === 'about') return <AboutContent />;
  if (page === 'tech') return <TechContent />;
  if (page === 'notes') return <NotesContent />;
  if (page === 'thoughts') return <ThoughtsContent />;
  if (page === 'thoughts/monaco-ethiopia-2018') return <ThoughtsContent />;
  return <WIPContent />;
};

const IndexReactBase = ({ topLevelPage }: { topLevelPage: string }) => {
  return (
    <React.Fragment>
      <Header />
      <Sidebar />
      <div id="main-content-structure">
        <div id="main-content">
          <PageContent page={topLevelPage} />
        </div>
      </div>
    </React.Fragment>
  );
};
export default IndexReactBase;
