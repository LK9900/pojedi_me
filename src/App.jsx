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
        <p style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>
            Add or select a restaurant to start tracking your meals.
        </p>
      )}
    </div>
  );
}
