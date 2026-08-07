<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
      <h1 class="mb-6 text-3xl font-bold">Signature du {{ documentData?.title }}</h1>
      <div class="mb-8 overflow-hidden rounded-xl border">
        <VuePdfEmbed v-if="pdfUrl" :source="pdfUrl" class="pdf-viewer" />
      </div>
      <!-- Zone signature -->
      <div v-if="!documentData?.tokenUsed">
        <h2 class="mb-3 text-xl font-semibold">Votre signature</h2>
        <div class="rounded-xl border bg-gray-50 p-4">
          <canvas ref="canvas" width="600" height="220" class="rounded-lg border bg-white" />
        </div>
        <div class="mt-4 flex gap-4">
          <button class="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100" @click="clearSignature">
            <Eraser :size="20" />Effacer
          </button>
          <button class="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
            @click="saveSignature">
            <CheckCircle :size="20" />
            Valider la signature
          </button>
        </div>
      </div>
      <!-- Bouton final -->
      <button v-if="!documentData?.tokenUsed"
        class="mt-8 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700"
        @click="signDocument">
        Signer le document
      </button>
      <div v-else class="mt-8 rounded-xl bg-green-100 p-6 text-center text-green-700">
        <div class="text-lg font-semibold text-center flex items-center gap-2">
          <CheckCircle :size="20" /> Le document a été signé avec succès.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import SignaturePad from "signature_pad";
import type { Document } from "../data/type";
import { onGetByIdService, signDocumentService } from "../data/service";
import VuePdfEmbed from "vue-pdf-embed";
import { CheckCircle, Eraser } from "lucide-vue-next";

const route = useRoute();
const token = route.params.token as string;

const canvas = ref<HTMLCanvasElement | null>(null);
let signaturePad: SignaturePad | null = null;

const pdfUrl = ref<string>("");
const documentData = ref<Document | null>(null);

const signatureImage = ref<string | null>(null);

const loading = ref<boolean>(true);
const error = ref<string>("");

onMounted(async () => {

  if (canvas.value) {
    signaturePad = new SignaturePad(canvas.value, { penColor: "black" });
  }
  await onLoadDocument();
});

const onLoadDocument = async () => {
  loading.value = true;
  const response = await onGetByIdService<Document>("sign", token);

  if (!response) {

    error.value = "Document introuvable";

    loading.value = false;

    return;

  }

  documentData.value = response;

  pdfUrl.value = `http://localhost:3000/file/${token}`;

  loading.value = false;

};
// Effacer signature
const clearSignature = () => {
  signaturePad?.clear();
  signatureImage.value = null;
};

// Enregistrer signature
const saveSignature = () => {

  if (!signaturePad || signaturePad.isEmpty()) {
    alert("Veuillez ajouter votre signature" );
    return;
  }
  signatureImage.value = signaturePad.toDataURL("image/png");
  console.log(signatureImage.value);
}

const signDocument = async () => {
  if (!signaturePad) return;
  if (signaturePad.isEmpty()) {
    alert("Veuillez signer le document");
    return;
  }
  const signature = signaturePad.toDataURL("image/png");
  if (documentData.value) {
    const result = await signDocumentService(token, signature, documentData.value?.signaturePositions);
    if (result === "success") {
      alert("Document signé avec succès");
      onLoadDocument();
    } else {
      alert("Une erreur est survenue.");
    }
  }
};

</script>
