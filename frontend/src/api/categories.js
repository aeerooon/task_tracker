import client from './client';

export function fetchCategories() {
  return client.get('/categories').then((r) => r.data);
}

export function createCategory(name) {
  return client.post('/categories', { name }).then((r) => r.data);
}
