import React from 'react';
import { Spin } from 'antd';
import 'antd/dist/reset.css';

const LoadingComponent = () => {
  return (
    <div style={styles.container}>
      <Spin size="large" />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};

export default LoadingComponent;
