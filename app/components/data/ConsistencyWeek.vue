<template>
    <primitives-container>
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-semibold text-gray-900">Consistency</h3>
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
                    <span v-for="label in axisLabels" :key="label" class="text-xs text-gray-400 w-8 text-center">
                        {{ label }}
                    </span>
                </div>
    
                <div class="space-y-3 relative">
                    
                    <div class="absolute top-0 bottom-0 left-12 right-0 pointer-events-none">
                        <div class="absolute top-0 bottom-0 bg-indigo-50/50 border-l border-r border-indigo-100 transition-all duration-500 ease-in-out"
                             :style="{ left: `${bedToleranceStart}%`, width: `${bedToleranceWidth}%` }">
                        </div>
                        <div class="absolute top-0 bottom-0 bg-indigo-50/50 border-l border-r border-indigo-100 transition-all duration-500 ease-in-out"
                             :style="{ left: `${wakeToleranceStart}%`, width: `${wakeToleranceWidth}%` }">
                        </div>
                         <div class="absolute top-0 bottom-0 bg-indigo-50/20 transition-all duration-500 ease-in-out"
                             :style="{ left: `${bedToleranceStart + bedToleranceWidth}%`, right: `${100 - wakeToleranceStart}%` }">
                        </div>
                    </div>

                    <div v-for="(dayRow, idx) in processedWeekDays" :key="idx" class="flex items-center gap-3 relative z-10 group">
                        
                        <div class="w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-200"
                             :class="getDayBubbleClass(dayRow)">
                            <span class="text-xs font-bold">{{ dayRow.label }}</span>
                        </div>
                        
                        <div class="flex-1 relative h-10 rounded-lg border border-gray-100 bg-transparent overflow-hidden">
                            <div class="absolute inset-0 flex opacity-50">
                                <div v-for="i in 5" :key="i" class="flex-1 border-r border-gray-100 last:border-0" />
                            </div>
                            
                            <div v-if="dayRow.hasData"
                                 class="absolute h-[60%] top-[20%] rounded-sm bg-gray-100 border border-gray-200 transition-all duration-500"
                                 :style="{
                                    left: `${getBarPosition(dayRow.minStart)}%`,
                                    width: `${getBarWidth(dayRow.minStart, dayRow.maxEnd)}%`
                                 }">
                            </div>

                            <div
                                v-for="(interval, i) in dayRow.intervals"
                                :key="i"
                                class="absolute h-full top-0 bottom-0 rounded-md transition-all duration-500 border-2 border-white shadow-sm flex items-center justify-center group/bar"
                                :class="getIntervalColor(interval)"
                                :style="{
                                    left: `${getBarPosition(interval.start)}%`,
                                    width: `${getBarWidth(interval.start, interval.end)}%`
                                }"
                            >
                                <span v-if="getBarWidth(interval.start, interval.end) > 15" 
                                      class="text-[10px] text-white font-medium whitespace-nowrap overflow-hidden px-1">
                                    {{ formatTimeShort(interval.start) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
    
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

<script setup lang="ts">
import { computed } from 'vue';

// 1. Props
const props = defineProps({
    intervals: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    currentDate: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    }
});

// 2. Real User Settings (No Mocks)
// Since this is Nuxt, useUserSettings is likely auto-imported.
// If not, add: import { useUserSettings } from '~/composables/useUserSettings';
const { bedTime, wakeUpTime, bedTimeTolerance, wakeUpTolerance } = useUserSettings();

// --- CORE HELPERS ---

const getLocalYMD = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const timeToDecimal = (timeStr: string) => {
    if(!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m / 60);
};

// --- CHART SCALING (Now Reactive to bedTime/wakeUpTime) ---

// Start the chart 2 hours before bedtime
const chartStartHour = computed(() => {
    const bed = timeToDecimal(bedTime.value);
    // If bedtime is 00:00, start is 22:00. If 01:00, start is 23:00.
    return (bed - 2 + 24) % 24; 
});

// Calculate total window duration (e.g., 22:00 -> 09:00 is 11 hours)
const chartDuration = computed(() => {
    const start = chartStartHour.value;
    let end = timeToDecimal(wakeUpTime.value) + 2; // End 2 hours after wake up
    
    // Handle midnight crossing (e.g. Start 22, End 09)
    // If End (9) < Start (22), add 24 to End => 33 - 22 = 11 hours
    if (end < start) end += 24;
    
    // Ensure minimum window to prevent breaking
    return Math.max(8, end - start);
});

const getPercentPosition = (hourDecimal: number) => {
    const start = chartStartHour.value;
    let target = hourDecimal;
    
    // Normalize target relative to start
    // Case: Start 22:00, Target 01:00. Target needs to be treated as 25.0
    // Threshold: if chart starts late (e.g. >12:00) and target is early (<12:00), add 24h
    if (start > 12 && target < 12) {
        target += 24;
    } else if (target < start) {
        // Fallback for rare edge cases or if start is early morning
        target += 24;
    }

    return ((target - start) / chartDuration.value) * 100;
};

// Axis Labels (Regenerates when settings change)
const axisLabels = computed(() => {
    const labels = [];
    const start = Math.floor(chartStartHour.value);
    const duration = Math.ceil(chartDuration.value);
    
    // Show label every ~3 hours
    const step = Math.ceil(duration / 5); 

    for (let i = 0; i <= duration; i += step) {
        let h = (start + i) % 24;
        labels.push(String(h).padStart(2, '0'));
    }
    return labels;
});

// --- TOLERANCE ZONES ---

const bedToleranceStart = computed(() => {
    const bed = timeToDecimal(bedTime.value);
    const startH = bed - (bedTimeTolerance.value / 60);
    return Math.max(0, getPercentPosition(startH));
});

const bedToleranceWidth = computed(() => {
    const widthHours = (bedTimeTolerance.value * 2) / 60;
    return (widthHours / chartDuration.value) * 100;
});

const wakeToleranceStart = computed(() => {
    const wake = timeToDecimal(wakeUpTime.value);
    const startH = wake - (wakeUpTolerance.value / 60);
    return Math.max(0, getPercentPosition(startH));
});

const wakeToleranceWidth = computed(() => {
    const widthHours = (wakeUpTolerance.value * 2) / 60;
    return (widthHours / chartDuration.value) * 100;
});

// --- DATA PROCESSING & STREAKS ---

const checkTolerance = (startIso: string, endIso: string) => {
    const startD = new Date(startIso);
    const endD = new Date(endIso);
    
    let actualBed = startD.getHours() + (startD.getMinutes() / 60);
    const targetBed = timeToDecimal(bedTime.value);
    let bedDiff = Math.abs(actualBed - targetBed);
    if (bedDiff > 12) bedDiff = 24 - bedDiff;

    let actualWake = endD.getHours() + (endD.getMinutes() / 60);
    const targetWake = timeToDecimal(wakeUpTime.value);
    let wakeDiff = Math.abs(actualWake - targetWake);
    if (wakeDiff > 12) wakeDiff = 24 - wakeDiff;

    return bedDiff <= (bedTimeTolerance.value/60) && wakeDiff <= (wakeUpTolerance.value/60);
};

const dailyStats = computed(() => {
    const stats: Record<string, any> = {};
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

const processedWeekDays = computed(() => {
    const refDate = new Date(props.currentDate);
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
            label, dateKey, isFuture, isToday,
            hasData: !!data,
            intervals: data?.intervals || [],
            minStart: data?.minStart,
            maxEnd: data?.maxEnd,
            isSuccess: data?.isSuccess || false
        };
    });
});

// --- STYLING & BARS ---

const getBarPosition = (isoStart: string) => {
    if (!isoStart) return 0;
    const d = new Date(isoStart);
    const h = d.getHours() + d.getMinutes() / 60;
    return Math.max(0, getPercentPosition(h));
};

const getBarWidth = (isoStart: string, isoEnd: string) => {
    if (!isoStart || !isoEnd) return 0;
    const startD = new Date(isoStart);
    const endD = new Date(isoEnd);
    const diffMs = endD.getTime() - startD.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return (diffHours / chartDuration.value) * 100;
};

const getIntervalColor = (interval: any) => {
    return (interval.duration_min > 45) ? 'bg-indigo-500 z-20' : 'bg-gray-400 z-30';
};

const getDayBubbleClass = (day: any) => {
    if (day.isFuture) return "bg-white border-dashed border-gray-200 text-gray-300";
    let cls = "border-transparent"; 
    if (day.isSuccess) cls = "bg-indigo-600 text-white";
    else if (day.hasData) cls = "bg-white border-indigo-200 text-indigo-400 border-solid";
    else cls = "bg-gray-100 text-gray-400";
    if (day.isToday) cls += " ring-2 ring-indigo-400 ring-offset-1 border-indigo-600";
    return cls;
};

const formatTimeShort = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}
</script>