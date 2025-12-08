<template>
    <primitives-container>
            <div class="flex items-center justify-between mb-6">
                <h3>Recommendations</h3>
                <Icon name="material-symbols:arrow-forward-ios-rounded" size="1.2em" class="text-gray-400" @click="navigateTo('/recommendations')"/>
            </div>
            <div class="flex flex-col gap-4 pt-2">
                <div
                    v-for="(rec, idx) in recommendations"
                    :key="idx"
                    :class="['flex gap-4 p-4 rounded-xl border', rec.bgColor, rec.borderColor]"
                >
                    <div class="flex-shrink-0">
                        <Icon :name="rec.icon" size="1.2em" :class="rec.iconColor" />
                    </div>
                    <p class="text-sm text-gray-700">{{ rec.text }}</p>
                </div>
            </div>
    </primitives-container>
</template>

<script setup>
const props = defineProps({
    summary: {
        type: Object,
        required: true
    }
});

const recommendations = computed(() => {
    const recs = [];
    
    // Sleep duration check
    if (props.summary.avg_sleep_per_night_hours >= 7.5) {
        recs.push({
            icon: 'material-symbols:check-circle-outline',
            text: `Great sleep duration! You're averaging ${props.summary.avg_sleep_per_night_hours.toFixed(1)} hours per night. Keep it up!`,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600'
        });
    } else if (props.summary.avg_sleep_per_night_hours >= 6.5) {
        recs.push({
            icon: 'material-symbols:lightbulb-outline',
            text: 'Sleep duration below ideal. Try going to bed 30 minutes earlier to reach 7-9 hours of sleep.',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600'
        });
    } else {
        recs.push({
            icon: 'material-symbols:warning-outline',
            text: 'Insufficient sleep detected. You need more sleep. Aim for at least 7 hours per night for optimal health.',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600'
        });
    }
    
    // Awakenings check
    if (props.summary.avg_awakenings <= 1 && props.summary.avg_sleep_per_night_hours >= 0.5) {
        recs.push({
            icon: 'material-symbols:check-circle-outline',
            text: 'Excellent sleep continuity! You have minimal awakenings. Your sleep is continuous and restorative.',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600'
        });
    } else if (props.summary.avg_awakenings <= 2 && props.summary.avg_sleep_per_night_hours >= 0.5) {
        recs.push({
            icon: 'material-symbols:lightbulb-outline',
            text: 'Some nighttime awakenings detected. Consider limiting fluids before bed and keeping the room cool and dark.',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600'
        });
    } else if (props.summary.avg_awakenings > 2){ 
            recs.push({
            icon: 'material-symbols:warning-outline',
            text: 'A lot of awakenings detected...',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600'
        });
    }
    
    // Show max 2 recommendations
    return recs.slice(0, 2);
});
</script>
