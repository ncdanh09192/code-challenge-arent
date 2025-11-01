import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Health Management API E2E Tests', () => {
  let app: INestApplication;
  let demoUserToken: string;
  let adminUserToken: string;
  let newUserToken: string;
  const testUser = {
    email: `test${Date.now()}@example.com`,
    username: `user${Math.random().toString(36).slice(2, 8)}`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login as demo user
    let res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'demo@example.com',
        password: 'demo123456',
      });
    demoUserToken = res.body.accessToken;

    // Login as admin user
    res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'demo123456',
      });
    adminUserToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ============= HEALTH CHECK =============
  describe('Health Check', () => {
    it('GET /health should return ok status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  // ============= AUTHENTICATION =============
  describe('Authentication', () => {
    it('POST /auth/register should create new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('POST /auth/login should return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          newUserToken = res.body.accessToken;
        });
    });

    it('GET /auth/me should return current user', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('POST /auth/login with wrong password should fail', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  // ============= BODY RECORDS =============
  describe('Body Records', () => {
    let bodyRecordId: string;

    it('POST /body-records should create body record', () => {
      return request(app.getHttpServer())
        .post('/body-records')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          weight: 75.5,
          bodyFatPercentage: 20.5,
          date: new Date().toISOString().split('T')[0],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.weight).toBe(75.5);
          bodyRecordId = res.body.id;
        });
    });

    it('GET /body-records should list user records', () => {
      return request(app.getHttpServer())
        .get('/body-records')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /body-records/latest should get latest record', () => {
      return request(app.getHttpServer())
        .get('/body-records/latest')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('weight');
        });
    });

    it('GET /body-records/stats should return statistics', () => {
      return request(app.getHttpServer())
        .get('/body-records/stats')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('current');
          expect(res.body).toHaveProperty('change');
        });
    });

    it('GET /body-records/trend should return trend data', () => {
      return request(app.getHttpServer())
        .get('/body-records/trend')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /body-records/:id should get specific record', () => {
      return request(app.getHttpServer())
        .get(`/body-records/${bodyRecordId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(bodyRecordId);
        });
    });

    it('PUT /body-records/:id should update record', () => {
      return request(app.getHttpServer())
        .put(`/body-records/${bodyRecordId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ weight: 76.0 })
        .expect(200)
        .expect((res) => {
          expect(res.body.weight).toBe(76);
        });
    });

    it('DELETE /body-records/:id should delete record', () => {
      return request(app.getHttpServer())
        .delete(`/body-records/${bodyRecordId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(204);
    });
  });

  // ============= MEALS =============
  describe('Meals', () => {
    let mealId: string;
    let mealPresetId: string;

    it('GET /meals/presets should list presets', () => {
      return request(app.getHttpServer())
        .get('/meals/presets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            mealPresetId = res.body[0].id;
          }
        });
    });

    it('GET /meals/presets/categories should list categories', () => {
      return request(app.getHttpServer())
        .get('/meals/presets/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('POST /meals/user should log meal', () => {
      return request(app.getHttpServer())
        .post('/meals/user')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          mealPresetId,
          date: new Date().toISOString().split('T')[0],
          calories: 500,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          mealId = res.body.id;
        });
    });

    it('GET /meals/user should list user meals', () => {
      return request(app.getHttpServer())
        .get('/meals/user')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /meals/user/date/:date should filter by date', () => {
      const date = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/meals/user/date/${date}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /meals/user/stats/:date should return stats', () => {
      const date = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/meals/user/stats/${date}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalCalories');
        });
    });

    it('PUT /meals/user/:id should update meal', () => {
      return request(app.getHttpServer())
        .put(`/meals/user/${mealId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ calories: 600 })
        .expect(200)
        .expect((res) => {
          expect(res.body.calories).toBe(600);
        });
    });

    it('DELETE /meals/user/:id should delete meal', () => {
      return request(app.getHttpServer())
        .delete(`/meals/user/${mealId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(204);
    });
  });

  // ============= EXERCISES =============
  describe('Exercises', () => {
    let exerciseId: string;
    let exercisePresetId: string;

    it('GET /exercises/presets should list presets', () => {
      return request(app.getHttpServer())
        .get('/exercises/presets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            exercisePresetId = res.body[0].id;
          }
        });
    });

    it('POST /exercises/user should log exercise', () => {
      return request(app.getHttpServer())
        .post('/exercises/user')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          exercisePresetId,
          date: new Date().toISOString().split('T')[0],
          duration: 30,
          calories_burned: 300,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          exerciseId = res.body.id;
        });
    });

    it('GET /exercises/user should list user exercises', () => {
      return request(app.getHttpServer())
        .get('/exercises/user')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /exercises/user/date/:date should filter by date', () => {
      const date = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/exercises/user/date/${date}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /exercises/user/stats/:date should return stats', () => {
      const date = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/exercises/user/stats/${date}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalDuration');
        });
    });

    it('PUT /exercises/user/:id should update exercise', () => {
      return request(app.getHttpServer())
        .put(`/exercises/user/${exerciseId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ duration: 45 })
        .expect(200)
        .expect((res) => {
          expect(res.body.duration).toBe(45);
        });
    });

    it('DELETE /exercises/user/:id should delete exercise', () => {
      return request(app.getHttpServer())
        .delete(`/exercises/user/${exerciseId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(204);
    });
  });

  // ============= DIARY =============
  describe('Diary & Daily Goals', () => {
    let diaryId: string;

    it('POST /diary/entries should create entry', () => {
      return request(app.getHttpServer())
        .post('/diary/entries')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          title: 'Test Entry',
          content: 'Test content',
          mood: 'happy',
          date: new Date().toISOString().split('T')[0],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          diaryId = res.body.id;
        });
    });

    it('GET /diary/entries should list entries', () => {
      return request(app.getHttpServer())
        .get('/diary/entries')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /diary/entries/date/:date should filter by date', () => {
      const date = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/diary/entries/date/${date}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /diary/goals/date/:date should return daily goal', () => {
      const date = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/diary/goals/date/${date}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('GET /diary/achievement/date/:date should return achievement', () => {
      const date = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/diary/achievement/date/${date}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('achievementRate');
        });
    });

    it('GET /diary/achievement/stats should return stats', () => {
      return request(app.getHttpServer())
        .get('/diary/achievement/stats')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('averageAchievementRate');
        });
    });

    it('PUT /diary/entries/:id should update entry', () => {
      return request(app.getHttpServer())
        .put(`/diary/entries/${diaryId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({ title: 'Updated' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated');
        });
    });

    it('DELETE /diary/entries/:id should delete entry', () => {
      return request(app.getHttpServer())
        .delete(`/diary/entries/${diaryId}`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(204);
    });
  });

  // ============= COLUMNS =============
  describe('Columns', () => {
    let columnId: string;
    let categoryId: string;

    it('GET /columns/categories should list categories', () => {
      return request(app.getHttpServer())
        .get('/columns/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            categoryId = res.body[0].id;
          }
        });
    });

    it('GET /columns should list published columns', () => {
      return request(app.getHttpServer())
        .get('/columns')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            columnId = res.body[0].id;
          }
        });
    });

    it('GET /columns/:id should get column details', () => {
      return request(app.getHttpServer())
        .get(`/columns/${columnId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('POST /columns should create column (admin)', () => {
      return request(app.getHttpServer())
        .post('/columns')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .send({
          title: 'Admin Test Column',
          content: 'Test content',
          categoryId: categoryId || 'health-tips',
          published: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          columnId = res.body.id;
        });
    });

    it('GET /columns/admin/my-columns should list admin columns', () => {
      return request(app.getHttpServer())
        .get('/columns/admin/my-columns')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  // ============= ERROR CASES =============
  describe('Error Handling', () => {
    it('GET /body-records without token should return 401', () => {
      return request(app.getHttpServer())
        .get('/body-records')
        .expect(401);
    });

    it('POST /auth/login with invalid email should return 401', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        })
        .expect(401);
    });

    it('POST /auth/register with missing email should return 400', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          password: 'password',
        })
        .expect(400);
    });
  });
});
