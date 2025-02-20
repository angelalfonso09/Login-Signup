import React from 'react';
import '../styles/common/backgroundLayout.css';

const BackgroundLayout = ({ children, variant = 'purple' }) => {
  return (
    <div className={`background-layout ${variant}`}>
      {children}
    </div>
  );
};

export default BackgroundLayout;
