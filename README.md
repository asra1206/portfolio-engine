# ⚡ Portfolio Engine

A SaaS-style portfolio generator. Add client details in the admin panel → get a beautiful live portfolio instantly.

---

## 🚀 Quick Start

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com) → Create a project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** (start in test mode)
4. Enable **Storage**
5. Get your web app config from Project Settings

### 2. Configure the app

Open `src/firebase.js` and fill in:
```js
export const cfg = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  appId: 'YOUR_APP_ID'
};
export const ADMIN_EMAIL = 'your-admin@email.com';
```

### 3. Create admin account
In Firebase Console → Authentication → Add user with the admin email above.

### 4. Run locally
```bash
npm install
npm run dev
```

### 5. Deploy
```bash
npm run build
# Deploy the dist/ folder to Firebase Hosting, Vercel, or Netlify
```

---

## 🏗️ How it Works

```
Admin logs in → Creates client profile → Fills in all details → Saves → Previews → Publishes

Client gets:  /p/{slug}   (live portfolio URL)
              /dashboard  (their own view after login)
```

---

## 📋 Client Profile Fields

| Tab | Fields |
|-----|--------|
| Basic Info | Name, Title, Email, Phone, Location, Bio, Photo |
| Story & Skills | About Me paragraph, Skills (comma-separated) |
| Experience | Role @ Company \| Year Range \| Description |
| Projects | Project Name \| URL \| Description |
| Education | Degree @ Institution \| Year |
| Socials & Domain | GitHub, LinkedIn, Twitter, Website, Custom Domain |
| CV Upload | PDF / ZIP / DOC file |

---

## 🔒 Firebase Security Rules

### Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clients/{clientId} {
      allow read: if resource.data.published == true
                  || request.auth != null && (
                    request.auth.token.email == 'YOUR_ADMIN_EMAIL'
                    || resource.data.uid == request.auth.uid
                  );
      allow write: if request.auth != null
                   && request.auth.token.email == 'YOUR_ADMIN_EMAIL';
    }
  }
}
```

### Storage
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.email == 'YOUR_ADMIN_EMAIL';
    }
  }
}
```

---

## 🗺️ Routes

| Route | Description |
|-------|-------------|
| `/` | Login page |
| `/admin` | Admin dashboard (admin only) |
| `/dashboard` | Client's own portfolio view |
| `/p/:slug` | Public portfolio page |

---

## 🔮 Future Roadmap

- [ ] Multiple portfolio templates / themes
- [ ] Custom domain auto-connect (DNS management)
- [ ] Client self-edit portal
- [ ] Analytics per portfolio
- [ ] Portfolio export as PDF
- [ ] Template marketplace
