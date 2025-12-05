<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
    <header class="header">
        <h1 class="title">{{ t('home.title') }}</h1>
        <button class="add-button" @click="$router.push('/create-card')">+</button>
    </header>
</template>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 20px 0px 20px;
    background-color: var(--bg-secondary);
    padding-top: calc(20px + max(0px, env(safe-area-inset-top)));
    background-color: var(--bg-primary);
}

.title {
    font-size: 36px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
}

.add-button {
    width: 42px;
    height: 42px;
    border: none;
    color: gray;
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
    text-align: center;
}
</style>