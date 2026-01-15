export const useCalculations = () => {
    const { globalSleepSummary } = useDevice()
    const intervalGrouping = computed(() => { 
        let rawIntervals = [];
        // if (!globalSleepSummary.value || 
        //     !globalSleepSummary.value.intervals || 
        //     !globalSleepSummary.value.intervals.length) {
        //     return [];
        // }
        rawIntervals = globalSleepSummary.value?.summary?.intervals || [];
        const groups = [];
        if (!rawIntervals.length) return [];


        let currentGroup = [rawIntervals[0]];
        for (let i = 1; i < rawIntervals.length; i++) {
            const previousInterval = rawIntervals[i - 1];
            const currentInterval = rawIntervals[i];
            const gap = new Date(currentInterval.start) - new Date(previousInterval.end);
            const fiveMinutesInMs = 5 * 60 * 1000; // 300000
            
            if (gap < fiveMinutesInMs) {
                currentGroup.push(currentInterval);
            } else {
                groups.push(currentGroup);
                currentGroup = [currentInterval];
            }
        }
        
        groups.push(currentGroup);
        
        // Filter out groups where total duration is less than 5 minutes
        const validGroups = groups.filter(group => {
            const totalDuration = group.reduce((sum, interval) => sum + interval.duration_min, 0);
            console.log("totalDuration:", totalDuration)
            return totalDuration >= 20;
        });
        console.log("SLEEPSUMMARY: ", globalSleepSummary.value.summary)
        return validGroups;
    });

    const longestInterval = computed(() => {

    })

    return {
        //Intervals
        intervalGrouping,
        longestInterval
    }

}