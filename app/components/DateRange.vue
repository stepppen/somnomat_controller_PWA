<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, today } from '@internationalized/date'


const df = new DateFormatter('en-US', {
  dateStyle: 'medium',
})

const dfNoYear = new DateFormatter('en-US', {
  day: 'numeric',
  month: 'short',
})


let localDate = today(
  getLocalTimeZone()
);

interface Props{
  startDate?: Array<number>,
  endDate?: Array<number>,
}
  
const props = withDefaults(defineProps<Props>(), {
  startDate: () => {
    const localDate = today(getLocalTimeZone());
    return [localDate.day, localDate.month, localDate.year]},
  endDate: () => { 
    const localDate = today(getLocalTimeZone());
    return [localDate.day, localDate.month, localDate.year]}
})



const modelValue = computed(() => ({
  // console.log("Props coming in", props.startDate);
  // start: new CalendarDate(2022, 1, 20),
  start: new CalendarDate(props.startDate[2]!, props.startDate[1]!, props.startDate[0]!),
  end: new CalendarDate(props.endDate[2]!, props.endDate[1]!, props.endDate[0]!)
}))

function compareDates(){
  console.log("Props coming in", props.startDate);
  // const result = modelValue.value.start.compare(modelValue.value.end);
  // console.log("Result", modelValue.value.start)
  // console.log(df.format(modelValue.value.start.toDate(getLocalTimeZone())))
  return modelValue.value.start.compare(modelValue.value.end)
}
</script>

<template>
      <template v-if="modelValue.start">
        <template v-if="compareDates() != 0">
          <!-- {{localDate}} -->
           <!-- {{ modelValue.start }}  -->
            {{ modelValue.start.year === modelValue.end.year 
                ? dfNoYear.format(modelValue.start.toDate(getLocalTimeZone())) 
                : df.format(modelValue.start.toDate(getLocalTimeZone())) 
            }} - {{ df.format(modelValue.end.toDate(getLocalTimeZone())) }}
        </template>

        <template v-else>
          <!-- {{ modelValue.end }} -->
          {{ df.format(modelValue.start.toDate(getLocalTimeZone())) }}
        </template>
      </template>
      <template v-else>
        Pick a date
      </template>

    <!-- <template #content>
      <UCalendar v-model="modelValue" class="p-2" :number-of-months="2" range />
    </template> -->
</template>

