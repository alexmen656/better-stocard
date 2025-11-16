<template>
    <nav class="bottom-nav">
        <button class="nav-item active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="5" rx="1" fill="#FF6B6B" />
                <rect x="3" y="10" width="7" height="5" rx="1" fill="#FF6B6B" />
                <rect x="3" y="17" width="7" height="5" rx="1" fill="#FF6B6B" />
                <rect x="12" y="3" width="9" height="2" rx="1" fill="#FF6B6B" />
                <rect x="12" y="10" width="9" height="2" rx="1" fill="#FF6B6B" />
                <rect x="12" y="17" width="9" height="2" rx="1" fill="#FF6B6B" />
            </svg>
            <span>Cards</span>
        </button>
        <button class="nav-item" @click="$router.push('/settings')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17C2 20.31 7.03 23.25 12 24C16.97 23.25 22 20.31 22 17V7L12 2Z" stroke="#999"
                    stroke-width="2" fill="none" />
            </svg>
            <span>Settings</span>
        </button>
    </nav>
</template>
<style scoped>
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #FFFFFF;
    border-top: 1px solid #E0E0E0;
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 24px;
    color: #999999;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.nav-item.active {
    color: #FF6B6B;
}

.nav-item svg {
    width: 24px;
    height: 24px;
}
</style>