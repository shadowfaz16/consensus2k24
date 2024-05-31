import useNetwork from '@/hooks/useNetwork';
import { bytesToBase64 } from '@/ultils/utils';
import React, { useState } from 'react';
import { FaQq, FaQrcode, FaUpload } from 'react-icons/fa';
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import QRCodeGenerator from '../qr/QrGenerator';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '@/store/store';

const BottomBar = () => {
  const { loading, peerId, publicKey, peerNumber } = useNetwork();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const generatedUserWallet = useStore((state) => state.userGeneratedWallet);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isExpanded ? -2 : 0 }}
      className="fixed bottom-0 w-full"
    >
      <div className="h-14 p-4 w-full bg-white shadow-lg border-t flex items-center justify-between">
        <div className="flex items-center gap-2 md:max-w-7xl md:mx-auto w-full justify-between">
          <div className='flex items-center gap-2'>
          <p className="text-sm">Status: {' '}
          {loading ? 
            "Loading..." : "Connected"
            }
          </p>
          <div className={`w-3 h-3 rounded-full ${loading ? "bg-blue-400" : "bg-emerald-400"} animate-pulse`} />
          </div>
          <div className='flex items-center gap-4'>
            <div
            onClick={() => setShowQr(true)}
            >
          <FaQrcode className="cursor-pointer" size={20} />
            </div>
        {
          isExpanded ? (
            <IoChevronDownOutline className="cursor-pointer" onClick={toggleExpand} />
          ) : (
            <IoChevronUpOutline className="cursor-pointer" onClick={toggleExpand} />
          )
        }
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="w-full bg-white shadow-lg pb-4 px-4">
          <div className='md:max-w-7xl md:mx-auto md:w-full'>
          {loading ? (
            <div className="w-48 h-48 bg-gray-500 animate-pulse" />
          ) : (
            <>
              <p className="text-sm">
                Peer ID: <span className="font-bold text-xs">{peerId}</span>
              </p>
              <p className="text-sm">
                Public Key: <span className="font-bold text-xs">{publicKey ? bytesToBase64(publicKey) : 'N/A'}</span>
              </p>
              <p className="text-sm">
                Burner wallet: <span className="font-bold text-xs">{generatedUserWallet}</span>
              </p>
            </>
          )}
          </div>
        </div>
      )}
        <AnimatePresence mode='wait'>
      {
        showQr && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
           className="w-full min-h-screen bg-gray-900 bg-opacity-30 fixed top-0 left-0 z-20 flex items-center justify-center"
          onClick={() => setShowQr(false)}
          >
            <div className='flex items-center justify-center p-6 bg-white rounded-lg shadow-lg'>
            <QRCodeGenerator />
            </div>
          </motion.div>
        )
      }
          </AnimatePresence>
    </motion.div>
  );
};

export default BottomBar;
