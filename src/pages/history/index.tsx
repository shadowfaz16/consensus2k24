import React from 'react'
import Table from '@/components/history/table'
import Layout from '@/components/layout'

const History = () => {
  return (
    <div className='pt-16 bg-gray-100 min-h-[92dvh]'>
        <div className='max-w-7xl mx-auto'>
        <Table />
        </div>
    </div>
  )
}

History.getLayout = function getLayout(page: React.ReactElement) {
    return <Layout>{page}</Layout>;
    }

export default History