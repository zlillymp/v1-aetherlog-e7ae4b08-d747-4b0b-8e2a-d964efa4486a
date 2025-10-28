# AetherLog

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zlillymp/call_log)

A minimalist CRM for intelligently logging and organizing phone calls from audio file uploads.

AetherLog is a sleek, single-page application designed to streamline the process of logging phone call records. Users can drag and drop audio files of phone calls, and the application will automatically parse the filename to extract the contact's name, phone number, call direction (inbound/outbound), and the exact timestamp of the call. It intelligently manages a contact list by either creating a new contact record if one doesn't exist for the given phone number, or updating an existing contact with the new call record.

## Key Features

- **Intelligent File Parsing:** Automatically extracts contact name, phone number, call direction, and timestamp from filenames.
- **Automatic Contact Management:** Creates new contacts or updates existing ones seamlessly.
- **Sleek Two-Column UI:** A persistent, searchable contact list on the left and a dynamic content area on the right.
- **Drag & Drop Uploads:** A beautiful and intuitive file upload zone for a smooth user experience.
- **Detailed Call History:** View a chronological log of all calls for any selected contact.
- **Built for Speed:** A fast, responsive experience powered by Cloudflare's edge infrastructure.

## Technology Stack

- **Frontend:** React, Vite, TypeScript
- **Backend:** Hono on Cloudflare Workers
- **Storage:** Cloudflare Durable Objects
- **Styling:** Tailwind CSS, shadcn/ui
- **State Management:** Zustand
- **UI/UX:** Framer Motion, Lucide React, React Dropzone

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

You can install Wrangler globally with Bun:
```bash
bun install -g wrangler
```

### Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd aetherlog
    ```

2.  **Install dependencies:**
    This project uses Bun for package management.
    ```bash
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite frontend and the Wrangler development server for the backend API concurrently.
    ```bash
    bun run dev
    ```

    The application will be available at `http://localhost:3000`.

## Project Structure

-   `src/`: Contains all the frontend React application code.
    -   `components/`: Reusable React components.
    -   `pages/`: Top-level page components.
    -   `lib/`: Utilities, API clients, and state management stores.
-   `worker/`: Contains the Hono backend code running on Cloudflare Workers.
    -   `index.ts`: The main worker entry point.
    -   `user-routes.ts`: Where custom API routes are defined.
    -   `entities.ts`: Durable Object entity definitions.
-   `shared/`: TypeScript types and mock data shared between the frontend and backend.

## Development

### Frontend

The frontend is a standard Vite + React application. You can add or modify components in `src/components` and pages in `src/pages`. The application's state is managed with Zustand, with the store defined in `src/lib/store.ts`.

### Backend

The backend API is built with Hono and runs on Cloudflare Workers. To add or modify API endpoints, edit the `worker/user-routes.ts` file. Data persistence is handled by Cloudflare Durable Objects, abstracted through entity classes in `worker/entities.ts`.

## Deployment

This project is configured for easy deployment to Cloudflare Pages.

1.  **Login to Wrangler:**
    Authenticate the Wrangler CLI with your Cloudflare account.
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which will build the application and deploy it to your Cloudflare account.
    ```bash
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/zlillymp/call_log)