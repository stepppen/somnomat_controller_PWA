<template>
    <div class="main-container py-4 flex justify-between w-full">
        <div>
            <h2 class="text-left">Insights</h2>
        </div>
        <div class="flex gap-4">
            <div class="nav-button opacity-50">
                <Icon name="material-symbols:notifications-outline-rounded" size="1.5em"/>
            </div>
        </div>
    </div>
        <div class="main-container py-2">
            <div class="text-sm mt-2 bg-red-200 rounded-2xl p-2 flex items-center justify-center gap-2">
                <Icon name="material-symbols:info-outline-rounded" size="1em"/>
                <p class="p-small text-center">
                    This is mock data
                </p>
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
                    <DateRange :startDate="newDateArr" :endDate="newDateArr"/>
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" :class="{disabledButton: isToday}" @click="dayForward">
                        <Icon name="material-symbols:arrow-forward-ios-rounded" size="1.3em"  />
                    </div>
                </div>
                <div v-if="globalSummaryLoading" class="flex flex-col gap-4">
                    <DataOverview 
                        :quality="sleepQuality" 
                        :sleepDuration="duration" 
                        :comment="sleepComment" 
                        :bedActivity="activity" 
                        :totalPlanned="totalPlannedMinutes" 
                        :timeInBed="timeInBedMinutes" 
                        :totalSleepMin="totalSleepMinutes"
                        :isLoading="isSkeleton"
                    />
                    <DataConsistencyDay :intervals="globalSleepSummary.summary.intervals" :isLoading="isSkeleton"/>
                    <DataSummaryCards :summary="globalSleepSummary.summary" isDayView="true" :isLoading="isSkeleton"/>
                    <DataRecommendationsSection :summary="globalSleepSummary.summary" :isLoading="isSkeleton"/>
                </div>
                <div v-else-if="globalSleepSummary" class="flex flex-col gap-4">
                    <DataOverview 
                        :quality="sleepQuality" 
                        :sleepDuration="duration" 
                        :comment="sleepCommentDay" 
                        :bedActivity="activity" 
                        :totalPlanned="totalPlannedMinutes" 
                        :timeInBed="timeInBedMinutes" 
                        :totalSleepMin="totalSleepMinutes"
                    />
                    <DataConsistencyDay :intervals="globalSleepSummary.summary.intervals"/>
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
                    <DateRange :startDate="startWeek" :endDate="endWeek"/>
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" :class="{disabledButton: isThisWeek}" @click="weekForward">
                        <Icon name="material-symbols:arrow-forward-ios-rounded" size="1.3em"  />
                    </div>
                </div>
                <div v-if="globalSleepSummary" class="flex flex-col gap-4">
                    <DataOverview 
                    :quality="sleepQuality" 
                    :sleepDuration="duration" 
                    :comment="sleepComment" 
                    :bedActivity="activity" 
                    />
                    <DataConsistencyWeek 
                            :intervals="globalSleepSummary.summary.intervals"
                        />
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
                    <DateRange :startDate="startMonth" :endDate="endMonth"/>
                    <div class="bg-white p-3 rounded-full flex items-center justify-center" :class="{disabledButton: isThisMonth}" @click="monthForward">
                        <Icon name="material-symbols:arrow-forward-ios-rounded" size="1.3em"  />
                    </div>
                </div>
                <div v-if="globalSleepSummary" class="flex flex-col gap-4">
                    <DataOverview :quality="sleepQuality" :sleepDuration="duration" :comment="sleepComment" :bedActivity="activity" />
                    <DataConsistencyMonth :intervals="globalSleepSummary.summary.intervals"/>
                    <DataSummaryCards :summary="globalSleepSummary.summary"/>
                    <DataRecommendationsSection :summary="globalSleepSummary.summary"/>
                </div>
            </template>
        </UTabs>
    </div>
</template>

<script setup>
import { CalendarDate, DateFormatter, getLocalTimeZone, today, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from '@internationalized/date'

const { 
  globalDeviceId,
  globalDeviceName,
  globalSleepSummary,
  globalTargetDevice,
  globalLoading,
  globalSummaryLoading,
  globalError,
  globalCommandStatus,
  globalPeriod,
  globalDate,
  isOn,
  loadDeviceData,
  loadSleepSummary,
  loadUserSettings,
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
    getSleepDuration,
    getSleepDayBoundary
} = useUserSettings()

//refs
let isToday = ref(true)
let isThisWeek = ref(true)
let isThisMonth = ref(true)
const isSkeleton = ref(true)

let refreshInterval = null;

let currentDate = today(getLocalTimeZone());
let currentWeek = today(getLocalTimeZone());
let currentMonth = today(getLocalTimeZone());
let newDateArr = ref([currentDate.day, currentDate.month, currentDate.year]);
let startWeek = ref([(startOfWeek(currentWeek, 'de-DE')).day, (startOfWeek(currentWeek, 'de-DE')).month, (startOfWeek(currentWeek, 'de-DE')).year]);
let endWeek = ref([(endOfWeek(currentWeek, 'de-DE')).day, (endOfWeek(currentWeek, 'de-DE')).month, (endOfWeek(currentWeek, 'de-DE')).year]);
let startMonth = ref([(startOfMonth(currentMonth, 'de-DE')).day, (startOfMonth(currentMonth, 'de-DE')).month, (startOfMonth(currentMonth, 'de-DE')).year]);
let endMonth = ref([(endOfMonth(currentMonth, 'de-DE')).day, (endOfMonth(currentMonth, 'de-DE')).month, (endOfMonth(currentMonth, 'de-DE')).year]);

const sleepComment = ref("You sleep has improved over last night");
const totalPlannedSleep = ref(null);

const sleepCommentDay = computed(() => { 
    if(sleepMetrics.value.quality > 80){ 
        return {
            icon: "material-symbols:sentiment-satisfied-outline-rounded",
            bgIcon: "bg-indigo-50",
            iconColor: "#5765CF",
            text: "Great sleep! Continue in the same way."
        }
    }
    else if(sleepMetrics.value.quality > 60){ 
        return {
            icon: "material-symbols:sentiment-content-outline-rounded",
            bgIcon: "bg-violet-100",
            iconColor: "#8953DB",
            text: "Good sleep quality. Be more consistent with achieving your sleep goal."
        }
    }
    else if(sleepMetrics.value.quality > 40){ 
        return {
            icon: "material-symbols:sentiment-neutral-outline-rounded",
            bgIcon: "bg-red-50",
            iconColor: "#DB5395",
            text: "Bad Sleep Quality. There are a lot of needed improvements."
        }
    } else { 
        return {
            icon: "material-symbols:data-alert-rounded",
            bgIcon: "bg-gray-100",
            iconColor: "#5E5E5E",
            text: "No data collected"
        }
    }
})

//comp props
const sleepMetrics = computed(() => {
    if (!globalSleepSummary.value?.summary || !totalPlannedSleep.value?.totalMinutes) {
        return { duration: 0, activity: 0, quality: 0 };
    }

    const summary = globalSleepSummary.value.summary;
    const sleepMin = summary.sleep_duration_min || 0;
    const sleepHours = summary.sleep_duration_hours || 0;
    const bedHours = summary.time_in_bed_hours || 0;
    const plannedMin = totalPlannedSleep.value.totalMinutes;
    
    let duration = 0;
    let activity = 0;
    
    //duration calculation for overview component (duration)
    if (sleepMin > 0 && plannedMin > 0) {
        if (globalPeriod.value === "day") {
            duration = Math.round((sleepMin / plannedMin) * 100);
        } else if (globalPeriod.value === "week") {
            duration = Math.round((sleepMin / (plannedMin * 7)) * 100);
        } else if (globalPeriod.value === "month") {
            const daysInMonth = endMonth.value[0] || 30;
            duration = Math.round((sleepMin / (plannedMin * daysInMonth)) * 100);
        }
        duration = Math.min(duration, 100);
    }
    if (sleepHours > 0 && bedHours > 0) {
        activity = Math.min(Math.round((sleepHours / bedHours) * 100), 100);
    }
    const quality = Math.round((activity + duration) / 2);
    
    return { duration, activity, quality };
});
const duration = computed(() => sleepMetrics.value.duration);
const activity = computed(() => sleepMetrics.value.activity);
const sleepQuality = computed(() => sleepMetrics.value.quality);

//safe computed properties for overview props
const totalPlannedMinutes = computed(() => {
    return totalPlannedSleep.value?.totalMinutes ? Math.round(totalPlannedSleep.value.totalMinutes) : 0;
});

const timeInBedMinutes = computed(() => {
    return globalSleepSummary.value?.summary?.time_in_bed_min ? Math.round(globalSleepSummary.value.summary.time_in_bed_min) : 0;
});

const totalSleepMinutes = computed(() => {
    return globalSleepSummary.value?.summary?.sleep_duration_min ? Math.round(globalSleepSummary.value.summary.sleep_duration_min) : 0;
});

function formatDateForAPI(day, month, year) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

//full lifecycle
onMounted(async () => {
    if (!globalDate.value) {
        const today = new Date();
        globalDate.value = today.getFullYear() + "-" + 
                          (today.getMonth() + 1).toString().padStart(2, '0') + "-" + 
                          today.getDate().toString().padStart(2, '0');
    }
    if (globalDeviceId.value) {
        await loadDeviceData()
        await loadUserSettings()
        await loadSleepSummary()
        totalPlannedSleep.value = await getSleepDuration()
        console.log("total planned sleep minutes: ", totalPlannedSleep.value?.totalMinutes)
        console.log("device id: ", globalDeviceId.value, "sleep summary: ", globalSleepSummary.value)
        console.log("SLEEPQUALITY: ",  sleepMetrics.value.quality)
        
        if (bedTime.value) { 
            console.log("bed time: ", bedTime.value, "with tolerance: ",  bedTimeTolerance.value, "Wake up time: ", wakeUpTime.value, "with tolerance: ",  wakeUpTolerance.value)
        }
        
        // refreshInterval = setInterval(async () => {
        //     await loadDeviceData()
        //     await loadSleepSummary()
        // }, 30000);
    }
    
    //load bed settings
    const saved = localStorage.getItem('targetBedtime');
    if (saved) targetBedtime.value = saved;
});

onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
});

async function handleToggle(value){
    if(value == 0) { 
        globalPeriod.value = "day"
        globalDate.value = formatDateForAPI(newDateArr.value[0], newDateArr.value[1], newDateArr.value[2])
    } else if (value == 1) { 
        globalPeriod.value = "week"
        globalDate.value = formatDateForAPI(newDateArr.value[0], newDateArr.value[1], newDateArr.value[2])
    } else { 
        globalPeriod.value = "month"
        globalDate.value = formatDateForAPI(newDateArr.value[0], newDateArr.value[1], newDateArr.value[2])
    }
    console.log('Period changed to:', globalPeriod.value, 'Date:', globalDate.value);
    await loadSleepSummary()
}

//day nav
async function dayBack(){ 
    isToday.value = false;
    const newDate = currentDate.subtract({ days: 1 });
    newDateArr.value = [newDate.day, newDate.month, newDate.year];
    globalDate.value = formatDateForAPI(newDate.day, newDate.month, newDate.year);
    currentDate = newDate;
    // globalSleepSummary.value = null
    await loadSleepSummary();
}


async function dayForward(){ 
    if(isToday.value) return;
    
    const newDate = currentDate.add({ days: 1 });
    newDateArr.value = [newDate.day, newDate.month, newDate.year];
    globalDate.value = formatDateForAPI(newDate.day, newDate.month, newDate.year);
    currentDate = newDate;
    await loadSleepSummary();
    
    const todayDate = today(getLocalTimeZone());
    if (currentDate.day === todayDate.day && 
        currentDate.month === todayDate.month && 
        currentDate.year === todayDate.year) { 
        isToday.value = true;
    }
}

//week navigation
async function weekBack(){ 
    isThisWeek.value = false;
    const newDate = currentWeek.subtract({ weeks: 1 });
    startWeek.value = [(startOfWeek(newDate, 'de-DE')).day, (startOfWeek(newDate, 'de-DE')).month, (startOfWeek(newDate, 'de-DE')).year]
    endWeek.value = [(endOfWeek(newDate, 'de-DE')).day, (endOfWeek(newDate, 'de-DE')).month, (endOfWeek(newDate, 'de-DE')).year]
    globalDate.value = formatDateForAPI(newDate.day, newDate.month, newDate.year)
    currentWeek = newDate;
    await loadSleepSummary();
}

async function weekForward(){ 
    if(isThisWeek.value) return;
    
    const newDate = currentWeek.add({ weeks: 1 });
    startWeek.value = [(startOfWeek(newDate, 'de-DE')).day, (startOfWeek(newDate, 'de-DE')).month, (startOfWeek(newDate, 'de-DE')).year]
    endWeek.value = [(endOfWeek(newDate, 'de-DE')).day, (endOfWeek(newDate, 'de-DE')).month, (endOfWeek(newDate, 'de-DE')).year]
    globalDate.value = formatDateForAPI(newDate.day, newDate.month, newDate.year)
    currentWeek = newDate;
    await loadSleepSummary();
    
    const todayDate = today(getLocalTimeZone());
    if (currentWeek.day === todayDate.day && currentWeek.month === todayDate.month){ 
        isThisWeek.value = true;
    }
}

//month navigation
async function monthBack(){ 
    isThisMonth.value = false;
    const newDate = currentMonth.subtract({ months: 1 });
    startMonth.value = [(startOfMonth(newDate, 'de-DE')).day, (startOfMonth(newDate, 'de-DE')).month, (startOfMonth(newDate, 'de-DE')).year]
    endMonth.value = [(endOfMonth(newDate, 'de-DE')).day, (endOfMonth(newDate, 'de-DE')).month, (endOfMonth(newDate, 'de-DE')).year]
    globalDate.value = formatDateForAPI(newDate.day, newDate.month, newDate.year)
    currentMonth = newDate;
    await loadSleepSummary();
}

async function monthForward(){ 
    if(isThisMonth.value) return;
    
    const newDate = currentMonth.add({ months: 1 });
    startMonth.value = [(startOfMonth(newDate, 'de-DE')).day, (startOfMonth(newDate, 'de-DE')).month, (startOfMonth(newDate, 'de-DE')).year]
    endMonth.value = [(endOfMonth(newDate, 'de-DE')).day, (endOfMonth(newDate, 'de-DE')).month, (endOfMonth(newDate, 'de-DE')).year]
    globalDate.value = formatDateForAPI(newDate.day, newDate.month, newDate.year)
    currentMonth = newDate;
    await loadSleepSummary();
    
    const todayDate = today(getLocalTimeZone());
    if (currentMonth.month === todayDate.month && currentMonth.year === todayDate.year){ 
        isThisMonth.value = true;
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
</script>

<style scoped>
.disabledButton { 
    opacity: 0.3;
}
</style>