export default function TaskFilters({ status, categoryId, search, categories, onChange }) {
  return (
    <div className="task-filters">
      <input
        className="search-input"
        placeholder="Search tasks by title..."
        value={search}
        onChange={(e) => onChange({ search: e.target.value, page: 1 })}
      />

      <select value={status} onChange={(e) => onChange({ status: e.target.value, page: 1 })}>
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        value={categoryId}
        onChange={(e) => onChange({ categoryId: e.target.value, page: 1 })}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
