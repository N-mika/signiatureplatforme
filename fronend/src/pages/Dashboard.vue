<script setup lang="ts">
import { computed } from "vue";
import { documentsMock } from "../data/documents.mock";
import { Upload } from "lucide-vue-next";
import Navbar from "../components/Navbar.vue";

const documents = documentsMock;

const totalDocuments = computed(() =>
  documents.length
);

const pendingDocuments = computed(() =>
  documents.filter(
    doc => doc.status === "En attente"
  ).length
);


const signedDocuments = computed(() =>
  documents.filter(
    doc => doc.status === "Signé"
  ).length
);


const expiredDocuments = computed(() =>
  documents.filter(
    doc => doc.status === "Expiré"
  ).length
);


</script>
<template>
    <Navbar />
  <div class="min-h-screen bg-gray-100">
    <main class="p-8">
      <div class="mx-auto max-w-7xl">
        <h1 class="mb-8 text-3xl font-bold">
          Dashboard
        </h1>
        <!-- Statistiques -->
        <div class="grid gap-6 md:grid-cols-4">
          <div class="rounded-2xl bg-white p-6 shadow">
            <p class="text-gray-500">Documents</p>
            <p class="mt-2 text-3xl font-bold">{{ totalDocuments }}</p>
          </div>
          <div class="rounded-2xl bg-white p-6 shadow">
            <p class="text-gray-500">En attente</p>
            <p class="mt-2 text-3xl font-bold text-yellow-500">{{ pendingDocuments }}</p>
          </div>
          <div class="rounded-2xl bg-white p-6 shadow">
            <p class="text-gray-500"> Signés</p>
            <p class="mt-2 text-3xl font-bold text-green-600">
              {{ signedDocuments }}
            </p>
          </div>
          <div class="rounded-2xl bg-white p-6 shadow">
            <p class="text-gray-500">Expirés</p>
            <p class="mt-2 text-3xl font-bold text-red-500">{{ expiredDocuments }}</p>
          </div>
        </div>
        <!-- Liste documents -->
        <div class="mt-10 rounded-2xl bg-white p-6 shadow">
          <div class="mb-6 flex justify-between">
            <h2 class="text-xl font-bold">Documents récents</h2>
            <button class="rounded-xl bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700">
              <RouterLink to="/upload" class="flex items-center gap-2">
                <Upload :size="20" /> Nouveau document
              </RouterLink>
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b text-left">
                  <th class="p-3">
                    Document
                  </th>
                  <th class="p-3">
                    Destinataire
                  </th>
                  <th class="p-3">
                    Statut
                  </th>
                  <th class="p-3">
                    Créé le
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="document in documents" :key="document.id" class="border-b hover:bg-gray-50">
                  <td class="p-3 font-medium">
                    {{ document.title }}
                  </td>
                  <td class="p-3">
                    {{ document.recipientEmail }}
                  </td>
                  <td class="p-3">
                    <span v-if="document.status === 'Signé'"
                      class="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      {{ document.status }}
                    </span>
                    <span v-else-if="document.status === 'En attente'"
                      class="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                      {{ document.status }}
                    </span>
                    <span v-else class="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                      {{ document.status }}
                    </span>
                  </td>
                  <td class="p-3">
                    {{ document.createdAt }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>