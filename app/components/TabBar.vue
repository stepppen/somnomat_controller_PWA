<template>
    <div class="toggle-container">
        <div class="tab-toggle">
            <div class="active-button" :style="sliderPos"></div>

            <div class="nav-button"
            @click="navigateTo('/bed-ops')"
            :class="{active: currentPath === 'bed-ops'}">
                <Icon name="material-symbols:bed-outline-rounded" :class="{activeIcon: currentPath === 'bed-ops'}" size="2em"/>
            </div>
            <div class="nav-button"
            @click="navigateTo('/')"
            :class="{active: currentPath === 'home'}">
                <Icon name="material-symbols:leaderboard-outline-rounded" :class="{activeIcon: currentPath === 'home'}" size="1.8em"/>
            </div>
            <div class="nav-button"
            @click="navigateTo('/settings')"
            :class="{active: currentPath === 'settings'}">
                <Icon name="material-symbols:person-outline-rounded" :class="{activeIcon: currentPath === 'settings'}" size="2em"/>
            </div>
        </div>
    </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const currentPath = ref('home')

const navigateTo = (path) => {
    router.push(path)
}

const sliderPos = computed (() => {
    let tabCount = 3;
    let visibleIndex = 0;

    if (currentPath.value === 'home') visibleIndex = 1
    else if (currentPath.value === 'bed-ops') visibleIndex = 0
    else if (currentPath.value === 'settings') visibleIndex = 2
    
    return{
        width: `calc(${100/tabCount}% - 4px)`,
        transform: `translateX(calc(${visibleIndex * 100}% + 4px))`
    }
})

watch (
    () => route.path,
    (newPath) => {
        if (newPath === '/'){
            currentPath.value = "home"
        } else if (newPath === '/bed-ops'){
            currentPath.value = "bed-ops"
        } else {
            currentPath.value = "settings"
        }
    }, { immediate: true }
)
</script>

<style scoped>
.toggle-container{
    display: flex;
    position: relative;
    /* margin: 0 1rem; */
    justify-content: center
}

.tab-toggle{
    display: flex;
    position: relative;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 4rem;
    padding: 4px;
    height: 3.2rem;
    cursor: pointer;
    user-select: none;
    max-width: 500px; 
    width: 100%;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nav-button{
    display: flex;
    flex: 1;
    align-items: center;
    position: relative;
    z-index: 2;
    justify-content: center;
    height: 100%;
    padding: 0 4px;
    border-radius: 4rem;
    white-space: nowrap;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nav-button :deep(svg) {
    color: #666;
    transition: color 0.3s ease;
}

.nav-button.active :deep(svg) {
    color: white;
}

.activeIcon{
    color: white;
    transition: color 0.3s ease;
}

.active-button{
    position: absolute;
    z-index: 1;
    left: 2px;
    /* right: 4px; */
    top: 4px;
    height: calc(100% - 8px);
    background: var(--primary-contrast);
    border-radius: 4rem;
    box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.15),
        0 1px 3px rgba(0, 0, 0, 0.1);
    transition: 
        transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
        width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>