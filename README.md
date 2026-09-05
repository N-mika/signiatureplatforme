# Signature Carte membre AESNA

Plateforme web de gestion et de signature électronique des documents de l'AESNA.

L'application permet de créer des documents, d'inviter des signataires, de positionner les signatures sur les PDF et de suivre l'état de signature des documents.

## 📋 Fonctionnalités

- 📄 Upload de documents PDF
- 👤 Gestion des utilisateurs et des signataires
- ✉️ Envoi d'invitations par email
- 🔐 Génération de liens de signature sécurisés
- ✍️ Signature électronique directement depuis le navigateur
- 📍 Positionnement de la signature sur le PDF
- 👥 Signature par deux personnes :
  - Président
  - Membre
- 📊 Suivi du statut des documents :
  - `En attente`
  - `En cours`
  - `Signé`
- 📄 Génération du document final avec les signatures
- ☁️ Stockage des fichiers avec Supabase Storage
- 🗄️ Stockage des informations avec MongoDB Atlas
- 📥 Téléchargement des documents signés

## 🏗️ Architecture

Le projet est organisé dans un seul repository contenant le frontend et le backend.

```text
signiatureplatforme/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── data/
│   │   ├── tools/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── ...
│   ├── package.json
│   └── ...
│
└── README.md
```

## 🛠️ Technologies utilisées

### Frontend

- Vue.js
- TypeScript
- Vite
- Tailwind CSS
- Vue Router
- Axios
- Vue PDF Embed
- Signature Pad
- Lucide Vue Next

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- PDF-Lib
- Nodemailer
- dotenv
- CORS

### Services externes

- MongoDB Atlas — base de données
- Supabase Storage — stockage des fichiers PDF
- Gmail — envoi des emails

## 🔄 Fonctionnement

### 1. Création d'un document

Un administrateur importe un fichier PDF depuis l'interface.

Le fichier est envoyé vers Supabase Storage.

```text
Frontend
   ↓
Supabase Storage
   ↓
original/<uuid>.pdf
```

Les informations du document sont ensuite enregistrées dans MongoDB.

### 2. Ajout des signataires

Chaque document possède deux signataires :

```text
Président
Membre
```

Chaque signataire possède :

- une adresse email
- un rôle
- un token de signature
- une position de signature
- un statut de signature

### 3. Invitation

Un email est envoyé au signataire avec un lien personnel.

```text
https://frontend-url/signdocument/<token>
```

Le token permet d'identifier le document et le signataire.

### 4. Signature

Le signataire ouvre son lien et peut :

1. consulter le PDF ;
2. dessiner sa signature ;
3. valider sa signature ;
4. signer le document.

La signature est ensuite intégrée au PDF avec `pdf-lib`.

### 5. Signature des deux personnes

Lorsqu'une seule personne a signé, le document passe à :

```text
En cours
```

Lorsque le Président et le Membre ont tous les deux signé :

```text
Signé
```

Le document final est alors enregistré dans Supabase Storage.

```text
original/
working/
signed/
```

## ☁️ Stockage Supabase

Les fichiers PDF sont stockés dans le bucket :

```text
aesnasignature
```

Organisation utilisée :

```text
aesnasignature/
│
├── original/
│   └── document.pdf
│
├── working/
│   └── document.pdf
│
└── signed/
    └── signed-document.pdf
```

Le bucket peut rester privé. Les fichiers sont accessibles à travers des URLs signées lorsque cela est nécessaire.

## 🗄️ Base de données

Les informations concernant les documents et les utilisateurs sont stockées dans MongoDB Atlas.

Un document contient notamment :

```text
title
originalFile
signedFile
signers
status
signedAt
```

Chaque fichier contient :

```text
name
path
size
type
```

## 🔐 Sécurité

Le système utilise des tokens uniques pour les liens de signature.

Un token est associé à un signataire spécifique.

Une fois la signature effectuée :

```text
tokenUsed = true
signed = true
```

Le même lien ne peut donc pas être utilisé pour signer plusieurs fois.

Les fichiers PDF sont stockés dans un bucket Supabase privé et peuvent être servis avec des URLs signées temporaires.

## ⚙️ Installation

### Prérequis

Avant de commencer, installer :

- Node.js
- npm ou Yarn
- MongoDB Atlas (C'est deja enligne pas besoin de l'installer juste de connexion)
- un projet Supabase

### Cloner le repository

```bash
git clone https://github.com/N-mika/signiatureplatforme.git
cd signiatureplatforme
```

## 🚀 Installation du frontend

```bash
cd frontend
npm install
```

Créer le fichier :

```text
.env
```

avec les variables nécessaires :

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
je vais vous les envoyer pour le backend
```

Lancer le frontend :

```bash
npm run dev
```

Le frontend sera accessible par défaut sur :

```text
http://localhost:5173
```

## 🚀 Installation du backend

Depuis la racine du projet :

```bash
cd backend
npm install
```

Créer le fichier :

```text
.env
```

avec les variables nécessaires :

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string

FRONTEND_URL=http://localhost:5173

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

EMAIL_USER=your_email
EMAIL_APP_PASSWORD=your_app_password
```

> Ne jamais publier les clés Supabase privées, les mots de passe ou les variables d'environnement dans Git.

Lancer le backend en développement :

```bash
npm run dev
```

Le serveur sera accessible sur :

```text
http://localhost:3000
```

## 📦 Build du backend

```bash
npm run build
```

Puis :

```bash
npm start
```

## 🔌 API principale

Quelques endpoints utilisés par l'application :

### Documents

```text
POST   /upload
GET    /alldocument
GET    /sign/:token
GET    /file/:token
POST   /sign/:token
```

### Utilisateurs

Les endpoints de gestion des utilisateurs permettent notamment de :

- créer un utilisateur ;
- envoyer une invitation ;
- vérifier une invitation ;
- définir un mot de passe ;
- récupérer les utilisateurs.

## 📁 Exemple de document

```json
{
  "title": "Document AESNA",
  "originalFile": {
    "name": "document.pdf",
    "path": "original/xxxx.pdf",
    "size": 150000,
    "type": "application/pdf"
  },
  "status": "En attente",
  "signers": {
    "president": {
      "role": "president",
      "email": "president@example.com",
      "signatureToken": "token",
      "tokenUsed": false,
      "signed": false
    },
    "member": {
      "role": "member",
      "email": "member@example.com",
      "signatureToken": "token",
      "tokenUsed": false,
      "signed": false
    }
  }
}
```

## 🌐 Déploiement

Le projet peut être déployé avec une architecture séparée :

```text
                    ┌──────────────────┐
                    │   Frontend Vue   │
                    │     Vercel       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Backend Express  │
                    │      Render      │
                    └───────┬───┬──────┘
                            │   │
                ┌───────────┘   └────────────┐
                ▼                            ▼
        ┌──────────────┐             ┌──────────────┐
        │ MongoDB Atlas│             │   Supabase   │
        │   Database   │             │    Storage   │
        └──────────────┘             └──────────────┘
```

Les variables d'environnement doivent être configurées directement dans les paramètres de la plateforme de déploiement.

## 🧪 Développement local

Pour développer le projet, lancer deux terminaux.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Puis ouvrir :

```text
http://localhost:5173
```

## 📌 Statuts des documents

| Statut | Description |
|---|---|
| `En attente` | Aucun signataire n'a encore signé |
| `En cours` | Un des deux signataires a signé |
| `Signé` | Les deux signataires ont signé |

## 🎯 Objectif du projet

Ce projet a été développé pour faciliter la gestion et la signature électronique des documents liés aux cartes de membre de l'AESNA.

L'objectif est de remplacer un processus manuel de transmission et de signature des documents par une solution numérique centralisée, simple et accessible depuis un navigateur.

## 👨‍💻 Auteur

**Mika**

Projet développé pour l'AESNA.

---

## 📄 Licence

Ce projet est destiné à un usage interne de l'AESNA.