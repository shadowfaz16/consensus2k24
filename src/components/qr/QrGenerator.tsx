// components/QRCodeGenerator.js
import React from 'react';
import {QRCodeSVG} from 'qrcode.react';

interface QRCodeGeneratorProps {
    value: string;
    }

const QRCodeGenerator = ({ value }: QRCodeGeneratorProps) => {
  return (
    <div>
      <QRCodeSVG value={value} />
    </div>
  );
};

export default QRCodeGenerator;
