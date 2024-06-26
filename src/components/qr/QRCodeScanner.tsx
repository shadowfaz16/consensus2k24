import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  scannedValue: string;
}

const QRCodeScanner = ({ onScan, scannedValue }: QRCodeScannerProps) => {
  const [data, setData] = useState("No result");

  const handleScan = (data: string) => {
    if (data) {
      onScan(data);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
  };

  return (
    <div className="w-64 h-64">
      <QrReader
        scanDelay={300}
        onResult={(result, error) => {
          if (result) {
            const scannedText = result.getText();
            setData(scannedText);
            handleScan(scannedText);
          }
          if (!!error) {
            console.info(error);
          }
        }}
        constraints={{}}
      />
    </div>
  );
};

export default QRCodeScanner;
