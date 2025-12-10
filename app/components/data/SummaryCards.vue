<template>
    <primitives-container>
        <h3>Summary</h3>
        <div class="grid grid-cols-2 gap-4 pt-2">
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
    isDayView: String,
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

// Convert UTC time string to CET/CEST
const convertUTCtoCET = (utcTimeString: string) => {
    if (!utcTimeString) return '--:--';
    
    try {
        let date: Date;

        // Simple time string "10:06" (assumed to be in UTC)
        if (utcTimeString.length === 5 && utcTimeString.includes(':')) {
            const [hours, minutes] = utcTimeString.split(':').map(Number);
            const now = new Date();
            date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes));
        } 
        // Full ISO string
        else {
            date = new Date(utcTimeString);
        }

        if (isNaN(date.getTime())) return '--:--';

        // Convert to CET/CEST (Europe/Zurich is same as Europe/Paris for timezone)
        return new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Zurich',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);

    } catch (error) {
        console.error('Error converting time:', error);
        return '--:--';
    }
};

// Convert ISO timestamp to CET time
const isoToCET = (isoString: string) => {
    if (!isoString) return '--:--';
    
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '--:--';

        return new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Zurich',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch (error) {
        console.error('Error converting ISO to CET:', error);
        return '--:--';
    }
};

const timeInBed = computed(() => { 
    if (props.isDayView) { 
        const totalMinutes = props.summary.time_in_bed_min || 0;
        const hrs = Math.floor(totalMinutes / 60);
        const min = Math.round(totalMinutes % 60);
        return `${hrs}h ${min}m`;
    } else { 
        // For week/month, calculate average
        const nightsCount = props.summary.nights_count || 1;
        const avgHours = (props.summary.time_in_bed_hours || 0) / nightsCount;
        return formatTime(avgHours);
    }
});

const avgBedtime = computed(() => {
    if (props.isDayView) { 
        // For day view, show the actual bedtime from summary (converted to CET)
        // The backend returns bed_time as "HH:MM" which we need to interpret correctly
        if (!props.summary.bed_time) return '--:--';
        
        // If intervals exist, use the first interval's start time
        if (props.summary.intervals && props.summary.intervals.length > 0) {
            return isoToCET(props.summary.intervals[0].start);
        }
        
        // Otherwise use the bed_time from summary
        return convertUTCtoCET(props.summary.bed_time);
    } else { 
        // For week/month view, calculate average from all intervals
        if (!props.summary.intervals || props.summary.intervals.length === 0) return '--:--';
        
        // Group intervals into sleep sessions
        const sessions: any[] = [];
        let currentSession: any[] = [];
        
        const sortedIntervals = [...props.summary.intervals].sort((a, b) => 
            new Date(a.start).getTime() - new Date(b.start).getTime()
        );
        
        for (const interval of sortedIntervals) {
            if (currentSession.length === 0) {
                currentSession.push(interval);
            } else {
                const lastInterval = currentSession[currentSession.length - 1];
                const lastEnd = new Date(lastInterval.end);
                const currentStart = new Date(interval.start);
                const gapHours = (currentStart.getTime() - lastEnd.getTime()) / (1000 * 60 * 60);
                
                if (gapHours > 8) {
                    sessions.push(currentSession);
                    currentSession = [interval];
                } else {
                    currentSession.push(interval);
                }
            }
        }
        
        if (currentSession.length > 0) {
            sessions.push(currentSession);
        }
        
        // Get first interval start time from each session (bedtime)
        const bedtimes = sessions.map(session => {
            const d = new Date(session[0].start);
            const cetString = new Intl.DateTimeFormat('en-US', { 
                timeZone: 'Europe/Zurich',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            }).format(d);
            
            const [h, m] = cetString.split(':').map(Number);
            return h * 60 + m;
        });
        
        // Handle midnight crossing
        const adjustedBedtimes = bedtimes.map(m => m < 12 * 60 ? m + 24 * 60 : m);
        let avgMin = adjustedBedtimes.reduce((a, b) => a + b, 0) / adjustedBedtimes.length;
        if (avgMin >= 24 * 60) avgMin -= 24 * 60;

        return formatTimeFromMin(avgMin);
    }
});

const avgWakeup = computed(() => {
    if (props.isDayView) { 
        // For day view, show the actual wake up time (converted to CET)
        if (!props.summary.wake_up_time) return '--:--';
        
        // If intervals exist, use the last interval's end time
        if (props.summary.intervals && props.summary.intervals.length > 0) {
            const lastInterval = props.summary.intervals[props.summary.intervals.length - 1];
            return isoToCET(lastInterval.end);
        }
        
        // Otherwise use the wake_up_time from summary
        return convertUTCtoCET(props.summary.wake_up_time);
    } else { 
        // For week/month view, calculate average from all intervals
        if (!props.summary.intervals || props.summary.intervals.length === 0) return '--:--';
        
        // Group intervals into sleep sessions
        const sessions: any[] = [];
        let currentSession: any[] = [];
        
        const sortedIntervals = [...props.summary.intervals].sort((a, b) => 
            new Date(a.start).getTime() - new Date(b.start).getTime()
        );
        
        for (const interval of sortedIntervals) {
            if (currentSession.length === 0) {
                currentSession.push(interval);
            } else {
                const lastInterval = currentSession[currentSession.length - 1];
                const lastEnd = new Date(lastInterval.end);
                const currentStart = new Date(interval.start);
                const gapHours = (currentStart.getTime() - lastEnd.getTime()) / (1000 * 60 * 60);
                
                if (gapHours > 8) {
                    sessions.push(currentSession);
                    currentSession = [interval];
                } else {
                    currentSession.push(interval);
                }
            }
        }
        
        if (currentSession.length > 0) {
            sessions.push(currentSession);
        }
        
        // Get last interval end time from each session (wake up time)
        const wakeups = sessions.map(session => {
            const d = new Date(session[session.length - 1].end);
            const cetString = new Intl.DateTimeFormat('en-US', { 
                timeZone: 'Europe/Zurich',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
            }).format(d);
            
            const [h, m] = cetString.split(':').map(Number);
            return h * 60 + m;
        });
        
        const avgMin = wakeups.reduce((a, b) => a + b, 0) / wakeups.length;
        return formatTimeFromMin(avgMin);
    }
});

const sleepQuality = computed(() => {
    const val = props.summary.avg_awakenings;
    if (val == 0) return '--';
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