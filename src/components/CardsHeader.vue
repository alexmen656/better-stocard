<template>
    <header class="header">
        <h1 class="title">Cards</h1>
        <button class="add-button" @click="$router.push('/create-card')">+</button>
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

.add-button {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: #FF6B6B;
    font-size: 32px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>