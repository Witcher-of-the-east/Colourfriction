# 🎨 Colourfriction

### Your interests. Your space. Your internet.

**Colourfriction** is a customizable, retro-inspired social platform built around personal expression, entertainment, and internet culture. Inspired by the early web, personal homepages, and Neocities-style websites, Colourfriction lets users create a digital space that reflects their personality, interests, and creative identity.

Instead of generic social media profiles, Colourfriction focuses on individuality through customizable layouts, personal media collections, stickers, colors, reviews, and decorative elements.

> The internet used to feel personal. Colourfriction aims to bring that feeling back.

---

## ✨ Features

### 🏠 Personal Homepage
- Create and customize a personal homepage.
- Personalize the appearance of your digital space.
- Organize entertainment interests into custom collections.
- Build a profile that reflects your personality and taste.

### 🎬 Media Stamps
- Explore and organize entertainment media.
- Display media artwork and covers.
- Customize media entries with personal titles and cover images.
- Add personal reviews and ratings.
- Mark favorite media.
- Organize media into personalized shelves.

### 📚 Custom Shelves
- Create your own media shelves.
- Organize collections around your interests.
- Customize shelf names and contents.
- Import and export shelf data.
- Build collections that reflect your individual taste.

### 🎨 Customization and Personalization
- Customize colors and themes.
- Arrange stickers and decorative elements.
- Upload custom sticker images.
- Position decorations around your personal space.
- Experiment with different visual styles.

### 🖼️ Sticker Studio
- Create and manage custom stickers.
- Personalize your homepage with decorative elements.
- Build a more expressive and individual profile.

### ✍️ Personal Reviews
- Write reviews for media you enjoy.
- Add ratings and personal opinions.
- Keep track of your entertainment interests.

### 📖 Guestbook
- Leave messages in the guestbook demonstration.
- Experience a nostalgic feature inspired by classic personal websites.

### 💾 Backup and Restore
- Export personal customization data.
- Restore supported data from backups.
- Import and export supported shelf information.
- Handle local storage errors more gracefully.

---

## 🛠️ Technology Stack

### Frontend
- **React 19** — Component-based user interface.
- **TypeScript** — Type safety and maintainable code.
- **Vite** — Development server and build tooling.
- **CSS** — Custom styling, layouts, themes, and visual effects.
- **Lucide React** — Interface icons.

### Backend — In Development
- **Node.js** — JavaScript runtime.
- **Express** — Backend API framework.
- **TypeScript** — Backend type safety.
- **PostgreSQL** — Relational database.
- **Neon** — Hosted PostgreSQL database provider.
- **node-postgres (`pg`)** — PostgreSQL client for Node.js.
- **dotenv** — Environment variable management.

The backend is being developed separately from the existing React frontend.

---

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js
- Git
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/Witcher-of-the-east/Colourfriction.git
```

### 2. Navigate to the Project

```bash
cd Colourfriction
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 5. Build for Production

To verify the frontend build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🗂️ Project Structure

The project is organized into a React frontend and a separate backend directory.

```text
Colourfriction/
│
├── public/
│   └── Static assets
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── MediaStamps.tsx
│   ├── PersonalHomepage.tsx
│   ├── ProfileEditor.tsx
│   └── styles.css
│
├── server/
│   ├── package.json
│   ├── .env
│   └── Backend source files
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

*The `server` directory is being developed. Its final structure may change as backend functionality is implemented.*

---

## 🗄️ Database and Backend

Colourfriction is transitioning from a primarily browser-based application toward a full-stack platform.

The planned architecture is:

```text
┌───────────────────────────────┐
│       React + TypeScript      │
│          Frontend             │
└───────────────┬───────────────┘
                │
                │ HTTP API Requests
                ▼
┌───────────────────────────────┐
│       Node.js + Express       │
│          Backend API          │
└───────────────┬───────────────┘
                │
                │ PostgreSQL Queries
                ▼
┌───────────────────────────────┐
│       Neon PostgreSQL         │
│        Hosted Database        │
└───────────────────────────────┘
```

The backend will eventually manage:

- User registration and authentication.
- Persistent user profiles.
- Custom homepage configurations.
- Media collections and shelves.
- Media reviews and ratings.
- Stickers and decorative elements.
- Guestbook entries.
- User-specific application data.

The exact database schema and API endpoints will be defined during backend development.

### Database Security

Database credentials must remain on the backend.

- Store the Neon connection string in `server/.env`.
- Never expose database credentials in React components or frontend environment variables.
- Never commit `.env` files to GitHub.
- Validate incoming API requests.
- Protect user-specific operations with appropriate authentication and authorization.

---

## 💾 Current Data Storage

The current frontend uses browser-based storage for supported personal data and customizations.

This means that, until the backend migration is implemented, data may be specific to the browser and device where it was created.

A hosted PostgreSQL database is being introduced to support persistent, account-based data in future versions.

**Important:** A hosted database alone does not provide user accounts or automatic synchronization. Those features require the backend and authentication system to be implemented.

---

## 🗺️ Development Roadmap

### Phase 1 — Frontend Foundation
- Establish the React and TypeScript application.
- Build the initial Colourfriction interface.
- Introduce entertainment collections and personal homepage functionality.

### Phase 2 — Personalization and Media Collections
- Develop the Profile Lab.
- Implement media artwork and stamp customization.
- Add reviews, ratings, and favorites.
- Build custom shelves.
- Create sticker customization tools.
- Add backup, restore, and shelf import/export functionality.
- Improve editor usability and storage error handling.

### Phase 3 — Backend and Database
- Configure hosted PostgreSQL through Neon.
- Build the Node.js and Express API.
- Connect the backend to PostgreSQL.
- Design the relational database schema.
- Implement account registration and authentication.
- Migrate supported browser-based data into persistent user accounts.

### Phase 4 — Full-Stack Integration
- Connect the frontend to the backend API.
- Load and save user profiles through PostgreSQL.
- Persist collections, reviews, and customizations.
- Introduce user-specific data access and authorization.
- Test API integration and error handling.

### Phase 5 — Deployment and Refinement
- Deploy the frontend and backend.
- Configure production environment variables.
- Harden authentication and database access.
- Test the complete application.
- Improve accessibility, responsiveness, and performance.

*Roadmap items describe planned work and are not necessarily implemented yet.*

---

## 🎯 Project Goals

Colourfriction aims to:

- Bring back the individuality of early personal websites.
- Encourage creative self-expression online.
- Make entertainment collections personal and enjoyable.
- Give users greater control over their digital spaces.
- Combine nostalgic web aesthetics with modern full-stack technology.
- Create an extensible foundation for future social features.

---

## 🤝 Contributing

Contributions, suggestions, and creative ideas are welcome.

If you want to contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your implementation.
5. Submit a pull request describing your changes.

Please keep the application's distinctive visual identity and focus on personal expression in mind when proposing new features.

---

## 📌 Project Status

**Current focus:** Completing the frontend personalization experience and establishing the hosted PostgreSQL backend.

The frontend has passed a production build check and has been tested manually in the browser. Backend development and database integration are in progress.

---

## 📄 License

A license has not yet been specified. Until one is added to the repository, do not assume the project is available for unrestricted reuse or redistribution.

---

**Colourfriction — Make the internet yours again.** 💿