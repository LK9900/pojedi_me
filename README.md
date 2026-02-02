# Personal Restaurant Meal Tracker

A minimalist, single-user web application to track restaurant meals.

## Tech Stack
- **Frontend**: Preact + Vite
- **Backend**: Node.js (Serverless Functions)
- **Database**: SQLite (`better-sqlite3`)
- **Deployment**: Vercel

## Project Structure
- `api/`: Serverless functions for Vercel (and local API logic).
- `src/`: Frontend source code.
- `database.db`: SQLite database file (stored in project root).
- `server.js`: Local development server to mimic Vercel environment.

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Initialize Database**
    Creates the `database.db` file and tables.
    ```bash
    npm run init-db
    ```

3.  **Run Locally**
    You need to run both the API server and the Vite frontend.

    **Terminal 1 (API Server):**
    ```bash
    node server.js
    ```
    (Runs on http://localhost:3000)

    **Terminal 2 (Frontend):**
    ```bash
    npm run dev
    ```
    (Runs on http://localhost:5173 and proxies API requests to port 3000)

    Open http://localhost:5173 in your browser.

## Deployment to Vercel

1.  Push this repository to GitHub.
2.  Log in to Vercel and "Add New Project".
3.  Import the repository.
4.  Vercel will detect Vite. The default settings are usually correct.
    - **Framework Preset**: Vite
    - **Root Directory**: `.`
5.  Deploy!

### Important Note on Data Persistence
This app uses a local SQLite file (`database.db`).
- **Locally**: Changes persist indefinitely.
- **On Vercel**: The filesystem is **read-only** and **ephemeral** (reset on redeploy/cold start).
  - You will be able to read the initial data committed to Git.
  - **Writes (adding meals/restaurants) will likely fail or revert** after a short period on Vercel Serverless.
  - *To make this fully persistent in production, you would need to switch to an external database (like Turso, Supabase, or Vercel Postgres) or use a persistent storage adapter.*
  - This implementation strictly follows the "SQLite file in project root" requirement.

## Features
- **Restaurants**: Add and switch between restaurants.
- **Sections**: Organize meals by section (Appetizers, Mains, etc.).
- **Meals**: Track meals as "Tried" or "Untried".
- **Auto-Sorting**: Untried meals appear at the top. Tried meals sink to the bottom.
