<template>
    <primitives-container>
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center mb-6">
                <h3>Monthly View</h3>
                <span class="p-small text-gray-500">
                    {{ monthLabel }}
                </span>
            </div>
    
            <div class="w-full">
                <div class="grid grid-cols-8 gap-2 text-center text-xs font-semibold text-gray-400 mb-2">
                    <div class="text-left pl-1">Wk</div> <div v-for="day in ['M','T','W','T','F','S','S']" :key="day">{{ day }}</div>
                </div>

                <div class="space-y-2">
                    <div v-for="(week, index) in monthlyWeeks" :key="index" class="grid grid-cols-8 gap-2 items-center">
                        
                        <div class="text-xs text-gray-400 font-medium text-left pl-1">
                            {{ week.weekNum }}
                        </div>

                        <div v-for="(day, dIndex) in week.days" :key="dIndex" 
                             class="aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all relative group"
                             :class="getDayClasses(day)">
                             
                            <span v-if="day.date">{{ new Date(day.date).getDate() }}</span>
                            
                            <div v-if="day.hasData" class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                                {{ day.isConsistent ? 'Consistent' : 'Inconsistent' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </primitives-container>
</template>

<script setup lang="ts">
import { computed, ref, PropType } from 'vue';

const props = defineProps({
    intervals: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    startDate: {
        type: String,
        required: true
    }
});

// Mock settings
const useUserSettings = () => ({
    bedTime: ref('23:00'),
    wakeUpTime: ref('07:00'),
    bedTimeTolerance: ref(30),
    wakeUpTolerance: ref(30),
});
const { bedTime, wakeUpTime, bedTimeTolerance, wakeUpTolerance } = useUserSettings();

const monthLabel = computed(() => {
    return new Date(props.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
});

// Reuse helpers
const timeToDecimal = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m / 60);
}

const isConsistent = (startH: number, endH: number) => {
    const targetBed = timeToDecimal(bedTime.value);
    const targetWake = timeToDecimal(wakeUpTime.value);
    const bedTol = bedTimeTolerance.value / 60;
    const wakeTol = wakeUpTolerance.value / 60;

    const bedDiff = Math.min(Math.abs(startH - targetBed), Math.abs(startH - targetBed + 24), Math.abs(startH - targetBed - 24));
    const wakeDiff = Math.min(Math.abs(endH - targetWake), Math.abs(endH - targetWake + 24), Math.abs(endH - targetWake - 24));
    
    return bedDiff <= bedTol && wakeDiff <= wakeTol;
}

const monthlyWeeks = computed(() => {
    const start = new Date(props.startDate); // e.g. 2025-12-01
    const year = start.getFullYear();
    const month = start.getMonth();
    const now = new Date();
    
    // 1. Process Data Map
    const dataMap: Record<string, any> = {};
    if (props.intervals) {
        props.intervals.forEach(interval => {
            const d = new Date(interval.end);
            const cet = new Date(d.getTime() + 3600000);
            const key = cet.toISOString().split('T')[0];
            
            if (!dataMap[key]) {
                const startD = new Date(interval.start);
                const startH = (startD.getUTCHours() + 1 + startD.getUTCMinutes()/60) % 24;
                const endH = (cet.getUTCHours() + 1 + cet.getUTCMinutes()/60) % 24;
                
                dataMap[key] = {
                    hasData: true,
                    isConsistent: isConsistent(startH, endH)
                };
            }
        });
    }

    // 2. Build Calendar Grid
    const weeks = [];
    let currentWeekDays = [];
    
    // Get first day of month
    const iterDate = new Date(year, month, 1);
    
    // Pad start of month (0 = Sun, 1 = Mon...)
    // We want Mon=0, Sun=6
    let firstDayIndex = iterDate.getDay() === 0 ? 6 : iterDate.getDay() - 1;
    
    for(let i=0; i<firstDayIndex; i++) {
        currentWeekDays.push({ date: null, isFuture: false }); // Padding
    }

    // Fill days
    while (iterDate.getMonth() === month) {
        const dateStr = iterDate.toISOString().split('T')[0];
        const isFuture = dateStr > now.toISOString().split('T')[0];
        const isCurrent = dateStr === now.toISOString().split('T')[0];
        const data = dataMap[dateStr] || { hasData: false, isConsistent: false };

        currentWeekDays.push({
            date: dateStr,
            isFuture,
            isCurrent,
            ...data
        });

        if (currentWeekDays.length === 7) {
            weeks.push({ weekNum: getWeekNumber(iterDate), days: currentWeekDays });
            currentWeekDays = [];
        }
        iterDate.setDate(iterDate.getDate() + 1);
    }

    // Pad end
    if (currentWeekDays.length > 0) {
        while (currentWeekDays.length < 7) {
            currentWeekDays.push({ date: null });
        }
        weeks.push({ weekNum: getWeekNumber(new Date(year, month, 28)), days: currentWeekDays });
    }

    return weeks;
});

// Helper to get ISO week number
function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
}

const getDayClasses = (day: any) => {
    const classes = [];
    if (!day.date) return 'invisible'; // Spacer

    if (day.isFuture) {
        classes.push('bg-gray-100 text-gray-300');
    } else if (day.isConsistent) {
        classes.push('bg-green-500 text-white shadow-sm');
    } else if (day.hasData) {
        classes.push('bg-red-500 text-white shadow-sm');
    } else {
        classes.push('bg-gray-50 text-gray-300'); // Empty past
    }

    if (day.isCurrent) classes.push('ring-2 ring-indigo-500 ring-offset-1');

    return classes;
}
</script>