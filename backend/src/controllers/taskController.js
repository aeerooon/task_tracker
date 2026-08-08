const { Op } = require('sequelize');
const { Task, Category } = require('../models');

const VALID_STATUSES = ['pending', 'in_progress', 'completed'];

async function listTasks(req, res, next) {
  try {
    const { status, category_id, search } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      where.status = status;
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await Task.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.json({
      tasks: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Category, attributes: ['id', 'name'] }],
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ task });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status, due_date, category_id } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    if (!category_id) {
      return res.status(400).json({ error: 'category_id is required' });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ error: 'category_id does not reference an existing category' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || null,
      status: status || 'pending',
      due_date: due_date || null,
      category_id,
      user_id: req.user.id,
    });

    const taskWithCategory = await Task.findByPk(task.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }],
    });

    return res.status(201).json({ task: taskWithCategory });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, status, due_date, category_id } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ error: 'category_id does not reference an existing category' });
      }
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (due_date !== undefined) task.due_date = due_date;
    if (category_id !== undefined) task.category_id = category_id;

    await task.save();

    const updated = await Task.findByPk(task.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }],
    });

    return res.json({ task: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
