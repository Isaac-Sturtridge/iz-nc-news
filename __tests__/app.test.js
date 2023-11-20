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

describe('GET api/articles/:article_id', () => {
    test('200: responds with a specific article object which has all necessary properties', () => {
        return request(app)
        .get('/api/article/1')
        .expect(200)
        .then((response) => {
            const article = response.body.article
            expect(article).toMatchObject({
                author: "butter_bridge",
                title: "Living in the shadow of a great man",
                article_id: 1,
                body: "I find this existence challenging",
                topic: "mitch",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
            })
        })
    });
    test('200: responds correctly with a random article', () => {
        const randomId = Math.ceil(Math.random() * 13)
        return request(app)
        .get(`/api/article/${randomId}`)
        .expect(200)
        .then((response) => {
            const article = response.body.article
            expect(article).toMatchObject({
                author: expect.any(String),
                title: expect.any(String),
                article_id: randomId,
                body: expect.any(String),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String)
            })
        })
    });
    test('404: returns not found if valid id given but article does not exist', () => {
        return request(app)
        .get('/api/article/999')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('Not found')
        })
    });

    test('400: returns bad request if article_id is not an integer', () => {
        return request(app)
        .get('/api/article/not_an_integer')
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })     
    });
});