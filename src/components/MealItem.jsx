export default function MealItem({ meal, onToggle, onDelete }) {
  return (
    <div class={`meal-item ${meal.tried ? 'tried' : ''}`}>
      <span class="meal-name">{meal.name}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>{meal.tried ? 'Tried' : 'Try?'}</span>
          <input 
            type="checkbox" 
            class="meal-checkbox"
            checked={!!meal.tried} 
            onChange={() => onToggle(meal)}
          />
        </label>
        <button 
            type="button" 
            onClick={() => onDelete(meal)}
            title="Delete Meal"
            style={{ 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer', 
                opacity: 0.5,
                padding: '0 5px'
            }}
        >
            ❌
        </button>
      </div>
    </div>
  );
}
