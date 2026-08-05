<script setup lang="ts">
import { ref, computed } from "vue";
import { Upload, FileText, X } from "lucide-vue-next";
import { uploadDocumentService } from "../data/service";
import Navbar from "../components/Navbar.vue";

const title = ref("");
const recipientEmail = ref("");
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

function openFileDialog() {
  fileInput.value?.click();
}

function handleFile(file: File | null) {
  if (!file) return;
  if (file.type !== "application/pdf") {
    alert("Veuillez sélectionner un fichier PDF.");
    return;
  }
  pdfFile.value = file;
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  handleFile(input.files[0]);
}

const onDrop = (event: DragEvent) => {
  event.preventDefault();

  const file = event.dataTransfer?.files[0];

  if (!file) return;

  handleFile(file);
}

function removeFile() {
  pdfFile.value = null;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

const submit = async () => {
  if (!title.value || !recipientEmail.value || !pdfFile.value) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  // console.log({
  //   title: title.value,
  //   email: recipientEmail.value,
  //   file: pdfFile.value,
  // });

  // API plus tard
  const result = await uploadDocumentService(
    title.value,
    recipientEmail.value,
    pdfFile.value
  );

  if (result) {
    alert("Document envoyé avec succès");
    title.value = "";
    recipientEmail.value = "";
    pdfFile.value = null;
  }
  else {
    alert("Erreur lors de l'envoi du document");
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
    <Navbar />
    <h1 class="mb-8 text-3xl font-bold">Envoyer un document</h1>
    <div class="space-y-6">
      <div>
        <label class="mb-2 block font-medium">Titre</label>
        <input v-model="title" type="text" placeholder="Contrat de travail"
          class="w-full rounded-xl border p-3 focus:border-emerald-500 focus:outline-none" />
      </div>
      <div>
        <label class="mb-2 block font-medium">Email du destinataire</label>
        <input v-model="recipientEmail" type="email" placeholder="client@email.com"
          class="w-full rounded-xl border p-3 focus:border-emerald-500 focus:outline-none" />
      </div>

      <div
        class="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center transition hover:border-emerald-500"
        @dragover.prevent @drop="onDrop" @click="openFileDialog">
        <input ref="fileInput" type="file" accept="application/pdf" class="hidden" @change="onFileChange" />
        <Upload class="mx-auto mb-4" :size="45" />
        <p class="font-semibold">Déposez votre PDF ici</p>
        <p class="mt-2 text-sm text-gray-500">
          ou cliquez pour sélectionner un fichier
        </p>
      </div>
      <div v-if="pdfFile" class="flex items-center justify-between rounded-xl border bg-gray-50 p-4">
        <div class="flex items-center gap-3">
          <FileText class="text-red-500" />
          <div>
            <p class="font-medium">{{ pdfFile.name }}</p>
            <p class="text-sm text-gray-500">{{ fileSize }}</p>
          </div>
        </div>
        <button class="text-red-500 hover:text-red-700" @click="removeFile">
          <X />
        </button>
      </div>
      <button class="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
        @click="submit">
        Envoyer le document
      </button>
    </div>
  </div>
</template>