<template>
    <primitives-container>
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-semibold text-gray-900">This Night</h3>
            </div>
    
            <div class="relative w-full select-none">
                <!-- Hour labels -->
                <div class="flex justify-between mb-2">
                    <span v-for="label in axisLabels" :key="label" class="text-xs text-gray-400 w-2 text-center">
                        {{ label }}
                    </span>
                </div>
    
                <!-- Main timeline -->
                <div class="relative h-16 rounded-lg border border-gray-100 bg-transparent overflow-hidden">
                    <!-- Grid lines -->
                    <div class="absolute inset-0 flex opacity-50">
                        <div v-for="i in 5" :key="i" class="flex-1 border-r border-gray-100 last:border-0" />
                    </div>
                    
                    <!-- Tolerance zones -->
                    <div
                        class="absolute h-full bg-[#e0e2fc] border-l border-r border-indigo-300 transition-all duration-500 ease-in-out"
                        :style="{
                            left: `${bedToleranceStart}%`,
                            width: `${bedToleranceWidth}%`
                        }"
                    />
                    <div
                        class="absolute h-full bg-[#e0e2fc] border-l border-r border-indigo-300 transition-all duration-500 ease-in-out"
                        :style="{
                            left: `${wakeToleranceStart}%`,
                            width: `${wakeToleranceWidth}%`
                        }"
                    />
                    <div 
                        class="absolute h-full bg-indigo-50/20 transition-all duration-500 ease-in-out"
                        :style="{ 
                            left: `${bedToleranceStart + bedToleranceWidth}%`, 
                            right: `${100 - wakeToleranceStart}%` 
                        }"
                    />
                    
                    <!-- Total bed time bar (light background) -->
                     <div class="flex flex-col gap-1">
                         <div v-if="hasTotalBedTime" 
                            v-for="(startTime, index) in totalBedTimeStart"
                            :key="index"
                            class="absolute h-1/8 top-11 rounded-sm bg-gray-400 transition-all duration-500 bed-bar"
                            :style="{
                                left: `${getBarPosition(startTime)}%`,
                                width: `${getBarWidth(startTime, totalBedTimeEnd[index])}%`
                            }">
                         </div>
     
                         <!-- All interval bars -->
                         <div
                             v-for="(interval, i) in props.intervals"
                             :key="interval.start + interval.end"
                             class=" absolute top-3 h-2/4 transition-all duration-500 flex items-center justify-center group z-2 sleep-bar"
                             :class="getIntervalColor(interval)"
                             :style="{
                                 left: `${getBarPosition(interval.start)}%`,
                                 width: `${getBarWidth(interval.start, interval.end)}%`
                             }"
                         >
                             <!-- <span v-if="getBarWidth(interval.start, interval.end) > 15" 
                                   class="text-[10px] text-white font-medium whitespace-nowrap overflow-hidden px-1">
                                 {{ formatTimeShort(interval.start) }}
                             </span> -->
                         </div>
                     </div>
                </div>
    
                <!-- Legend -->
                <div class="flex gap-6 pt-6 justify-center flex-wrap">
                    <div class="flex items-center gap-2 ">
                        <div class="w-3 h-3 sleep-time-legend" />
                        <span class="text-xs text-gray-500">Sleep</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 tolerance-legend" />
                        <span class="text-xs text-gray-500">Tolerance</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bed-time-legend" />
                        <span class="text-xs text-gray-500">Total Bed Time</span>
                    </div>
                </div>
            </div>
        </div>
    </primitives-container>
</template>

<script setup>
import { computed } from 'vue';
const { 
  globalDeviceId,
  globalDeviceSettings,
  loadDeviceSettings,
} = useDevice()

const { 
    bedTime,
    wakeUpTime,
    bedTimeTolerance,
    wakeUpTolerance,
} = useUserSettings()

const { intervalGrouping } = useCalculations()

const localBedTime = ref(bedTime)
const localWakeTime = ref(wakeUpTime)
const localBedTolerance = ref(bedTimeTolerance)
const localWakeTolerance = ref(wakeUpTolerance)

onMounted(async () => {
    if (globalDeviceId.value) { 
        await loadDeviceSettings()
        if (globalDeviceSettings.value) {
            localBedTime.value = globalDeviceSettings.value.bed_time ?? "0";
            localWakeTime.value = globalDeviceSettings.value.wake_up_time ?? "0";
            localBedTolerance.value = globalDeviceSettings.value.bed_time_tolerance ?? 0;
            localWakeTolerance.value = globalDeviceSettings.value.wake_up_tolerance ?? 0;
            console.log("localBedTime:", localBedTime.value, "localWakeTime.value:", localWakeTime.value, "localBedTolerance:", localBedTolerance.value, "localWakeTolerance:", localWakeTolerance.value)
        }
    }
    if(intervalGrouping) { 
        console.log("props int: ", intervalGrouping.value)

    }
});

const props = defineProps({
    intervals: {
        type: Array,
        default: () => []
    }
});

const CHART_DURATION = 24;

const timeToChartHours = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const hourDecimal = h + (m / 60);
    
    // If time is >= 12:00, it's on the first day (yesterday afternoon/evening)
    // If time is < 12:00, it's on the second day (today morning)
    // if go to bed at 23:45 -> 23.75 -> 11.75
    //if go to bed at 09:30 -> 9.5 -> 21.5
    if (hourDecimal >= 12) {
        return hourDecimal - 12;
    } else {
        return hourDecimal + 12; 
    }
};

// Convert ISO timestamp to hours since chart start
const isoToChartHours = (isoStr) => {
    if (!isoStr) return 0;
    const d = new Date(isoStr);
    const hour = d.getHours();
    const minute = d.getMinutes();
    const hourDecimal = hour + (minute / 60);
    
    // Same logic as timeToChartHours
    if (hourDecimal >= 12) {
        return hourDecimal - 12;
    } else {
        return hourDecimal + 12;
    }
};

const getPercentPosition = (chartHours) => {
    return (chartHours / CHART_DURATION) * 100 -4;
};

//x-axis hours
const axisLabels = computed(() => {
    const labels = [];
    for (let i = 0; i <= 24; i += 2) {
        const hour = (12 + i) % 24;
        labels.push(String(hour).padStart(2, '0'));
    }
    return labels;
});

const bedToleranceStart = computed(() => {
    const bedChartHours = timeToChartHours(localBedTime.value);
    const toleranceHours = localBedTolerance.value / 60;
    const startHours = bedChartHours - toleranceHours;
    return Math.max(0, getPercentPosition(startHours) + 5);
});

const bedToleranceWidth = computed(() => {
    const widthHours = (localBedTolerance.value * 2) / 60;
    return (widthHours / CHART_DURATION) * 100;
});

const wakeToleranceStart = computed(() => {
    const wakeChartHours = timeToChartHours(localWakeTime.value);
    const toleranceHours = localWakeTolerance.value / 60;
    const startHours = wakeChartHours - toleranceHours;
    return Math.max(0, getPercentPosition(startHours) + 5);
});

const wakeToleranceWidth = computed(() => {
    const widthHours = (localWakeTolerance.value * 2) / 60;
    return (widthHours / CHART_DURATION) * 100;
});


const hasTotalBedTime = computed(() => props.intervals.length > 0);



// const intervalGrouping = computed (() => { 
//     if (!props.intervals.length) return null;
//     let intervalAcc = []
//     for (let i = 0; i < props.intervals.length - 1; i++) { 
//         if(new Date(props.intervals[i + 1].start) - new Date(props.intervals[i].end) < 300000) { 
//             if(intervalAcc.includes(props.intervals[i])) { 
//                 if(props.intervals[i + 1].duration_min > 5){ 
//                     intervalAcc.push(props.intervals[i + 1])
//                 }  
//             } else { 
//                 if(props.intervals[i].duration_min > 5){
//                     intervalAcc.push(props.intervals[i])
//                 }
//                 if(props.intervals[i + 1].duration_min > 5){ 
//                     intervalAcc.push(props.intervals[i + 1])
//                 } 
//                 // if(new Date(props.intervals[i].duration_min) > 5) { 
//                 // }
//                 // if(new Date(props.intervals[i + 1].duration_min) > 5) { 
//                 // }
//                 console.log("intervalAcc", intervalAcc)
//             }
//         }
    
//     }
//     return intervalAcc

// })

// const intervalGrouping = computed(() => { 
//     if (!props.intervals.length) return [];
//     const groups = [];
//     let currentGroup = [props.intervals[0]];
//     for (let i = 1; i < props.intervals.length; i++) {
//         const previousInterval = props.intervals[i - 1];
//         const currentInterval = props.intervals[i];
//         const gap = new Date(currentInterval.start) - new Date(previousInterval.end);
//         const fiveMinutesInMs = 5 * 60 * 1000; // 300000
        
//         if (gap < fiveMinutesInMs) {
//             currentGroup.push(currentInterval);
//         } else {
//             groups.push(currentGroup);
//             currentGroup = [currentInterval];
//         }
//     }
    
//     groups.push(currentGroup);
    
//     // Filter out groups where total duration is less than 5 minutes
//     const validGroups = groups.filter(group => {
//         const totalDuration = group.reduce((sum, interval) => sum + interval.duration_min, 0);
//         console.log("totalDuration:", totalDuration)
//         return totalDuration >= 20;
//     });
//     console.log("valid: ", validGroups)
//     return validGroups;
// });



const totalBedTimeStart = computed(() => {
    // if (!props.intervals.length) return null;

    //reduce method => reducer(accumulator, currentValue, index)
    //reduces into a single val
    // const getEarliest = (earliest, interval) => {
    // return props.intervals.reduce((earliestAcc, currentInterval) => {
    //     return new Date(currentInterval.start) < new Date(earliestAcc) ? currentInterval.start : earliestAcc;
    // }, props.intervals[0].start); //accumulator initialiser -> earliestAcc

    // return intervalGrouping.value.reduce((earliestAcc, currentInterval) => { 
    //     return new Date(currentInterval.start) < new Date(earliestAcc) ? currentInterval.start : earliestAcc;
    // }, intervalGrouping.value[0][0].start)

    if (!intervalGrouping.value || !intervalGrouping.value.length) return null;

    // For each group, get the start of the first interval
    return intervalGrouping.value.map(group => {
        return group[0].start;
    });
});




const totalBedTimeEnd = computed(() => {
    // if (!props.intervals.length) return null;
    // return props.intervals.reduce((latest, interval) => {
    //     return new Date(interval.end) > new Date(latest) ? interval.end : latest;
    // }, props.intervals[0].end);

    // return intervalGrouping.value.reduce((latestAcc, currentInterval) => { 
    //     return new Date(currentInterval.end) < new Date(latestAcc) ? currentInterval.end : latestAcc;
    // }, intervalGrouping.value[0][0].end)

    if (!intervalGrouping.value || !intervalGrouping.value.length) return null;

    // For each group, get the end of the last interval
    return intervalGrouping.value.map(group => {
        return group[group.length - 1].end; // Last interval's end in each group
    });
});

const getBarPosition = (isoStart) => {
    if (!isoStart) return 0;
    const chartHours = isoToChartHours(isoStart);
    return Math.max(0, Math.min(100, getPercentPosition(chartHours)));
};

const getBarWidth = (isoStart, isoEnd) => {
    if (!isoStart || !isoEnd) return 0;
    const startD = new Date(isoStart);
    const endD = new Date(isoEnd);
    const diffMs = endD.getTime() - startD.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const widthPercent = (diffHours / CHART_DURATION) * 100;
    return Math.max(0, Math.min(100, widthPercent));
};

const getIntervalColor = (interval) => {
    console.log('intervalGrouping.value:', intervalGrouping.value);
    console.log('Type:', typeof intervalGrouping.value);
    console.log('Is array?', Array.isArray(intervalGrouping.value));
    if (!intervalGrouping.value || !Array.isArray(intervalGrouping.value) || intervalGrouping.value.length === 0) {
        return 'bg-gray-200';
    }
    for (const group of intervalGrouping.value) {
        if (!Array.isArray(group)) continue;
        
        // Compare by properties instead of object reference
        const found = group.some(item => 
            item.start === interval.start && 
            item.end === interval.end
        );
        
        if (found) {
            return 'bg-[#0600AB]';
        }
    }
    
    return 'bg-gray-200';
};

const formatTimeShort = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>

.sleep-bar {
    /* background-color: var(--gradient-start);  */
    /* background: #acacbb; */
    opacity: 1;
    border-radius: 0.2rem;
}
.bed-bar {
    background-color: #c9c0ed; 
    opacity: 1;
    border-radius: 0.2rem;
}

.bed-time-legend {
    background-color: #c9c0ed; 
    opacity: 1;
    border-radius: 0.2rem;
    border: 1px solid var(--gradient-end) ;
}

.sleep-time-legend {
    background-color: var(--gradient-start); 
    opacity: 1;
    border-radius: 0.2rem;
    border: 1px solid var(--gradient-start) ;
}

.tolerance-legend {
    background-color: #e0e2fc; 
    opacity: 1;
    border-radius: 0.2rem;
    border: 1px solid oklch(78.5% 0.115 274.713) ;
}

</style>