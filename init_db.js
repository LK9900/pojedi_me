import db from './api/db.js';

async function init() {
    try {
        console.log('Initializing database...');
        
        // sql.js doesn't support multiple statements in one go via .run() usually, 
        // or rather my wrapper calls .run() which executes one.
        // But db.js uses .run() which calls sql.js .run(). sql.js .run() executes.
        // However, better to split them to be safe and use my wrapper.

        await db.run(`
         CREATE TABLE IF NOT EXISTS restaurants (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             name TEXT NOT NULL,
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )
        `);

        await db.run(`
         CREATE TABLE IF NOT EXISTS sections (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             restaurant_id INTEGER NOT NULL,
             name TEXT NOT NULL,
             FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
         )
        `);

        await db.run(`
         CREATE TABLE IF NOT EXISTS meals (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             section_id INTEGER NOT NULL,
             name TEXT NOT NULL,
             tried BOOLEAN DEFAULT 0,
             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
             FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
         )
        `);

        console.log('Database initialized.');
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

init();
