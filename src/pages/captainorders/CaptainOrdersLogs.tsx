import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptainOrdersHeader } from '../../components/captainorders/CaptainOrdersHeader'
import { ActivityLogsView } from '../LogsPage'

export default function CaptainOrdersLogs() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')

  return (
    <ActivityLogsView
      source="captain"
      newOrderPath="/table-view?from=captain"
      header={
        <CaptainOrdersHeader
          billNo={billNo}
          onBillNoChange={setBillNo}
          onNewOrder={() => navigate('/table-view?from=captain')}
          onViewKot={() => navigate('/captain-orders?kot=1')}
        />
      }
    />
  )
}
