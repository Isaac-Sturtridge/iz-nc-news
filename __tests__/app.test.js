const request = require('supertest');
const app = require('../app');
const db = require('../db/connection')
const seed = require('../db/seeds/seed')
const { topicData, userData, articleData, commentData } = require('../db/data/test-data')

afterAll(() => {
    return db.end()
})

beforeEach(() => {
    return seed({ topicData, userData, articleData, commentData })
})


describe('GET api/topics', () => {
    test('200: returns a 200 status code', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
    });
    test('200: returns a list of topics, with the same length as in test data', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            expect(response.body.length).toBe(3)
        })
    });
});