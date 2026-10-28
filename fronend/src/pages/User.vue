<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <main class="p-6 lg:p-8">
      <div class="mx-auto flex max-w-7xl flex-col gap-6">

        <!-- Header -->
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div class="w-full max-w-xs rounded-2xl bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">
                  Administrateurs
                </p>
                <p class="mt-1 text-3xl font-bold text-gray-900">
                  {{ allUser.length }}
                </p>
              </div>

              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users :size="24" />
              </div>
            </div>
          </div>

          <button
            class="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
            @click="openModal">
            <UserPlus :size="19" />
            Ajouter un administrateur
          </button>
        </div>

        <!-- Message global -->
        <div v-if="pageMessage" :class="[
          'flex items-start justify-between gap-4 rounded-xl px-4 py-3 text-sm',
          pageMessage.type === 'success'
            ? 'border border-green-100 bg-green-50 text-green-700'
            : 'border border-red-100 bg-red-50 text-red-700'
        ]">
          <span>{{ pageMessage.text }}</span>

          <button class="shrink-0 text-xs font-medium underline" @click="pageMessage = null">
            Fermer
          </button>
        </div>

        <!-- Liste -->
        <div class="rounded-2xl bg-white p-6 shadow-sm">

          <!-- Recherche -->
          <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 class="font-semibold text-gray-900">
                Liste des administrateurs
              </h2>
              <p class="mt-1 text-sm text-gray-500">
                Consultez et gérez les administrateurs.
              </p>
            </div>

            <div class="relative w-full md:max-w-sm">
              <Search :size="19" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input v-model="search" type="text" placeholder="Rechercher un administrateur..."
                class="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th class="p-4 font-medium">Nom</th>
                  <th class="p-4 font-medium">Email</th>
                  <th class="p-4 font-medium">Statut</th>
                  <th class="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="p-10 text-center text-sm text-gray-400">
                    Chargement des administrateurs...
                  </td>
                </tr>

                <tr v-for="admin in filteredAdmins" :key="admin.id"
                  class="border-b border-gray-100 transition hover:bg-gray-50">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {{ admin.name.charAt(0).toUpperCase() }}
                      </div>

                      <span class="font-medium text-gray-800">
                        {{ admin.name }}
                      </span>
                    </div>
                  </td>

                  <td class="p-4 text-sm text-gray-600">
                    {{ admin.email }}
                  </td>

                  <td class="p-4">
                    <span :class="[
                      'rounded-full px-3 py-1 text-xs font-medium',
                      admin.isActif
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    ]">
                      {{ admin.isActif ? "Actif" : "En attente" }}
                    </span>
                  </td>

                  <td class="p-4 text-right">
                    <button v-if="admin.id !== 'admin'"
                      class="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      :disabled="deletingId === admin.id" @click="removeAdmin(admin)">
                      {{ deletingId === admin.id ? "Suppression..." : "Supprimer" }}
                    </button>

                    <span v-else class="text-xs text-gray-400">
                      Compte principal
                    </span>
                  </td>
                </tr>

                <!-- Aucun résultat -->
                <tr v-if="!loading && filteredAdmins.length === 0">
                  <td colspan="4" class="p-10 text-center text-sm text-gray-400">
                    Aucun administrateur trouvé.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">
              Ajouter un administrateur
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Créez un nouveau compte administrateur.
            </p>
          </div>

          <button class="text-gray-400 transition hover:text-gray-700" @click="closeModal">
            <X :size="22" />
          </button>
        </div>

        <!-- Succès -->
        <div v-if="createdSuccess" class="flex flex-col gap-4">
          <div class="rounded-xl bg-green-50 p-4 text-sm text-green-700">
            <p class="font-medium">{{ modalMessage }}</p>
            <p v-if="createdInvitationLink" class="mt-1 text-xs">
              Transmettez ce lien au nouvel administrateur s'il n'a pas reçu l'email :
            </p>
          </div>

          <div v-if="createdInvitationLink" class="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p class="break-all text-xs text-gray-600">{{ createdInvitationLink }}</p>
          </div>

          <div class="flex justify-end gap-3">
            <button v-if="createdInvitationLink"
              class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              @click="copyInvitationLink">
              {{ linkCopied ? "Lien copié !" : "Copier le lien" }}
            </button>

            <button
              class="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              @click="closeModal">
              Fermer
            </button>
          </div>
        </div>

        <!-- Formulaire -->
        <div v-else class="flex flex-col gap-4">

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Nom
            </label>

            <input v-model="newAdmin.name" type="text" placeholder="Nom de l'administrateur" :disabled="sending"
              class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Email
            </label>

            <input v-model="newAdmin.email" type="email" placeholder="admin@email.com" :disabled="sending"
              class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-gray-50" />
          </div>

          <div v-if="modalError" class="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {{ modalError }}
          </div>

          <div class="mt-2 flex justify-end gap-3">
            <button
              class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              :disabled="sending" @click="closeModal">
              Annuler
            </button>

            <button
              class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="sending || !newAdmin.name || !newAdmin.email" @click="addAdmin">
              <Loader2 v-if="sending" :size="17" class="animate-spin" />
              {{ sending ? "Envoi..." : "Ajouter" }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Users, UserPlus, Search, X, Loader2 } from "lucide-vue-next";
import Navbar from "../components/Navbar.vue";
import type { User } from "../data/type.ts";
import { onGetService, inviteAdminService, deleteUserService } from "../data/service.ts";

const allUser = ref<User[]>([]);
const loading = ref(true);

const search = ref<string>("");
const showModal = ref<boolean>(false);

const sending = ref(false);
const modalError = ref("");
const modalMessage = ref("");
const createdSuccess = ref(false);
const createdInvitationLink = ref("");
const linkCopied = ref(false);

const deletingId = ref<string | null>(null);

const pageMessage = ref<{ type: "success" | "error"; text: string } | null>(null);

const newAdmin = ref({
  name: "",
  email: "",
});

const filteredAdmins = computed(() => {
  const value = search.value.toLowerCase();

  return allUser.value.filter(admin =>
    admin.name.toLowerCase().includes(value) ||
    admin.email.toLowerCase().includes(value)
  );
});

const loadUsers = async () => {
  loading.value = true;

  try {
    allUser.value = await onGetService<User>("getalluser");
  } finally {
    loading.value = false;
  }
};

const openModal = () => {
  newAdmin.value = { name: "", email: "" };
  modalError.value = "";
  modalMessage.value = "";
  createdSuccess.value = false;
  createdInvitationLink.value = "";
  linkCopied.value = false;
  showModal.value = true;
};

const closeModal = () => {
  if (sending.value) return;

  showModal.value = false;
  modalError.value = "";
  modalMessage.value = "";
  createdSuccess.value = false;
  createdInvitationLink.value = "";
  linkCopied.value = false;
};

const addAdmin = async () => {
  modalError.value = "";

  if (!newAdmin.value.name || !newAdmin.value.email) {
    modalError.value = "Veuillez remplir tous les champs.";
    return;
  }

  const email = newAdmin.value.email.trim().toLowerCase();
  const alreadyExists = allUser.value.some(
    (admin) => admin.email?.toLowerCase() === email
  );

  if (alreadyExists) {
    modalError.value = "Cet email est déjà utilisé par un autre administrateur.";
    return;
  }

  sending.value = true;

  try {
    const result = await inviteAdminService(newAdmin.value.name.trim(), email);

    if (!result.success) {
      modalError.value = result.message;
      return;
    }

    modalMessage.value = result.message;
    createdSuccess.value = true;
    createdInvitationLink.value = result.data?.invitationLink ?? "";

    pageMessage.value = {
      type: result.data?.emailSent ? "success" : "error",
      text: result.message,
    };

    newAdmin.value = { name: "", email: "" };

    await loadUsers();
  } finally {
    sending.value = false;
  }
};

const copyInvitationLink = async () => {
  try {
    await navigator.clipboard.writeText(createdInvitationLink.value);
    linkCopied.value = true;
  } catch (error) {
    console.error("Erreur copie du lien :", error);
    linkCopied.value = false;
  }
};

const removeAdmin = async (admin: User) => {
  if (!confirm(`Supprimer l'administrateur ${admin.name} (${admin.email}) ?`)) return;

  deletingId.value = admin.id;

  try {
    const result = await deleteUserService(admin.id);

    pageMessage.value = {
      type: result.success ? "success" : "error",
      text: result.message,
    };

    if (result.success) {
      await loadUsers();
    }
  } finally {
    deletingId.value = null;
  }
};

onMounted(loadUsers);
</script>
