import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ============= Clean Database =============
  console.log('🧹 Cleaning existing data...');
  await prisma.column.deleteMany({});
  await prisma.columnCategory.deleteMany({});
  await prisma.dailyGoal.deleteMany({});
  await prisma.diaryEntry.deleteMany({});
  await prisma.userExercise.deleteMany({});
  await prisma.userMeal.deleteMany({});
  await prisma.bodyRecord.deleteMany({});
  await prisma.mealPreset.deleteMany({});
  await prisma.mealCategory.deleteMany({});
  await prisma.exercisePreset.deleteMany({});
  await prisma.user.deleteMany({});

  // ============= Create Users =============
  console.log('👤 Creating demo users...');

  const hashedPassword = await bcrypt.hash('demo123456', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      username: 'demouser',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'user',
      avatar_url: 'https://api.example.com/avatars/demo-user.jpg',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      avatar_url: 'https://api.example.com/avatars/admin.jpg',
    },
  });

  console.log(`✅ Created users: ${demoUser.username}, ${adminUser.username}\n`);

  // ============= Create Meal Categories & Presets =============
  console.log('🍽️  Creating meal categories and presets...');

  const mealCategories = await Promise.all([
    prisma.mealCategory.create({
      data: {
        name: 'Breakfast',
        icon_url: 'https://api.example.com/icons/breakfast.png',
      },
    }),
    prisma.mealCategory.create({
      data: {
        name: 'Lunch',
        icon_url: 'https://api.example.com/icons/lunch.png',
      },
    }),
    prisma.mealCategory.create({
      data: {
        name: 'Dinner',
        icon_url: 'https://api.example.com/icons/dinner.png',
      },
    }),
    prisma.mealCategory.create({
      data: {
        name: 'Snack',
        icon_url: 'https://api.example.com/icons/snack.png',
      },
    }),
  ]);

  const breakfastId = mealCategories[0].id;
  const lunchId = mealCategories[1].id;
  const dinnerId = mealCategories[2].id;
  const snackId = mealCategories[3].id;

  const mealPresets = await Promise.all([
    // Breakfast
    prisma.mealPreset.create({
      data: {
        name: 'Oatmeal with Berries',
        categoryId: breakfastId,
        calories: 350,
        description: 'Healthy oatmeal with fresh blueberries and honey',
        image_url: 'https://api.example.com/meals/oatmeal.jpg',
      },
    }),
    prisma.mealPreset.create({
      data: {
        name: 'Scrambled Eggs & Toast',
        categoryId: breakfastId,
        calories: 400,
        description: 'Two eggs with whole wheat toast and butter',
        image_url: 'https://api.example.com/meals/eggs-toast.jpg',
      },
    }),
    prisma.mealPreset.create({
      data: {
        name: 'Smoothie Bowl',
        categoryId: breakfastId,
        calories: 320,
        description: 'Protein smoothie with granola and coconut',
        image_url: 'https://api.example.com/meals/smoothie-bowl.jpg',
      },
    }),
    // Lunch
    prisma.mealPreset.create({
      data: {
        name: 'Chicken Caesar Salad',
        categoryId: lunchId,
        calories: 480,
        description: 'Grilled chicken with romaine and parmesan',
        image_url: 'https://api.example.com/meals/caesar-salad.jpg',
      },
    }),
    prisma.mealPreset.create({
      data: {
        name: 'Tuna Sandwich',
        categoryId: lunchId,
        calories: 420,
        description: 'Tuna mayo on whole wheat with vegetables',
        image_url: 'https://api.example.com/meals/tuna-sandwich.jpg',
      },
    }),
    prisma.mealPreset.create({
      data: {
        name: 'Pasta Primavera',
        categoryId: lunchId,
        calories: 550,
        description: 'Whole wheat pasta with seasonal vegetables',
        image_url: 'https://api.example.com/meals/pasta.jpg',
      },
    }),
    // Dinner
    prisma.mealPreset.create({
      data: {
        name: 'Grilled Salmon',
        categoryId: dinnerId,
        calories: 520,
        description: 'Salmon fillet with asparagus and lemon',
        image_url: 'https://api.example.com/meals/salmon.jpg',
      },
    }),
    prisma.mealPreset.create({
      data: {
        name: 'Beef Stir Fry',
        categoryId: dinnerId,
        calories: 580,
        description: 'Lean beef with broccoli and brown rice',
        image_url: 'https://api.example.com/meals/beef-stirfry.jpg',
      },
    }),
    prisma.mealPreset.create({
      data: {
        name: 'Vegetable Curry',
        categoryId: dinnerId,
        calories: 420,
        description: 'Mild curry with chickpeas and vegetables',
        image_url: 'https://api.example.com/meals/curry.jpg',
      },
    }),
    // Snacks
    prisma.mealPreset.create({
      data: {
        name: 'Protein Bar',
        categoryId: snackId,
        calories: 200,
        description: 'Energy bar with nuts and chocolate',
        image_url: 'https://api.example.com/meals/protein-bar.jpg',
      },
    }),
    prisma.mealPreset.create({
      data: {
        name: 'Apple with Almond Butter',
        categoryId: snackId,
        calories: 250,
        description: 'Fresh apple with 2 tbsp almond butter',
        image_url: 'https://api.example.com/meals/apple-almond.jpg',
      },
    }),
  ]);

  console.log(`✅ Created ${mealPresets.length} meal presets\n`);

  // ============= Create Exercise Presets =============
  console.log('🏋️  Creating exercise presets...');

  const exercisePresets = await Promise.all([
    prisma.exercisePreset.create({
      data: {
        name: 'Running',
        description: 'Steady pace running',
        calories_per_unit: 80, // per 10 minutes
        icon_url: 'https://api.example.com/icons/running.png',
      },
    }),
    prisma.exercisePreset.create({
      data: {
        name: 'Cycling',
        description: 'Moderate intensity cycling',
        calories_per_unit: 70, // per 10 minutes
        icon_url: 'https://api.example.com/icons/cycling.png',
      },
    }),
    prisma.exercisePreset.create({
      data: {
        name: 'Swimming',
        description: 'Freestyle swimming',
        calories_per_unit: 90, // per 10 minutes
        icon_url: 'https://api.example.com/icons/swimming.png',
      },
    }),
    prisma.exercisePreset.create({
      data: {
        name: 'Weight Training',
        description: 'Strength training with weights',
        calories_per_unit: 60, // per 10 minutes
        icon_url: 'https://api.example.com/icons/weights.png',
      },
    }),
    prisma.exercisePreset.create({
      data: {
        name: 'Yoga',
        description: 'Flexibility and relaxation yoga',
        calories_per_unit: 40, // per 10 minutes
        icon_url: 'https://api.example.com/icons/yoga.png',
      },
    }),
    prisma.exercisePreset.create({
      data: {
        name: 'HIIT Workout',
        description: 'High intensity interval training',
        calories_per_unit: 120, // per 10 minutes
        icon_url: 'https://api.example.com/icons/hiit.png',
      },
    }),
    prisma.exercisePreset.create({
      data: {
        name: 'Walking',
        description: 'Brisk walking',
        calories_per_unit: 45, // per 10 minutes
        icon_url: 'https://api.example.com/icons/walking.png',
      },
    }),
  ]);

  console.log(`✅ Created ${exercisePresets.length} exercise presets\n`);

  // ============= Create Column Categories =============
  console.log('📰 Creating column categories...');

  const columnCategories = await Promise.all([
    prisma.columnCategory.create({
      data: {
        name: 'Health Tips',
        display_order: 1,
      },
    }),
    prisma.columnCategory.create({
      data: {
        name: 'Diet Advice',
        display_order: 2,
      },
    }),
    prisma.columnCategory.create({
      data: {
        name: 'Exercise Guide',
        display_order: 3,
      },
    }),
    prisma.columnCategory.create({
      data: {
        name: 'Wellness',
        display_order: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${columnCategories.length} column categories\n`);

  // ============= Create Sample Columns =============
  console.log('📝 Creating sample columns...');

  await Promise.all([
    prisma.column.create({
      data: {
        adminId: adminUser.id,
        title: '10 Tips for a Healthy Lifestyle',
        content:
          '# 10 Tips for a Healthy Lifestyle\n\n1. Stay hydrated\n2. Get enough sleep\n3. Exercise regularly\n4. Eat balanced meals\n5. Manage stress\n6. Limit processed foods\n7. Get sunlight\n8. Social connections\n9. Regular checkups\n10. Practice mindfulness',
        categoryId: columnCategories[0].id,
        image_url: 'https://api.example.com/columns/health-tips.jpg',
        published: true,
        view_count: 0,
      },
    }),
    prisma.column.create({
      data: {
        adminId: adminUser.id,
        title: 'Nutrition Guide for Beginners',
        content:
          '# Understanding Nutrition\n\nProper nutrition is the foundation of health. This guide covers macronutrients, micronutrients, and how to build balanced meals.',
        categoryId: columnCategories[1].id,
        image_url: 'https://api.example.com/columns/nutrition.jpg',
        published: true,
        view_count: 0,
      },
    }),
    prisma.column.create({
      data: {
        adminId: adminUser.id,
        title: 'Start Your Fitness Journey',
        content:
          '# Beginner Fitness Guide\n\nThis article covers how to start exercising, what equipment you need, and common mistakes to avoid.',
        categoryId: columnCategories[2].id,
        image_url: 'https://api.example.com/columns/fitness.jpg',
        published: true,
        view_count: 0,
      },
    }),
  ]);

  console.log('✅ Created sample columns\n');

  // ============= Generate 30+ Days of Demo Data =============
  console.log('📅 Generating 30+ days of health tracking demo data...');

  const today = new Date();
  const dayCount = 35; // 35 days of data
  const moods = ['happy', 'neutral', 'sad', 'excited'];

  for (let i = dayCount - 1; i >= 0; i--) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - i);
    const dateStr = currentDate.toISOString().split('T')[0];

    // ============= Body Records (3 per week) =============
    if (i % 3 === 0) {
      const weight = 75 + Math.random() * 3 - 1.5; // 73.5 - 76.5 kg
      const bodyFat = 20 + Math.random() * 5 - 2.5; // 17.5 - 22.5 %

      await prisma.bodyRecord.create({
        data: {
          userId: demoUser.id,
          weight: parseFloat(weight.toFixed(1)),
          bodyFatPercentage: parseFloat(bodyFat.toFixed(1)),
          date: currentDate,
          notes: `Weight check for ${dateStr}`,
        },
      });
    }

    // ============= Meals (2-3 per day) =============
    const mealsPerDay = Math.floor(Math.random() * 2) + 2; // 2-3 meals

    for (let m = 0; m < mealsPerDay; m++) {
      const mealPreset = mealPresets[Math.floor(Math.random() * mealPresets.length)];
      const hour = 6 + m * 6 + Math.floor(Math.random() * 2); // Distribute throughout day
      const time = `${String(hour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

      await prisma.userMeal.create({
        data: {
          userId: demoUser.id,
          mealPresetId: mealPreset.id,
          date: currentDate,
          time,
          calories: mealPreset.calories,
          servings: 1,
        },
      });
    }

    // ============= Exercises (0-2 per day) =============
    const exercisePerDay = Math.floor(Math.random() * 2); // 0-1 exercises

    for (let e = 0; e < exercisePerDay; e++) {
      const exercise = exercisePresets[Math.floor(Math.random() * exercisePresets.length)];
      const duration = 20 + Math.floor(Math.random() * 40); // 20-60 minutes
      const calories = (exercise.calories_per_unit * duration) / 10;
      const hour = 16 + Math.floor(Math.random() * 6); // Afternoon/evening
      const time = `${String(hour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

      await prisma.userExercise.create({
        data: {
          userId: demoUser.id,
          exercisePresetId: exercise.id,
          date: currentDate,
          time,
          duration,
          calories_burned: Math.floor(calories),
        },
      });
    }

    // ============= Diary Entries (occasional, 50% chance) =============
    if (Math.random() > 0.5) {
      const moodIdx = Math.floor(Math.random() * moods.length);
      const hour = 21 + Math.floor(Math.random() * 3); // Evening
      const time = `${String(hour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

      await prisma.diaryEntry.create({
        data: {
          userId: demoUser.id,
          title: `Day ${dayCount - i} Reflection`,
          content: `Today was a good day! I focused on staying healthy and active. Managed to complete my daily goals and felt productive.`,
          mood: moods[moodIdx],
          date: currentDate,
          time,
        },
      });
    }

    // ============= Daily Goals (auto-create and update) =============
    const mealsCount = mealsPerDay;
    const exercisesCount = exercisePerDay;
    const diaryWritten = Math.random() > 0.5 ? 1 : 0;

    const achievementRate = Math.round(
      ((mealsCount + exercisesCount + diaryWritten) / (3 + 1 + 1)) * 100,
    );

    await prisma.dailyGoal.create({
      data: {
        userId: demoUser.id,
        date: currentDate,
        target_meals: 3,
        target_exercises: 1,
        target_diary: 1,
        meals_logged: Math.min(mealsCount, 3),
        exercises_logged: Math.min(exercisesCount, 1),
        diary_written: diaryWritten,
        achievement_rate: achievementRate,
      },
    });

    if (i % 5 === 0) {
      process.stdout.write('.');
    }
  }

  console.log('\n✅ Generated 30+ days of demo data\n');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Seed Summary:');
  console.log(`  - Users: 1 demo user + 1 admin`);
  console.log(`  - Meal Categories: ${mealCategories.length}`);
  console.log(`  - Meal Presets: ${mealPresets.length}`);
  console.log(`  - Exercise Presets: ${exercisePresets.length}`);
  console.log(`  - Column Categories: ${columnCategories.length}`);
  console.log(`  - Columns: 3 published articles`);
  console.log(`  - Days of Data: ${dayCount}`);
  console.log(`\n🔑 Demo Credentials:`);
  console.log(`  - Email: demo@example.com`);
  console.log(`  - Password: demo123456`);
  console.log(`\n🔐 Admin Credentials:`);
  console.log(`  - Email: admin@example.com`);
  console.log(`  - Password: demo123456`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
