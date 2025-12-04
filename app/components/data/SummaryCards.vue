

<!-- SummaryCards.vue -->
<template>
    <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Summary</h2>
        <div class="grid grid-cols-2 gap-4">
            <div v-for="(card, idx) in cards" :key="idx" class="bg-gray-50 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-500">{{ card.title }}</span>
                    <Icon v-if="card.info" name="material-symbols:info-outline" size="1em" class="text-gray-400" />
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-2xl">{{ card.icon }}</span>
                    <span :class="['text-2xl font-bold', card.color]">
                        {{ card.value }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    summary: {
        type: Object,
        required: true
    }
});

const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
};

const formatTimeFromMin = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const avgBedtime = computed(() => {
    if (!props.summary.intervals || props.summary.intervals.length === 0) return '22:43';
    
    const bedtimes = props.summary.intervals.map(interval => {
        const d = new Date(interval.start);
        return d.getUTCHours() * 60 + d.getUTCMinutes();
    });
    
    const avgMin = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
    return formatTimeFromMin(avgMin);
});

const avgWakeup = computed(() => {
    if (!props.summary.intervals || props.summary.intervals.length === 0) return '07:14';
    
    const wakeups = props.summary.intervals.map(interval => {
        const d = new Date(interval.end);
        return d.getUTCHours() * 60 + d.getUTCMinutes();
    });
    
    const avgMin = wakeups.reduce((a, b) => a + b, 0) / wakeups.length;
    return formatTimeFromMin(avgMin);
});

const sleepQuality = computed(() => {
    const avg = props.summary.avg_awakenings_per_night;
    if (avg <= 1) return 'Excellent';
    if (avg <= 1.5) return 'Good';
    if (avg <= 2.5) return 'Fair';
    return 'Poor';
});

const cards = computed(() => [
    {
        title: 'avg time in bed',
        value: formatTime(props.summary.avg_sleep_per_night_hours),
        icon: '',
        color: 'text-indigo-600'
    },
    {
        title: 'Sleep quality',
        value: sleepQuality.value,
        icon: '',
        color: 'text-purple-600',
        info: true
    },
    {
        title: 'avg go to bed',
        value: avgBedtime.value,
        icon: '',
        color: 'text-indigo-600'
    },
    {
        title: 'avg wake up',
        value: avgWakeup.value,
        icon: '',
        color: 'text-blue-600'
    }
]);
</script>
