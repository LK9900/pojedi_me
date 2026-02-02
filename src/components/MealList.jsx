import { useState, useEffect } from 'preact/hooks';
import { fetchMeals, createMeal, toggleMealTried, deleteMeal } from '../utils/api';
import MealItem from './MealItem';

export default function MealList({ sectionId }) {
  const [meals, setMeals] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sectionId) {
      loadMeals();
    } else {
      setMeals([]);
    }
  }, [sectionId]);

  async function loadMeals() {
    try {
      const data = await fetchMeals(sectionId);
      setMeals(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const newMeal = await createMeal(sectionId, newName);
      // Add to list. Since it's untried, it goes to top.
      const newMeals = [newMeal, ...meals];
      newMeals.sort((a, b) => {
        if (!!a.tried !== !!b.tried) return a.tried ? 1 : -1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
      setMeals(newMeals);
      setNewName('');
    } catch (err) {
      console.error(err);
      alert('Failed to add meal: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(meal) {
    // Optimistic update
    const newTried = !meal.tried;
    const updatedMeals = meals.map(m => 
      m.id === meal.id ? { ...m, tried: newTried } : m
    );
    
    // Sort: Untried first, then by date desc
    updatedMeals.sort((a, b) => {
        if (!!a.tried !== !!b.tried) return a.tried ? 1 : -1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    
    setMeals(updatedMeals);
    
    try {
      await toggleMealTried(meal.id, newTried);
    } catch (err) {
      console.error(err);
      loadMeals(); // Revert on error
      alert('Failed to update meal: ' + err.message);
    }
  }

  async function handleDelete(meal) {
    if (!confirm(`Delete meal "${meal.name}"?`)) return;
    
    // Optimistic remove
    const updatedMeals = meals.filter(m => m.id !== meal.id);
    setMeals(updatedMeals);

    try {
      await deleteMeal(meal.id);
    } catch (err) {
      console.error(err);
      loadMeals(); // Revert
      alert('Failed to delete meal: ' + err.message);
    }
  }

  const untried = meals.filter(m => !m.tried);
  const tried = meals.filter(m => m.tried);

  if (!sectionId) return <p style={{color: '#666', textAlign: 'center', marginTop: '40px'}}>Select a section to view meals.</p>;

  return (
    <div class="meal-list-container">
      <div class="meal-list">
        {untried.map(m => (
          <MealItem key={m.id} meal={m} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
        
        {untried.length > 0 && tried.length > 0 && (
           <div class="divider">Tried Meals</div>
        )}
        
        {tried.map(m => (
          <MealItem key={m.id} meal={m} onToggle={handleToggle} onDelete={handleDelete} />
        ))}
        
        {meals.length === 0 && <p style={{color: '#888', textAlign: 'center'}}>No meals yet in this section.</p>}
      </div>

      <form onSubmit={handleAdd} class="add-form" style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
        <input 
          type="text" 
          placeholder="New Meal Name"
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
