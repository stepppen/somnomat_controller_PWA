<template>
    <primitives-container>
        <h1>Overview</h1>
        
        <div class="w-full flex items-center gap-8">
          <div class="relative w-48 h-48 flex items-center justify-center">
            <svg ref="chartSvg" :width="160" :height="160" class="absolute"></svg>
            
            <div class="relative z-10 flex flex-col items-center justify-center">
                <p>Quality</p>
                <h1>{{ quality }}
                  <span class="text-xs text-gray-400">/100</span></h1>
            </div>
          </div>

          <div class="flex flex-col gap-6">
              <div class="flex flex-col">
                  <h2 class="text-4xl font-bold text-[#000080]">{{ sleepDuration }}%</h2>
                  <p class="text-gray-400">Sleep Duration</p>
              </div>
              <div class="flex flex-col">
                  <h2 class="text-4xl font-bold text-[#9b87f5]">{{ bedActivity }}%</h2>
                  <p class="text-gray-400">Bed Activity</p>
              </div>
          </div>
        </div>
        <!-- <PrimitivesFullButton buttonPath="/" navIcon="material-symbols:info-outline-rounded" buttonText="This week you"/> -->
        <div class="mt-6 flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="text-gray-700">{{ comment }}</p>
            
             <Icon name="material-symbols:info-outline-rounded" class="iconColor" size="1.5em"/>
        </div>
    </primitives-container>
</template>

<script setup lang="ts">
import * as d3 from 'd3'

interface Props{ 
    quality?: number,
    sleepDuration?: number,
    bedActivity?: number,
    comment?: string,
}

const props = withDefaults(defineProps<Props>(), {
    quality: 87,
    sleepDuration: 50,
    bedActivity: 90,
    comment: 'This week you slept much better than last week'
})

const chartSvg = ref<SVGSVGElement | null>(null)

onMounted(() => {
  if (!chartSvg.value) return

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

  let sleepAngle = ((1.03 - (props.sleepDuration / 100)) * Math.PI)
  sleepPath.transition()
    .duration(1000)
    .attrTween('d', function(d: any) {
      const interpolate = d3.interpolate(d.endAngle, sleepAngle)
      return function(t: number) {
        d.endAngle = interpolate(t)
        return sleepArc(d)
      }
    })

  const bedAngle = 2 * Math.PI - (1.03 - (props.bedActivity / 100)) * Math.PI
  bedPath.transition()
    .duration(1000)
    .attrTween('d', function(d: any) {
      const interpolate = d3.interpolate(d.endAngle, bedAngle)
      return function(t: number) {
        d.endAngle = interpolate(t)
        return bedArc(d)
      }
    })
})
</script>