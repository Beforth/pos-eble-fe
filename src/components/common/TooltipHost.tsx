import { useEffect } from 'react'
import { initTooltips } from '../../utils/tooltip'

export function TooltipHost() {
  useEffect(() => {
    initTooltips()
  }, [])
  return null
}
