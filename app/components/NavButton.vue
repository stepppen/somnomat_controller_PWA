<template>
    <div class="flex justify-center">  
        <button 
            @touchstart="$event.target.classList.add('pressed')" 
            @touchend="$event.target.classList.remove('pressed')"
            :class="['nav-btn', { 'active': isPressed }]"
            >
            <MdiIcon v-if="navIcon" :icon="navIcon" size="28px" />
        </button>
    </div>
</template>
<script setup lang="ts">
interface Props{
    navIcon?: String
}
defineProps<Props>()
</script>
<style scoped>
.nav-btn {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.5rem 2rem;
  margin: 0.5rem;
  border-radius: 2rem;
  color: #000;
  background-color: rgb(240, 240, 240);
  white-space: nowrap;
  font-size: 1rem;
  -webkit-tap-highlight-color: transparent; /* Prevent blue flash on iOS */
  touch-action: manipulation; /* Ensure taps are recognized immediately */
  transition: background-color 0.15s ease-in-out; /* Smooth transition */
}

/* 👇 This will now trigger on mobile when pressed */
button.pressed {
  background-color: rgb(209, 210, 211) !important; /* slate-300 */
}
</style>