<template>
    <primitives-container>
        <div class="flex flex-col gap-6">
            <div class="flex justify-between items-end">
                <div>
                    <h3 class="font-semibold text-gray-900">Consistency</h3>
                </div>
                <div class="text-right">
                    <span class="text-sm font-bold text-indigo-600">Streak: {{ successCount }} Days</span>
                </div>
            </div>

            <div class="grid grid-cols-7 gap-2">
                <div v-for="day in weekLabels" :key="day" class="text-center text-[10px] font-bold text-gray-400 uppercase pb-1">
                    {{ day }}
                </div>
                
                <div 
                    v-for="day in calendarDays" 
                    :key="day.dateKey"
                    @click="selectDay(day)"
                    class="aspect-square relative rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200"
                    :class="getDayClass(day)"
                >
                    <span class="text-xs font-bold" :class="day.isSuccess ? 'text-white' : 'text-gray-700'">
                        {{ day.dayNum }}
                    </span>
                    
                    <div v-if="selectedDayKey === day.dateKey" 
                         class="absolute inset-0 border-2 border-indigo-900 rounded-xl z-20 scale-110"></div>
                </div>
            </div>

            <transition name="pop" mode="out-in">
                <div v-if="focusedDay" :key="focusedDay.dateKey" class="mt-2 flex flex-col gap-2">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class=" text-gray-900">{{ formatFullDate(focusedDay.dateKey) }}</h3>
                        <div v-if="focusedDay.isSuccess" class="flex items-center gap-1">
                            <div class="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                            <span class="text-[10px] font-bold text-indigo-600 uppercase">Consistency Goal Hit</span>
                        </div>
                    </div>

                    <div class="relative w-full select-none">
                        <div class="flex justify-between mb-2 px-1">
                            <span v-for="label in axisLabels" :key="label" class="text-[10px] text-gray-400 w-4 text-center">{{ label }}</span>
                        </div>

                        <div class="relative h-20 rounded-xl border border-gray-100 bg-gray-50 overflow-visible">
                            <div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                                <div class="absolute inset-0 flex opacity-30">
                                    <div v-for="i in 4" :key="i" class="flex-1 border-r border-gray-100 last:border-0" />
                                </div>
                            </div>

                            <div @click.stop="toggleZone('bed')" class="absolute h-full bg-indigo-50/60 border-l border-r border-indigo-200 transition-all cursor-pointer"
                                :class="selectedZone === 'bed' ? 'ring-2 ring-indigo-400 z-30' : 'z-10'"
                                :style="{ left: `${getPercentPosition(bedToleranceStartHours)}%`, width: `${getPercentWidth(localBedTolerance / 30)}%` }">
                                <transition name="pop">
                                    <div v-if="selectedZone === 'bed'" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-xl z-[100] whitespace-nowrap">
                                        <div class="p-small font-bold text-gray-400">Bedtime Target</div>
                                        <div class="text-[11px]">{{ localBedTime }} (±{{ localBedTolerance }}m)</div>
                                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                                    </div>
                                </transition>
                            </div>

                            <div @click.stop="toggleZone('wake')" class="absolute h-full bg-indigo-50/60 border-l border-r border-indigo-200 transition-all cursor-pointer"
                                :class="selectedZone === 'wake' ? 'ring-2 ring-indigo-400 z-30' : 'z-10'"
                                :style="{ left: `${getPercentPosition(wakeToleranceStartHours)}%`, width: `${getPercentWidth(localWakeTolerance / 30)}%` }">
                                <transition name="pop">
                                    <div v-if="selectedZone === 'wake'" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-xl z-[100] whitespace-nowrap">
                                        <div class="p-small font-bold text-gray-400">Wake Target</div>
                                        <div class="text-[11px]">{{ localWakeTime }} (±{{ localWakeTolerance }}m)</div>
                                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                                    </div>
                                </transition>
                            </div>

                            <div class="relative h-full w-full pointer-events-none">

                                <div v-for="(interval, i) in focusedDay.intervals" :key="interval.start"
                                    @click.stop="handleSelect(interval)"
                                    class="absolute top-5 h-8 transition-all duration-200 flex items-center justify-center rounded-md cursor-pointer pointer-events-auto active:opacity-70"
                                    :class="[getIntervalColor(interval), selectedInterval === interval ? 'ring-2 ring-indigo-900 ring-offset-2 z-50' : 'z-20']"
                                    :style="{ left: `${getPercentPosition(isoToRelativeHours(interval.start))}%`, width: `${getPercentWidth(getDurationHours(interval.start, interval.end))}%` }">
                                    <transition name="pop">
                                        <div v-if="selectedInterval === interval" class="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#00033D] text-white p-2 rounded-lg shadow-2xl whitespace-nowrap z-[100]">
                                            <div class="flex flex-col items-center gap-0.5">
                                                <span class="p-small text-gray-400 font-bold">Sleep Session</span>
                                                <span class="text-[11px] font-medium">{{ formatTimeShort(getGroupTimes(interval).start) }} — {{ formatTimeShort(getGroupTimes(interval).end) }}</span>
                                            </div>
                                            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00033D] rotate-45"></div>
                                        </div>
                                    </transition>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

                <div class="flex gap-6 justify-center flex-wrap">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-sm border bg-[#0600AB]" />
                        <span class="text-[10px] text-gray-500 font-semibold">Sleep</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-sm bg-indigo-100 border border-indigo-300" />
                        <span class="text-[10px] text-gray-500 font-semibold">Tolerance</span>
                    </div>
                </div>
        </div>
    </primitives-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
    intervals: { type: Array, default: () => [] }
});

const { globalDate, globalDeviceSettings, loadDeviceSettings } = useDevice();
const { bedTime, wakeUpTime, bedTimeTolerance, wakeUpTolerance } = useUserSettings();
const { intervalGrouping } = useCalculations();

//local states
const localBedTime = ref(bedTime.value || "22:30");
const localWakeTime = ref(wakeUpTime.value || "07:30");
const localBedTolerance = ref(bedTimeTolerance.value || 30);
const localWakeTolerance = ref(wakeUpTolerance.value || 30);

const selectedDayKey = ref(null);
const selectedInterval = ref(null);
const selectedZone = ref(null);
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

onMounted(async () => {
    await loadDeviceSettings();
    if (globalDeviceSettings.value) {
        localBedTime.value = globalDeviceSettings.value.bed_time ?? "22:30";
        localWakeTime.value = globalDeviceSettings.value.wake_up_time ?? "07:30";
        localBedTolerance.value = globalDeviceSettings.value.bed_time_tolerance ?? 30;
        localWakeTolerance.value = globalDeviceSettings.value.wake_up_tolerance ?? 30;
    }
});

//parsing the date
const getLocalYMD = (isoStr) => new Date(isoStr).toISOString().split('T')[0];

//calender
const calendarDays = computed(() => {
    const d = globalDate.value ? new Date(globalDate.value) : new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startOffset = firstDay.getDay() - 1; 
    if (startOffset === -1) startOffset = 6;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push({ isPadding: true, dateKey: `pad-${i}` });

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        const dateKey = getLocalYMD(date);
        const dayIntervals = props.intervals.filter(inv => getLocalYMD(inv.end) === dateKey);
        
        const hasSuccess = dayIntervals.some(inv => {
            const relStart = isoToRelativeHours(inv.start);
            const relEnd = isoToRelativeHours(inv.end);
            const bedTarget = getRelativeFromStr(localBedTime.value);
            const wakeTarget = getRelativeFromStr(localWakeTime.value);
            
            const startOk = Math.abs(relStart - bedTarget) <= (localBedTolerance.value / 60);
            const endOk = Math.abs(relEnd - wakeTarget) <= (localWakeTolerance.value / 60);
            return startOk && endOk && inv.duration_min > 45;
        });

        days.push({
            dayNum: i,
            dateKey,
            intervals: dayIntervals,
            hasData: dayIntervals.length > 0,
            isSuccess: hasSuccess,
            totalBedTimeStart: dayIntervals.length > 0 ? [dayIntervals[0].start] : [], 
            totalBedTimeEnd: dayIntervals.length > 0 ? [dayIntervals[dayIntervals.length-1].end] : []
        });
    }
    return days;
});

const focusedDay = computed(() => calendarDays.value.find(d => d.dateKey === selectedDayKey.value));
const successCount = computed(() => calendarDays.value.filter(d => d.isSuccess).length);

const isoToRelativeHours = (isoStr) => {
    const d = new Date(isoStr);
    const hrs = d.getHours() + (d.getMinutes() / 60);
    return hrs >= 12 ? hrs - 12 : hrs + 12;
};

const getRelativeFromStr = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const dec = h + (m/60);
    return dec >= 12 ? dec - 12 : dec + 12;
};

const windowRange = computed(() => {
    if (!focusedDay.value || focusedDay.value.intervals.length === 0) return { start: 9, end: 21, duration: 12 };
    const points = focusedDay.value.intervals.flatMap(i => [isoToRelativeHours(i.start), isoToRelativeHours(i.end)]);
    const min = Math.min(...points, bedToleranceStartHours.value) - 1;
    const max = Math.max(...points, wakeToleranceStartHours.value + 1) + 1;
    return { start: min, end: max, duration: max - min };
});

const getPercentPosition = (relHour) => ((relHour - windowRange.value.start) / windowRange.value.duration) * 100;
const getPercentWidth = (durationHrs) => (durationHrs / windowRange.value.duration) * 100;
const getDurationHours = (start, end) => (new Date(end) - new Date(start)) / (1000 * 60 * 60);

const bedToleranceStartHours = computed(() => getRelativeFromStr(localBedTime.value) - (localBedTolerance.value / 60));
const wakeToleranceStartHours = computed(() => getRelativeFromStr(localWakeTime.value) - (localWakeTolerance.value / 60));

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

//interactions
const selectDay = (day) => {
    if (day.isPadding) return;
    selectedDayKey.value = day.dateKey;
    selectedInterval.value = null;
    selectedZone.value = null;
};

const toggleZone = (zone) => {
    selectedInterval.value = null;
    selectedZone.value = selectedZone.value === zone ? null : zone;
};

const handleSelect = (interval) => {
    selectedZone.value = null;
    selectedInterval.value = selectedInterval.value === interval ? null : interval;
};

const getGroupTimes = (interval) => {
    const group = intervalGrouping.value?.find(g => g.some(item => item.start === interval.start));
    return group ? { start: group[0].start, end: group[group.length - 1].end } : { start: interval.start, end: interval.end };
};

const getIntervalColor = (interval) => {
    const isSleep = intervalGrouping.value?.some(group => group.some(item => item.start === interval.start));
    return isSleep ? 'bg-[#0600AB]' : 'bg-gray-200';
};

const getDayClass = (day) => {
    if (day.isPadding) return "opacity-0 pointer-events-none";
    if (day.isSuccess) return "bg-indigo-600 shadow-md";
    if (day.hasData) return "bg-indigo-50 border border-indigo-100";
    return "bg-gray-50 border border-transparent";
};

const formatFullDate = (key) => new Date(key).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' });
const formatTimeShort = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

watch(() => globalDate.value, () => {
    selectedDayKey.value = null;
});
</script>

<style scoped>
.pop-enter-active { animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-leave-active { animation: pop-in 0.15s reverse ease-in; }
@keyframes pop-in {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>