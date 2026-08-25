<script setup lang="ts">
import { ref } from 'vue';
import Login from './components/login.vue';
const isLoged = ref<boolean>(true);
const onLogin = (loged : boolean)=>{
  console.log(loged)
  console.log('logeed')
  isLoged.value = loged
}
</script>

<template>
  <Login v-if="isLoged" @loged="onLogin"/>
  <router-view v-else />
</template>
