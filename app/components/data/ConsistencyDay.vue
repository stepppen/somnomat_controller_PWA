<template>
    <primitives-container>
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-semibold text-gray-900">This Night</h3>
            </div>
    
            <div class="relative w-full select-none">
                <!-- Hour labels -->
                <div class="flex justify-between mb-2 pl-4 pr-4">
                    <span v-for="label in axisLabels" :key="label" class="text-xs text-gray-400 w-8 text-center">
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
                        class="absolute h-full bg-indigo-50/50 border-l border-r border-indigo-100 transition-all duration-500 ease-in-out"
                        :style="{
                            left: `${bedToleranceStart}%`,
                            width: `${bedToleranceWidth}%`
                        }"
                    />
                    <div
                        class="absolute h-full bg-indigo-50/50 border-l border-r border-indigo-100 transition-all duration-500 ease-in-out"
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
                    <div v-if="hasTotalBedTime"
                         class="absolute h-[60%] top-[20%] rounded-sm bg-gray-100 border border-gray-200 transition-all duration-500"
                         :style="{
                            left: `${getBarPosition(totalBedTimeStart)}%`,
                            width: `${getBarWidth(totalBedTimeStart, totalBedTimeEnd)}%`
                         }">
                    </div>

                    <!-- All interval bars -->
                    <div
                        v-for="(interval, i) in props.intervals"
                        :key="i"
                        class="absolute h-full rounded-md transition-all duration-500 border-2 border-white shadow-sm flex items-center justify-center group z-2"
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
    
                <!-- Legend -->
                <div class="flex gap-6 pt-6 justify-center flex-wrap">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-indigo-500 rounded" />
                        <span class="text-xs text-gray-500">Sleep</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-gray-400 rounded" />
                        <span class="text-xs text-gray-500">Interval</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-gray-100 border border-gray-200 rounded" />
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
    return (chartHours / CHART_DURATION) * 100;
};

// Axis Labels - Show every 3 hours from 12:00
const axisLabels = computed(() => {
    const labels = [];
    for (let i = 0; i <= 24; i += 3) {
        const hour = (12 + i) % 24;
        labels.push(String(hour).padStart(2, '0'));
    }
    return labels;
});

const bedToleranceStart = computed(() => {
    const bedChartHours = timeToChartHours(localBedTime.value);
    const toleranceHours = localBedTolerance.value / 60;
    const startHours = bedChartHours - toleranceHours;
    return Math.max(0, getPercentPosition(startHours));
});

const bedToleranceWidth = computed(() => {
    const widthHours = (localBedTolerance.value * 2) / 60;
    return (widthHours / CHART_DURATION) * 100;
});

const wakeToleranceStart = computed(() => {
    const wakeChartHours = timeToChartHours(localWakeTime.value);
    const toleranceHours = localWakeTolerance.value / 60;
    const startHours = wakeChartHours - toleranceHours;
    return Math.max(0, getPercentPosition(startHours));
});

const wakeToleranceWidth = computed(() => {
    const widthHours = (localWakeTolerance.value * 2) / 60;
    return (widthHours / CHART_DURATION) * 100;
});


const hasTotalBedTime = computed(() => props.intervals.length > 0);

const totalBedTimeStart = computed(() => {
    if (!props.intervals.length) return null;
    return props.intervals.reduce((earliest, interval) => {
        return new Date(interval.start) < new Date(earliest) ? interval.start : earliest;
    }, props.intervals[0].start);
});

const totalBedTimeEnd = computed(() => {
    if (!props.intervals.length) return null;
    return props.intervals.reduce((latest, interval) => {
        return new Date(interval.end) > new Date(latest) ? interval.end : latest;
    }, props.intervals[0].end);
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
    return (interval.duration_min > 45) ? 'bg-indigo-500' : 'bg-gray-300';
};

const formatTimeShort = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>