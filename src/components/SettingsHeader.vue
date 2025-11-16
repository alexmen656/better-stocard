<template>
    <header class="header">
        <h1 class="title">Settings</h1>
    </header>
</template>
<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px 20px;
    background-color: #FFFFFF;
    border-bottom: 1px solid #E0E0E0;
    padding-top: calc(15px + max(0px, env(safe-area-inset-top)));
}

.title {
    font-size: 20px;
    font-weight: 400;
    color: #999999;
    letter-spacing: 0.5px;
}
</style>