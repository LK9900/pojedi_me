import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { downloadDatabase, uploadDatabase } from './github-storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the correct database path based on environment
// Vercel (and most serverless) implies read-only root, so we must use /tmp
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const rootDbPath = path.resolve(process.cwd(), 'database.db');
const tmpDbPath = path.join(os.tmpdir(), 'database.db');

// The active path we will read/write to
const dbPath = isVercel ? tmpDbPath : rootDbPath;

let dbInstance = null;
let SQL = null;
let currentSha = null; // Track SHA for GitHub updates

// Helper to ensure DB is loaded
async function getDB() {
  if (dbInstance) return dbInstance;

  if (!SQL) {
    const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found at ${wasmPath}`);
    }
    const wasmBinary = fs.readFileSync(wasmPath);
    SQL = await initSqlJs({ wasmBinary });
  }

  // Strategy for Persistence:
  // 1. If we are on Vercel, try to download DB from GitHub first.
  // 2. If download succeeds, write to dbPath and load.
  // 3. If download fails (doesn't exist), check seed or create new.
  
  if (isVercel && !dbInstance) {
      try {
          console.log('Downloading DB from GitHub...');
          const result = await downloadDatabase();
          if (result) {
              console.log('DB downloaded successfully.');
              fs.writeFileSync(dbPath, result.buffer);
              currentSha = result.sha;
          } else {
              console.log('No DB found on GitHub.');
          }
      } catch (err) {
          console.error('Failed to download DB from GitHub:', err);
      }
  }

  if (fs.existsSync(dbPath)) {
    // Active DB exists
    const filebuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(filebuffer);
  } else {
    // No DB anywhere, create new
    dbInstance = new SQL.Database();
    initTables(dbInstance);
    // We don't save immediately here to avoid empty commit spam, 
    // but the next write will trigger saveDB -> upload.
  }

  return dbInstance;
}

// Initialize tables if they don't exist
function initTables(db) {
    try {
        db.run(`CREATE TABLE IF NOT EXISTS restaurants (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             name TEXT NOT NULL,
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )`);
         
        db.run(`CREATE TABLE IF NOT EXISTS sections (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             restaurant_id INTEGER NOT NULL,
             name TEXT NOT NULL,
             FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
         )`);
         
        db.run(`CREATE TABLE IF NOT EXISTS meals (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             section_id INTEGER NOT NULL,
             name TEXT NOT NULL,
             tried BOOLEAN DEFAULT 0,
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
         )`);
    } catch (err) {
        console.error("Failed to init tables:", err);
    }
}

async function saveDB() {
  if (dbInstance) {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    
    // 1. Save locally to /tmp (fastest)
    try {
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error("Failed to save DB locally:", err);
    }

    // 2. Upload to GitHub (Persistence)
    // Only do this on Vercel to avoid dev spam, or if we want local dev to sync too.
    // Let's do it always for now to ensure sync.
    if (isVercel) {
        console.log('Uploading DB to GitHub...');
        try {
            const newSha = await uploadDatabase(buffer, currentSha);
            if (newSha) {
                currentSha = newSha;
                console.log('DB uploaded successfully. New SHA:', newSha);
            }
        } catch (err) {
            console.error("Failed to upload DB to GitHub:", err);
        }
    }
  }
}

// Wrapper methods
const query = async (sql, params = []) => {
  const db = await getDB();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const run = async (sql, params = []) => {
  const db = await getDB();
  db.run(sql, params);
  
  const idRes = db.exec("SELECT last_insert_rowid() as id")[0];
  const lastInsertRowid = idRes ? idRes.values[0][0] : 0;
  
  // Persist after write
  // We await this to ensure it's saved before response returns (critical for serverless)
  await saveDB();
  
  return { lastInsertRowid };
};

const get = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0];
};

export default {
  query,
  run,
  get
};
