<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />

    <div class="mx-auto max-w-3xl p-8">
      <div class="rounded-2xl bg-white p-6 shadow">
        <div class="flex flex-col gap-6">
          <!-- Header -->
          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-bold text-gray-900">
              Nouveau document
            </h1>

            <p class="text-sm text-gray-500">
              Envoyez le document au Président et au Membre pour signature.
            </p>
          </div>

          <!-- Titre -->
          <div class="flex flex-col gap-2">
            <label class="font-medium text-gray-700">
              Titre du document
            </label>

            <input
              v-model="title"
              type="text"
              placeholder="Contrat de travail"
              class="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <!-- Président -->
          <div class="flex flex-col gap-2">
            <label class="font-medium text-gray-700">
              Email du Président
            </label>

            <input
              v-model="presidentEmail"
              type="email"
              placeholder="president@email.com"
              class="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <!-- Membre -->
          <div class="flex flex-col gap-2">
            <label class="font-medium text-gray-700">
              Email du Membre
            </label>

            <input
              v-model="memberEmail"
              type="email"
              placeholder="membre@email.com"
              class="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          <!-- Upload -->
          <div class="flex flex-col gap-2">
            <label class="font-medium text-gray-700">
              Document PDF
            </label>

            <input
              ref="fileInput"
              type="file"
              accept="application/pdf"
              class="hidden"
              @change="onFileChange"
            />

            <button
              type="button"
              class="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 transition hover:border-emerald-500 hover:bg-emerald-50"
              @click="openFileDialog"
            >
              <Upload
                :size="40"
                class="text-gray-400"
              />

              <div class="flex flex-col items-center gap-1">
                <span class="font-semibold text-gray-700">
                  Déposer un PDF
                </span>

                <span class="text-sm text-gray-500">
                  ou cliquez pour sélectionner
                </span>
              </div>
            </button>
          </div>

          <!-- Fichier -->
          <div
            v-if="pdfFile"
            class="flex items-center justify-between rounded-xl border bg-gray-50 p-4"
          >
            <div class="flex min-w-0 items-center gap-3">
              <FileText
                :size="24"
                class="shrink-0 text-red-500"
              />

              <div class="flex min-w-0 flex-col">
                <span class="truncate font-medium">
                  {{ pdfFile.name }}
                </span>

                <span class="text-sm text-gray-500">
                  {{ fileSize }}
                </span>
              </div>
            </div>

            <button
              type="button"
              class="text-red-500 transition hover:text-red-700"
              @click="removeFile"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Destinataires -->
          <div
            class="flex flex-col gap-3 rounded-xl bg-gray-50 p-4"
          >
            <span class="text-sm font-semibold text-gray-700">
              Destinataires
            </span>

            <div class="flex flex-col gap-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">
                  Président
                </span>

                <span class="font-medium text-gray-800">
                  {{ presidentEmail || "-" }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-500">
                  Membre
                </span>

                <span class="font-medium text-gray-800">
                  {{ memberEmail || "-" }}
                </span>
              </div>
            </div>
          </div>

          <!-- Envoyer -->
          <button
            type="button"
            :disabled="
              !title ||
              !presidentEmail ||
              !memberEmail ||
              !pdfFile
            "
            class="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="submit"
          >
            Envoyer pour signature
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Upload, FileText, X } from "lucide-vue-next";
import Navbar from "../components/Navbar.vue";
import { uploadDocumentService } from "../data/service";

const title = ref<string>("");

const presidentEmail = ref<string>("");
const memberEmail = ref<string>("");

const pdfFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

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

  if (!input.files?.length) {
    return;
  }

  const file = input.files[0];

  if (file.type !== "application/pdf") {
    alert("Veuillez sélectionner un fichier PDF.");
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
  if (
    !title.value ||
    !presidentEmail.value ||
    !memberEmail.value ||
    !pdfFile.value
  ) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

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
};
</script>