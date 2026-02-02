import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

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
    // Explicitly locate the WASM file
    // On Vercel, it should be in the same directory as the function (api/) or root depending on bundling.
    // We copied it to api/sql-wasm.wasm
    // process.cwd() in Vercel function usually points to the function root or project root.
    // Let's try to find it.
    
    const wasmPath = path.join(process.cwd(), 'api', 'sql-wasm.wasm');
    
    // Fallback if not found there (local dev)
    const localWasmPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
    
    const locateFile = (file) => {
        if (fs.existsSync(wasmPath)) return wasmPath;
        if (fs.existsSync(localWasmPath)) return localWasmPath;
        return file; // Default behavior
    };

    SQL = await initSqlJs({
        locateFile: (file) => {
            if (fs.existsSync(wasmPath)) return wasmPath;
             // Try relative to __dirname equivalent if needed, but ES modules...
             // Let's rely on absolute path constructed above.
             return wasmPath;
        }
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
        saveDB();
    }
  } else {
    // No DB anywhere, create new
    dbInstance = new SQL.Database();
    saveDB(); // Initialize file
  }

  return dbInstance;
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
