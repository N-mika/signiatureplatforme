<template>
  <div class="min-h-screen bg-gray-100">
    <Navbar />
    <div class="mx-auto max-w-7xl p-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Formulaire -->
        <div class="rounded-2xl bg-white p-6 shadow">
          <h1 class="mb-6 text-2xl font-bold">Nouveau document</h1>
          <div class="space-y-5">
            <div>
              <label class="mb-2 block font-medium">Titre</label>
              <input v-model="title" type="text" placeholder="Contrat de travail"
                class="w-full rounded-xl border p-3 outline-none focus:border-emerald-500" />
            </div>

            <div>
              <label class="mb-2 block font-medium">Email du destinataire </label>
              <input v-model="recipientEmail" type="email" placeholder="client@email.com"
                class="w-full rounded-xl border p-3 outline-none focus:border-emerald-500" />
            </div>

            <!-- Upload -->

            <div
              class="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-emerald-500"
              @click="openFileDialog" @dragover.prevent @drop="onDrop">

              <input ref="fileInput" type="file" accept="application/pdf" class="hidden" @change="onFileChange" />
              <Upload class="mx-auto mb-3" :size="45" />
              <p class="font-semibold"> Déposer un PDF</p>
              <p class="mt-2 text-sm text-gray-500">ou cliquez ici</p>
            </div>

            <div v-if="pdfFile" class="flex items-center justify-between rounded-xl border bg-gray-50 p-4">

              <div class="flex items-center gap-3">
                <FileText class="text-red-500" />
                <div>
                  <p class="font-medium">{{ pdfFile.name }}</p>
                  <p class="text-sm text-gray-500">{{ fileSize }}</p>
                </div>
              </div>
              <button class="text-red-500" @click="removeFile">
                <X />
              </button>
            </div>
            <button class="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
              @click="submit">Envoyer le document</button>
          </div>
        </div>

        <!-- Aperçu PDF -->

        <div class="lg:col-span-2">
          <div v-if="pdfPreview" class="rounded-2xl bg-gray-300 p-6 shadow">
            <div ref="pdfContainer" class="relative mx-auto w-fit" @click="placeSignature">
              <VuePdfEmbed :source="pdfPreview" class="pdf-viewer" />
              <div @click.stop
                class="absolute flex items-center justify-center rounded-lg border-2 border-dashed border-blue-600 bg-blue-600/20 text-sm font-bold text-blue-700"
                :style="{
                  left: signaturePosition.x + 'px',
                  top: signaturePosition.y + 'px',
                  width: signaturePosition.width + 'px',
                  height: signaturePosition.height + 'px'
                }">
                ✍ Signature
              </div>
            </div>
          </div>

          <div v-else
            class="flex h-175 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white">
            <div class="text-center text-gray-500">
              <Upload :size="60" class="mx-auto mb-3" />

              <p class="text-lg">
                Sélectionnez un PDF pour commencer
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Upload, FileText, X } from "lucide-vue-next";
import Navbar from "../components/Navbar.vue";
import VuePdfEmbed from "vue-pdf-embed";
import { uploadDocumentService } from "../data/service";
import type { SignaturePosition } from "../data/type.ts";

const title = ref("");
const recipientEmail = ref("");

const pdfFile = ref<File | null>(null);
const pdfPreview = ref("");

const fileInput = ref<HTMLInputElement | null>(null);
const pdfContainer = ref<HTMLElement | null>(null);

const signaturePosition = ref<SignaturePosition>({
  page: 1,
  x: 0,
  y: 0,
  width: 180,
  height: 70,
  pdfWidth: 0,
  pdfHeight: 0,
});

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

const handleFile = (file: File | null) => {
  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Veuillez sélectionner un fichier PDF.");
    return;
  }

  pdfFile.value = file;

  if (pdfPreview.value) {
    URL.revokeObjectURL(pdfPreview.value);
  }

  pdfPreview.value = URL.createObjectURL(file);

  signaturePosition.value = {
    page: 2,
    x: 40,
    y: 40,
    width: 80,
    height: 40,
    pdfWidth: 0,
    pdfHeight: 0
  };
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  handleFile(input.files[0]);
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();

  const file = event.dataTransfer?.files[0];

  if (!file) return;

  handleFile(file);
};

const removeFile = () => {

  if (pdfPreview.value) {
    URL.revokeObjectURL(pdfPreview.value);
  }

  pdfPreview.value = "";
  pdfFile.value = null;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const placeSignature = (event: MouseEvent) => {
  if (!pdfContainer.value) return;
  const rect = pdfContainer.value.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  signaturePosition.value.x = Math.max(0, x - signaturePosition.value.width / 2);
  signaturePosition.value.y = Math.max(0, y - signaturePosition.value.height / 2);
  signaturePosition.value.pdfWidth = pdfContainer.value?.clientWidth;
  signaturePosition.value.pdfHeight = pdfContainer.value?.clientHeight;
};

const submit = async () => {
  if (!title.value || !recipientEmail.value || !pdfFile.value) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const result = await uploadDocumentService(
    title.value,
    recipientEmail.value,
    pdfFile.value,
    signaturePosition.value
  );

  if (result) {
    alert("Document envoyé avec succès.");
    title.value = "";
    recipientEmail.value = "";

    removeFile();
  } else {
    alert("Erreur lors de l'envoi.");
  }
};
</script>
