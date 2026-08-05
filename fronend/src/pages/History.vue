<script setup lang="ts">

import Navbar from "../components/Navbar.vue";
import { documentsMock } from "../data/documents.mock";

const documents = documentsMock;

function statusClass(status: string) {

  if (status === "Signé") {
    return "bg-green-100 text-green-700";
  }


  if (status === "En attente") {
    return "bg-yellow-100 text-yellow-700";
  }


  return "bg-red-100 text-red-700";

}
</script>
<template>
  <div class="min-h-screen bg-gray-100">
      <Navbar />
    <main class="p-8">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8">
          <h1 class="text-3xl font-bold">
            Historique des documents
          </h1>
          <p class="mt-2 text-gray-500">
            Consultez tous les documents envoyés et signés.
          </p>
        </div>
        <div class="rounded-2xl bg-white p-6 shadow">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold">
              Tous les documents
            </h2>
            <div>
              <input type="text" placeholder="Rechercher un document..."
                class="rounded-xl border px-4 py-2 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b text-left text-gray-600">
                  <th class="p-4">
                    Document
                  </th>
                  <th class="p-4">
                    Destinataire
                  </th>
                  <th class="p-4">
                    Statut
                  </th>
                  <th class="p-4">
                    Création
                  </th>
                  <th class="p-4">
                    Signature
                  </th>
                  <th class="p-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="document in documents" :key="document.id" class="border-b hover:bg-gray-50">
                  <td class="p-4 font-medium">
                    {{ document.title }}
                  </td>
                  <td class="p-4">
                    {{ document.recipientEmail }}
                  </td>
                  <td class="p-4">
                    <span :class="[
                      'rounded-full px-3 py-1 text-sm font-medium',
                      statusClass(document.status)
                    ]">

                      {{ document.status }}
                    </span>
                  </td>
                  <td class="p-4 text-gray-600">
                    {{ document.createdAt }}
                  </td>
                  <td class="p-4 text-gray-600">
                    <span v-if="document.signedAt">
                      {{ document.signedAt }}
                    </span>
                    <span v-else class="text-gray-400">
                      Pas encore signé
                    </span>
                  </td>
                  <td class="p-4">
                    <button class="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">
                      Voir
                    </button>
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