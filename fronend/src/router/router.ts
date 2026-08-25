import { createWebHistory, createRouter } from "vue-router";
// import UploadDocument from "../pages/UploadDocument.vue";
import SignDocument from "../pages/SignDocument.vue";
import Dashboard from "../pages/Dashboard.vue";
import History from "../pages/History.vue";
import UploadPage from "../pages/UploadPage.vue";
import DocumentDetails from "../pages/documentDetails.vue";
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Dashboard },
    { path: "/upload", component: UploadPage },
    { path: "/signDocument/:token", component: SignDocument },
    { path: "/documentdetails/:id", component: DocumentDetails },
    { path: '/history', component: History },
  ],
});