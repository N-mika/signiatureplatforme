<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <Loading v-if="loading" />
    <div v-else class="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
      <h1 class="mb-6 text-3xl font-bold">
        Signature du {{ documentData?.title }}
      </h1>

      <div v-if="documentData" class="mb-6 text-gray-500">
        Signataire :
        <span class="font-semibold text-gray-800">
          {{ documentData.signer.role === "president" ? "Président" : "Membre" }}
        </span>

        <span class="ml-2">
          ({{ documentData.signer.email }})
        </span>
      </div>

      <div class="mb-8 overflow-hidden rounded-xl border">
        <VuePdfEmbed v-if="pdfUrl" :source="pdfUrl" class="pdf-viewer" />
      </div>

      <div v-if="documentData && !documentData.signer.signed" class="mb-8">
        <h2 class="mb-3 text-xl font-semibold">
          Votre signature
        </h2>

        <div class="rounded-xl border bg-gray-50 p-4">
          <canvas ref="canvas" width="600" height="220" class="w-full rounded-lg border bg-white" />
        </div>

        <div class="mt-4 flex gap-4">
          <button class="flex items-center gap-2 rounded-xl border px-5 py-3 hover:bg-gray-100" @click="clearSignature">
            <Eraser :size="20" />
            Effacer
          </button>

          <button class="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-white hover:bg-emerald-700"
            @click="saveSignature">
            <CheckCircle :size="20" />
            Valider la signature
          </button>
        </div>
      </div>

      <button v-if="documentData && !documentData.signer.signed"
        class="mt-8 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700"
        @click="signDocument">
        Signer le document
      </button>

      <div v-else-if="documentData?.signer.signed" class="mt-8 rounded-xl bg-green-100 p-6 text-center text-green-700">
        <div class="flex items-center justify-center gap-2 text-lg font-semibold">
          <CheckCircle :size="20" />
          Vous avez déjà signé ce document.
        </div>

        <p v-if="documentData.signer.signedAt" class="mt-2 text-sm">
          Signé le {{ new Date(documentData.signer.signedAt).toLocaleString() }}
        </p>
      </div>

      <div v-if="error" class="mt-6 rounded-xl bg-red-100 p-4 text-red-700">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import SignaturePad from "signature_pad";
import type { SignDocument } from "../data/type";
import { API, onGetByIdService, signDocumentService } from "../data/service";
import VuePdfEmbed from "vue-pdf-embed";
import { CheckCircle, Eraser } from "lucide-vue-next";
import Loading from "../components/Loading.vue";


const route = useRoute();
const token = route.params.token as string;

const canvas = ref<HTMLCanvasElement | null>(null);
let signaturePad: SignaturePad | null = null;

const pdfUrl = ref("");
const documentData = ref<SignDocument | null>(null);
const signatureImage = ref<string | null>(null);

const loading = ref(true);
const error = ref("");

onMounted(async () => {
  await onLoadDocument();
});

const onLoadDocument = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await onGetByIdService<SignDocument>("sign", token);

    if (!response) {
      error.value = "Document introuvable";
      return;
    }

    documentData.value = response;
    pdfUrl.value = `${API}/file/${token}`;

    loading.value = false;

    await nextTick();

    if (canvas.value && !response.signer.signed) {
      signaturePad?.off();

      signaturePad = new SignaturePad(canvas.value, {
        penColor: "black",
        minWidth: 2,
        maxWidth: 4
      });
    }
  } catch (err) {
    console.error("Erreur chargement document :", err);
    error.value = "Impossible de charger le document";
    loading.value = false;
  }
};

const clearSignature = () => {
  signaturePad?.clear();
  signatureImage.value = null;
};

const saveSignature = () => {
  if (!signaturePad || signaturePad.isEmpty()) {
    alert("Veuillez ajouter votre signature");
    return;
  }

  signatureImage.value = signaturePad.toDataURL("image/png");
};

const signDocument = async () => {
  if (!signaturePad || signaturePad.isEmpty()) {
    alert("Veuillez signer le document");
    return;
  }

  try {
    const signature = signaturePad.toDataURL("image/png");

    const result = await signDocumentService(
      token,
      signature
    );

    if (result === "success") {

      await onLoadDocument();
      // alert("Document signé avec succès");

      signaturePad?.clear();
      signatureImage.value = null;
    } else {
      alert("Une erreur est survenue.");
    }
  } catch (err) {
    console.error("Erreur signature :", err);
    alert("Une erreur est survenue.");
  }
};
</script>