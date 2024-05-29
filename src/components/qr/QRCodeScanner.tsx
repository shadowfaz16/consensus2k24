// components/QRCodeScanner.js
import React from 'react';
import { QrReader } from 'react-qr-reader';

const QRCodeScanner = ({ onScan }) => {
  const handleScan = (data) => {
    if (data) {
      onScan(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <QrReader
      scanDelay={300}
        onResult={handleScan}
        constraints={{
            
        }}
      />
    </div>
  );
};

export default QRCodeScanner;
