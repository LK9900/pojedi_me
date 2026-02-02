async function handleResponse(res, defaultMsg) {
  if (!res.ok) {
    let errorMsg = defaultMsg;
    try {
      const errorData = await res.json();
      if (errorData.error) {
        errorMsg += ': ' + errorData.error;
      }
    } catch {
      try {
        const text = await res.text();
        if (text) errorMsg += ': ' + text.slice(0, 100); // Limit length
      } catch (e) {
        // ignore
      }
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function fetchRestaurants() {
  const res = await fetch('/api/restaurants');
  return handleResponse(res, 'Failed to fetch restaurants');
}

export async function createRestaurant(name) {
  const res = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return handleResponse(res, 'Failed to create restaurant');
}

export async function deleteRestaurant(id) {
  const res = await fetch(`/api/restaurants/${id}`, { method: 'DELETE' });
  return handleResponse(res, 'Failed to delete restaurant');
}

export async function fetchSections(restaurantId) {
  const res = await fetch(`/api/restaurants/${restaurantId}/sections`);
  return handleResponse(res, 'Failed to fetch sections');
}

export async function createSection(restaurantId, name) {
  const res = await fetch('/api/sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurant_id: restaurantId, name })
  });
  return handleResponse(res, 'Failed to create section');
}

export async function deleteSection(id) {
  const res = await fetch(`/api/sections/${id}`, { method: 'DELETE' });
  return handleResponse(res, 'Failed to delete section');
}

export async function fetchMeals(sectionId) {
  const res = await fetch(`/api/sections/${sectionId}/meals`);
  return handleResponse(res, 'Failed to fetch meals');
}

export async function createMeal(sectionId, name) {
  const res = await fetch('/api/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section_id: sectionId, name })
  });
  return handleResponse(res, 'Failed to create meal');
}

export async function toggleMealTried(id, tried) {
  const res = await fetch(`/api/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tried })
  });
  return handleResponse(res, 'Failed to update meal');
}

export async function deleteMeal(id) {
  const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
  return handleResponse(res, 'Failed to delete meal');
}
