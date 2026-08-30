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
            @click="showModal = true">
            <UserPlus :size="19" />
            Ajouter un administrateur
          </button>
        </div>

        <!-- Statistique -->


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
                  <th class="p-4 font-medium">Rôle</th>
                  <!-- <th class="p-4 font-medium">Actions</th> -->
                </tr>
              </thead>

              <tbody>
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
                    <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Administrateur
                    </span>
                  </td>
                </tr>

                <!-- Aucun résultat -->
                <tr v-if="filteredAdmins.length === 0">
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

          <button class="text-gray-400 transition hover:text-gray-700" @click="showModal = false">
            <X :size="22" />
          </button>
        </div>

        <div class="flex flex-col gap-4">

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Nom
            </label>

            <input v-model="newAdmin.name" type="text" placeholder="Nom de l'administrateur"
              class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">
              Email
            </label>

            <input v-model="newAdmin.email" type="email" placeholder="admin@email.com"
              class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
          </div>
          <div class="mt-2 flex justify-end gap-3">
            <button
              class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              @click="showModal = false">
              Annuler
            </button>

            <button
              class="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              @click="addAdmin">
              Ajouter
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Users, UserPlus, Search, X } from "lucide-vue-next";
import Navbar from "../components/Navbar.vue";
import type { User } from "../data/type.ts";
import { onAddService, onGetService } from "../data/service.ts";

const allUser = ref<User[]>([]);

const search = ref<string>("");
const showModal = ref<boolean>(false);

const newAdmin = ref<User>({
  id: "",
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

const addAdmin = async () => {
  if (!newAdmin.value.name || !newAdmin.value.email) {
    alert("Veuillez remplir tous les champs.");
    return;
  }
  const user = await onAddService('invitadmin', newAdmin.value);
  if (user === 'success') {
    newAdmin.value = {
      id: "",
      name: "",
      email: "",
    };
    showModal.value = false;
  }

};

onMounted(async () => {
  const response = await onGetService<User>('getalluser');
  allUser.value = response;
  console.log(response)
})
</script>