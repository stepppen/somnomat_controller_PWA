<template>
    <primitives-container>
        <h3>Summary</h3>
        <div class="grid grid-cols-2 gap-4 pt-2" >
            <div class="bg-gray-50 rounded-xl p-2 flex flex-col gap-2">
                <div class="px-2 text-left">
                    <p v-if="isDayView" class="p-small text-gray-500 text-left">
                        Time in bed 
                    </p>
                    <p v-else class="p-small text-gray-500 text-left">
                        Avg time in bed
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-[#EDF0FF] rounded-xl p-2 flex align-items-center justify-center">
                        <!-- <span class="text-2xl">{{ card.icon }}</span> -->
                        <Icon name="material-symbols:timelapse-outline-rounded" class="iconColorBlue" size="1.5em"/>
                    </div>
                    <!-- <span class="text-2xl">{{ card.icon }}</span> -->
                    <h3>
                        {{timeInBed}}
                    </h3>
                </div>
            </div>
            <div class="bg-gray-50 rounded-xl p-2 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <div class="px-2 text-left">
                        <p class="p-small text-gray-500 text-left">
                            Sleep Continuity
                        </p>
                    </div>
                    <!-- <Icon name="material-symbols:info-outline" size="1em" class="text-gray-400" /> -->
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-[#EDF0FF] rounded-xl p-2 flex align-items-center justify-center">

                        <Icon name="material-symbols:editor-choice-outline-rounded" class="iconColorBlue" size="1.5em"/>
                    </div>
                    <!-- <span class="text-2xl">{{ card.icon }}</span> -->
                    <h3>
                        {{sleepQuality}}
                    </h3>
                </div>
            </div>
            <div class="bg-gray-50 rounded-xl p-2 flex flex-col gap-2">
                <div class="px-2 text-left">
                    <p v-if="isDayView" class="p-small text-gray-500 text-left">
                        Went to bed
                    </p>
                    <p v-else class="p-small text-gray-500 text-left">
                        Avg go to bed
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-[#EDF0FF] rounded-xl p-2 flex align-items-center justify-center">
                        <Icon name="material-symbols:bedtime-outline-rounded" class="iconColorBlue" size="1.5em"/>
                    </div>
                    <!-- <span class="text-2xl">{{ card.icon }}</span> -->
                    <h3>
                        {{ avgBedtime }}
                    </h3>
                </div>
            </div>
            <div class="bg-gray-50 rounded-xl p-2 flex flex-col gap-2">
                <div class="px-2 text-left">
                    <p v-if="isDayView" class="p-small text-gray-500 text-left">
                        Woke up
                    </p>
                    <p v-else class="p-small text-gray-500 text-left">
                        Avg wake up
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-[#EDF0FF] rounded-xl p-2 flex align-items-center justify-center">
                        <Icon name="material-symbols:wb-sunny-outline-rounded" class="iconColorBlue" size="1.5em"/>
                    </div>
                    <!-- <span class="text-2xl">{{ card.icon }}</span> -->
                    <h3>
                        {{ avgWakeup }}
                    </h3>
                </div>
            </div>
        </div>
    </primitives-container>
</template>

<script setup lang="ts">
const props = defineProps({
    isDayView: String,
    summary: {
        type: Object,
        required: true
    }
});

let dayFlag = ref(false)

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

const timeInBed = computed (() => { 
    if (props.isDayView){ 
        var hrs = parseInt(props.summary.time_in_bed_hours);
        var min = Math.round((Number(props.summary.time_in_bed_hours)-hrs) * 60);
        var timeInBed = hrs+'h '+min+'m';
        return timeInBed
    } else { 
        const avgTimeInBed = formatTime(props.summary.avg_sleep_per_night_hours)
        return avgBedtime
    }
})

const avgBedtime = computed(() => {
    if (props.isDayView){ 
        return props.summary.bed_time
    } else { 
        if (!props.summary.intervals || props.summary.intervals.length === 0) return '22:43';
        
        const bedtimes = props.summary.intervals.map(interval => {
            const d = new Date(interval.start);
            return d.getUTCHours() * 60 + d.getUTCMinutes();
        });
        
        const avgMin = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
        return formatTimeFromMin(avgMin);
    }
});

const avgWakeup = computed(() => {
    if (props.isDayView){ 
        return props.summary.wake_up_time
    } else{ 
        if (!props.summary.intervals || props.summary.intervals.length === 0) return '07:14';
        
        const wakeups = props.summary.intervals.map(interval => {
            const d = new Date(interval.end);
            return d.getUTCHours() * 60 + d.getUTCMinutes();
        });
        
        const avgMin = wakeups.reduce((a, b) => a + b, 0) / wakeups.length;
        return formatTimeFromMin(avgMin);
    }
});

//arbitrary value - ask Manu/Alex
const sleepQuality = computed(() => {
    const val = props.summary.avg_awakenings;
    console.log("Awakenings this night: ", val)
    if (val <= 1) return 'Excellent';
    if (val <= 1.5) return 'Good';
    if (val <= 2.5) return 'Fair';
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

<style>
.iconColorBlue { 
    color: var(--gradient-start);
}
</style>
