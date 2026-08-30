<template>
  <Login v-if="!isLoged && !(route.path.startsWith('/signdocument') || route.path.startsWith('/create-password'))" @loged="onLogin" />
  <router-view v-else />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Login from './components/Login.vue';
import type { UserConnected } from './data/type.ts';
import { useRoute } from 'vue-router';
// import { authService } from './data/service.ts';
const route = useRoute();

const isLoged = ref<boolean>(false);
const onLogin = (userConnected: UserConnected) => {
  localStorage.setItem("userconnected", JSON.stringify(userConnected));
  isLoged.value = userConnected.isConnected
}

onMounted(async () => {
  const userData = localStorage.getItem("userconnected");
  if(userData){
    const user = JSON.parse(userData) as UserConnected;
    // const authUser = await authService<User>(user.user.id);
    isLoged.value = user.isConnected
  }
})
</script>
