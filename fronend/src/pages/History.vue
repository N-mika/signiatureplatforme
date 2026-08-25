<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <main class="p-8">
      <div class="mx-auto h-[80vh] overflow-auto">
        <div class="rounded-2xl bg-white p-6 shadow">
          <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-bold">Tous les documents</h2>
              <p class="text-sm text-gray-500">
                {{ filteredDocuments.length }} document(s)
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <div class="relative">
                <input v-model="search" type="text" placeholder="Rechercher..."
                  class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-emerald-500 sm:w-72" />

                <button v-if="search" @click="search = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  ×
                </button>
              </div>

              <select v-model="selectedStatus"
                class="rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:border-emerald-500">
                <option value="Tous">Tous les statuts</option>
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Signé">Signé</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b text-left text-sm text-gray-500">
                  <th class="p-4 font-medium">Document</th>
                  <th class="p-4 font-medium">Destinataire</th>
                  <th class="p-4 font-medium">Statut</th>
                  <th class="p-4 font-medium">Création</th>
                  <th class="p-4 font-medium">Signature</th>
                  <th class="p-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="document in filteredDocuments" :key="document._id" class="border-b hover:bg-gray-50">
                  <td class="p-4">
                    <div class="flex flex-col gap-1">
                      <span class="font-medium">{{ document.title }}</span>
                      <span class="text-xs text-gray-400">PDF</span>
                    </div>
                  </td>

                  <td class="p-4 text-sm text-gray-600">
                    <div class="flex flex-col gap-1">
                      <span>{{ document.signers.president.email }}</span>
                      <span>{{ document.signers.member.email }} </span>
                    </div>
                  </td>

                  <td class="p-4">
                    <span :class="[
                      'rounded-full px-3 py-1 text-xs font-medium',
                      statusClass(document.status)
                    ]">
                      {{ document.status }}
                    </span>
                  </td>

                  <td class="p-4 text-sm text-gray-600">
                    {{ formatDate(document.createdAt) }}
                  </td>

                  <td class="p-4 text-sm">
                    <span v-if="document.signedAt" class="text-gray-600">
                      {{ formatDate(document.signedAt) }}
                    </span>
                    <span v-else class="text-gray-400">
                      Pas encore signé
                    </span>
                  </td>

                  <td class="p-4">
                    <div class="flex justify-end gap-2">
                      <RouterLink v-if="document.signers?.president?.signatureToken"
                        :to="`/documentdetails/${document._id}`"
                        class="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">
                        Voir
                      </RouterLink>

                      <button v-if="document.status === 'Signé'" @click="downloadDocument(document._id)"
                        :disabled="downloadingId === document._id"
                        class="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-primary hover:bg-emerald-100 disabled:opacity-50">
                        <Download :size="18" />
                        <span v-if="downloadingId === document._id">
                          Téléchargement...
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredDocuments.length === 0">
                  <td colspan="6" class="p-10 text-center">
                    <p class="font-medium text-gray-600">
                      Aucun document trouvé
                    </p>
                    <p class="mt-1 text-sm text-gray-400">
                      Modifiez votre recherche ou votre filtre.
                    </p>
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

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Navbar from "../components/Navbar.vue";
import {
  onDownloadSignedDocumentService,
  onGetService
} from "../data/service.ts";
import type { Document } from "../data/type.ts";
import { Download } from "lucide-vue-next";
import { formatDate } from "../tools/tools.ts";

const documents = ref<Document[]>([]);
const search = ref("");
const selectedStatus = ref("Tous");
const downloadingId = ref<string | null>(null);

onMounted(async () => {
  try {
    documents.value = await onGetService<Document>("alldocument");
  } catch (error) {
    console.error("Erreur récupération documents :", error);
  }
});

const filteredDocuments = computed(() => {
  const value = search.value.trim().toLowerCase();

  return documents.value.filter((document) => {
    const title = document.title?.toLowerCase() || "";
    const email = document.signers?.president?.email?.toLowerCase() || "";

    const matchesSearch =
      !value || title.includes(value) || email.includes(value);

    const matchesStatus =
      selectedStatus.value === "Tous" ||
      document.status === selectedStatus.value;

    return matchesSearch && matchesStatus;
  });
});

const downloadDocument = (id: string) => {
  downloadingId.value = id;
  onDownloadSignedDocumentService(id);

  setTimeout(() => {
    downloadingId.value = null;
  }, 1000);
};

function statusClass(status: string) {
  if (status === "Signé") return "bg-green-100 text-green-700";
  if (status === "En attente") return "bg-yellow-100 text-yellow-700";
  if (status === "En cours") return "bg-blue-100 text-blue-700";
  return "bg-red-100 text-red-700";
}


</script>