<template>
  <div class="settings-container">
    <h1>This is an settings page</h1>
    <p>(Comming soon)</p>
  </div>
</template>

<style scoped>
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.settings-container {
  min-height: 100vh;
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  -webkit-user-select: none;
  user-select: none;
}

@media (min-width: 1024px) {
  .settings-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>