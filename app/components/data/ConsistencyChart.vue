<template>
    <primitives-container>
        <div class="bg-white rounded-2xl p-6 border border-gray-200">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-900">Consistency</h2>
                <span class="text-sm text-gray-500">
                    Current streak: {{ currentStreak }} days | record: {{ recordStreak }}
                </span>
            </div>
    
            <div class="relative">
                <!-- Hour labels -->
                <div class="flex justify-between mb-2 pl-12">
                    <span v-for="hour in hours" :key="hour" class="text-xs text-gray-400 w-12 text-center">
                        {{ hour }}
                    </span>
                </div>
    
                <!-- Chart grid -->
                <div class="space-y-3">
                    <div v-for="(day, idx) in days" :key="idx" class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span class="text-sm font-semibold text-indigo-600">{{ day }}</span>
                        </div>
                        
                        <div class="flex-1 relative h-10 bg-gray-50 rounded-lg">
                            <!-- Grid lines -->
                            <div class="absolute inset-0 flex">
                                <div v-for="i in 6" :key="i" class="flex-1 border-r border-gray-200 last:border-0" />
                            </div>
                            
                            <!-- Sleep bars -->
                            <div
                                v-for="(interval, i) in getIntervalsForDay(day)"
                                :key="i"
                                class="absolute h-full bg-indigo-600 rounded hover:bg-indigo-700 transition cursor-pointer"
                                :style="{
                                    left: `${getBarPosition(interval.start)}%`,
                                    width: `${getBarWidth(interval.start, interval.end)}%`
                                }"
                                :title="`${formatTime(interval.start)} - ${formatTime(interval.end)} (${Math.round(interval.duration_min)}min)`"
                            />
                        </div>
                    </div>
                </div>
    
                <!-- Legend -->
                <div class="flex gap-6 mt-6 justify-center">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-indigo-600 rounded" />
                        <span class="text-sm text-gray-600">Sleeping</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-gray-300 rounded" />
                        <span class="text-sm text-gray-600">Awake</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 bg-indigo-200 rounded" />
                        <span class="text-sm text-gray-600">Tolerance</span>
                    </div>
                </div>
            </div>
        </div>
    </primitives-container>
</template>

<script setup>
const props = defineProps({
    intervals: {
        type: Array,
        default: () => []
    }
});

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const hours = ['22', '00', '02', '04', '06', '08', '10'];
const currentStreak = ref(11);
const recordStreak = ref(434);

const getIntervalsForDay = (dayLetter) => {
    if (!props.intervals || props.intervals.length === 0) return [];
    
    return props.intervals.filter(interval => {
        const date = new Date(interval.start);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return dayName[0] === dayLetter;
    });
};

const getBarPosition = (time) => {
    const date = new Date(time);
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
    
    let position;
    if (hour >= 22) {
        position = ((hour - 22) / 12) * 100;
    } else {
        position = ((hour + 2) / 12) * 100;
    }
    return Math.max(0, Math.min(100, position));
};

const getBarWidth = (start, end) => {
    const startPos = getBarPosition(start);
    const endPos = getBarPosition(end);
    return Math.max(2, endPos - startPos);
};

const formatTime = (isoTimestamp) => {
    const d = new Date(isoTimestamp);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
</style>