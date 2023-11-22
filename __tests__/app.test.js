const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const {
  topicData,
  userData,
  articleData,
  commentData,
} = require("../db/data/test-data");
const endpoints = require("../endpoints.json");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed({ topicData, userData, articleData, commentData });
});

describe("General errors", () => {
  test("404: returns a not found for any route that is not defined", () => {
    return request(app)
      .get("/api/not-a-route")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
});

describe("GET /api", () => {
  test("200: this endpoint returns a description of itself and an example response", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.endpoints).toEqual(endpoints);
      });
  });
  test("200: responds with an object that describes all endpoints available, each with a description, array of queries and object for responses", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const endpoints = response.body.endpoints;
        for (const path in endpoints) {
          const endpoint = endpoints[path];
          expect(endpoint).toMatchObject({
            description: expect.any(String),
            queries: expect.any(Array),
            exampleResponse: expect.any(Object),
          });
          const endOfPath = path.slice(path.lastIndexOf("/") + 1);
          expect(endpoint.exampleResponse.hasOwnProperty(endOfPath)).toBe(true);
        }
      });
  });
});

describe("GET /api/topics", () => {
  test("200: returns a 200 status code", () => {
    return request(app).get("/api/topics").expect(200);
  });
  test("200: returns a list of topics, with the same length as in test data", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        expect(response.body.topics.length).toBe(3);
      });
  });
  test("200: returns a list of topics that match the test data", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
});

describe("GET: /api/articles", () => {
  test("200: returns a list of articles with all properties from the database", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles.length).toBe(13)
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
      });
  });
  test("200: returns the correct comment count for each article in the list", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        // hardcoded from a query to the test database, this won't change as tests are built up
        const arrayOfCommentCounts = [
          { article_id: 5, comment_count: "2" },
          { article_id: 6, comment_count: "1" },
          { article_id: 1, comment_count: "11" },
          { article_id: 9, comment_count: "2" },
          { article_id: 3, comment_count: "2" },
        ];
        articles.forEach((article) => {
          const currentArticleComments = arrayOfCommentCounts.find(
            (comment_counts) => comment_counts.article_id === article.article_id
          );
          if (currentArticleComments) {
            expect(article.comment_count).toBe(currentArticleComments["comment_count"]);
          } else {
            expect(article.comment_count).toBe("0");
          }
        });
      });
  });
  test("200: the articles are sorted by date in descending order by default", () => {
    return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
            const articles = response.body.articles
            expect(articles).toBeSortedBy('created_at', {descending: true})
        })
  });
  test('200: the articles do not have a body property', () => {
    return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
            const articles = response.body.articles
            articles.forEach((article) => {
                expect(article.hasOwnProperty("body")).toBe(false)
            })
        })
  });
  // errors should only occur with this endpoint when we have queries (later tasks)
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

describe('GET /api/articles/:article_id/comments', () => {
    test('200: responds with all of the comments for a single article', () => {
        return request(app)
        .get('/api/article/1/comments')
        .expect(200)
        .then((response) => {
            const comments = response.body.comments
            expect(comments.length).toBe(11)
            comments.forEach((comment) => {
                expect(comment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: expect.any(Number),
                    created_at: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    article_id: 1
                })
            })
        })
    });
    test('200: returns a random articles\' comments', () => {
        const randomId = Math.ceil(Math.random() * 13)
        return request(app)
        .get(`/api/article/${randomId}/comments`)
        .expect(200)
        .then((response) => {
            const comments = response.body.comments
            comments.forEach((comment) => {
                expect(comment.article_id).toBe(randomId)
            })
        })
    });
    test('200: returns the most recent comments first', () => {
        return request(app)
        .get('/api/article/1/comments')
        .expect(200)
        .then((response) => {
            const comments = response.body.comments
            expect(comments).toBeSortedBy('created_at', {descending: true})
        })
    });
    test('200: returns an empty array when the article has no comments', () => {
        return request(app)
        .get('/api/article/4/comments')
        .expect(200)
        .then((response) => {
            const comments = response.body.comments
            expect(comments).toEqual([])
        })
    });
    test('404: returns not found when the article does not exist', () => {
        return request(app)
        .get('/api/article/100/comments')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('Not found')
        })
    });
    test('400: returns bad request when article_id is not an integer ', () => {
        return request(app)
        .get('/api/article/not_integer/comments')
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })
    });
}); 

describe('PATCH: /api/articles/:article_id', () => {
  test('200: should update an article and return the updated article with the new number of votes', () => {
    const updatedArticle = {
      inc_votes: 1
    }
    return request(app)
    .patch('/api/articles/1')
    .send(updatedArticle)
    .expect(200)
    .then((response) => {
      const article = response.body.article
      expect(article.votes).toBe(101)
    })
  });
  test('200: can also decrement votes', () => {
    const updatedArticle = {
      inc_votes: -100
    }
    return request(app)
    .patch('/api/articles/1')
    .send(updatedArticle)
    .expect(200)
    .then((response) => {
      const article = response.body.article
      expect(article.votes).toBe(0)
    })
  });
});