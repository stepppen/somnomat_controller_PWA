<template>
  <svg ref="svg"></svg>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  width: {
    type: Number,
    default: 300
  },
  height: {
    type: Number,
    default: 300
  }
})

const marginBottom = 30;
const marginTop = 30;
const marginLeft = 40;
const marginRight = 10;
const svg = ref(null)

const drawChart = () => {
  const svgEl = d3.select(svg.value)
  svgEl.selectAll('*').remove()
  const containerWidth = Math.min(props.width, svg.value.parentElement.clientWidth - 32)
  
  svgEl.attr('width', containerWidth).attr('height', props.height)
  svgEl.attr('viewBox', `0 0 ${containerWidth} ${props.height}`)
  svgEl.attr('preserveAspectRatio', 'xMidYMid meet')

  const x = d3
    .scaleBand()
    .domain(props.data.map((d, i) => i))
    .range([marginLeft, containerWidth - marginRight])
    .padding(0.1)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(props.data)])
    .nice()
    .range([props.height - marginBottom, marginTop])

  svgEl
    .selectAll('rect')
    .data(props.data)
    .join('rect')
    .attr('x', (_, i) => x(i))
    .attr('y', d => y(d))
    .attr('width', x.bandwidth())
    .attr('height', d => (props.height - marginBottom) - y(d))
    .attr('fill', 'grey')

  svgEl
    .append("g")
    .attr("transform", `translate(0,${props.height - marginBottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  svgEl.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickFormat((y) => (y * 100).toFixed()))
}    

onMounted(drawChart)
watch(() => props.data, drawChart)
</script>