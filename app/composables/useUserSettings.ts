// composables/useUserSettings.ts
export const useUserSettings = () => {
  const bedTime = useState<string>('bedTime', () => '00:00')
  const wakeUpTime = useState<string>('wakeUpTime', () => '07:55')
  const bedTimeTolerance = useState<number>('bedTimeTolerance', () => 30) // in minutes
  const wakeUpTolerance = useState<number>('wakeUpTolerance', () => 15) // in minutes

  const setBedTime = (time: string) => {
    bedTime.value = time
  }

  const setWakeUpTime = (time: string) => {
    wakeUpTime.value = time
  }

  const setBedTimeTolerance = (tolerance: number) => {
    bedTimeTolerance.value = Math.max(0, tolerance)
  }

  const setWakeUpTolerance = (tolerance: number) => {
    wakeUpTolerance.value = Math.max(0, tolerance)
  }

  const adjustBedTimeTolerance = (delta: number) => {
    setBedTimeTolerance(bedTimeTolerance.value + delta)
  }

  const adjustWakeUpTolerance = (delta: number) => {
    setWakeUpTolerance(wakeUpTolerance.value + delta)
  }

  // Calculate total sleep duration
  const getSleepDuration = () => {
    const [bedHour, bedMin] = bedTime.value.split(':').map(Number)
    const [wakeHour, wakeMin] = wakeUpTime.value.split(':').map(Number)
    
    let bedMinutes = bedHour * 60 + bedMin
    let wakeMinutes = wakeHour * 60 + wakeMin
    
    // If wake time is earlier than bed time, it's next day
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60
    }
    
    const totalMinutes = wakeMinutes - bedMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return { hours, minutes, totalMinutes }
  }

  return {
    bedTime,
    wakeUpTime,
    bedTimeTolerance,
    wakeUpTolerance,
    setBedTime,
    setWakeUpTime,
    setBedTimeTolerance,
    setWakeUpTolerance,
    adjustBedTimeTolerance,
    adjustWakeUpTolerance,
    getSleepDuration
  }
}