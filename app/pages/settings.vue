<template>
    <div class="main-container py-4 flex justify-between w-full">
        <div>
            <h2 class="text-left">Settings</h2>
        </div>
        <div class="flex gap-4">
            <div class="nav-button"
            @click="navigateTo('/')">
                <Icon name="material-symbols:notifications-outline-rounded" size="1.5em"/>
            </div>
        </div>
        
    </div>
    <div class="flex flex-col gap-4">
        <div class="main-container">
            <!-- Device Selector -->
            <primitives-container>
                <h3>Jan Frischknecht</h3>
                <PrimitivesFullButton buttonPath="/personal-settings" navIcon="" buttonText="email"/>
            </primitives-container>
        </div>
        <div class="main-container">
            <!-- Device Selector -->
            <primitives-container>
                <h3>App Settings</h3>
                <PrimitivesFullButton buttonPath="/bed-time" navIcon="material-symbols:alarm-outline-rounded" buttonText="Adjust Bed Time"/>
                <PrimitivesFullButton buttonPath="/about-app" navIcon="material-symbols:info-outline-rounded" buttonText="About App"/>
            </primitives-container>
        </div>
        <div class="main-container">
            <!-- Device Selector -->
            <primitives-container>
                <h3>Device Settings</h3>
                <PrimitivesFullButton buttonPath="/device-management" navIcon="material-symbols:bigtop-updates-rounded" buttonText="Device Management"/>
                <PrimitivesFullButton buttonPath="/debug-info" navIcon="material-symbols:privacy-tip-outline-rounded" buttonText="Debug Info"/>
            </primitives-container>
        </div>
        <div class="main-container">
            <!-- Device Selector -->
            <primitives-container>
                <h3>Help & Info</h3>
                <PrimitivesFullButton buttonPath="/privacy-policy" navIcon="material-symbols:spa-outline-rounded" buttonText="Privacy Policy"/>
            </primitives-container>
        </div>
        <div class="main-container">
            <PrimitivesFullButtonDark buttonText="logout" buttonPath="/"/>
        </div>
        <div>
            <p class="p-small">
                © 2025 Calmea. All Rights Reserved. Zürich, Switzerland.
            </p>
        </div>
    </div>
</template>
