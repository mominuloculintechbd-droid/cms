<template>
  <div class="not-found-view">
    <div class="container">
      <div class="error-code">404</div>
      <div class="error-message">Oops! Page Not Found.</div>
      <p class="error-description">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <router-link to="/" class="btn btn--primary">Go to Homepage</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: var(--color-background);
}

.container {
  max-width: 600px;
}

.error-code {
  font-size: 10rem;
  font-weight: var(--font-weight-black);
  color: var(--primary-500);
  text-shadow: 4px 4px 0px var(--color-border);
}

.error-message {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
}

.error-description {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}
</style>
