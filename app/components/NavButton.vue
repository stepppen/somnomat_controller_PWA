<template>
    <div class="w-full flex justify-evenly header_dimensions">  
        <button 
            @touchstart="$event.target.classList.add('pressed')" 
            @touchend="$event.target.classList.remove('pressed')"
            :class="['nav-btn', { 'active': isPressed }]"
            >
            <Icon :name="navIcon" style="color: black" size="2em"/>

            <!-- <MdiIcon v-if="navIcon" :icon="navIcon" class="large-icon" /> -->
        </button>
    </div>
</template>
<script setup lang="ts">
interface Props{
    navIcon?: String | undefined,
    sizeIcon?: Number | undefined
}
defineProps<Props>()
</script>
<style scoped>
.nav-btn {
  display: block;
  width: 5rem;
  text-align: center;
  padding: 0.5rem rem;
  margin: 0.5rem;
  border-radius: 1rem;
  color: #000000;
  background-color: rgb(255, 255, 255);
  white-space: nowrap;
  /* font-size: 1rem; */
  -webkit-tap-highlight-color: transparent; 
  touch-action: manipulation; 
  transition: background-color 0.15s ease-in-out; 
}

button.pressed {
  background-color: rgb(209, 210, 211) !important; 
}

.large-icon {
  font-size: 48px;
}

/* .header_dimensions{
  
} */
</style>