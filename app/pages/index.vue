<template>
    <div class="main-flex-container">
        <div class="flex-col-container">
            <div class="py-8">
                <BarChart :width=barLength :height=barHeight :data="chartData" />
            </div>
        </div>
    </div>
</template>

<script setup>
const barLength = ref(300);
const barHeight = ref(300);
const chartData = ref([10, 15, 20, 25, 30, 20, 25, 5, 7, 8, 22, 32, 30, 12, 10])
</script>