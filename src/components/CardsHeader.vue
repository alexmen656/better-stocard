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
    padding: 8px 20px 0px 20px;
    /*14px*/
    /*14px 20px 20px 20px*/
    background-color: var(--bg-secondary);
    /* border-bottom: 1px solid #E0E0E0;*/
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
    /*48*/
    height: 42px;
    /*48*/
    border: none;
    /* background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);*/
    color: gray;
    /*#FFFFFF;*/
    font-size: 28px;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    /*  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);*/
    transition: all 0.3s ease;
    text-align: center;
}

/*.add-button:active {
    transform: scale(0.95);
    box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
}

.add-button:hover {
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}*/
</style>