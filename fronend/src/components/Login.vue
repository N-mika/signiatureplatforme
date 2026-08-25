<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 p-6">
    <div class="w-full max-w-md">
      <div class="rounded-2xl bg-white p-8 shadow-sm">
        <!-- Logo -->
        <div class="flex flex-col items-center gap-3 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
            <FileSignature :size="28" />
          </div>

          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-bold text-gray-900">Bienvenue</h1>
            <p class="text-sm text-gray-500">
              Connectez-vous à votre espace administrateur.
            </p>
          </div>
        </div>

        <!-- Formulaire -->
        <form class="mt-8 flex flex-col gap-5" @submit.prevent="login">
          <!-- Email -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Adresse email
            </label>

            <div class="relative">
              <Mail :size="19" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input v-model="email" type="email" placeholder="admin@email.com" autocomplete="email"
                class="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>

          <!-- Mot de passe -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">
                Mot de passe
              </label>

              <button type="button" class="text-xs font-medium text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            </div>

            <div class="relative">
              <Lock :size="19" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                autocomplete="current-password"
                class="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10" />

              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" :size="19" />
                <Eye v-else :size="19" />
              </button>
            </div>
          </div>

          <!-- Erreur -->
          <div v-if="error" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ error }}
          </div>

          <!-- Connexion -->
          <button type="submit" :disabled="loading || !email || !password"
            class="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
            <Loader2 v-if="loading" :size="19" class="animate-spin" />
            <LogIn v-else :size="19" />
            {{ loading ? "Connexion..." : "Se connecter" }}
          </button>
        </form>

        <!-- Sécurité -->
        <div class="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck :size="15" class="text-primary" />
          <span>Espace administrateur sécurisé</span>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-gray-400">
        © {{ new Date().getFullYear() }} AESNA
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { FileSignature, Mail, Lock, Eye, EyeOff, LogIn, Loader2, ShieldCheck } from "lucide-vue-next";

const email = ref<string>("");
const password = ref<string>("");
const showPassword = ref<boolean>(false);
const loading = ref<boolean>(false);
const error = ref<string>("");

const emits = defineEmits<{ (e: "loged", loged: boolean): void }>();
const login = async () => {
  if (!email.value || !password.value) {
    error.value = "Veuillez remplir tous les champs.";
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    emits("loged", false)
    console.log({ email: email.value, password: password.value });
  } catch (err) {
    console.error(err);
    error.value = "Email ou mot de passe incorrect.";
  } finally {
    loading.value = false;
  }
};
</script>