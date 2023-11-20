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

describe('General errors', () => {
    test('404: returns a not found for any route that is not defined', () => {
        return request(app)
        .get('/api/not-a-route')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('Not found');
        })
    })
});


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
            expect(response.body.topics.length).toBe(3);
        })
    });
    test('200: returns a list of topics that match the test data', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            const topics = response.body.topics
            topics.forEach((topic) => {
                expect(topic).toMatchObject({
                    description: expect.any(String),
                    slug: expect.any(String)
                })
            })
        })
    });
});