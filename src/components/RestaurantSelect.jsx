import { useState, useEffect } from 'preact/hooks';
import { fetchRestaurants, createRestaurant, deleteRestaurant } from '../utils/api';

export default function RestaurantSelect({ selectedId, onSelect }) {
  const [restaurants, setRestaurants] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      const data = await fetchRestaurants();
      setRestaurants(data);
      if (!selectedId && data.length > 0) {
        onSelect(data[0].id);
      }
    } catch (err) {
      console.error(err);
      // alert('Failed to load restaurants: ' + err.message); // Too noisy on load
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const newRest = await createRestaurant(newName);
      setRestaurants([newRest, ...restaurants]);
      setNewName('');
      onSelect(newRest.id);
    } catch (err) {
      console.error(err);
      alert('Failed to add restaurant: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirm('Are you sure you want to delete this restaurant? All sections and meals will be lost.')) return;
    
    setLoading(true);
    try {
      await deleteRestaurant(selectedId);
      const remaining = restaurants.filter(r => r.id !== selectedId);
      setRestaurants(remaining);
      onSelect(remaining.length > 0 ? remaining[0].id : null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete restaurant: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="restaurant-select-container">
      <div class="restaurant-select">
        <select 
          value={selectedId || ''} 
          onChange={(e) => onSelect(Number(e.target.value))}
          disabled={restaurants.length === 0}
        >
          <option value="" disabled>Select a Restaurant</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        {selectedId && (
          <button 
            type="button" 
            class="btn btn-danger" 
            onClick={handleDelete}
            title="Delete Restaurant"
            style={{marginLeft: '10px', backgroundColor: '#ff4444'}}
          >
            🗑️
          </button>
        )}
      </div>
      
      <form onSubmit={handleAdd} class="add-form">
        <input 
          type="text" 
          placeholder="New Restaurant Name"
          value={newName}
          onInput={(e) => setNewName(e.target.value)}
        />
        <button type="submit" class="btn" disabled={loading || !newName.trim()}>
          + Add
        </button>
      </form>
    </div>
  );
}
