<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-6">

    <div class="w-full max-w-md">

      <div class="mb-6 flex flex-col items-center gap-3 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
          <ShieldCheck :size="30" />
        </div>

        <div>
          <h1 class="text-2xl font-bold text-gray-900">Bienvenue</h1>
          <p class="mt-1 text-sm text-gray-500">Activez votre compte administrateur</p>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

        <div v-if="loading" class="py-10 text-center">
          <div class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>

          <p class="mt-4 text-sm text-gray-500">Vérification de votre invitation...</p>
        </div>

        <div v-else-if="invitationInvalid" class="py-8 text-center">

          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle :size="24" />
          </div>

          <h2 class="mt-4 font-semibold text-gray-900">
            Invitation invalide
          </h2>

          <p class="mt-2 text-sm text-gray-500">
            {{ error }}
          </p>
        </div>

        <form v-else-if="!success" @submit.prevent="acceptInvitation" class="flex flex-col gap-5">

          <div class="rounded-xl bg-gray-50 p-4">
            <p class="text-sm text-gray-500"> Vous êtes invité en tant que </p>

            <p class="mt-1 font-semibold text-gray-900">{{ user.name }}</p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>

            <div class="relative">
              <Lock :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input v-model="user.password" type="password" placeholder="••••••••"
                class="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>

            <p class="text-xs text-gray-400">
              Minimum 8 caractères
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>

            <div class="relative">
              <Lock :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input v-model="confirmPassword" type="password" placeholder="••••••••"
                class="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>

          <div v-if="error" class="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {{ error }}
          </div>

          <button type="submit" :disabled="submitting"
            class="rounded-xl bg-primary px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60">
            {{
              submitting
                ? "Création du compte..."
                : "Créer mon compte administrateur"
            }}
          </button>

        </form>

        <div v-else class="py-8 text-center">

          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle :size="28" />
          </div>

          <h2 class="mt-4 text-lg font-semibold text-gray-900">
            Compte créé !
          </h2>

          <p class="mt-2 text-sm text-gray-500">
            {{ success }}
          </p>

          <p class="mt-4 text-xs text-gray-400">
            Redirection vers la connexion...
          </p>

        </div>

      </div>

      <p class="mt-6 text-center text-xs text-gray-400">
        Signature Carte membre AESNA
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ShieldCheck, Lock, CheckCircle, AlertCircle } from "lucide-vue-next";
import { loadInvitationService, activateUserService } from "../data/service";
import type { User } from "../data/type";

const route = useRoute();
const router = useRouter();

const token = route.params.token as string;
const user = ref<User>({
  id: '',
  email: "",
  name: '',
  password: '',
})

const confirmPassword = ref("");

const loading = ref(true);
const submitting = ref(false);
const invitationInvalid = ref(false);

const error = ref("");
const success = ref("");

const loadInvitation = async () => {
  try {
    const response = await loadInvitationService(token);

    if (!response.success || !response.data) {
      invitationInvalid.value = true;
      error.value = "Cette invitation n'est plus valide.";
      return;
    }

    if (response.data.isActif) {
      invitationInvalid.value = true;
      error.value = "Cette invitation a déjà été utilisée. Connectez-vous avec votre mot de passe.";
      return;
    }

    user.value = {
      ...response.data,
      password: "",
    };
  } finally {
    loading.value = false;
  }
};

const acceptInvitation = async () => {
  error.value = "";

  const password = user.value.password ?? "";

  if (password !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas.";
    return;
  }
  if (password.length < 8) {
    error.value = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }

  submitting.value = true;

  try {
    const response = await activateUserService(user.value.id, password);

    if (!response.success) {
      error.value = response.message;
      return;
    }

    success.value = response.message;
    setTimeout(() => { router.push("/") }, 2500);
  } finally {
    submitting.value = false;
  }
};

onMounted(loadInvitation);
</script>
