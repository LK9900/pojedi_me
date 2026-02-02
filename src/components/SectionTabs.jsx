import { useState, useEffect } from 'preact/hooks';
import { fetchSections, createSection, deleteSection } from '../utils/api';

export default function SectionTabs({ restaurantId, selectedSectionId, onSelectSection }) {
  const [sections, setSections] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadSections();
    } else {
      setSections([]);
    }
  }, [restaurantId]);

  async function loadSections() {
    try {
      const data = await fetchSections(restaurantId);
      setSections(data);
      if (data.length > 0 && (!selectedSectionId || !data.find(s => s.id === selectedSectionId))) {
        onSelectSection(data[0].id);
      } else if (data.length === 0) {
        onSelectSection(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const newSec = await createSection(restaurantId, newName);
      const updated = [...sections, newSec];
      setSections(updated);
      setNewName('');
      onSelectSection(newSec.id);
    } catch (err) {
      console.error(err);
      alert('Failed to add section: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation(); // Prevent tab selection
    if (!confirm('Delete this section and all its meals?')) return;
    
    try {
      await deleteSection(id);
      const remaining = sections.filter(s => s.id !== id);
      setSections(remaining);
      if (selectedSectionId === id) {
        onSelectSection(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete section: ' + err.message);
    }
  }

  if (!restaurantId) return null;

  return (
    <div>
      <div class="sections-nav">
        {sections.map(s => (
          <div 
            key={s.id} 
            class={`section-tab ${selectedSectionId === s.id ? 'active' : ''}`}
            onClick={() => onSelectSection(s.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {s.name}
            {selectedSectionId === s.id && (
              <span 
                class="tab-delete-icon"
                onClick={(e) => handleDelete(e, s.id)}
                title="Delete Section"
              >
                ❌
              </span>
            )}
          </div>
        ))}
        {sections.length === 0 && <span class="empty-msg">No sections yet.</span>}
      </div>

      <form onSubmit={handleAdd} class="add-form" style={{marginBottom: '20px'}}>
        <input 
          type="text" 
          placeholder="New Section (e.g. Appetizers)"
          value={newName}
          onInput={(e) => setNewName(e.target.value)}
        />
        <button type="submit" class="btn" disabled={loading || !newName.trim()}>
          + Add Section
        </button>
      </form>
    </div>
  );
}
