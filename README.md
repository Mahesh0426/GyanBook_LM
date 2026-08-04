# 📚 gyanbookLM

**gyanbookLM** is an AI-powered knowledge companion inspired by [NotebookLM](https://notebooklm.google.com/). Upload your documents, notes, and references — and have an intelligent conversation with your content.

---

## ✨ Features

- 📄 Upload and manage personal knowledge sources
- 💬 Chat with your documents using AI
- 🔍 Source-grounded responses — no hallucinations
- 🌐 Clean, responsive web interface

---

## 🛠️ Tech Stack

| Layer    | Technology                            |
| -------- | ------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend  | Node.js, Express v5, TypeScript       |
| Runtime  | tsx, nodemon                          |
| Package  | pnpm                                  |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v10+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd notebookLLM_clone

# Install server dependencies
cd server
pnpm install

# Install client dependencies
cd ../client
pnpm install
```

### Running in Development

**Start the backend server:**

```bash
cd server
pnpm dev
```

**Start the frontend:**

```bash
cd client
pnpm dev
```

The client will be available at `http://localhost:3000` and the server at `http://localhost:8000` (or your configured port).

---

## 📁 Project Structure

```
gyanbookLM/
├── client/          # Next.js frontend
│   └── package.json
├── server/          # Express.js backend (TypeScript)
│   ├── src/
│   │   └── index.ts
│   └── package.json
└── README.md
```

---

## 🌱 Roadmap

- [ ] Document upload (PDF, TXT, Markdown)
- [ ] AI-powered Q&A over uploaded sources
- [ ] Source citation in responses
- [ ] Multi-notebook support
- [ ] Audio overview generation

---

## 📄 License

ISC License — see [LICENSE](LICENSE) for details.

---

<p align="center">Built with ❤️ and inspired by NotebookLM</p>
