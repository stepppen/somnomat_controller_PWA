<template>
    <div class="main-container py-4 flex justify-between w-full">
        <div>
            <h2 class="text-left">Insights</h2>
        </div>
        <div class="flex gap-4">
            <!-- <div class="nav-button"
            @click="navigateTo('/')"
            :class="{active: currentPath === 'home'}">
                <Icon name="material-symbols:settings-outline-rounded" size="1.5em"/>
            </div> -->
            <div class="nav-button"
            @click="navigateTo('/notifications')">
                <Icon name="material-symbols:notifications-outline-rounded" size="1.5em"/>
            </div>
        </div>
        
    </div>
    <div class="main-container ">
          <UTabs @update:modelValue="handleToggle" :items="items" color="info" :ui="{ 
            indicator: 'rounded-full',
            list: 'bg-white rounded-full'}">
            
            <!-- day -->
            <template #dayData >
                <div class="w-full flex justify-between items-center py-4">
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" @click="dayBack">
                        <Icon class="" name="material-symbols:arrow-back-ios-new-rounded" size="1.3em" />
                    </div>
                    <!-- <div class="p-2 bg-white rounded-full flex items-center justify-center w-10 h-10 pl-3">
                    </div> -->
                    <DateRange :startDate="newDateArr" :endDate="newDateArr"/>
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" :class="{disabledButton: isToday}" @click="dayForward">
                        <Icon name="material-symbols:arrow-forward-ios-rounded" size="1.3em"  />
                    </div>
                </div>
                <div v-if="globalSleepSummary" class="flex flex-col gap-4">
                    <DataOverview :quality="sleepQuality" :sleepDuration="duration" :comment="sleepComment" :bedActivity="activity" />
                    <!-- <DataConsistencyChart :intervals="globalSleepSummary.summary.intervals"/> -->
                    <DataSummaryCards :summary="globalSleepSummary.summary" isDayView="true"/>
                    <DataRecommendationsSection :summary="globalSleepSummary.summary"/>

                </div>
            </template>

            <!-- week -->
            <template #weekData>
                <div class="w-full flex justify-between items-center py-4">
                    <div class="bg-white p-3 rounded-full flex items-center justify-center">
                        <Icon class="" name="material-symbols:arrow-back-ios-new-rounded" size="1.3em" @click="weekBack"/>
                    </div>
                    <!-- <div class="p-2 bg-white rounded-full flex items-center justify-center w-10 h-10 pl-3">
                    </div> -->
                    <DateRange :startDate="startWeek" :endDate="endWeek"/>
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" :class="{disabledButton: isThisWeek}" @click="weekForward">
                        <Icon name="material-symbols:arrow-forward-ios-rounded" size="1.3em"  />
                    </div>
                </div>
                <div v-if="globalSleepSummary" class="flex flex-col gap-4">
                    <DataOverview :quality="sleepQuality" :sleepDuration="duration" :comment="sleepComment" :bedActivity="activity" />
                    <DataConsistencyChart :intervals="globalSleepSummary.summary.intervals"/>
                    <DataSummaryCards :summary="globalSleepSummary.summary"/>
                    <DataRecommendationsSection :summary="globalSleepSummary.summary"/>

                </div>
            </template>

            <!-- month -->
            <template #monthData>
                <div class="w-full flex justify-between items-center py-4">
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" @click="monthBack">
                        <Icon class="" name="material-symbols:arrow-back-ios-new-rounded" size="1.3em" />
                    </div>
                    <!-- <div class="p-2 bg-white rounded-full flex items-center justify-center w-10 h-10 pl-3">
                    </div> -->
                    <DateRange :startDate="startMonth" :endDate="endMonth"/>
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" :class="{disabledButton: isThisMonth}" @click="monthForward">
                        <Icon name="material-symbols:arrow-forward-ios-rounded" size="1.3em"  />
                    </div>
                </div>
            </template>
        </UTabs>
    </div>
            

            <!-- Empty State -->
            <!-- <div v-else class="bg-white-800 rounded-lg p-12 text-center border border-slate-700">
                <div class="text-6xl mb-4">🛏️</div>
                <h2 class="text-2xl font-bold mb-2">No Sleep Data Yet</h2>
                <p class="text-blackray-400 mb-4">
                    {{ error || 'Start the ESP32 simulator to generate sleep data' }}
                </p>
                <div class="bg-white-900 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
                    <p class="text-sm text-blackray-300 font-medium mb-2">Quick Start:</p>
                    <ol class="text-xs text-blackray-400 space-y-1 list-decimal list-inside">
                        <li>Open a terminal in the backend directory</li>
                        <li>Run: <code class="bg-white-700 px-2 py-1 rounded">python test_esp32.py</code></li>
                        <li>Wait a few seconds, then click Refresh below</li>
                    </ol>
                </div>
                <button @click="loadData" 
                        class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition">
                    Refresh
                </button>
            </div> -->

            <!-- Footer -->
            <!-- <div class="mt-6 text-center text-sm text-blackray-500">
                Auto-refresh every 30 seconds • Last update: {{ lastUpdate }}
            </div> -->
</template>

<script setup>
import { CalendarDate, DateFormatter, getLocalTimeZone, today, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '@internationalized/date'
const { 
  globalDeviceId,
  globalDeviceName,
  globalSleepSummary,
  globalTargetDevice,
  globalLoading,
  globalError,
  globalCommandStatus,
  globalPeriod,
  globalDate,
  isOn,
  loadDeviceData,
  loadSleepSummary,
  sendCommand
} = useDevice()

const { 
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
} = useUserSettings()

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// const sleepSummary = ref(null);
const totalDevices = ref(null);
const lastUpdate = ref('Never');
const loading = ref(false);
const error = ref('');
const deviceId = ref('');
const targetBedtime = ref('22:00');
const bedtimeSaved = ref(false);
const focusedDayIndex = ref(0);
let isToday = ref(true)
let isThisWeek = ref(true)
let isThisMonth = ref(true)
let refreshInterval = null;


let currentDate = today(getLocalTimeZone());
let currentWeek = today(getLocalTimeZone());
let currentMonth = today(getLocalTimeZone());
let newDateArr = ref([currentDate.day, currentDate.month, currentDate.year]);
let startWeek = ref([(startOfWeek(currentWeek, 'de-DE')).day, (startOfWeek(currentWeek, 'de-DE')).month, (startOfWeek(currentWeek, 'de-DE')).year]);
let endWeek = ref([(endOfWeek(currentWeek, 'de-DE')).day, (endOfWeek(currentWeek, 'de-DE')).month, (endOfWeek(currentWeek, 'de-DE')).year]);
let startMonth = ref([(startOfMonth(currentMonth, 'de-DE')).day, (startOfMonth(currentMonth, 'de-DE')).month, (startOfMonth(currentMonth, 'de-DE')).year]);
let endMonth = ref([(endOfMonth(currentMonth, 'de-DE')).day, (endOfMonth(currentMonth, 'de-DE')).month, (endOfMonth(currentMonth, 'de-DE')).year]);

let sleepQuality = ref(0)
let sleepComment = ref("Good Job")
let duration = ref(0)
let activity = ref(0)
let totalPlannedSleep = ref(0)



// Lifecycle
onMounted(async () => {
    if (!globalDate.value) {
        const today = new Date();
        globalDate.value = today.getFullYear() + "-" + 
                          (today.getMonth() + 1).toString().padStart(2, '0') + "-" + 
                          today.getDate().toString().padStart(2, '0');
    }
    if (globalDeviceId.value) {
        await loadDeviceData()
        await loadSleepSummary()
        totalPlannedSleep.value = await getSleepDuration()
        console.log("total planned sleep minutes: ", totalPlannedSleep.value.totalMinutes)


        console.log("device id: ", globalDeviceId.value, "sleep summary: ", globalSleepSummary.value)
        if (globalSleepSummary.value && totalPlannedSleep.value) {
            calcSleepDurationPercentage("day")
            calcBedOnPercentage()
            calcQuality()
            // duration.value = globalSleepSummary.value.summary.sleep_duration_hours
            // activity.value = Math.round((globalSleepSummary.value.summary.sleep_duration_hours / globalSleepSummary.value.summary.time_in_bed_hours) * 100 ) 
            // console.log("sleep duration for this day is: ", duration.value)
        }
        if (bedTime) { 
            console.log("bed time: ", bedTime.value, "with tolerance: ",  bedTimeTolerance.value, "Wake up time: ", wakeUpTime.value, "with tolerance: ",  wakeUpTolerance.value)
        }

        
        refreshInterval = setInterval(async () => {
            await loadDeviceData()
            await loadSleepSummary()
        }, 30000);
    }
    
    // Load saved bedtime preference
    const saved = localStorage.getItem('targetBedtime');
    if (saved) targetBedtime.value = saved;
});

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
});

watch(globalSleepSummary, () => {
    if (globalSleepSummary.value) {
        nextTick(() => {
            drawDonuts();
            drawScatterPlot();
            drawFocusTimeline();
        });
    }
});



async function handleToggle(value){
    //"motor_status_".concat((globalDeviceSettings.value.motor_status).toString())
    if(value == 0) { 
        globalPeriod.value = "day"
        // newDateArr
        globalDate.value = (newDateArr.value[2]).toString() + "-" + ((newDateArr.value[1]).toString()).padStart(2, '0') + "-" + ((newDateArr.value[0]).toString()).padStart(2, '0')
        console.log("Global Date Val", globalDate.value)
        await loadSleepSummary()
    } else if (value == 1) { 
        globalPeriod.value = "week"
        globalDate.value = (newDateArr.value[2]).toString() + "-" + ((newDateArr.value[1]).toString()).padStart(2, '0') + "-" + ((newDateArr.value[0]).toString()).padStart(2, '0')
        await loadSleepSummary()
    } else { 
        globalPeriod.value = "month"
        globalDate.value = (newDateArr.value[2]).toString() + "-" + ((newDateArr.value[1]).toString()).padStart(2, '0') + "-" + ((newDateArr.value[0]).toString()).padStart(2, '0')
        await loadSleepSummary()
    }
    console.log('Value:', value);
}

//for one day forward/back
async function dayBack(){ 
    console.log("sleep duration for this day is: ", duration.value)
    isToday.value = false;
    console.log("is it today in dayBack: ", isToday.value)
    const newDate  = currentDate.subtract({ days: 1 });
    newDateArr.value = [newDate.day, newDate.month, newDate.year ]
    console.log("Current Date: ", newDateArr.value);
    globalDate.value = (newDateArr.value[2]).toString() + "-" + ((newDateArr.value[1]).toString()).padStart(2, '0') + "-" + ((newDateArr.value[0]).toString()).padStart(2, '0')
    console.log("Global Date Val", globalDate.value)
    await loadSleepSummary()
    calcSleepDurationPercentage("day")
    calcBedOnPercentage()
    calcQuality()
    currentDate = newDate;
}

async function dayForward(){ 
    console.log("sleep duration for this day is: ", duration.value)
    console.log("is it today: ", isToday.value)
    if(isToday.value) return;
    else { 
        const newDate  = currentDate.add({ days: 1 });
        newDateArr.value = [newDate.day, newDate.month, newDate.year ]
        console.log("got here, this is isToday: ", isToday.value);
        globalDate.value = (newDateArr.value[2]).toString() + "-" + ((newDateArr.value[1]).toString()).padStart(2, '0') + "-" + ((newDateArr.value[0]).toString()).padStart(2, '0')
        console.log("Global Date Val", globalDate.value)
        await loadSleepSummary()
        calcSleepDurationPercentage("day")
        calcBedOnPercentage()
        calcQuality()
        currentDate = newDate;
        console.log("currentDate:", currentDate.day, "today thingy: ", today(getLocalTimeZone()).day)
        if (currentDate.day === today(getLocalTimeZone()).day){ 
            isToday.value = true;
            console.log("Its the same day ");
        }

    }
}

function calcSleepDurationPercentage(period) { 
    
    if (globalSleepSummary.value.summary.sleep_duration_min != 0) { 
        if (period === "day") { 
            duration.value = Math.round((globalSleepSummary.value.summary.sleep_duration_min / totalPlannedSleep.value.totalMinutes) * 100)
            console.log("duration percentage: ", duration.value, "slept for: ", globalSleepSummary.value.summary.sleep_duration_min, "min, out of", totalPlannedSleep.value.totalMinutes )
        }
         else if (period === "week") { 
            duration.value = Math.round(((parseInt(globalSleepSummary.value.summary.sleep_duration_min)) / (totalPlannedSleep.value.totalMinutes * 7))*100)
            console.log("period is: ", period, "with duration val: ", duration.value)
            console.log("duration percentage: ", duration.value, "slept for: ", globalSleepSummary.value.summary.sleep_duration_min, "min, out of", totalPlannedSleep.value.totalMinutes )
        } 
        else if (period === "month") { 
            duration.value = Math.round(((parseInt(globalSleepSummary.value.summary.sleep_duration_min)) / totalPlannedSleep.value.totalMinutes)*100)
            console.log("duration percentage: ", duration.value, "slept for: ", globalSleepSummary.value.summary.sleep_duration_min, "min, out of", totalPlannedSleep.value.totalMinutes )
        } 
        
    }else { 
            duration.value = 0
            console.log("duration percentage: ", duration.value, "slept for: ", globalSleepSummary.value.summary.sleep_duration_min, "min, out of", totalPlannedSleep.value.totalMinutes )
        }
}

function calcBedOnPercentage() { 
    if (globalSleepSummary.value.summary.sleep_duration_hours != 0) { 
        activity.value = Math.round((globalSleepSummary.value.summary.sleep_duration_hours / globalSleepSummary.value.summary.time_in_bed_hours) * 100)
    } else { 
        activity.value = 0
    }  
}

function calcQuality() { 
    console.log("activity: ", activity.value, ", duration: ", parseInt(duration.value))
    sleepQuality.value = Math.round((activity.value + duration.value) / 2)
}

//for one week forward/back

async function weekBack(){ 
    isThisWeek.value = false;
    const newDate = currentWeek.subtract({ weeks: 1 });
    startWeek.value = [(startOfWeek(newDate, 'de-DE')).day, (startOfWeek(newDate, 'de-DE')).month, (startOfWeek(newDate, 'de-DE')).year]
    endWeek.value = [(endOfWeek(newDate, 'de-DE')).day, (endOfWeek(newDate, 'de-DE')).month, (endOfWeek(newDate, 'de-DE')).year]
    globalDate.value = (newDate.year).toString() + "-" + ((newDate.month).toString()).padStart(2, '0') + "-" + ((newDate.day).toString()).padStart(2, '0')
    console.log("Global Date Val", globalDate.value)
    await loadSleepSummary()
    calcSleepDurationPercentage("week")
    calcBedOnPercentage()
    calcQuality()
    console.log("newDate is: ", newDate)
    currentWeek = newDate;
}

async function weekForward(){ 
    console.log("is it today: ", isThisWeek.value)
    if(isThisWeek.value) return;
    else { 
        const newDate  = currentWeek.add({ weeks: 1 });
        startWeek.value = [(startOfWeek(newDate, 'de-DE')).day, (startOfWeek(newDate, 'de-DE')).month, (startOfWeek(newDate, 'de-DE')).year]
        endWeek.value = [(endOfWeek(newDate, 'de-DE')).day, (endOfWeek(newDate, 'de-DE')).month, (endOfWeek(newDate, 'de-DE')).year]
        globalDate.value = (newDate.year).toString() + "-" + ((newDate.month).toString()).padStart(2, '0') + "-" + ((newDate.day).toString()).padStart(2, '0')
        console.log("Global Date Val", globalDate.value)
        await loadSleepSummary()
        calcSleepDurationPercentage("week")
        calcBedOnPercentage()
        calcQuality()
        currentWeek = newDate;
        console.log("currentWeek:", currentWeek.day, "today thingy: ", today(getLocalTimeZone()).day)
        if (currentWeek.day === today(getLocalTimeZone()).day && currentWeek.month === today(getLocalTimeZone()).month){ 
            isThisWeek.value = true;
            console.log("Its the same week");
        }
    }
}

//for one month forward/back
async function monthBack(){ 
    isThisMonth.value = false;
    const newDate = currentMonth.subtract({ months: 1 });
    startMonth.value = [(startOfMonth(newDate, 'de-DE')).day, (startOfMonth(newDate, 'de-DE')).month, (startOfMonth(newDate, 'de-DE')).year]
    endMonth.value = [(endOfMonth(newDate, 'de-DE')).day, (endOfMonth(newDate, 'de-DE')).month, (endOfMonth(newDate, 'de-DE')).year]
    globalDate.value = (newDate.year).toString() + "-" + ((newDate.month).toString()).padStart(2, '0') + "-" + ((newDate.day).toString()).padStart(2, '0')
    console.log("Global Date Val", globalDate.value)
    await loadSleepSummary()
    console.log("newDate is: ", newDate)
    currentMonth = newDate;
}

async function monthForward(){ 
    console.log("is it today: ", isThisMonth.value)
    if(isThisMonth.value) return;
    else { 
        const newDate  = currentMonth.add({ months: 1 });
        startMonth.value = [(startOfMonth(newDate, 'de-DE')).day, (startOfMonth(newDate, 'de-DE')).month, (startOfMonth(newDate, 'de-DE')).year]
        endMonth.value = [(endOfMonth(newDate, 'de-DE')).day, (endOfMonth(newDate, 'de-DE')).month, (endOfMonth(newDate, 'de-DE')).year]
        globalDate.value = (newDate.year).toString() + "-" + ((newDate.month).toString()).padStart(2, '0') + "-" + ((newDate.day).toString()).padStart(2, '0')
        console.log("Global Date Val", globalDate.value)
        await loadSleepSummary()
        currentMonth = newDate;
        console.log("currentMonth:", currentMonth.day, "today thingy: ", today(getLocalTimeZone()).day)
        if (currentMonth.month === today(getLocalTimeZone()).month && currentMonth.year === today(getLocalTimeZone()).year){ 
            isThisMonth.value = true;
            console.log("Its the same month ");
        }

    }
}




const items = [
  {
    label: 'Day',
    slot: 'dayData'
  },
  {
    label: 'Week',
    slot: 'weekData'
  },
    {
    label: 'Month',
    slot: 'monthData'
  }
]

// Computed properties
const qualityLabel = computed(() => {
    if (!globalSleepSummary.value) return '—';
    const avg = globalSleepSummary.value.summary.avg_awakenings_per_night;
    if (avg <= 1) return 'Excellent';
    if (avg <= 2) return 'Good';
    if (avg <= 3) return 'Fair';
    return 'Poor';
});

const qualityColor = computed(() => {
    const label = qualityLabel.value;
    if (label === 'Excellent') return 'text-blackreen-400';
    if (label === 'Good') return 'text-blue-400';
    if (label === 'Fair') return 'text-yellow-400';
    return 'text-red-400';
});

const consistencyScore = computed(() => {
    if (!globalSleepSummary.value) return 0;
    const intervals = globalSleepSummary.value.summary.intervals;
    if (intervals.length < 2) return 100;
    
    const startTimes = intervals.map(iv => {
        const d = new Date(iv.start);
        return d.getUTCHours() * 60 + d.getUTCMinutes();
    });
    
    const mean = startTimes.reduce((a, b) => a + b, 0) / startTimes.length;
    const variance = startTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / startTimes.length;
    const sd = Math.sqrt(variance);
    
    return Math.max(0, Math.min(100, Math.round(100 - sd / 2)));
});

const consistencySdMin = computed(() => {
    if (!globalSleepSummary.value) return 0;
    const intervals = globalSleepSummary.value.summary.intervals;
    if (!intervals || !Array.isArray(intervals) || intervals.length < 2) {
        return 0;
    }
    
    const startTimes = intervals.map(iv => {
        const d = new Date(iv.start);
        return d.getUTCHours() * 60 + d.getUTCMinutes();
    });
    
    const mean = startTimes.reduce((a, b) => a + b, 0) / startTimes.length;
    const variance = startTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / startTimes.length;
    return Math.round(Math.sqrt(variance));
});

const consistencyLabel = computed(() => {
    const sd = consistencySdMin.value;
    if (sd <= 60) return 'Excellent';
    if (sd <= 90) return 'Good';
    if (sd <= 120) return 'Fair';
    return 'Needs work';
});

const consistencyBadgeClass = computed(() => {
    const label = consistencyLabel.value;
    if (label === 'Excellent' || label === 'Good') return 'bg-green-600 text-blackreen-100';
    if (label === 'Fair') return 'bg-yellow-600 text-yellow-100';
    return 'bg-red-600 text-red-100';
});

const bedOnCoverage = computed(() => {
    return Math.round(75 + Math.random() * 20);
});

const bedOnLabel = computed(() => {
    const cov = bedOnCoverage.value;
    if (cov >= 85) return 'Great coverage';
    if (cov >= 70) return 'Good';
    return 'Low';
});

const bedOnBadgeClass = computed(() => {
    const cov = bedOnCoverage.value;
    if (cov >= 85) return 'bg-green-600 text-blackreen-100';
    if (cov >= 70) return 'bg-blue-600 text-blue-100';
    return 'bg-red-600 text-red-100';
});

const totalOccupiedFormatted = computed(() => {
    if (!globalSleepSummary.value) return '—';
    const hours = globalSleepSummary.value.summary.total_sleep_hours;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
});

const dailyTimeline = computed(() => {
    if (!globalSleepSummary.value) return {};
    
    const timeline = {};
    globalSleepSummary.value.summary.intervals.forEach(interval => {
        const day = interval.start.slice(0, 10);
        if (!timeline[day]) {
            timeline[day] = { intervals: [], totalMin: 0, awakenings: 0 };
        }
        timeline[day].intervals.push(interval);
        timeline[day].totalMin += interval.duration_min;
    });
    
    Object.keys(timeline).forEach(day => {
        timeline[day].awakenings = Math.max(0, timeline[day].intervals.length - 1);
    });
    
    return timeline;
});

const sortedDays = computed(() => {
    return Object.keys(dailyTimeline.value).sort();
});

const focusedDay = computed(() => {
    return sortedDays.value[focusedDayIndex.value] || '—';
});

const focusedDayData = computed(() => {
    return dailyTimeline.value[focusedDay.value] || { intervals: [], totalMin: 0, awakenings: 0 };
});

const focusedDayOccupied = computed(() => {
    const min = focusedDayData.value.totalMin;
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return `${h}h ${m}m`;
});

const focusedDayAwakenings = computed(() => {
    return focusedDayData.value.awakenings;
});

const focusedDayCoverage = computed(() => {
    return Math.round(70 + Math.random() * 25);
});


const suggestions = computed(() => {
    if (!globalSleepSummary.value) return [];
    
    const summary = globalSleepSummary.value.summary;
    const suggestions = [];
    
    if (summary.avg_sleep_per_night_hours >= 7.5) {
        suggestions.push({
            type: 'good',
            title: 'Great sleep duration',
            message: `You're averaging ${summary.avg_sleep_per_night_hours.toFixed(1)} hours per night. Keep it up!`
        });
    } else if (summary.avg_sleep_per_night_hours >= 6.5) {
        suggestions.push({
            type: 'warning',
            title: 'Sleep duration below ideal',
            message: 'Try going to bed 30 minutes earlier to reach 7-9 hours of sleep.'
        });
    } else {
        suggestions.push({
            type: 'warning',
            title: 'Insufficient sleep',
            message: 'You need more sleep. Aim for at least 7 hours per night for optimal health.'
        });
    }
    
    if (summary.avg_awakenings_per_night <= 1) {
        suggestions.push({
            type: 'good',
            title: 'Excellent sleep continuity',
            message: 'You have minimal awakenings. Your sleep is continuous and restorative.'
        });
    } else if (summary.avg_awakenings_per_night <= 2) {
        suggestions.push({
            type: 'info',
            title: 'ℹSome nighttime awakenings',
            message: 'Consider limiting fluids before bed and keeping the room cool and dark.'
        });
    } else {
        suggestions.push({
            type: 'warning',
            title: 'Frequent awakenings detected',
            message: 'Multiple awakenings may affect sleep quality. Try a consistent bedtime routine.'
        });
    }
    
    const score = consistencyScore.value;
    if (score >= 80) {
        suggestions.push({
            type: 'good',
            title: 'Consistent sleep schedule',
            message: 'Your bedtime is consistent. This helps regulate your circadian rhythm.'
        });
    } else {
        suggestions.push({
            type: 'info',
            title: 'Variable sleep schedule',
            message: 'Try going to bed at the same time each night to improve sleep quality.'
        });
    }
    
    return suggestions;
});



function saveTargetBedtime() {
    localStorage.setItem('targetBedtime', targetBedtime.value);
    bedtimeSaved.value = true;
    setTimeout(() => { bedtimeSaved.value = false; }, 2000);
    drawScatterPlot(); // Redraw with new target
}

function previousDay() {
    if (focusedDayIndex.value > 0) {
        focusedDayIndex.value--;
        nextTick(() => drawFocusTimeline());
    }
}

function nextDay() {
    if (focusedDayIndex.value < sortedDays.value.length - 1) {
        focusedDayIndex.value++;
        nextTick(() => drawFocusTimeline());
    }
}

function drawDonuts() {
    // Draw consistency donut
    drawDonut('consistencyDonut', consistencyScore.value);
    // Draw bed ON donut
    drawDonut('bedOnDonut', bedOnCoverage.value);
}

function drawDonut(elementId, percentage) {
    const svg = document.getElementById(elementId);
    if (!svg) return;
    
    svg.innerHTML = '';
    const w = 180, h = 180, r = 74, thickness = 18;
    const centerX = w / 2, centerY = h / 2;
    
    // Background arc
    const bgPath = describeArc(centerX, centerY, r, 0, 359.99);
    const bgArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bgArc.setAttribute('d', bgPath);
    bgArc.setAttribute('fill', 'none');
    bgArc.setAttribute('stroke', '#1f2937');
    bgArc.setAttribute('stroke-width', thickness);
    svg.appendChild(bgArc);
    
    // Value arc
    const angle = (percentage / 100) * 359.99;
    const valuePath = describeArc(centerX, centerY, r, 0, angle);
    const valueArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    valueArc.setAttribute('d', valuePath);
    valueArc.setAttribute('fill', 'none');
    valueArc.setAttribute('stroke', '#60a5fa');
    valueArc.setAttribute('stroke-width', thickness);
    valueArc.setAttribute('stroke-linecap', 'round');
    svg.appendChild(valueArc);
    
    // Center text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', centerX);
    text.setAttribute('y', centerY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#e5e7eb');
    text.setAttribute('font-size', '32');
    text.setAttribute('font-weight', 'bold');
    text.textContent = Math.round(percentage) + '%';
    svg.appendChild(text);
}

function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function drawScatterPlot() {
    const container = document.getElementById('consistencyScatter');
    if (!container || !globalSleepSummary.value) return;
    
    container.innerHTML = '';
    
    // Get first interval per day for bedtime consistency
    const byDay = {};
    globalSleepSummary.value.summary.intervals.forEach(iv => {
        const day = iv.start.slice(0, 10);
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(iv);
    });
    
    const points = [];
    Object.keys(byDay).sort().forEach(day => {
        const intervals = byDay[day].sort((a, b) => new Date(a.start) - new Date(b.start));
        const first = intervals.find(x => x.duration_min >= 5);
        if (first) {
            const d = new Date(first.start);
            const minutes = d.getUTCHours() * 60 + d.getUTCMinutes();
            points.push({ day, minutes });
        }
    });
    
    if (points.length === 0) {
        container.innerHTML = '<p class="text-blackray-400 text-center py-8">No data available for scatter plot</p>';
        return;
    }
    
    // SVG setup
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', container.clientWidth);
    svg.setAttribute('height', 280);
    svg.style.overflow = 'visible';
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);
    
    // Scales
    const minMinutes = Math.min(...points.map(p => p.minutes)) - 30;
    const maxMinutes = Math.max(...points.map(p => p.minutes)) + 30;
    const xScale = (day) => {
        const idx = points.findIndex(p => p.day === day);
        return (idx / Math.max(1, points.length - 1)) * width;
    };
    const yScale = (minutes) => height - ((minutes - minMinutes) / (maxMinutes - minMinutes)) * height;
    
    // Target bedtime band
    const targetMin = timeToMinutes(targetBedtime.value);
    if (targetMin !== null) {
        const band = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        band.setAttribute('x', 0);
        band.setAttribute('y', yScale(targetMin + 30));
        band.setAttribute('width', width);
        band.setAttribute('height', yScale(targetMin - 30) - yScale(targetMin + 30));
        band.setAttribute('fill', '#22c55e');
        band.setAttribute('opacity', '0.1');
        g.appendChild(band);
    }
    
    // Grid lines
    for (let m = Math.ceil(minMinutes / 60) * 60; m <= Math.floor(maxMinutes / 60) * 60; m += 60) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('x2', width);
        line.setAttribute('y1', yScale(m));
        line.setAttribute('y2', yScale(m));
        line.setAttribute('stroke', '#1f2937');
        line.setAttribute('stroke-width', 1);
        g.appendChild(line);
    }
    
    // Points
    points.forEach(p => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', xScale(p.day));
        circle.setAttribute('cy', yScale(p.minutes));
        circle.setAttribute('r', 4);
        circle.setAttribute('fill', '#60a5fa');
        
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${p.day} • ${formatMinutesToTime(p.minutes)}`;
        circle.appendChild(title);
        
        g.appendChild(circle);
    });
    
    // Y-axis labels
    for (let m = Math.ceil(minMinutes / 60) * 60; m <= Math.floor(maxMinutes / 60) * 60; m += 60) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', -10);
        text.setAttribute('y', yScale(m));
        text.setAttribute('text-anchor', 'end');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '11');
        text.textContent = formatMinutesToTime(m);
        g.appendChild(text);
    }
    
    // X-axis labels (dates)
    points.forEach((p, idx) => {
        if (idx % Math.ceil(points.length / 7) === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', xScale(p.day));
            text.setAttribute('y', height + 20);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#94a3b8');
            text.setAttribute('font-size', '10');
            text.textContent = formatDate(p.day);
            g.appendChild(text);
        }
    });
    
    container.appendChild(svg);
}

function drawFocusTimeline() {
    const container = document.getElementById('focusTimeline');
    if (!container || !focusedDayData.value.intervals.length) {
        if (container) container.innerHTML = '<p class="text-blackray-400 text-center py-4">No data for this day</p>';
        return;
    }
    
    container.innerHTML = '';
    
    const intervals = focusedDayData.value.intervals;
    const width = container.clientWidth - 100;
    const height = 60;
    
    // Find time range
    let minMin = 1440, maxMin = 0;
    intervals.forEach(iv => {
        const start = new Date(iv.start);
        const end = new Date(iv.end);
        const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
        const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
        minMin = Math.min(minMin, startMin);
        maxMin = Math.max(maxMin, endMin);
    });
    
    minMin = Math.max(0, minMin - 30);
    maxMin = Math.min(1440, maxMin + 30);
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', container.clientWidth);
    svg.setAttribute('height', height);
    
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', 'translate(50, 10)');
    svg.appendChild(g);
    
    // Background track
    const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    track.setAttribute('x', 0);
    track.setAttribute('y', 14);
    track.setAttribute('width', width);
    track.setAttribute('height', 8);
    track.setAttribute('rx', 4);
    track.setAttribute('fill', '#1f2937');
    g.appendChild(track);
    
    // Intervals
    const xScale = (min) => ((min - minMin) / (maxMin - minMin)) * width;
    
    intervals.forEach(iv => {
        const start = new Date(iv.start);
        const end = new Date(iv.end);
        const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
        const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
        
        const x1 = xScale(startMin);
        const x2 = xScale(endMin);
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x1);
        rect.setAttribute('y', 14);
        rect.setAttribute('width', Math.max(2, x2 - x1));
        rect.setAttribute('height', 8);
        rect.setAttribute('rx', 3);
        rect.setAttribute('fill', '#60a5fa');
        
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${formatTime(iv.start)} - ${formatTime(iv.end)}`;
        rect.appendChild(title);
        
        g.appendChild(rect);
    });
    
    // Time labels
    const ticks = [];
    for (let m = Math.ceil(minMin / 30) * 30; m <= Math.floor(maxMin / 30) * 30; m += 60) {
        ticks.push(m);
    }
    
    ticks.forEach(m => {
        const x = xScale(m);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', 40);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#94a3b8');
        text.setAttribute('font-size', '10');
        text.textContent = formatMinutesToTime(m);
        g.appendChild(text);
    });
    
    container.appendChild(svg);
}

// Helper functions
function formatDate(isoDate) {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(isoTimestamp) {
    const d = new Date(isoTimestamp);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(isoTimestamp) {
    const d = new Date(isoTimestamp);
    return d.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatMinutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeToMinutes(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return null;
    const [h, m] = timeStr.split(':').map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
}

function getTimelineStyle(interval) {
    const start = new Date(interval.start);
    const end = new Date(interval.end);
    
    const startMin = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMin = end.getUTCHours() * 60 + end.getUTCMinutes();
    
    let normalizedStart = startMin >= 18 * 60 ? startMin - 18 * 60 : startMin + (24 - 18) * 60;
    let normalizedEnd = endMin >= 18 * 60 ? endMin - 18 * 60 : endMin + (24 - 18) * 60;
    
    const totalMinutes = 15 * 60;
    const left = (normalizedStart / totalMinutes) * 100;
    const width = ((normalizedEnd - normalizedStart) / totalMinutes) * 100;
    
    return {
        left: `${left}%`,
        width: `${width}%`
    };
}
</script>

<style scoped>

.disabledButton { 
    opacity: 0.5;
}

</style>