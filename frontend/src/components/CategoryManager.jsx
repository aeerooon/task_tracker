import { useState } from 'react';

export default function CategoryManager({ categories, onAdd, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await onAdd(name.trim());
      setName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not add category');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Categories</h2>

        <ul className="category-list">
          {categories.length === 0 && <li className="empty">No categories yet.</li>}
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>

        <form onSubmit={handleAdd} className="inline-form">
          {error && <div className="alert alert-error">{error}</div>}
          <input
            placeholder="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </form>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
