require('dotenv').config();
const { sequelize, User, Category, Task } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const [user] = await User.findOrCreate({
    where: { email: 'reviewer@example.com' },
    defaults: { name: 'Reviewer Test Account', password: 'password123' },
  });

  const categoryNames = ['Work', 'Personal', 'Errands'];
  const categories = {};
  for (const name of categoryNames) {
    const [cat] = await Category.findOrCreate({ where: { name } });
    categories[name] = cat;
  }

  const existingTasks = await Task.count({ where: { user_id: user.id } });
  if (existingTasks === 0) {
    await Task.bulkCreate([
      {
        title: 'Prepare exam submission email',
        description: 'Draft and send the submission with all links',
        status: 'pending',
        due_date: '2026-08-15',
        category_id: categories['Work'].id,
        user_id: user.id,
      },
      {
        title: 'Review Sequelize associations',
        description: 'Double-check FK constraints and cascade rules',
        status: 'in_progress',
        due_date: '2026-08-10',
        category_id: categories['Work'].id,
        user_id: user.id,
      },
      {
        title: 'Buy groceries',
        description: null,
        status: 'pending',
        due_date: null,
        category_id: categories['Errands'].id,
        user_id: user.id,
      },
      {
        title: 'Gym session',
        description: 'Leg day',
        status: 'completed',
        due_date: '2026-08-05',
        category_id: categories['Personal'].id,
        user_id: user.id,
      },
    ]);
    console.log('Seeded sample tasks.');
  } else {
    console.log('Tasks already exist for reviewer account, skipping task seed.');
  }

  console.log('Seed complete.');
  console.log('Test account -> email: reviewer@example.com | password: password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
