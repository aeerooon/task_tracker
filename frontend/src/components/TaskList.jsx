const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function TaskList({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <div className="empty-state">No tasks match your filters yet.</div>;
  }

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Category</th>
          <th>Due Date</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>
              <div className="task-title">{task.title}</div>
              {task.description && <div className="task-description">{task.description}</div>}
            </td>
            <td>
              <span className={`status-badge status-${task.status}`}>
                {STATUS_LABELS[task.status]}
              </span>
            </td>
            <td>{task.Category?.name || '—'}</td>
            <td>{task.due_date || '—'}</td>
            <td className="task-actions">
              <button type="button" className="btn-link" onClick={() => onEdit(task)}>
                Edit
              </button>
              <button type="button" className="btn-link danger" onClick={() => onDelete(task)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
