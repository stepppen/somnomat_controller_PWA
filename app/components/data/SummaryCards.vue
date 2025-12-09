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
                        <Icon name="material-symbols:timelapse-outline-rounded" class="iconColorBlue" size="1.5em"/>
                    </div>
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
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-[#EDF0FF] rounded-xl p-2 flex align-items-center justify-center">
                        <Icon name="material-symbols:editor-choice-outline-rounded" class="iconColorBlue" size="1.5em"/>
                    </div>
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
                    <h3>
                        {{ avgBedtime }}
                    </h3>
                </div>
            </div>

            <div class="bg-gray-50 rounded-xl p-2 flex flex-col gap-2">
                <div class="px-2 text-left">
                    <p v-if="isDayView" class="p-small text-gray-500 text-left">
                        Left bed
                    </p>
                    <p v-else class="p-small text-gray-500 text-left">
                        Avg leave bed
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="bg-[#EDF0FF] rounded-xl p-2 flex align-items-center justify-center">
                        <Icon name="material-symbols:wb-sunny-outline-rounded" class="iconColorBlue" size="1.5em"/>
                    </div>
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
    isDayView: String, // Note: Boolean is usually better here if possible, but kept as String to match your code
    summary: {
        type: Object,
        required: true
    }
});

const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
};

const formatTimeFromMin = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

//  - not strictly needed here, but conceptually we are shifting the UTC point to CET.

// Helper function to convert UTC time string to CET
const convertUTCtoCET = (utcTimeString: string) => {
    if (!utcTimeString) return '--:--';
    
    try {
        let date: Date;

        // Case 1: Simple Time String "10:06"
        // We must interpret this as "Today at 10:06 UTC" to get the correct CET offset
        if (utcTimeString.length === 5 && utcTimeString.includes(':')) {
            const [hours, minutes] = utcTimeString.split(':').map(Number);
            const now = new Date();
            // Create a date object using UTC methods
            date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes));
        } 
        // Case 2: Full ISO String "2023-10-10T10:06:00Z"
        else {
            date = new Date(utcTimeString);
        }

        // Validate date
        if (isNaN(date.getTime())) return '--:--';

        // Convert to CET using Intl.DateTimeFormat
        // We use 'en-GB' to force "24-hour" format (e.g., 23:00 instead of 11:00 PM)
        return new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Paris',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);

    } catch (error) {
        console.error('Error converting time:', error);
        return '--:--';
    }
};

const timeInBed = computed(() => { 
    if (props.isDayView){ 
        const hrs = parseInt(props.summary.time_in_bed_hours);
        const min = Math.round((Number(props.summary.time_in_bed_hours) - hrs) * 60);
        return `${hrs}h ${min}m`;
    } else { 
        return formatTime(props.summary.avg_sleep_per_night_hours);
    }
});

const avgBedtime = computed(() => {
    if (props.isDayView){ 
        // Handles "10:06" UTC -> "11:06" CET (or 12:06 CEST)
        return convertUTCtoCET(props.summary.bed_time);
    } else { 
        if (!props.summary.intervals || props.summary.intervals.length === 0) return '--:--';
        
        const bedtimes = props.summary.intervals.map((interval: any) => {
            const d = new Date(interval.start);
            // Get local CET time components
            const cetString = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
            return cetString.getHours() * 60 + cetString.getMinutes();
        });
        
        // Handle midnight crossing for averages (e.g. 23:00 and 01:00 should avg to 00:00, not 12:00)
        // This is a simple fix assuming bedtimes are usually at night.
        // If the time is early morning (e.g., 0-12), add 24 hours (1440 mins) for the calculation
        const adjustedBedtimes = bedtimes.map(m => m < 12 * 60 ? m + 24 * 60 : m);
        
        let avgMin = adjustedBedtimes.reduce((a, b) => a + b, 0) / adjustedBedtimes.length;
        if (avgMin >= 24 * 60) avgMin -= 24 * 60; // Wrap back if needed

        return formatTimeFromMin(avgMin);
    }
});

const avgWakeup = computed(() => {
    if (props.isDayView){ 
        // Handles "06:00" UTC -> "07:00" CET
        return convertUTCtoCET(props.summary.wake_up_time);
    } else { 
        if (!props.summary.intervals || props.summary.intervals.length === 0) return '--:--';
        
        const wakeups = props.summary.intervals.map((interval: any) => {
            const d = new Date(interval.end);
            const cetString = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
            return cetString.getHours() * 60 + cetString.getMinutes();
        });
        
        const avgMin = wakeups.reduce((a, b) => a + b, 0) / wakeups.length;
        return formatTimeFromMin(avgMin);
    }
});

const sleepQuality = computed(() => {
    const val = props.summary.avg_awakenings;
    if (val <= 1) return 'Excellent';
    if (val <= 1.5) return 'Good';
    if (val <= 2.5) return 'Fair';
    return 'Poor';
});
</script>

<style>
.iconColorBlue { 
    color: var(--gradient-start);
}
</style>