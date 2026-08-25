<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { FileText, Clock, CheckCircle, Upload } from "lucide-vue-next";
import Navbar from "../components/Navbar.vue";
import { onGetService } from "../data/service";
import type { Document } from "../data/type";
import { formatDate } from "../tools/tools.ts";

const documents = ref<Document[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    documents.value = await onGetService<Document>("alldocument");
  } catch (error) {
    console.error("Erreur récupération documents :", error);
  } finally {
    loading.value = false;
  }
});

const totalDocuments = computed(() => documents.value.length);

const pendingDocuments = computed(() =>
  documents.value.filter(doc => doc.status === "En attente").length
);

const inProgressDocuments = computed(() =>
  documents.value.filter(doc => doc.status === "En cours").length
);

const signedDocuments = computed(() =>
  documents.value.filter(doc => doc.status === "Signé").length
);

const recentDocuments = computed(() =>
  [...documents.value].sort((a, b) =>
    new Date(b.createdAt || "").getTime() -
    new Date(a.createdAt || "").getTime())
    .slice(0, 5)
);

function statusClass(status: string) {
  if (status === "Signé") {
    return "bg-aesna-green/10 text-aesna-green";
  }

  if (status === "En cours") {
    return "bg-aesna-blue/10 text-aesna-blue";
  }

  return "bg-aesna-yellow/20 text-yellow-700";
}

</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <main class="p-6 lg:p-8">
      <div class="mx-auto flex flex-col gap-6 h-[80vh] overflow-auto">

        <!-- Statistiques -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-1">
              <span class="text-sm text-gray-500">Documents</span>
              <span class="text-3xl font-bold text-aesna-black">
                {{ totalDocuments }}
              </span>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-aesna-blue/10 text-aesna-blue">
              <FileText :size="22" />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-1">
              <span class="text-sm text-gray-500">En attente</span>
              <span class="text-3xl font-bold text-yellow-600">
                {{ pendingDocuments }}
              </span>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-aesna-yellow/20 text-yellow-600">
              <Clock :size="22" />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-1">
              <span class="text-sm text-gray-500">En cours</span>
              <span class="text-3xl font-bold text-aesna-blue">
                {{ inProgressDocuments }}
              </span>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-aesna-blue/10 text-aesna-blue">
              <Clock :size="22" />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-1">
              <span class="text-sm text-gray-500">Signés</span>
              <span class="text-3xl font-bold text-aesna-green">
                {{ signedDocuments }}
              </span>
            </div>

            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-aesna-green/10 text-aesna-green">
              <CheckCircle :size="22" />
            </div>
          </div>

        </div>

        <!-- Documents récents -->
        <div class="rounded-2xl bg-white p-6 shadow-sm">

          <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-bold text-aesna-black">
                Documents récents
              </h2>
              <p class="text-sm text-gray-500">
                Les derniers documents ajoutés.
              </p>
            </div>

            <RouterLink to="/upload"
              class="flex w-fit items-center gap-2 rounded-xl bg-aesna-green px-4 py-2.5 text-sm font-medium text-white transition hover:bg-aesna-green/90">
              <Upload :size="18" />
              Nouveau document
            </RouterLink>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-12 text-gray-400">
            Chargement des documents...
          </div>

          <!-- Tableau -->
          <div v-else-if="recentDocuments.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b text-left text-sm text-gray-500">
                  <th class="p-3 font-medium">Document</th>
                  <th class="p-3 font-medium">Destinataire</th>
                  <th class="p-3 font-medium">Statut</th>
                  <th class="p-3 font-medium">Créé le</th>
                  <!-- <th class="p-3 text-right font-medium">Action</th> -->
                </tr>
              </thead>

              <tbody>
                <tr v-for="document in recentDocuments" :key="document._id"
                  class="border-b transition hover:bg-gray-50">
                  <td class="p-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                        <FileText :size="18" class="text-aesna-green" />
                      </div>

                      <div class="flex min-w-0 flex-col">
                        <span class="max-w-xs truncate font-medium text-gray-800">
                          {{ document.title }}
                        </span>
                        <span class="text-xs text-gray-400">
                          PDF
                        </span>
                      </div>
                    </div>
                  </td>

                  <td class="p-3 text-sm text-gray-600">
                    {{ document.signers?.president?.email || "Non défini" }}
                  </td>

                  <td class="p-3">
                    <span :class="[
                      'rounded-full px-3 py-1 text-xs font-medium',
                      statusClass(document.status)
                    ]">
                      {{ document.status }}
                    </span>
                  </td>

                  <td class="p-3 text-sm text-gray-600">
                    {{ formatDate(document.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Aucun document -->
          <div v-else class="flex flex-col items-center gap-2 py-12 text-center">
            <FileText :size="40" class="text-gray-300" />

            <p class="font-medium text-gray-600">
              Aucun document
            </p>

            <p class="text-sm text-gray-400">
              Commencez par envoyer votre premier document.
            </p>

            <RouterLink to="/upload"
              class="mt-2 rounded-lg bg-aesna-green px-4 py-2 text-sm font-medium text-white hover:bg-aesna-green/90">
              Envoyer un document
            </RouterLink>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>