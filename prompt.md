**Role & Objective**  
You are an expert full-stack developer specializing in minimalist, functional web applications. Your task is to build a **personal restaurant meal tracker** with the simplest possible tech stack that meets the exact specifications below. The app must be production-ready for deployment on Vercel via GitHub.

---

## **1. Project Specifications**

### **Core Purpose**  
A single-user web app to track which meals from various restaurants I have tried. No multi-user features, no authentication.

### **Required Features**
1. **Restaurant Management**
   - Add/name a restaurant
   - Switch between restaurants (dropdown or list)
   - View only one restaurant at a time

2. **Meal & Section System**
   - Create **sections** per restaurant (e.g., "Appetizers", "Main Courses", "Desserts")
   - Add **meals** to a section
   - Each meal has:
     - Name (required)
     - Section (required, from existing sections for that restaurant)
     - "Tried" status (checkbox, default: false)

3. **View & Interaction Rules**
   - Within a section, **untried meals appear at the top**, tried meals **automatically sink to the bottom**
   - Toggling "tried" status **instantly reorders** the list
   - Filter meals **by section** (buttons/tabs to show only one section at a time)
   - Clear visual distinction between tried/untried meals

4. **Data Persistence**
   - All data stored in a **database**
   - Changes persist instantly without "save" button
   - Preserve state between sessions

---

## **2. Tech Stack Mandate**  
*Simplest possible stack for a single-user Vercel deployment.*

**Frontend:**  
- **Framework:** Preact (lightweight React alternative) or vanilla JS with components  
- **Styling:** Plain CSS or Tailwind CSS (minimal setup)  
- **Build Tool:** Vite (fast, zero-config for deployment)  

**Backend & Database:**  
- **Runtime:** Node.js with Express (serverless-friendly)  
- **Database:** SQLite (single file, no external service)  
  - Use `better-sqlite3` for simplicity  
  - Store database file in project root (committed to Git for simplicity)  
- **API:** RESTful endpoints (GET/POST/PATCH/DELETE)  

**Deployment:**  
- Host on **Vercel** via GitHub  
- Use Vercel’s serverless functions for API endpoints  
- Static frontend served from Vercel  

---

## **3. Database Schema**

```sql
-- restaurants table
CREATE TABLE restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- sections table (belongs to a restaurant)
CREATE TABLE sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- meals table (belongs to a section)
CREATE TABLE meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    tried BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);
```

---

## **4. API Endpoints**

**All endpoints return JSON**

### **Restaurants**
- `GET /api/restaurants` → List all restaurants
- `POST /api/restaurants` → Create new restaurant  
  Body: `{ "name": "Restaurant Name" }`
- `DELETE /api/restaurants/:id` → Delete restaurant (cascade deletes sections/meals)

### **Sections**
- `GET /api/restaurants/:restaurantId/sections` → List sections for a restaurant
- `POST /api/sections` → Create new section  
  Body: `{ "restaurant_id": 1, "name": "Section Name" }`

### **Meals**
- `GET /api/sections/:sectionId/meals` → List meals in a section  
  *Important:* Return meals ordered by `tried ASC` (untried first), then `created_at DESC`
- `POST /api/meals` → Create new meal  
  Body: `{ "section_id": 1, "name": "Meal Name" }`
- `PATCH /api/meals/:id` → Update meal (primarily for toggling `tried`)  
  Body: `{ "tried": true }`

---

## **5. Frontend UI/UX Requirements**

### **Layout**
```
┌─────────────────────────────────────────┐
│ [Dropdown: Select Restaurant] [+ Add]   │
├─────────────────────────────────────────┤
│ [All] [Appetizers] [Mains] [Desserts]  │ ← Section filter tabs
├─────────────────────────────────────────┤
│ • Untried Meal 1       [ ] Tried?       │
│ • Untried Meal 2       [ ] Tried?       │
│ ─────────────────────────────────────── │ ← Visual divider
│ ✓ Tried Meal 1         [✓] Tried?       │
│ ✓ Tried Meal 2         [✓] Tried?       │
├─────────────────────────────────────────┤
│ [+] Add New Meal to This Section        │
└─────────────────────────────────────────┘
```

### **Interaction Rules**
1. **Restaurant dropdown** – on change, reload that restaurant’s sections/meals
2. **Section tabs** – filter meals to show only selected section
3. **"Tried?" checkbox** – immediate PATCH request, then reorder UI without refresh
4. **"Add" buttons** – simple inline form, submit via POST, clear form, refresh list
5. **Visual cues**:
   - Tried meals: grayed text, checkmark icon, lower opacity
   - Divider line between untried/tried sections
   - Subtle animation when meal moves to bottom

---

## **6. File Structure**
```
project/
├── api/
│   ├── restaurants.js         # Vercel serverless endpoint
│   ├── sections.js
│   └── meals.js
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                # Main component
│   ├── components/
│   │   ├── RestaurantSelect.jsx
│   │   ├── SectionTabs.jsx
│   │   ├── MealList.jsx
│   │   └── MealItem.jsx
│   ├── utils/
│   │   └── api.js             # Fetch wrapper
│   └── styles.css
├── database.db                # SQLite file
├── package.json
├── vite.config.js
└── vercel.json               # Vercel configuration
```

---

## **7. Vercel-Specific Configuration**

**vercel.json**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/public/index.html" }
  ],
  "functions": {
    "api/*.js": {
      "maxDuration": 10
    }
  }
}
```

**Environment:** No environment variables needed (SQLite file in repo).

---

## **8. Implementation Constraints**
- **No external dependencies** beyond Preact, Express, SQLite, Vite
- **No authentication** middleware
- **No server-side rendering** – pure SPA with API calls
- **Database file included in Git** (acceptable for single-user app)
- **Mobile-responsive** but minimalist design
- **No loading spinners** – instant updates preferred

---

## **9. Deliverable**  
Generate the complete codebase with:
1. Working SQLite database with schema
2. All API endpoints (serverless functions)
3. Complete frontend with all interactions
4. Vercel deployment configuration
5. A `README.md` with:
   - Setup instructions (`npm install`, `npm run dev`)
   - Deployment instructions (connect GitHub to Vercel)
   - Note about database being in Git

---

## **10. Success Criteria**  
The app is complete when:
- I can add a restaurant
- I can add sections to that restaurant
- I can add meals to sections
- I can toggle "tried" status and see meals reorder automatically
- I can filter by section
- I can switch restaurants
- All data persists after refresh
- The app deploys to Vercel with one click via GitHub

---

**Begin building.** Start with the database schema and serverless API endpoints, then proceed to frontend components. Provide the complete codebase in your response.