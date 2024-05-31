// components/QRCodeGenerator.js
import React from 'react';
import {QRCodeSVG} from 'qrcode.react';
import useStore from '@/store/store';

interface QRCodeGeneratorProps {
    value?: string;
    }

const QRCodeGenerator = ({ value }: QRCodeGeneratorProps) => {

  const qrString = useStore((state) => state.qrString);

  return (
    <div>
      <QRCodeSVG value={qrString ? qrString : "NO CID YET"} size={220} />
    </div>
  );
};

export default QRCodeGenerator;
