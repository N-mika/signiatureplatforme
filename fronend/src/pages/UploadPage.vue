<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <main class="p-6 lg:p-8">
      <div class="mx-auto h-[80vh] overflow-auto">
        <div class="flex flex-col gap-6">

          <!-- Formulaire -->
          <div class="rounded-2xl bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-6">

              <!-- Informations -->
              <div class="flex flex-col gap-1">
                <h2 class="font-semibold text-aesna-black">Informations du document</h2>
                <p class="text-sm text-gray-400">
                  Renseignez les informations nécessaires avant l'envoi.
                </p>
              </div>

              <!-- Titre -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700">Titre du document</label>

                <div class="relative">
                  <FileText :size="19" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input v-model="title" type="text" placeholder="Ex. Carte Mika"
                    class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-aesna-black outline-none transition placeholder:text-gray-400 focus:border-aesna-green focus:ring-2 focus:ring-aesna-green/10" />
                </div>
              </div>

              <!-- Signataires -->
              <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                  <h2 class="font-semibold text-aesna-black">Signataires</h2>
                  <p class="text-sm text-gray-400">
                    Les personnes qui devront signer le document.
                  </p>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <!-- Président -->
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">Président</label>

                    <div class="relative">
                      <User :size="19" class="absolute left-3 top-1/2 -translate-y-1/2 text-aesna-green" />

                      <input v-model="presidentEmail" type="email" placeholder="president@email.com"
                        class="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-aesna-green focus:ring-2 focus:ring-aesna-green/10" />
                    </div>
                  </div>

                  <!-- Membre -->
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-gray-700">Membre</label>

                    <div class="relative">
                      <User :size="19" class="absolute left-3 top-1/2 -translate-y-1/2 text-aesna-blue" />

                      <input v-model="memberEmail" type="email" placeholder="membre@email.com"
                        class="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-aesna-blue focus:ring-2 focus:ring-aesna-blue/10" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Upload -->
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1">
                  <h2 class="font-semibold text-aesna-black">Document PDF</h2>
                  <p class="text-sm text-gray-400">
                    Sélectionnez le document que vous souhaitez faire signer.
                  </p>
                </div>

                <input ref="fileInput" type="file" accept="application/pdf" class="hidden" @change="onFileChange" />

                <!-- Zone upload -->
                <button v-if="!pdfFile" type="button"
                  class="group flex min-h-44 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 transition hover:border-aesna-green hover:bg-aesna-green/5"
                  @click="openFileDialog">
                  <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-aesna-green/10 transition group-hover:bg-aesna-green/15">
                    <Upload :size="26" class="text-aesna-green" />
                  </div>

                  <div class="flex flex-col items-center gap-1">
                    <span class="font-semibold text-aesna-black">
                      Sélectionner un PDF
                    </span>
                    <span class="text-sm text-gray-400">
                      Cliquez ici pour choisir votre fichier
                    </span>
                  </div>
                </button>

                <!-- Fichier sélectionné -->
                <div v-else
                  class="flex items-center justify-between gap-4 rounded-xl border border-aesna-green/20 bg-aesna-green/5 p-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <FileText :size="22" class="text-red-500" />
                    </div>

                    <div class="flex min-w-0 flex-col gap-1">
                      <span class="truncate text-sm font-semibold text-aesna-black">
                        {{ pdfFile.name }}
                      </span>
                      <span class="text-xs text-gray-400">
                        PDF · {{ fileSize }}
                      </span>
                    </div>
                  </div>

                  <button type="button"
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Supprimer le fichier" @click="removeFile">
                    <X :size="19" />
                  </button>
                </div>
              </div>

              <!-- Résumé -->
              <div class="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <div class="mb-4 flex items-center gap-2">
                  <Send :size="18" class="text-aesna-green" />
                  <h3 class="text-sm font-semibold text-aesna-black">
                    Résumé de l'envoi
                  </h3>
                </div>

                <div class="flex flex-col gap-3 text-sm">
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-gray-500">Document</span>
                    <span class="max-w-[60%] truncate font-medium text-gray-800">
                      {{ title || "Non renseigné" }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-4">
                    <span class="text-gray-500">Président</span>
                    <span class="max-w-[60%] truncate font-medium text-gray-800">
                      {{ presidentEmail || "Non renseigné" }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-4">
                    <span class="text-gray-500">Membre</span>
                    <span class="max-w-[60%] truncate font-medium text-gray-800">
                      {{ memberEmail || "Non renseigné" }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Bouton -->
              <button type="button" :disabled="!title || !presidentEmail || !memberEmail || !pdfFile || loading"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-aesna-green py-3.5 text-sm font-semibold text-white transition bg-primary hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                @click="submit">
                <Loader2 v-if="loading" :size="19" class="animate-spin" />
                <Send v-else :size="19" />
                <span>
                  {{ loading ? "Envoi en cours..." : "Envoyer pour signature" }}
                </span>
              </button>
            </div>
          </div>

          <!-- Information -->
          <div class="flex gap-3 rounded-xl border border-aesna-blue/20 bg-aesna-blue/5 p-4">
            <Info :size="19" class="mt-0.5 shrink-0 text-aesna-blue" />

            <p class="text-sm leading-5 text-gray-600">
              Une fois envoyé, chaque signataire recevra un accès lui permettant
              de signer le document. Vous pourrez ensuite suivre leur progression
              depuis le suivie.
            </p>
          </div>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Upload, FileText, X, User, Send, Info, Loader2 } from "lucide-vue-next";
import Navbar from "../components/Navbar.vue";
import { uploadDocumentService } from "../data/service";

const title = ref("");
const presidentEmail = ref("");
const memberEmail = ref("");
const pdfFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);

const fileSize = computed(() => {
  if (!pdfFile.value) return "";

  const size = pdfFile.value.size;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
});

const openFileDialog = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  const file = input.files[0];

  if (file.type !== "application/pdf") {
    alert("Veuillez sélectionner un fichier PDF.");
    input.value = "";
    return;
  }

  pdfFile.value = file;
};

const removeFile = () => {
  pdfFile.value = null;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const submit = async () => {
  if (!title.value || !presidentEmail.value || !memberEmail.value || !pdfFile.value) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  try {
    loading.value = true;

    const result = await uploadDocumentService(
      title.value,
      presidentEmail.value,
      memberEmail.value,
      pdfFile.value
    );

    if (!result) {
      alert("Erreur lors de l'envoi.");
      return;
    }

    alert("Document envoyé avec succès.");

    title.value = "";
    presidentEmail.value = "";
    memberEmail.value = "";
    removeFile();
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
    alert("Une erreur est survenue lors de l'envoi.");
  } finally {
    loading.value = false;
  }
};
</script>