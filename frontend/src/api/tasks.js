import client from './client';

export function fetchTasks({ status, category_id, search, page, limit }) {
  const params = {};
  if (status) params.status = status;
  if (category_id) params.category_id = category_id;
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  return client.get('/tasks', { params }).then((r) => r.data);
}

export function fetchTask(id) {
  return client.get(`/tasks/${id}`).then((r) => r.data);
}

export function createTask(payload) {
  return client.post('/tasks', payload).then((r) => r.data);
}

export function updateTask(id, payload) {
  return client.put(`/tasks/${id}`, payload).then((r) => r.data);
}

export function deleteTask(id) {
  return client.delete(`/tasks/${id}`);
}
