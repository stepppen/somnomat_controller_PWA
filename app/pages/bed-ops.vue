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
            <div>
                <p>Server Response: {{serverAnswer}}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
let serverAnswer = ref()
const config = useRuntimeConfig();
//for prod:
const apiBase = config.public.apiBase;
//for dev only:
// const apiBase = "http://localhost:10000";
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


async function sendBoolean(action) {
    try {
        console.log(`Sending ${action} to: ${apiBase}/api/log`);
        const response = await fetch(`${apiBase}/api/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({action}),
        })
        const data = await response.json();
    
        console.log("Response: ", data);
        serverAnswer.value = data

    } catch (error) {
        console.error('Error:', error);
    }
}
</script>