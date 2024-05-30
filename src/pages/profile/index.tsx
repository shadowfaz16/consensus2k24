import React from 'react';
import QRCodeGenerator from '@/components/qr/QrGenerator';

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
        <div className="flex flex-col items-center">
          <img
            className="w-24 h-24 rounded-full shadow-md"
            src="https://via.placeholder.com/150"
            alt="Profile"
          />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">John Doe</h2>
          <p className="text-gray-600">ID: 123456789</p>
          <p className="text-gray-600">Location: New York, USA</p>
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

export default Profile;
