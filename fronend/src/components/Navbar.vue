<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  FileSignature,
  LayoutDashboard,
  Upload,
  History,
  User
} from "lucide-vue-next";

</script>
<template>
  <nav class="border-b bg-white shadow-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <FileSignature :size="24" />
        </div>
        <span class="text-xl font-bold">
          PDF Signer
        </span>
      </RouterLink>
      <!-- Menu -->
      <div class="flex items-center gap-8">
        <RouterLink to="/" class="flex items-center gap-2 text-gray-600 transition hover:text-emerald-600">
          <LayoutDashboard :size="20" />
          Dashboard
        </RouterLink>
        <RouterLink to="/upload" class="flex items-center gap-2 text-gray-600 transition hover:text-emerald-600">
          <Upload :size="20" />
          Nouveau document
        </RouterLink>
        <RouterLink to="/history" class="flex items-center gap-2 text-gray-600 transition hover:text-emerald-600">
          <History :size="20" />
          Historique
        </RouterLink>
      </div>
      <!-- Profil -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <User :size="22" />
        </div>
        <div>
          <p class="text-sm font-semibold">
            Administrateur
          </p>
          <p class="text-xs text-gray-500">
            admin@email.com
          </p>
        </div>
      </div>
    </div>
  </nav>
</template>