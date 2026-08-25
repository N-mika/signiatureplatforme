<script setup lang="ts">
import { RouterLink } from "vue-router";
import { FileSignature, LayoutDashboard, Upload, History, User } from "lucide-vue-next";
</script>

<template>
  <nav class="border-b border-gray-100 bg-white shadow-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <FileSignature :size="23" />
        </div>

        <span class="text-lg font-bold text-aesna-black">
          AESNA
        </span>
      </div>

      <!-- Menu -->
      <div class="flex items-center gap-2">
        <RouterLink to="/"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-aesna-green/10 hover:text-aesna-green"
          active-class="border-indigo-500 text-gray-900 focus:border-indigo-700">
          <LayoutDashboard :size="19" />
          Dashboard
        </RouterLink>

        <RouterLink to="/upload"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-aesna-green/10 hover:text-aesna-green"
          active-class="bg-aesna-green/10 text-aesna-green">
          <Upload :size="19" />
          Nouveau document
        </RouterLink>

        <RouterLink to="/history"
          class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-aesna-green/10 hover:text-aesna-green"
          active-class="bg-aesna-green/10 text-aesna-green">
          <History :size="19" />
          Suivi
        </RouterLink>
      </div>

      <!-- Profil -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-aesna-blue/10 text-aesna-blue">
          <User :size="21" />
        </div>

        <div class="flex flex-col gap-0.5">
          <p class="text-sm font-semibold text-aesna-black">
            Administrateur
          </p>

          <p class="text-xs text-gray-400">
            admin@email.com
          </p>
        </div>
      </div>

    </div>
  </nav>
</template>