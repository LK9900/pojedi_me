export async function fetchRestaurants() {
  const res = await fetch('/api/restaurants');
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  return res.json();
}

export async function createRestaurant(name) {
  const res = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to create restaurant');
  return res.json();
}

export async function deleteRestaurant(id) {
  const res = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete restaurant');
  return res.json();
}

export async function fetchSections(restaurantId) {
  const res = await fetch(`/api/restaurants/${restaurantId}/sections`);
  if (!res.ok) throw new Error('Failed to fetch sections');
  return res.json();
}

export async function createSection(restaurantId, name) {
  const res = await fetch('/api/sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurant_id: restaurantId, name })
  });
  if (!res.ok) throw new Error('Failed to create section');
  return res.json();
}

export async function deleteSection(id) {
  const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete section');
  return res.json();
}

export async function fetchMeals(sectionId) {
  const res = await fetch(`/api/sections/${sectionId}/meals`);
  if (!res.ok) throw new Error('Failed to fetch meals');
  return res.json();
}

export async function createMeal(sectionId, name) {
  const res = await fetch('/api/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section_id: sectionId, name })
  });
  if (!res.ok) throw new Error('Failed to create meal');
  return res.json();
}

export async function toggleMealTried(id, tried) {
  const res = await fetch(`/api/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tried })
  });
  if (!res.ok) throw new Error('Failed to update meal');
  return res.json();
}

export async function deleteMeal(id) {
  const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete meal');
  return res.json();
}
