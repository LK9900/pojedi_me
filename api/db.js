import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

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

// Helper to ensure DB is loaded
async function getDB() {
  if (dbInstance) return dbInstance;

  if (!SQL) {
    // Locate the WASM file relative to this file (api/db.js)
    const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
    
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found at ${wasmPath}`);
    }

    const wasmBinary = fs.readFileSync(wasmPath);

    SQL = await initSqlJs({
        wasmBinary
    });
  }

  // Strategy:
  // 1. If active dbPath exists, use it (it has latest data for this container).
  // 2. If not, check if we have a seed database in project root (rootDbPath).
  // 3. If yes, copy it to dbPath (so we start with seed data).
  // 4. If no, create a new empty DB.

  if (fs.existsSync(dbPath)) {
    // Active DB exists
    const filebuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(filebuffer);
  } else if (isVercel && fs.existsSync(rootDbPath)) {
    // First run in this container, copy from seed
    try {
        const seedBuffer = fs.readFileSync(rootDbPath);
        fs.writeFileSync(dbPath, seedBuffer);
        dbInstance = new SQL.Database(seedBuffer);
    } catch (err) {
        console.error("Failed to copy seed DB:", err);
        // Fallback to empty
        dbInstance = new SQL.Database();
        initTables(dbInstance); // Ensure tables exist
        saveDB();
    }
  } else {
    // No DB anywhere, create new
    dbInstance = new SQL.Database();
    initTables(dbInstance); // Ensure tables exist
    saveDB(); // Initialize file
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

function saveDB() {
  if (dbInstance) {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    // This will write to /tmp/database.db on Vercel, which is allowed.
    // Locally it writes to project root.
    try {
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error("Failed to save DB:", err);
    }
  }
}

// Wrapper methods
const query = async (sql, params = []) => {
  const db = await getDB();
  // sql.js .exec returns [{columns, values}]
  // We want array of objects
  // Use .prepare statement for safer binding and easier object mapping
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
  // We need to execute and get lastID/changes.
  // sql.js doesn't give easy access to changes/lastID in .run() return
  // We have to execute, then check 'SELECT last_insert_rowid()' or 'SELECT changes()'
  // BUT: .run() executes.
  
  db.run(sql, params);
  
  // Get metadata
  // Note: sql.js doesn't strictly track 'changes' easily without another query, 
  // but last_insert_rowid is standard.
  const idRes = db.exec("SELECT last_insert_rowid() as id")[0];
  const lastInsertRowid = idRes ? idRes.values[0][0] : 0;
  
  // Persist after write
  saveDB();
  
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
