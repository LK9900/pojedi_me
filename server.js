import express from 'express';
import restaurantsHandler from './api/restaurants.js';
import sectionsHandler from './api/sections.js';
import mealsHandler from './api/meals.js';

const app = express();
app.use(express.json());

const adapt = (handler) => (req, res) => {
  req.query = { ...req.query, ...req.params };
  return handler(req, res);
};

// Map routes to match vercel.json rewrites logic
app.all('/api/restaurants', adapt(restaurantsHandler));
app.all('/api/restaurants/:id', adapt(restaurantsHandler));

app.all('/api/restaurants/:id/sections', (req, res) => {
    req.query.restaurantId = req.params.id;
    return adapt(sectionsHandler)(req, res);
});
app.all('/api/sections', adapt(sectionsHandler));
app.all('/api/sections/:id', adapt(sectionsHandler)); // Added for DELETE /api/sections/:id

app.all('/api/sections/:sectionId/meals', (req, res) => {
    req.query.sectionId = req.params.sectionId;
    return adapt(mealsHandler)(req, res);
});
app.all('/api/meals', adapt(mealsHandler));
app.all('/api/meals/:id', adapt(mealsHandler));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
