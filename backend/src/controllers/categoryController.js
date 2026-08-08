const { Category } = require('../models');

async function listCategories(req, res, next) {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.json({ categories });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const category = await Category.create({ name: name.trim() });
    return res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory };
