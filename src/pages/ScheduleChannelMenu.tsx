import { Navigate, useParams } from 'react-router-dom'
import { isMenuChannelId } from '../mocks/menuChannels'
import BaseMenu from './BaseMenu'

export default function ScheduleChannelMenu() {
  const { channel = '' } = useParams()
  if (!isMenuChannelId(channel)) {
    return <Navigate to="/menu/schedule-changes" replace />
  }
  return <BaseMenu channelId={channel} mode="schedule" />
}
