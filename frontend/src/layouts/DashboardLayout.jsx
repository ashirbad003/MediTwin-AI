import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

function DashboardLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '28px 32px',
          background: 'transparent',
          overflowY: 'auto',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
