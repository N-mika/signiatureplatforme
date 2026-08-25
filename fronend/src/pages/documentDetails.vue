<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <Loading v-if="loading" />
    <main v-else class="p-6 lg:p-8">
      <div v-if="documentData" class="mx-auto flex max-w-7xl flex-col gap-6">

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">

          <!-- PDF -->
          <section class="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div class="flex items-center justify-between border-b px-5 py-4">
              <div class="flex items-center gap-3">
                <FileText :size="20" class="text-aesna-green" />
                <div>
                  <h2 class="font-semibold text-aesna-black">
                    Document
                  </h2>
                  <p class="text-xs text-gray-400">
                    Aperçu du fichier PDF
                  </p>
                </div>
              </div>
            </div>

            <div class="overflow-auto bg-gray-100 p-4">
              <div class="mx-auto overflow-hidden rounded-lg bg-white shadow">
                <VuePdfEmbed  v-if="pdfUrl" :source="pdfUrl" class="pdf-viewer"/>
              </div>
            </div>
          </section>

          <!-- Informations -->
          <aside class="flex flex-col gap-6">

            <!-- Résumé -->
            <section class="rounded-2xl bg-white p-5 shadow-sm">
              <h2 class="mb-4 font-semibold text-aesna-black">
                Informations
              </h2>

              <div class="flex flex-col gap-4">
                <div>
                  <p class="text-xs text-gray-400">Document</p>
                  <p class="mt-1 font-medium text-gray-800">
                    {{ documentData.title }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-gray-400">Création</p>
                  <p class="mt-1 text-sm text-gray-700">
                    {{ formatDate(documentData.createdAt) }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-gray-400">Signature finale</p>
                  <p class="mt-1 text-sm text-gray-700">
                    {{ documentData.signedAt ? formatDate(documentData.signedAt) : "Pas encore signé" }}
                  </p>
                </div>
              </div>
            </section>

            <!-- Progression -->
            <section class="rounded-2xl bg-white p-5 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="font-semibold text-aesna-black">
                  Progression
                </h2>

                <span class="text-sm font-semibold text-aesna-green">
                  {{ signedCount }}/{{ totalSigners }}
                </span>
              </div>

              <div class="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  class="h-full rounded-full bg-aesna-green transition-all"
                  :style="{ width: `${progress}%` }"
                />
              </div>

              <p class="mt-3 text-sm text-gray-500">
                {{ progressText }}
              </p>
            </section>

            <!-- Signataires -->
            <section class="rounded-2xl bg-white p-5 shadow-sm">
              <div class="mb-4">
                <h2 class="font-semibold text-aesna-black">
                  Signataires
                </h2>
                <p class="text-xs text-gray-400">
                  État des signatures
                </p>
              </div>

              <div class="flex flex-col gap-3">

                <!-- Président -->
                <div v-if="documentData.signers?.president" class="rounded-xl border border-gray-100 p-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <div
                        :class="[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          documentData.signers.president.signed
                            ? 'bg-aesna-green/10 text-aesna-green'
                            : 'bg-yellow-50 text-yellow-600'
                        ]"
                      >
                        <Check
                          v-if="documentData.signers.president.signed"
                          :size="20"
                        />
                        <Clock v-else :size="20" />
                      </div>

                      <div class="min-w-0">
                        <p class="font-medium text-gray-800">
                          Président
                        </p>
                        <p class="truncate text-xs text-gray-400">
                          {{ documentData.signers.president.email }}
                        </p>
                      </div>
                    </div>

                    <span
                      :class="[
                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                        documentData.signers.president.signed
                          ? 'bg-aesna-green/10 text-aesna-green'
                          : 'bg-yellow-50 text-yellow-600'
                      ]"
                    >
                      {{
                        documentData.signers.president.signed
                          ? "Signé"
                          : "En attente"
                      }}
                    </span>
                  </div>

                  <div
                    v-if="documentData.signers.president.signedAt"
                    class="mt-3 border-t pt-3 text-xs text-gray-400"
                  >
                    Signé le
                    {{ formatDate(documentData.signers.president.signedAt) }}
                  </div>
                </div>

                <!-- Membre -->
                <div
                  v-if="documentData.signers?.member"
                  class="rounded-xl border border-gray-100 p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <div
                        :class="[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          documentData.signers.member.signed
                            ? 'bg-aesna-green/10 text-aesna-green'
                            : 'bg-yellow-50 text-yellow-600'
                        ]"
                      >
                        <Check
                          v-if="documentData.signers.member.signed"
                          :size="20"
                        />
                        <Clock v-else :size="20" />
                      </div>

                      <div class="min-w-0">
                        <p class="font-medium text-gray-800">
                          Membre
                        </p>
                        <p class="truncate text-xs text-gray-400">
                          {{ documentData.signers.member.email }}
                        </p>
                      </div>
                    </div>

                    <span
                      :class="[
                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                        documentData.signers.member.signed
                          ? 'bg-aesna-green/10 text-aesna-green'
                          : 'bg-yellow-50 text-yellow-600'
                      ]"
                    >
                      {{
                        documentData.signers.member.signed
                          ? "Signé"
                          : "En attente"
                      }}
                    </span>
                  </div>

                  <div
                    v-if="documentData.signers.member.signedAt"
                    class="mt-3 border-t pt-3 text-xs text-gray-400"
                  >
                    Signé le
                    {{ formatDate(documentData.signers.member.signedAt) }}
                  </div>
                </div>

              </div>
            </section>

          </aside>
        </div>

        <!-- Erreur -->
        <div
          v-if="error"
          class="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {{ error }}
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Check, Clock, FileText } from "lucide-vue-next";
import VuePdfEmbed from "vue-pdf-embed";

import { API, onGetByIdService } from "../data/service";
import Loading from "../components/Loading.vue";
import type { Document } from "../data/type.ts";
import Navbar from "../components/Navbar.vue";

const route = useRoute();
const id = route.params.id as string;

const pdfUrl = ref("");
const documentData = ref<Document | null>(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  await onLoadDocument();
});

const onLoadDocument = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await onGetByIdService<Document>("document", id);

    if (!response) {
      error.value = "Document introuvable";
      return;
    }

    documentData.value = response;
    pdfUrl.value = `${API}/file/${documentData.value.signers.member.signatureToken}?t=${Date.now()}`;
  } catch (err) {
    console.error("Erreur chargement document :", err);
    error.value = "Impossible de charger le document";
  } finally {
    loading.value = false;
  }
};

const signers = computed(() => {
  if (!documentData.value?.signers) return [];

  return [
    documentData.value.signers.president,
    documentData.value.signers.member
  ].filter(Boolean);
});

const signedCount = computed(() => {
  return signers.value.filter((signer) => signer?.signed).length;
});

const totalSigners = computed(() => signers.value.length);

const progress = computed(() => {
  if (!totalSigners.value) return 0;

  return Math.round(
    (signedCount.value / totalSigners.value) * 100
  );
});

const progressText = computed(() => {
  if (progress.value === 100) {
    return "Tous les signataires ont signé le document.";
  }

  if (progress.value === 0) {
    return "Aucun signataire n'a encore signé.";
  }

  return `${signedCount.value} signataire(s) sur ${totalSigners.value} ont signé.`;
});

function formatDate(date?: string | Date | null) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
</script>