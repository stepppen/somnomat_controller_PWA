<template>
    <div class="main-container py-4 flex justify-start w-full">
        <div class="nav-button"
            @click="goBack">
                <Icon name="material-symbols:arrow-back-ios-rounded" size="1.5em"/>
            </div>
    </div>
</template>

<script setup>
const router = useRouter()
const route = useRoute()
const goBack = () => {
    router.back()
}
</script>