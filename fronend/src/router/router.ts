import { createWebHistory, createRouter } from "vue-router";
import UploadDocument from "../pages/UploadDocument.vue";
import SignDocument from "../pages/SignDocument.vue";
import Dashboard from "../pages/Dashboard.vue";
import History from "../pages/History.vue";
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Dashboard },
    { path: "/upload", component: UploadDocument },
    { path: "/signDocument/:token", component: SignDocument },
    { path: '/history', component: History }
  ],
});