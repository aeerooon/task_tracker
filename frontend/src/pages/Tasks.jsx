import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { fetchCategories, createCategory } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import Pagination from '../components/Pagination';
import TaskFormModal from '../components/TaskFormModal';
import CategoryManager from '../components/CategoryManager';
import ConfirmDialog from '../components/ConfirmDialog';

const LIMIT = 5;

export default function Tasks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks({
        status: status || undefined,
        category_id: categoryId || undefined,
        search: search || undefined,
        page,
        limit: LIMIT,
      });
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [status, categoryId, search, page]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data.categories);
    } catch {
      // Non-fatal: filters/forms just show fewer options if this fails
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // Debounce search input slightly so we don't hammer the API on every keystroke
    const handle = setTimeout(loadTasks, search ? 300 : 0);
    return () => clearTimeout(handle);
  }, [loadTasks]);

  function handleFilterChange(changes) {
    if ('status' in changes) setStatus(changes.status);
    if ('categoryId' in changes) setCategoryId(changes.categoryId);
    if ('search' in changes) setSearch(changes.search);
    if ('page' in changes) setPage(changes.page);
  }

  async function handleSaveTask(payload) {
    if (editingTask) {
      await updateTask(editingTask.id, payload);
    } else {
      await createTask(payload);
    }
    setShowTaskModal(false);
    setEditingTask(null);
    await loadTasks();
  }

  async function handleConfirmDelete() {
    if (!taskPendingDelete) return;
    try {
      await deleteTask(taskPendingDelete.id);
      setTaskPendingDelete(null);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete task.');
      setTaskPendingDelete(null);
    }
  }

  async function handleAddCategory(name) {
    await createCategory(name);
    await loadCategories();
  }

  function handleLogout() {
    logout();
    navigate('/signin');
  }

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">Signed in as {user?.name}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-secondary" onClick={() => setShowCategoryModal(true)}>
            Categories
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
          >
            + New Task
          </button>
          <button type="button" className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <TaskFilters
        status={status}
        categoryId={categoryId}
        search={search}
        categories={categories}
        onChange={handleFilterChange}
      />

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading tasks...</div>
      ) : (
        <>
          <TaskList
            tasks={tasks}
            onEdit={(task) => {
              setEditingTask(task);
              setShowTaskModal(true);
            }}
            onDelete={(task) => setTaskPendingDelete(task)}
          />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {showTaskModal && (
        <TaskFormModal
          task={editingTask}
          categories={categories}
          onSave={handleSaveTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {showCategoryModal && (
        <CategoryManager
          categories={categories}
          onAdd={handleAddCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {taskPendingDelete && (
        <ConfirmDialog
          title="Delete task?"
          message={`This will permanently delete "${taskPendingDelete.title}".`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setTaskPendingDelete(null)}
        />
      )}
    </div>
  );
}
