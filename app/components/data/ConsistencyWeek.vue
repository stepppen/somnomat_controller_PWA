<template>
    <primitives-container>
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-semibold text-gray-900">This Week</h3>
                <div class="flex flex-col text-right">
                    <span class="text-sm font-bold text-indigo-600">
                        Streak: {{ streakStats.current }} days
                    </span>
                    <span class="text-xs text-gray-400">
                        Best: {{ streakStats.record }} days
                    </span>
                </div>
            </div>
    
            <div class="relative w-full select-none">
                <div class="flex justify-between mb-2 pl-12 pr-4">
                    <span v-for="label in axisLabels" :key="label" class="text-[10px] text-gray-400 w-4 text-center">
                        {{ label }}
                    </span>
                </div>
    
                <div class="relative">

                    <div class="flex flex-col gap-2 relative z-10">
                        <div v-for="(dayRow, idx) in processedWeekDays" :key="idx" class="flex items-center gap-3 relative z-10 mb-4">
                            <!-- Day bubble -->
                            <div class="w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-200"
                                 :class="getDayBubbleClass(dayRow)">
                                <span class="text-xs font-bold">{{ dayRow.label }}</span>
                            </div>
                                                    <!-- Tolerance zones background -->
                        <div class="absolute top-0 bottom-0 left-12 right-0 pointer-events-none">
                            <!-- Bedtime tolerance zone -->
                            <div 
                                @click.stop="toggleZone('bed', dayRow.dateKey)"
                                class="absolute top-0 bottom-0 bg-indigo-50/60 border-l border-r border-indigo-200 transition-all cursor-pointer pointer-events-auto z-11"
                                :class="selectedZone?.type === 'bed' && selectedZone?.day === dayRow.dateKey ? 'ring-2 ring-indigo-400 z-30' : 'z-10'"
                                :style="{ left: `${bedToleranceStart}%`, width: `${bedToleranceWidth}%` }">
                                <transition name="pop">
                                    <div v-if="selectedZone?.type === 'bed' && selectedZone?.day === dayRow.dateKey" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-xl z-[100] whitespace-nowrap">
                                        <div class="p-small font-bold text-gray-400">Bedtime Target</div>
                                        <div class="text-[11px]">{{ localBedTime }} (±{{ localBedTolerance }}m)</div>
                                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                                    </div>
                                </transition>
                            </div>

                            <!-- Wake time tolerance zone -->
                            <div 
                                @click.stop="toggleZone('wake', dayRow.dateKey)"
                                class="absolute top-0 bottom-0 bg-indigo-50/60 border-l border-r border-indigo-200 transition-all cursor-pointer pointer-events-auto z-11"
                                :class="selectedZone?.type === 'wake' && selectedZone?.day === dayRow.dateKey ? 'ring-2 ring-indigo-400 z-30' : 'z-10'"
                                :style="{ left: `${wakeToleranceStart}%`, width: `${wakeToleranceWidth}%` }">
                                <transition name="pop">
                                    <div v-if="selectedZone?.type === 'wake' && selectedZone?.day === dayRow.dateKey" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-xl z-[100] whitespace-nowrap">
                                        <div class="p-small font-bold text-gray-400">Wake Target</div>
                                        <div class="text-[11px]">{{ localWakeTime }} (±{{ localWakeTolerance }}m)</div>
                                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                            
                            <!-- Timeline bar -->
                            <div class="flex-1 relative h-10 rounded-xl border border-gray-100 bg-gray-50">
                                
                                <div class="relative h-full w-full pointer-events-none">
                                    <!-- Total bed time indicator -->
                                    <div v-if="dayRow.hasData"
                                         class="absolute h-1 bottom-2 rounded-full bg-gray-200"
                                         :style="{
                                            left: `${getBarPosition(dayRow.minStart)}%`,
                                            width: `${getBarWidth(dayRow.minStart, dayRow.maxEnd)}%`
                                         }">
                                    </div>
    
                                    <!-- Sleep intervals -->
                                    <div
                                        v-for="(interval, i) in dayRow.intervals"
                                        :key="interval.start + interval.end"
                                        @click.stop="handleSelect(interval, dayRow.dateKey)"
                                        class="absolute top-2 h-4 transition-all duration-200 flex items-center justify-center rounded-md cursor-pointer pointer-events-auto active:opacity-70"
                                        :class="[
                                            getIntervalColor(interval),
                                            isIntervalSelected(interval, dayRow.dateKey) ? 'ring-2 ring-indigo-900 ring-offset-2 z-50' : 'z-20'
                                        ]"
                                        :style="{
                                            left: `${getBarPosition(interval.start)}%`,
                                            width: `${getBarWidth(interval.start, interval.end)}%`
                                        }"
                                    >
                                        <transition name="pop">
                                            <div v-if="isIntervalSelected(interval, dayRow.dateKey)" 
                                                 class="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-2xl whitespace-nowrap z-[100]">
                                                <div class="flex flex-col items-center gap-0.5">
                                                    <span class="p-small text-gray-400 font-bold">Sleep Session</span>
                                                    <span class="text-[11px] font-medium">
                                                        {{ formatTimeShort(interval.start) }} — {{ formatTimeShort(interval.end) }}
                                                    </span>
                                                </div>
                                                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                                            </div>
                                        </transition>
                                    </div>
                                </div>
                            </div>
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
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
    intervals: { type: Array, default: () => [] }
});

const { globalDeviceId, globalDeviceSettings, globalDate, loadDeviceSettings } = useDevice();
const { bedTime, wakeUpTime, bedTimeTolerance, wakeUpTolerance } = useUserSettings();
const { intervalGrouping } = useCalculations();

const localBedTime = ref(bedTime.value || "22:30");
const localWakeTime = ref(wakeUpTime.value || "07:30");
const localBedTolerance = ref(bedTimeTolerance.value || 30);
const localWakeTolerance = ref(wakeUpTolerance.value || 30);

// Selection states (matching DataConsistencyDay)
const selectedInterval = ref(null);
const selectedDay = ref(null);
const selectedZone = ref(null); // 'bed' or 'wake'

onMounted(async () => {
    if (globalDeviceId.value) { 
        await loadDeviceSettings();
        if (globalDeviceSettings.value) {
            localBedTime.value = globalDeviceSettings.value.bed_time ?? "22:30";
            localWakeTime.value = globalDeviceSettings.value.wake_up_time ?? "07:30";
            localBedTolerance.value = globalDeviceSettings.value.bed_time_tolerance ?? 30;
            localWakeTolerance.value = globalDeviceSettings.value.wake_up_tolerance ?? 30;
        }
    }
});

const getLocalYMD = (dateStr) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m / 60);
};

// Use the same relative hours conversion as DataConsistencyDay
const isoToRelativeHours = (isoStr) => {
    const d = new Date(isoStr);
    const hrs = d.getHours() + (d.getMinutes() / 60);
    return hrs >= 12 ? hrs - 12 : hrs + 12;
};

// Window range calculation (like DataConsistencyDay)
const windowRange = computed(() => {
    const points = props.intervals.flatMap(i => [
        isoToRelativeHours(i.start),
        isoToRelativeHours(i.end)
    ]);
    
    if (!points.length) return { start: 9, end: 21, duration: 12 };

    const bedStart = getRelativeFromStr(localBedTime.value) - (localBedTolerance.value / 60);
    const wakeEnd = getRelativeFromStr(localWakeTime.value) + (localWakeTolerance.value / 60);

    const min = Math.min(...points, bedStart) - 1;
    const max = Math.max(...points, wakeEnd) + 1;
    return { start: min, end: max, duration: max - min };
});

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

const getRelativeFromStr = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const dec = h + (m/60);
    return dec >= 12 ? dec - 12 : dec + 12;
};

// Tolerance zones (matching DataConsistencyDay calculations)
const bedToleranceStart = computed(() => {
    const start = getRelativeFromStr(localBedTime.value) - (localBedTolerance.value / 60);
    return getPercentPosition(start);
});

const bedToleranceWidth = computed(() => {
    const widthHours = (localBedTolerance.value * 2) / 60;
    return getPercentWidth(widthHours);
});

const wakeToleranceStart = computed(() => {
    const start = getRelativeFromStr(localWakeTime.value) - (localWakeTolerance.value / 60);
    return getPercentPosition(start);
});

const wakeToleranceWidth = computed(() => {
    const widthHours = (localWakeTolerance.value * 2) / 60;
    return getPercentWidth(widthHours);
});

// Toggle zone selection (matching DataConsistencyDay)
const toggleZone = (zone, key) => {
    selectedInterval.value = null;
    selectedDay.value = null;
    if (selectedZone.value?.type === zone && selectedZone.value?.day === key) {
        selectedZone.value = null;
    } else {
        selectedZone.value = { type: zone, day: key };
    }
};

// Handle interval selection (matching DataConsistencyDay)
const handleSelect = (interval, dayKey) => {
    selectedZone.value = null;
    if (selectedInterval.value === interval && selectedDay.value === dayKey) {
        selectedInterval.value = null;
        selectedDay.value = null;
    } else {
        selectedInterval.value = interval;
        selectedDay.value = dayKey;
    }
};

// Check if interval is selected
const isIntervalSelected = (interval, dayKey) => {
    return selectedInterval.value === interval && selectedDay.value === dayKey;
};

// Check if sleep is within tolerance
const checkTolerance = (startIso, endIso) => {
    const startD = new Date(startIso);
    const endD = new Date(endIso);
    
    let actualBed = startD.getHours() + (startD.getMinutes() / 60);
    const targetBed = timeToDecimal(localBedTime.value);
    let bedDiff = Math.abs(actualBed - targetBed);
    if (bedDiff > 12) bedDiff = 24 - bedDiff;

    let actualWake = endD.getHours() + (endD.getMinutes() / 60);
    const targetWake = timeToDecimal(localWakeTime.value);
    let wakeDiff = Math.abs(actualWake - targetWake);
    if (wakeDiff > 12) wakeDiff = 24 - wakeDiff;

    return bedDiff <= (localBedTolerance.value/60) && wakeDiff <= (localWakeTolerance.value/60);
};

// Process intervals by day
const dailyStats = computed(() => {
    const stats = {};
    if (!props.intervals || props.intervals.length === 0) return stats;

    props.intervals.forEach(interval => {
        const dateKey = getLocalYMD(interval.end);
        if (!stats[dateKey]) {
            stats[dateKey] = {
                intervals: [],
                minStart: interval.start,
                maxEnd: interval.end,
                isSuccess: false
            };
        }
        stats[dateKey].intervals.push(interval);
        
        if (new Date(interval.start) < new Date(stats[dateKey].minStart)) 
            stats[dateKey].minStart = interval.start;
        if (new Date(interval.end) > new Date(stats[dateKey].maxEnd)) 
            stats[dateKey].maxEnd = interval.end;

        const durationMin = interval.duration_min || 0;
        if (durationMin > 45 && checkTolerance(interval.start, interval.end)) {
            stats[dateKey].isSuccess = true;
        }
    });
    return stats;
});

// Calculate streak statistics
const streakStats = computed(() => {
    const days = Object.keys(dailyStats.value).sort();
    if (days.length === 0) return { current: 0, record: 0 };

    let current = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    days.forEach(day => {
        if (dailyStats.value[day].isSuccess) tempStreak++;
        else tempStreak = 0;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
    });
    
    const lastDayKey = days[days.length - 1];
    const todayKey = getLocalYMD(new Date().toISOString());
    
    if (dailyStats.value[lastDayKey]?.isSuccess) {
         const diffTime = Math.abs(new Date(todayKey).getTime() - new Date(lastDayKey).getTime());
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
         if (diffDays <= 1) current = tempStreak;
    }

    return { current, record: maxStreak };
});

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Process week data based on current globalDate
const processedWeekDays = computed(() => {
    const refDate = globalDate.value ? new Date(globalDate.value) : new Date();
    const dayOfWeek = refDate.getDay(); 
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const mondayDate = new Date(refDate);
    mondayDate.setDate(refDate.getDate() + diffToMon);
    const todayStr = getLocalYMD(new Date().toISOString());

    return weekDays.map((label, idx) => {
        const rowDate = new Date(mondayDate);
        rowDate.setDate(mondayDate.getDate() + idx);
        
        const dateKey = getLocalYMD(rowDate.toISOString());
        const data = dailyStats.value[dateKey];
        const isFuture = dateKey > todayStr;
        const isToday = dateKey === todayStr;

        return {
            label, 
            dateKey, 
            isFuture, 
            isToday,
            hasData: !!data,
            intervals: data?.intervals || [],
            minStart: data?.minStart,
            maxEnd: data?.maxEnd,
            isSuccess: data?.isSuccess || false
        };
    });
});

// Bar positioning using the same logic as DataConsistencyDay
const getBarPosition = (isoStart) => {
    if (!isoStart) return 0;
    const relHour = isoToRelativeHours(isoStart);
    return Math.max(0, getPercentPosition(relHour));
};

const getBarWidth = (isoStart, isoEnd) => {
    if (!isoStart || !isoEnd) return 0;
    const durationHrs = getDurationHours(isoStart, isoEnd);
    return getPercentWidth(durationHrs);
};

// Color intervals based on if they're sleep sessions (matching DataConsistencyDay exactly)
const getIntervalColor = (interval) => {
    const isSleep = intervalGrouping.value?.some(group => 
        group.some(item => item.start === interval.start)
    );
    return isSleep ? 'bg-[#0600AB]' : 'bg-gray-200';
};

const getDayBubbleClass = (day) => {
    if (day.isFuture) return "bg-white border-dashed border-gray-200 text-gray-300";
    let cls = "border-transparent"; 
    if (day.isSuccess) cls = "bg-indigo-600 text-white";
    else if (day.hasData) cls = "bg-white border-indigo-200 text-indigo-400 border-solid";
    else cls = "bg-gray-100 text-gray-400";
    if (day.isToday) cls += " ring-2 ring-indigo-400 ring-offset-1 border-indigo-600";
    return cls;
};

const formatTimeShort = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
};
</script>

<style scoped>
.pop-enter-active { animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-leave-active { animation: pop-in 0.15s reverse ease-in; }
@keyframes pop-in {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>