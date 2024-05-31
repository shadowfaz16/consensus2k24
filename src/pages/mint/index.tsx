import Layout from '@/components/layout';
import React from 'react'

const Mint = () => {
  return (
    <div className='bg-gray-100 min-h-[92dvh] pt-8'>
        <div className='bg-white rounded-lg shadow-lg max-w-7xl mx-auto p-7'>
            <h3 className='text-lg font-medium'>Claim</h3>
            <p className='text-sm'>
                Claim your nfts, see them in your profile and take them off chain
            </p>
            <button className='bg-blue-500 text-white rounded-lg p-2 mt-4'>Claim now</button>
        </div>
    </div>
  )
}

Mint.getLayout = function getLayout(page: React.ReactElement) {
    return <Layout>{page}</Layout>;
  };

export default Mint