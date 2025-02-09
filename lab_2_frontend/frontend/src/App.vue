<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

  const store = useAuthStore();

  onMounted(() => {
    const url = new URL(window.location.href);
    const jwt = url.searchParams.get('jwt');
    console.log(url.searchParams)

    if (jwt) {
      // Store JWT in localStorage
      localStorage.setItem('token', jwt);
      url.searchParams.delete('jwt');
      window.history.replaceState({}, document.title, url.pathname + url.search);
      store.tryApplyJwt(jwt)
      // window.location.reload()
    }
  });
</script>
