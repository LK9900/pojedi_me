import { useState } from 'preact/hooks';
import RestaurantSelect from './components/RestaurantSelect';
import SectionTabs from './components/SectionTabs';
import MealList from './components/MealList';
import './styles.css';

export function App() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [sectionId, setSectionId] = useState(null);

  return (
    <div id="app">
      <div class="header">
        <h1>🍽️ Meal Tracker</h1>
      </div>
      
      <RestaurantSelect 
        selectedId={restaurantId} 
        onSelect={(id) => {
            setRestaurantId(id);
            setSectionId(null); 
        }} 
      />
      
      {restaurantId && (
        <SectionTabs 
          restaurantId={restaurantId} 
          selectedSectionId={sectionId} 
          onSelectSection={setSectionId} 
        />
      )}
      
      {sectionId && (
        <MealList sectionId={sectionId} />
      )}
      
      {!restaurantId && (
        <p class="empty-msg text-center mt-40">
            Add or select a restaurant to start tracking your meals.
        </p>
      )}

      <footer style={{
        marginTop: '60px', 
        textAlign: 'center', 
        color: 'var(--text-secondary)', 
        fontSize: '0.8rem', 
        opacity: 0.5,
        borderTop: '1px solid #333',
        paddingTop: '20px',
        fontFamily: 'var(--font-body)'
      }}>
        <p>Pojedi Me v2.0 • Retro Edition</p>
      </footer>
    </div>
  );
}
