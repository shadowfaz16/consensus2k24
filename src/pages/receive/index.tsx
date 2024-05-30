import React from 'react';
import QRCodeGenerator from '@/components/qr/QrGenerator';
import Layout from '@/components/layout';
import { FaRegUserCircle } from "react-icons/fa";


const Profile = () => {
  return (
    <div className="min-h-[92dvh] flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
        <div className="flex flex-col items-center">
          <FaRegUserCircle className="w-24 h-24 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Bob</h2>
          <p className="text-gray-600">ID: 42069</p>
          <p className="text-gray-600">Austin, Texas, USA</p>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
            {/* QR Code will be placed here */}
            <QRCodeGenerator value="https://example.com" />
          </div>
        </div>
      </div>
    </div>
  );
};

Profile.getLayout = function getLayout(page: React.ReactElement) {
    return <Layout>{page}</Layout>;
    }

export default Profile;
