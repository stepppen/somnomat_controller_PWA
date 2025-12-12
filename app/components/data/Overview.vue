<template>
    <primitives-container>
        <h3>Overview</h3>
        
        <div class="w-full flex items-center gap-8">
          <div class="relative w-48 h-48 flex items-center justify-center">
            <!-- <div v-if="isLoading" class="h-32 w-32 rounded-full bg-gray-100"></div> -->
             <svg  v-if="isLoading" ref="chartSvgLoading" :width="160" :height="160" class="absolute"></svg>
            <svg  v-else ref="chartSvg" :width="160" :height="160" class="absolute"></svg>
            
            <div class="relative z-10 flex flex-col items-center justify-center">
                <p class="p-small text-gray-400">Quality</p>
                <div v-if="isLoading" class="bg-gray-100 rounded-full h-8 w-12"></div>
                <h1 v-else class="h-bold">{{ quality }}
                  <span class="text-xs text-gray-400">/100</span></h1>
            </div>
          </div>

          <div class="flex flex-col gap-6">
              <div class="flex flex-col">
                <div class="flex justify-between">
                  <div v-if="isLoading" class="bg-gray-100 rounded-full h-8 w-12"></div>
                  <h1 v-else class="text-[#000080] h-bold">{{ sleepDuration }}%</h1>
                  <UPopover :ui="{content: 'rounded-2xl ring-0'}">
                    <UButton label="Open" color="secondary" variant="subtle"> 
                      <Icon name="material-symbols:info-outline-rounded" class="iconColor opacity-50" size="1em"/>
                    </UButton>

                    <template #content>
                      <div class=" max-w-full p-2 flex rounded-2xl">
                        <p v-if="totalSleepMin" class="p-small">Slept for {{ totalSleepMin }} min out of {{ totalPlanned }} min planned.</p>
                        <p v-else class="p-small">Total sleep time over planned sleeping time</p>
                      </div>
                    </template>
                  </UPopover>
                </div>
                  <p class="p-small text-gray-400">Sleep Duration </p>
              </div>
              <div class="flex flex-col">
                <div class="flex justify-between">
                  <div v-if="isLoading" class="bg-gray-100 rounded-full h-8 w-12"></div>
                  <h1 v-else-if="totalSleepMin && timeInBed"  class="text-[#9b87f5] h-bold">{{ Math.round((totalSleepMin/timeInBed) * 100) }}%</h1>
                  <h1 v-else  class="text-[#9b87f5] h-bold">0%</h1>
                  <UPopover :ui="{content: 'rounded-2xl ring-0'}">
                    <UButton label="Open" color="secondary" variant="subtle"> 
                      <Icon name="material-symbols:info-outline-rounded" class="iconColor opacity-50" size="1em"/>
                    </UButton>

                    <template #content>
                      <div class=" max-w-full p-2 flex rounded-2xl">
                        <p v-if="totalSleepMin" class="p-small">Slept for {{ totalSleepMin }} min out of {{ timeInBed }} min in bed.</p>
                        <p v-else class="p-small">Sleep duration over total time in bed</p>
                      </div>
                    </template>
                  </UPopover>
                </div>
                  <p class="p-small text-gray-400">Bed Activity</p>
              </div>
          </div>
        </div>
        <div v-if="isLoading" class="mt-6 flex items-center gap-3 bg-gray-50 p-4 h-14 rounded-lg"></div>
        <div v-else class="mt-6 flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="p-small text-gray-700">{{ comment }}</p>
        </div>
    </primitives-container>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
let sleepAngle = ref(0)
let bedAngle = ref(0)

const { 
  globalDeviceId,
  globalDeviceName,
  globalSleepSummary,
  globalTargetDevice,
  globalLoading,
  globalError,
  globalCommandStatus,
  globalPeriod,
  globalDate,
  isOn,
  loadDeviceData,
  loadSleepSummary,
  loadUserSettings,
  sendCommand
} = useDevice()

interface Props{ 
    quality?: number,
    sleepDuration?: number,
    bedActivity?: number,
    comment?: string,
    totalPlanned?: number,
    totalSleepMin?: number,
    timeInBed?: number,
    isLoading?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
    quality: 87,
    sleepDuration: 50,
    bedActivity: 90,
    comment: 'This week you slept much better than last week'
})


// const computedSleepDuration = computed(() => {return props.sleepDuration})


const chartSvg = ref<SVGSVGElement | null>(null)
const chartSvgLoading = ref<SVGSVGElement | null>(null)

// const sleepAngle = computed(() => {
//   const result = 1.03 - (computedSleepDuration.value / 100) * Math.PI
//   return result
// })

watch(() => [props.sleepDuration, props.bedActivity], (newVals, oldVals) => {
    if (chartSvg.value && newVals !== oldVals) {
        d3.select(chartSvg.value).selectAll("*").remove();
        drawChart();
    }
});
function drawChartSkeleton() { 
  const width = 160
  const height = 160
  const thickness = 16
  const radius = Math.min(width, height) / 2 

  const svg = d3.select(chartSvgLoading.value)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  const backgroundArc = d3.arc()
    .innerRadius(radius - thickness)
    .outerRadius(radius)
    .cornerRadius(12)

  //sleep duration grey
  svg.append('path')
    .datum({ startAngle: 0.1, endAngle: (Math.PI - 0.1) })
    .style('fill', '#e5e7eb')
    .attr('d', backgroundArc as any)

  //bed activity grey
  svg.append('path')
    .datum({ startAngle: Math.PI + 0.1, endAngle: (2 * Math.PI)-0.1 })
    .style('fill', '#e5e7eb')
    .attr('d', backgroundArc as any)

}

function drawChart() { 
const width = 160
  const height = 160
  const thickness = 16
  const radius = Math.min(width, height) / 2 

  const svg = d3.select(chartSvg.value)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)


  const backgroundArc = d3.arc()
    .innerRadius(radius - thickness)
    .outerRadius(radius)
    .cornerRadius(12)

  //sleep duration grey
  svg.append('path')
    .datum({ startAngle: 0.1, endAngle: (Math.PI - 0.1) })
    .style('fill', '#e5e7eb')
    .attr('d', backgroundArc as any)

  //bed activity grey
  svg.append('path')
    .datum({ startAngle: Math.PI + 0.1, endAngle: (2 * Math.PI)-0.1 })
    .style('fill', '#e5e7eb')
    .attr('d', backgroundArc as any)

  //sleep duration filled
  const sleepArc = d3.arc()
    .innerRadius(radius - thickness)
    .outerRadius(radius)
    .startAngle(Math.PI - 0.1) 
    .cornerRadius(12)

  const sleepPath = svg.append('path')
    .datum({ endAngle: Math.PI - 0.1 }) 
    .style('fill', '#000080')
    .attr('d', sleepArc as any)

  //bed activity filled
  const bedArc = d3.arc()
    .innerRadius(radius - thickness)
    .outerRadius(radius)
    .startAngle(Math.PI + 0.1)
    .cornerRadius(12)

  const bedPath = svg.append('path')
    .datum({ endAngle: Math.PI + 0.1 }) 
    .style('fill', '#9b87f5')
    .attr('d', bedArc as any)

    //top is at 0 (0.1), bottom is at 3.14 (3.04), 50% is at 1.52
    //if props.Duration is at 50 -> sleepAngle should be at 1.52
    //the higher props.Duration, the lower the sleepAngle
    // sleepDuration is 100 for full sleep
    // (π - 0.1) - (sleepDuration * ((π - 0.2) / 100)) = 1.52 --> 50 = 1.57
    // (π - 0.1) - (sleepDuration * ((π - 0.2) / 100)) = 1.52 --> 0 = 3.04
    //
    // (Math.PI - 0.1) - 0.1 = X
    
    // (Math.PI - 0.2) - (80/100) = 2.24 
    // (Math.PI - 0.2) - (50/100) = 2.54
    // (Math.PI - 0.1) - (1/100) => 3.03
  if (props.sleepDuration !== 0) { 
    // sleepAngle.value = 1.03 - (props.sleepDuration / 100)
    // sleepAngle.value = 1.03 - (props.sleepDuration / 100) * (Math.PI - 0.2)
    sleepAngle.value = (Math.PI - 0.1) - (props.sleepDuration *  ((Math.PI - 0.2) / 100))
  } else { 
    sleepAngle.value = Math.PI - 0.1
  }
  sleepPath.transition()
    .duration(1000)
    .attrTween('d', function(d: any) {
      const interpolate = d3.interpolate(d.endAngle, sleepAngle.value)
      return function(t: number) {
        d.endAngle = interpolate(t)
        return sleepArc(d)
      }
    })
  
  if (props.bedActivity !== 0) { 
    // 2 * Math.PI - (1.03 - (props.bedActivity / 100)) * Math.PI
    bedAngle.value = 2 * Math.PI - ((Math.PI - 0.1) - (props.bedActivity *  ((Math.PI - 0.2) / 100)))
  } else { 
    bedAngle.value = Math.PI + 0.1
  }
  // console.log("sleep angle: ", sleepAngle.value)  
  // const bedAngle = 2 * Math.PI - (1.03 - (props.bedActivity / 100)) * Math.PI
  bedPath.transition()
    .duration(1000)
    .attrTween('d', function(d: any) {
      const interpolate = d3.interpolate(d.endAngle, bedAngle.value)
      return function(t: number) {
        d.endAngle = interpolate(t)
        return bedArc(d)
      }
    })
}


onMounted(() => {
  drawChartSkeleton()
  if (!chartSvg.value) return
  drawChart()
})

</script>