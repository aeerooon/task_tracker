const express = require('express');
const { listCategories, createCategory } = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listCategories);
router.post('/', requireAuth, createCategory);

module.exports = router;
