import { useState } from 'react'
import CustomSidebar from '../components/common/CustomSidebar'
import TradeView from '../layouts/TradeView'

import '../styles/dashboard.css'


function Dashboard() {

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div>
        <CustomSidebar />
      </div>

      <div className="d-flex flex-grow-1 dashboard-content">
        <div className="container-fluid">
          {/* <h1 className="text-center">
            Hello, this is the dock view test dashboard!
          </h1> */}
          <TradeView />
        </div>
      </div>
    </div>
  )
}

export default Dashboard