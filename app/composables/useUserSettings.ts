// composables/useUserSettings.ts
export const useUserSettings = () => {
  let globalDeviceId = useState('globalDeviceId', () => "987")
  const bedTime = useState<string>('bedTime', () => '00:00')
  const wakeUpTime = useState<string>('wakeUpTime', () => '07:55')
  const bedTimeTolerance = useState<number>('bedTimeTolerance', () => 30) 
  const wakeUpTolerance = useState<number>('wakeUpTolerance', () => 15) 

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

  const getSleepDuration = () => {
    const [bedHour, bedMin] = bedTime.value.split(':').map(Number)
    const [wakeHour, wakeMin] = wakeUpTime.value.split(':').map(Number)
    
    let bedMinutes = bedHour * 60 + bedMin
    let wakeMinutes = wakeHour * 60 + wakeMin
    
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60
    }
    
    const totalMinutes = wakeMinutes - bedMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return { hours, minutes, totalMinutes }
  }

  const sendSettings = async () => {
    console.log("bed_time: ", bedTime.value, "wake_up_time: ", wakeUpTime.value,"bed_time_tolerance: ", bedTimeTolerance.value,"wake_up_tolerance: ", wakeUpTolerance.value)
    try {
      const config = useRuntimeConfig()
      const response = await $fetch(`${config.public.apiBase}/user-settings/${globalDeviceId.value}`, {
        method: 'POST',
        body: {
          bed_time: bedTime.value,
          wake_up_time: wakeUpTime.value,
          bed_time_tolerance: bedTimeTolerance.value,
          wake_up_tolerance: wakeUpTolerance.value
        }
      })
      
      return { success: true, data: response }
    } catch (error) {
      console.error('Failed to send settings:', error)
      return { success: false, error }
    }
  }
  const getSleepDayBoundary = () => {
    // 3pm boundary - captures previous night's sleep
    return {
      hour: 15,
      minute: 0,
      totalMinutes: 15 * 60,
      formatted: '15:00'
    }
  }

  return {
    bedTime,
    wakeUpTime,
    bedTimeTolerance,
    wakeUpTolerance,
    getSleepDayBoundary,
    setBedTime,
    setWakeUpTime,
    setBedTimeTolerance,
    setWakeUpTolerance,
    adjustBedTimeTolerance,
    adjustWakeUpTolerance,
    getSleepDuration,
    sendSettings
  }
}