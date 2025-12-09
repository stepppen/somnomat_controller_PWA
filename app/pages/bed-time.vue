<template>
    <div class="main-container py-4 flex flex-col items-center w-full min-h-screen">
        <div class="w-full px-4 mb-6">
            <button class="nav-button" @click="navigateTo('/settings')">
                <Icon name="material-symbols:arrow-back-ios-rounded" size="1.5em"/>
            </button>
        </div>
        <div class="main-container w-full flex justify-center py-8">
            <div class="flex flex-col gap-2 align-items-center justify-center">
                <div>
                    <h3 class="text-xl font-bold">Set bed time</h3>
                </div>
            </div>
        </div>

        <div class="relative w-80 h-80 mb-12">
            <svg class="w-full h-full" viewBox="0 0 288 288">
                <circle cx="144" cy="144" r="110" fill="white" stroke="#E5E7EB" stroke-width="2"/>

                <path
                    :d="getArcPath()"
                    fill="none"
                    stroke="url(#gradient)"
                    stroke-width="20"
                    stroke-linecap="round"
                />

                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:var(--gradient-end);stop-opacity:1" />
                        <stop offset="100%" style="stop-color:var(--gradient-start);stop-opacity:1" />
                    </linearGradient>
                </defs>

                <g v-for="hour in [12, 3, 6, 9]" :key="hour">
                    <text
                        :x="144 + 70 * Math.sin((hour * 30 - 0) * Math.PI / 180)"
                        :y="144 - 70 * Math.cos((hour * 30 - 0) * Math.PI / 180) + 5"
                        text-anchor="middle"
                        class="text-sm fill-gray-400 font-medium"
                    >
                        {{ hour }}
                    </text>
                </g>

                <g v-for="i in 12" :key="i">
                    <line
                        :x1="144 + 90 * Math.sin((i * 30 - 90) * Math.PI / 180)"
                        :y1="144 - 90 * Math.cos((i * 30 - 90) * Math.PI / 180)"
                        :x2="144 + 100 * Math.sin((i * 30 - 90) * Math.PI / 180)"
                        :y2="144 - 100 * Math.cos((i * 30 - 90) * Math.PI / 180)"
                        stroke="#E5E7EB"
                        stroke-width="2"
                    />
                </g>

                <text x="144" y="144" text-anchor="middle" class="text-2xl fill-gray-900 align-middle">
                    {{ sleepDurationText }}
                </text>
            </svg>

            <div
                ref="bedHandle"
                class="absolute w-12 h-12 sleep-icon rounded-full cursor-pointer shadow-lg flex items-center justify-center z-10"
                :style="getBedHandlePosition()"
                @mousedown="startDrag('bed', $event)"
                @touchstart="startDrag('bed', $event)"
            >
                <Icon name="material-symbols:bedtime-outline-rounded" class="text-white" size="1.5em"/>
            </div>

            <div
                ref="wakeHandle"
                class="absolute w-12 h-12 wake-icon rounded-full cursor-pointer shadow-lg flex items-center justify-center z-10"
                :style="getWakeHandlePosition()"
                @mousedown="startDrag('wake', $event)"
                @touchstart="startDrag('wake', $event)"
            >
                <Icon name="material-symbols:wb-sunny-outline-rounded" class="text-white" size="1.5em"/>
            </div>
        </div>

        <div class="w-full flex flex-col gap-4">
            <primitives-container>
                <div class="flex justify-between gap-4">
                    
                    <div class="flex-1 flex flex-col items-center gap-2">
                        <div class="w-12 h-12 sleep-icon rounded-full flex items-center justify-center">
                            <Icon name="material-symbols:bedtime-outline-rounded" class="text-white" size="1.5em"/>
                        </div>
                        <p class="p-small text-gray-400">Bed time</p>
                        
                        <h1 class="text-2xl font-bold">{{ localBedTime }}</h1>
                        
                        <TimePeriodToggle 
                            :model-value="bedPeriod"
                            label=""
                            @update:model-value="toggleBedPeriod"
                        />

                        <div class="flex items-center gap-1 bg-[#E7E7FF] rounded-full mt-1">
                            <button @click="adjustBedTimeTolerance(-5)" class="w-10 h-10 rounded-full bg-[#CBCBF9] flex items-center justify-center hover:bg-purple-200 transition">
                                <Icon name="material-symbols:remove-rounded" class="text-black" size="1em"/>
                            </button>
                            <p class="w-14 text-center text-sm">±{{ localBedTolerance }}m</p>
                            <button @click="adjustBedTimeTolerance(5)" class="w-10 h-10 rounded-full bg-[#CBCBF9] flex items-center justify-center hover:bg-purple-200 transition">
                                <Icon name="material-symbols:add-rounded" class="text-black" size="1em"/>
                            </button>
                        </div>
                    </div>

                    <div class="flex-1 flex flex-col items-center gap-2">
                        <div class="wake-icon w-12 h-12 rounded-full flex items-center justify-center">
                            <Icon name="material-symbols:wb-sunny-outline-rounded" class="text-white" size="1.5em"/>
                        </div>
                        <p class="p-small text-gray-400">Wake up</p>
                        
                        <h1 class="text-2xl font-bold">{{ localWakeTime }}</h1>
                        
                        <TimePeriodToggle 
                            :model-value="wakePeriod"
                            label="" 
                            @update:model-value="toggleWakePeriod"
                        />

                        <div class="flex items-center gap-1 bg-[#F3EEFF] rounded-full mt-1">
                            <button @click="adjustWakeUpTolerance(-5)" class="w-10 h-10 rounded-full bg-[#DBCFF7] flex items-center justify-center hover:bg-purple-200 transition">
                                <Icon name="material-symbols:remove-rounded" class="text-black" size="1em"/>
                            </button>
                            <p class="w-14 text-center text-sm">±{{ localWakeTolerance }}m</p>
                            <button @click="adjustWakeUpTolerance(5)" class="w-10 h-10 rounded-full bg-[#DBCFF7] flex items-center justify-center hover:bg-purple-200 transition">
                                <Icon name="material-symbols:add-rounded" class="text-black" size="1em"/>
                            </button>
                        </div>
                    </div>

                </div>
            </primitives-container>
            
            <PrimitivesFullButtonDark 
                buttonText="save" 
                buttonPath="/settings"
                @click.native="saveSettings" 
            />
        </div>
    </div>
</template>

<script setup lang="ts">
// Assuming TimePeriodToggle is auto-imported or registered globally
// If not, import it: import TimePeriodToggle from '@/components/TimePeriodToggle.vue'

const { 
    bedTime, 
    wakeUpTime, 
    bedTimeTolerance, 
    wakeUpTolerance,
    setBedTime,
    setWakeUpTime,
    adjustBedTimeTolerance: adjustBedToleranceGlobal,
    adjustWakeUpTolerance: adjustWakeToleranceGlobal,
} = useUserSettings()

// --- State ---
const localBedTime = ref(bedTime.value)
const localWakeTime = ref(wakeUpTime.value)
const localBedTolerance = ref(bedTimeTolerance.value)
const localWakeTolerance = ref(wakeUpTolerance.value)

// Determine initial AM/PM based on the string (e.g., "14:00" is PM)
const getPeriodFromTime = (time: string): 'AM' | 'PM' => {
  const hours = parseInt(time.split(':')[0])
  return hours >= 12 ? 'PM' : 'AM'
}

const bedPeriod = ref<'AM' | 'PM'>(getPeriodFromTime(localBedTime.value))
const wakePeriod = ref<'AM' | 'PM'>(getPeriodFromTime(localWakeTime.value))

const isDragging = ref(false)
const dragType = ref<'bed' | 'wake' | null>(null)

// --- Helpers ---

// Convert time string to angle
const timeToAngle = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return ((hours % 12) * 30 + minutes * 0.5 - 90) * Math.PI / 180
}

// Convert angle to raw hours/minutes (0-11 range)
// Note: This no longer returns a string, but raw numbers for calculation
const angleToRawTime = (angle: number): { hours: number, minutes: number } => {
    let degrees = (angle * 180 / Math.PI + 90) % 360
    if (degrees < 0) degrees += 360
    
    const totalMinutes = Math.round((degrees / 360) * 12 * 60)
    let hours = Math.floor(totalMinutes / 60) % 12
    let minutes = Math.round((totalMinutes % 60) / 5) * 5 
    
    if(minutes === 60) { 
        hours += 1;
        minutes = 0;
        hours = hours % 12;
    }
    
    return { hours, minutes }
}

// Helper to flip AM/PM without changing position
const convertToPeriod = (time: string, targetPeriod: 'AM' | 'PM'): string => {
  let [hours, minutes] = time.split(':').map(Number)
  
  // If we want PM, and it's currently AM (hours < 12), add 12
  if (targetPeriod === 'PM' && hours < 12) hours += 12
  // If we want AM, and it's currently PM (hours >= 12), subtract 12
  if (targetPeriod === 'AM' && hours >= 12) hours -= 12
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// --- Toggle Handlers ---
const toggleBedPeriod = (newVal: 'AM' | 'PM') => {
  bedPeriod.value = newVal
  localBedTime.value = convertToPeriod(localBedTime.value, newVal)
}

const toggleWakePeriod = (newVal: 'AM' | 'PM') => {
  wakePeriod.value = newVal
  localWakeTime.value = convertToPeriod(localWakeTime.value, newVal)
}

// --- Visual Position Calculators ---
const getBedHandlePosition = () => {
    const angle = timeToAngle(localBedTime.value)
    const radius = 120
    return {
        left: `${144 + radius * Math.cos(angle) - 8}px`,
        top: `${144 + radius * Math.sin(angle) - 8}px`,
    }
}

const getWakeHandlePosition = () => {
    const angle = timeToAngle(localWakeTime.value)
    const radius = 120
    return {
        left: `${144 + radius * Math.cos(angle) - 8}px`,
        top: `${144 + radius * Math.sin(angle) - 8}px`,
    }
}

const getArcPath = () => {
    const startAngle = timeToAngle(localBedTime.value)
    const endAngle = timeToAngle(localWakeTime.value)
    const radius = 110
    
    let angle = endAngle - startAngle
    if (angle <= 0) angle += 2 * Math.PI
    
    const largeArc = angle > Math.PI ? 1 : 0
    
    const startX = 144 + radius * Math.cos(startAngle)
    const startY = 144 + radius * Math.sin(startAngle)
    const endX = 144 + radius * Math.cos(endAngle)
    const endY = 144 + radius * Math.sin(endAngle)
    
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
}

// --- Computed Logic ---
const sleepDurationText = computed(() => {
    const [bedHour, bedMin] = localBedTime.value.split(':').map(Number)
    const [wakeHour, wakeMin] = localWakeTime.value.split(':').map(Number)
    
    let bedMinutes = bedHour * 60 + bedMin
    let wakeMinutes = wakeHour * 60 + wakeMin
    
    // If wake time is earlier than bed time (e.g. 23:00 -> 07:00), add 24h
    if (wakeMinutes <= bedMinutes) {
        wakeMinutes += 24 * 60
    }
    
    const totalMinutes = wakeMinutes - bedMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return `${hours}h ${minutes}m`
})

// --- Drag Events ---
const startDrag = (type: 'bed' | 'wake', event: MouseEvent | TouchEvent) => {
    isDragging.value = true
    dragType.value = type
    event.preventDefault() // Prevents scrolling on touch devices
    
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('touchmove', onDrag)
    document.addEventListener('touchend', stopDrag)
}

const onDrag = (event: MouseEvent | TouchEvent) => {
    if (!isDragging.value || !dragType.value) return
    
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    
    const dialElement = document.querySelector('.relative.w-80.h-80') as HTMLElement
    if (!dialElement) return
    
    const rect = dialElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const dx = clientX - centerX
    const dy = clientY - centerY
    const angle = Math.atan2(dy, dx)
    
    // 1. Get raw 0-11 time from angle
    let { hours, minutes } = angleToRawTime(angle)
    
    // 2. Adjust based on current Toggle State (AM/PM)
    if (dragType.value === 'bed') {
        if (bedPeriod.value === 'PM') hours += 12
        
        // Handle 12 AM vs 12 PM edge case if necessary, 
        // but generally 0-11 + 12 = 12-23 (PM) and 0-11 (AM) covers it.
        // Specifically: 12 PM is represented as 12:00. 12 AM is 00:00.
        // If angle is 0 (12 oclock position) -> returns 0 hours.
        // If PM -> 0 + 12 = 12 (12:00). Correct.
        // If AM -> 0 (00:00). Correct.

        localBedTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    } else {
        if (wakePeriod.value === 'PM') hours += 12
        localWakeTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    }
}

const stopDrag = () => {
    isDragging.value = false
    dragType.value = null
    
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('touchend', stopDrag)
}

// --- Tolerance ---
const adjustBedTimeTolerance = (delta: number) => {
    localBedTolerance.value = Math.max(0, localBedTolerance.value + delta)
}

const adjustWakeUpTolerance = (delta: number) => {
    localWakeTolerance.value = Math.max(0, localWakeTolerance.value + delta)
}

// --- Save ---
const saveSettings = async () => {
    setBedTime(localBedTime.value)
    setWakeUpTime(localWakeTime.value)
    adjustBedToleranceGlobal(localBedTolerance.value - bedTimeTolerance.value)
    adjustWakeToleranceGlobal(localWakeTolerance.value - wakeUpTolerance.value)
    
    const { sendSettings } = useUserSettings()
    const result = await sendSettings()
    
    if (result.success) {
        console.log('Settings saved successfully:', result.data)
    } else {
        console.error('Failed to save settings:', result.error)
    }
}

onUnmounted(() => {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.nav-button {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
}

.nav-button:hover {
    opacity: 0.7;
}
.sleep-icon{ 
    background-color: var(--gradient-start);
}

.wake-icon{ 
    background-color: var(--gradient-end);
}
</style>