<template>
    <primitives-container>
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-semibold text-gray-900">This Night</h3>
            </div>
    
            <div class="relative w-full select-none">
                <div class="flex justify-between mb-2 px-1">
                    <span v-for="label in axisLabels" :key="label" class="text-[10px] text-gray-400 w-4 text-center">
                        {{ label }}
                    </span>
                </div>
    
                <div class="relative h-20 rounded-xl border border-gray-100 bg-gray-50 touch-pan-y overflow-visible">
                    
                    <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                        <div class="absolute inset-0 flex opacity-30">
                            <div v-for="i in 4" :key="i" class="flex-1 border-r border-gray-100 last:border-0" />
                        </div>
                    </div>
                    
                    <div
                        @click.stop="toggleZone('bed')"
                        class="absolute h-full bg-indigo-50/60 border-l border-r border-indigo-200 transition-all cursor-pointer"
                        :class="selectedZone === 'bed' ? 'ring-2 ring-indigo-400 z-30' : 'z-10'"
                        :style="{ left: `${getPercentPosition(bedToleranceStartHours)}%`, width: `${getPercentWidth(localBedTolerance / 30)}%` }"
                    >
                        <transition name="pop">
                            <div v-if="selectedZone === 'bed'" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-xl z-[100] whitespace-nowrap">
                                <div class="p-small font-bold text-gray-400">Bedtime Target</div>
                                <div class="text-[11px]">{{ localBedTime }} (±{{ localBedTolerance }}m)</div>
                                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                            </div>
                        </transition>
                    </div>

                    <div
                        @click.stop="toggleZone('wake')"
                        class="absolute h-full bg-indigo-50/60 border-l border-r border-indigo-200 transition-all cursor-pointer"
                        :class="selectedZone === 'wake' ? 'ring-2 ring-indigo-400 z-30' : 'z-10'"
                        :style="{ left: `${getPercentPosition(wakeToleranceStartHours)}%`, width: `${getPercentWidth(localWakeTolerance / 30)}%` }"
                    >
                        <transition name="pop">
                            <div v-if="selectedZone === 'wake'" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-xl z-[100] whitespace-nowrap">
                                <div class="p-small font-bold text-gray-400">Wake Target</div>
                                <div class="text-[11px]">{{ localWakeTime }} (±{{ localWakeTolerance }}m)</div>
                                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                            </div>
                        </transition>
                    </div>
                    
                    <div class="relative h-full w-full pointer-events-none">
                         <div v-if="hasTotalBedTime" 
                            v-for="(startTime, index) in totalBedTimeStart"
                            :key="'bed-'+index"
                            class="absolute h-1 bottom-3 rounded-full bg-gray-200"
                            :style="{
                                left: `${getPercentPosition(isoToRelativeHours(startTime))}%`,
                                width: `${getPercentWidth(getDurationHours(startTime, totalBedTimeEnd[index]))}%`
                            }">
                         </div>
     
                         <div
                             v-for="(interval, i) in props.intervals"
                             :key="interval.start + interval.end"
                             @click.stop="handleSelect(interval)"
                             class="absolute top-5 h-8 transition-all duration-200 flex items-center justify-center rounded-md cursor-pointer pointer-events-auto active:opacity-70"
                             :class="[
                                getIntervalColor(interval),
                                selectedInterval === interval ? 'ring-2 ring-indigo-900 ring-offset-2 z-50' : 'z-20'
                             ]"
                             :style="{
                                 left: `${getPercentPosition(isoToRelativeHours(interval.start))}%`,
                                 width: `${getPercentWidth(getDurationHours(interval.start, interval.end))}%`
                             }"
                         >
                            <transition name="pop">
                                <div v-if="selectedInterval === interval" 
                                     class="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-2xl whitespace-nowrap z-[100]"
                                >
                                    <div class="flex flex-col items-center gap-0.5">
                                        <span class="p-small text-gray-400 font-bold">Sleep Session</span>
                                        <span class="text-[11px] font-medium">
                                            {{ formatTimeShort(getGroupTimes(interval).start) }} — {{ formatTimeShort(getGroupTimes(interval).end) }}
                                        </span>
                                    </div>
                                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                                </div>
                            </transition>
                         </div>
                    </div>
                </div>
    
                <div class="flex gap-6 pt-6 justify-center flex-wrap">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-sm border bg-[#0600AB]" />
                        <span class="text-[10px] text-gray-500 font-semibold">Sleep</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-sm bg-indigo-100 border border-indigo-300" />
                        <span class="text-[10px] text-gray-500 font-semibold">Tolerance</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300" />
                        <span class="text-[10px] text-gray-500 font-semibold">Bed Time</span>
                    </div>
                </div>
            </div>
        </div>
    </primitives-container>
</template>

<script setup>

const props = defineProps({
    intervals: { type: Array, default: () => [] }
});

// Settings & Calculations
const { globalDeviceId, globalDeviceSettings, loadDeviceSettings } = useDevice()
const { bedTime, wakeUpTime, bedTimeTolerance, wakeUpTolerance } = useUserSettings()
const { intervalGrouping } = useCalculations()

const localBedTime = ref(bedTime)
const localWakeTime = ref(wakeUpTime)
const localBedTolerance = ref(bedTimeTolerance)
const localWakeTolerance = ref(wakeUpTolerance)

// Selection States
const selectedInterval = ref(null);
const selectedZone = ref(null); // 'bed' or 'wake'

onMounted(async () => {
    if (globalDeviceId.value) { 
        await loadDeviceSettings()
        if (globalDeviceSettings.value) {
            localBedTime.value = globalDeviceSettings.value.bed_time ?? "22:30";
            localWakeTime.value = globalDeviceSettings.value.wake_up_time ?? "07:30";
            localBedTolerance.value = globalDeviceSettings.value.bed_time_tolerance ?? 30;
            localWakeTolerance.value = globalDeviceSettings.value.wake_up_tolerance ?? 30;
        }
    }
});

const windowRange = computed(() => {
    const points = props.intervals.flatMap(i => [
        isoToRelativeHours(i.start),
        isoToRelativeHours(i.end)
    ]);
    
    if (!points.length) return { start: 9, end: 21, duration: 12 };

    const min = Math.min(...points, bedToleranceStartHours.value) - 1;
    const max = Math.max(...points, wakeToleranceStartHours.value + (localWakeTolerance.value/30)) + 1;
    return { start: min, end: max, duration: max - min };
});

const isoToRelativeHours = (isoStr) => {
    const d = new Date(isoStr);
    const hrs = d.getHours() + (d.getMinutes() / 60);
    return hrs >= 12 ? hrs - 12 : hrs + 12;
};

const getPercentPosition = (relHour) => ((relHour - windowRange.value.start) / windowRange.value.duration) * 100;
const getPercentWidth = (durationHrs) => (durationHrs / windowRange.value.duration) * 100;
const getDurationHours = (start, end) => (new Date(end) - new Date(start)) / (1000 * 60 * 60);

const axisLabels = computed(() => {
    const labels = [];
    const step = windowRange.value.duration / 4;
    for (let i = 0; i <= 4; i++) {
        const relHour = windowRange.value.start + (i * step);
        const actualHour = Math.floor(relHour + 12) % 24;
        labels.push(`${String(actualHour).padStart(2, '0')}:00`);
    }
    return labels;
});

const toggleZone = (zone) => {
    selectedInterval.value = null;
    if (selectedZone.value === zone) {
        selectedZone.value = null;
    } else {
        selectedZone.value = zone;
    }
};


// const handleSelect = (interval) => {
//     selectedZone.value = null;
//     selectedInterval.value = selectedInterval.value === interval ? null : interval;
// };

const handleSelect = (interval) => {
    selectedZone.value = null; 
    if (selectedInterval.value === interval) {
        selectedInterval.value = null;
    } else {
        selectedInterval.value = interval;
    }
};

const clearSelection = () => {
    selectedInterval.value = null;
    selectedZone.value = null;
};

const getGroupTimes = (interval) => {
    const group = intervalGrouping.value?.find(g => g.some(item => item.start === interval.start));
    return group ? { start: group[0].start, end: group[group.length - 1].end } : { start: interval.start, end: interval.end };
};

const getIntervalColor = (interval) => {
    const isSleep = intervalGrouping.value?.some(group => group.some(item => item.start === interval.start));
    return isSleep ? 'bg-[#0600AB]' : 'bg-gray-200';
};

const formatTimeShort = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });


const getRelativeFromStr = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const dec = h + (m/60);
    return dec >= 12 ? dec - 12 : dec + 12;
};

const bedToleranceStartHours = computed(() => getRelativeFromStr(localBedTime.value) - (localBedTolerance.value / 60));
const wakeToleranceStartHours = computed(() => getRelativeFromStr(localWakeTime.value) - (localWakeTolerance.value / 60));

const hasTotalBedTime = computed(() => props.intervals.length > 0);
const totalBedTimeStart = computed(() => intervalGrouping.value?.map(g => g[0].start) || []);
const totalBedTimeEnd = computed(() => intervalGrouping.value?.map(g => g[g.length - 1].end) || []);
</script>

<style scoped>
.pop-enter-active { animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-leave-active { animation: pop-in 0.15s reverse ease-in; }
@keyframes pop-in {
  0% { transform:  scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>