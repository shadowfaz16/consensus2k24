// pages/index.js
import { ReactElement, useState } from "react";
import QRCodeGenerator from "@/components/qr/QrGenerator";
import QRCodeScanner from "@/components/qr/QRCodeScanner";
import Layout from "@/components/layout";

const QR = () => {
  const [qrValue, setQrValue] = useState("");
  const [scannedValue, setScannedValue] = useState("");
  const [scan, setScan] = useState(false);

  const handleScan = (data: string) => {
    setScannedValue(data);
    navigator.clipboard.writeText(data).then(() => {
      // alert("Copied to clipboard");
    });
  };

  return (
    <div className="min-h-[92dvh] flex flex-col items-center justify-center bg-gray-100 p-4 gap-4">
      <h1>QR Code Generator and Scanner</h1>
        <button
            onClick={() => setScan(!scan)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-md"
            >
            {scan ? "Stop Scanning" : "Start Scanning"}
        </button>
        <p>or</p>
      <div className="">
        {/* <QRCodeGenerator value={qrValue} />  */}
        <input
          type="text"
          value={scannedValue}
          onChange={(e) => setScannedValue(e.target.value)}
          placeholder="Enter wallet address"
          className="border border-gray-300 p-2 rounded-md mb-4"
        />
      </div>
      <div className="">
        {scan ? <QRCodeScanner onScan={handleScan} scannedValue={scannedValue} /> : null}
      </div>
        {scannedValue ? <p>Scanned Valueeee: {scannedValue}</p> : null}
    </div>
  );
};

QR.getLayout = function getLayout(page: ReactElement) {
    return (
      <Layout>
        {page}
      </Layout>
    );
  }

export default QR;
