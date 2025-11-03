<template>
    <div class="main-flex-container">
        <div class="flex-col-container">
            <div class="flex gap-4 align-center justify-center ">
                <NuxtLink to="/"> <-</NuxtLink>
                <h1>Bed Operation</h1>

            </div>
            <div class="button-container">
                <button id="start" class="action-btn">Start</button>
                <button id="stop" class="action-btn">Stop</button>
            </div>
            <button id="meditation" class="action-btn">Meditation Mode</button>
        </div>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
const apiBase = config.public.apiBase;
onMounted(() => {
    document.getElementById("start").addEventListener("click", function() {
        sendBoolean("start");
    })
    document.getElementById("stop").addEventListener("click", function() {
        sendBoolean("stop");
    })
    document.getElementById("meditation").addEventListener("click", function() {
        sendBoolean("meditation");
    })

});


async function sendBoolean(message) {
    try {
        const response = await fetch(`${apiBase}/api/log`, {
            method: 'POST',
            body: message,
        })
        const data = await response.json();
    
        console.log("Response: ", data);

    } catch (error) {
        console.error('Error:', error);
    }
}
</script>