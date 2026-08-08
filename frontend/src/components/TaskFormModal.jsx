import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function TaskFormModal({ task, categories, onSave, onClose }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'pending');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [categoryId, setCategoryId] = useState(task?.category_id || categories[0]?.id || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!categoryId) {
      setError('Please select or create a category first');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || null,
        status,
        due_date: dueDate || null,
        category_id: Number(categoryId),
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save task');
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>

        <div className="form-row">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Due Date
            <input type="date" value={dueDate || ''} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>

        <label>
          Category
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.length === 0 && <option value="">No categories yet</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
