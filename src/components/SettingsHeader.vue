<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
<template>
    <header class="header">
        <h1 class="title">{{ t('settings.title') }}</h1>
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
</style>