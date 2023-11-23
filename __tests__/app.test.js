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
  describe('Tests for topic query', () => {
    test('200: The endpoint accepts a query of topic and filters the list by the selected topic', () => {
      return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles
        expect(articles.length).toBe(12)
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: 'mitch',
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        })
      })
    });
    test('200: should return an empty list when given a topic that has no articles', () => {
      return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles
        expect(articles.length).toBe(0)
      })
    });
    test('404: should return not found when given a topic that does not exist', () => {
      return request(app)
      .get("/api/articles?topic=unobtainium")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found")
      })
    });
  });
  describe('Tests for sort_by and order query', () => {
    test('200: The endpoint accepts a query of sort_by and returns articles sorted by the desired column ', () => {
      return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy('author', {descending: true})
      })
    });
    test('400: should reject any sort_by queries that are not existing columns', () => {
      return request(app)
      .get("/api/articles?sort_by=bad_column")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request')
      })
    });
    test('400: rejects SQL injection of sort_by', () => {
      return request(app)
      .get("/api/articles?sort_by=author;SELECT * FROM articles;")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request')
      })
    });
    test('200: The endpoint accepts a query of order and returns articles sorted ascending or descending', () => {
      return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy('created_at', {descending: false})
      })
    });
    test('400: should reject any order queries that are not asc or desc', () => {
      return request(app)
      .get("/api/articles?order=bad_order")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request')
      })
    });
    test('400: rejects SQL injection of order', () => {
      return request(app)
      .get("/api/articles?order=asc;SELECT * FROM articles;")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request')
      })
    });
    test('200: should work for a combination of order and sort_by', () => {
      return request(app)
      .get("/api/articles?sort_by=author&order=asc")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy('author', {descending: false})
      })
    });
    test('200: should allow topic filtering too', () => {
      return request(app)
      .get("/api/articles?sort_by=author&order=asc&topic=mitch")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles).toBeSortedBy('author', {descending: false})
        articles.forEach((article) => {
          expect(article.topic).toBe('mitch')
        })
      })
    });
  });
});

describe('GET api/articles/:article_id', () => {
    test('200: responds with a specific article object which has all necessary properties', () => {
        return request(app)
        .get('/api/articles/1')
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
        .get(`/api/articles/${randomId}`)
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
        .get('/api/articles/999')
        .expect(404)
        .then((response) => {
            expect(response.body.msg).toBe('Not found')
        })
    });

    test('400: returns bad request if article_id is not an integer', () => {
        return request(app)
        .get('/api/articles/not_an_integer')
        .expect(400)
        .then((response) => {
            expect(response.body.msg).toBe('Bad request')
        })     
    });
    test('200: returns the comment count for a single article', () => {
      return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then((response) => {
        const article = response.body.article
        expect(article.comment_count).toBe(11)
      })
    });
    test('200: returns the comment count for an article with 0 comments', () => {
      return request(app)
      .get(`/api/articles/4`)
      .expect(200)
      .then((response) => {
        const article = response.body.article
        expect(article.comment_count).toBe(0)
      })
    });
});


describe('GET /api/articles/:article_id/comments', () => {
  test('200: responds with all of the comments for a single article', () => {
      return request(app)
      .get('/api/articles/1/comments')
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
      .get(`/api/articles/${randomId}/comments`)
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
      .get('/api/articles/1/comments')
      .expect(200)
      .then((response) => {
          const comments = response.body.comments
          expect(comments).toBeSortedBy('created_at', {descending: true})
      })
  });
  test('200: returns an empty array when the article has no comments', () => {
      return request(app)
      .get('/api/articles/4/comments')
      .expect(200)
      .then((response) => {
          const comments = response.body.comments
          expect(comments).toEqual([])
      })
  });
  test('404: returns not found when the article does not exist', () => {
      return request(app)
      .get('/api/articles/100/comments')
      .expect(404)
      .then((response) => {
          expect(response.body.msg).toBe('Not found')
      })
  });
  test('400: returns bad request when article_id is not an integer ', () => {
      return request(app)
      .get('/api/articles/not_integer/comments')
      .expect(400)
      .then((response) => {
          expect(response.body.msg).toBe('Bad request')
      })
  });
}); 


describe('POST /api/articles/:article_id/comments', () => {
  test('201: successfully adds a new comment to the specified article', () => {
    const input = {
      username: "lurker",
      body: "I don't know how but they found me"
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(input)
    .expect(201)
    .then((response) => {
      const comment = response.body.comment
      expect(comment).toMatchObject({
        body: "I don't know how but they found me",
        votes: 0,
        article_id: 1,
        created_at: expect.any(String),
        author: "lurker"
      })
    })
  });
  test('404: tries to post a comment to an article that does not exist', () => {
    const input = {
      username: "lurker",
      body: "I don't know how but they found me"
    }
    return request(app)
    .post('/api/articles/999/comments')
    .send(input)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe("Not found")
    })
  });
  test('400: tries to post a comment to an article_id that cannot be an id', () => {
    const input = {
      username: "lurker",
      body: "I don't know how but they found me"
    }
    return request(app)
    .post('/api/articles/not_an_id/comments')
    .send(input)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe("Bad request")
    })
  });
  test('404: the username does not exist in the database', () => {
    const input = {
      username: "bad_user",
      body: "I don't know how but they found me"
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(input)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe("Not found")
    })
  });
  // most comment boxes I know about do not allow an empty post which is why this error
  test('400: does not allow posting an empty comment', () => {
    const input = {
      username: "lurker",
      body: ""
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(input)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
  test('400: does not allow excess keys in the request body', () => {
    const input = {
      username: "lurker",
      body: "bad comment",
      bad_key: "bad_key"
    }
    return request(app)
    .post('/api/articles/1/comments')
    .send(input)
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
      expect(article).toMatchObject({
        author: "butter_bridge",
        title: "Living in the shadow of a great man",
        article_id: 1,
        body: "I find this existence challenging",
        topic: "mitch",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: 101,
        article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    })
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
  // no error if votes go below zero
  test('404: article is a valid input but does not exist', () => {
    const updatedArticle = {
      inc_votes: 1
    }
    return request(app)
    .patch('/api/articles/999')
    .send(updatedArticle)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Not found')
    })
  });
  test('400: article is not a valid input', () => {
    const updatedArticle = {
      inc_votes: 1
    }
    return request(app)
    .patch('/api/articles/not_integer')
    .send(updatedArticle)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
  // invalid inc_votes 
  test('400: inc_votes is in an invalid format', () => {
    const updatedArticle = {
      inc_votes: 'cat'
    }
    return request(app)
    .patch('/api/articles/1')
    .send(updatedArticle)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
});

describe('DELETE: /api/comments/:comment_id', () => {
  test('204: should successfully delete a comment', () => {
    return request(app)
    .delete('/api/comments/1')
    .expect(204)
  });
  test('404: the comment is a valid id but it does not exist', () => {
    return request(app)
    .delete('/api/comments/999')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Not found')
    })
  });
  test('400: should respond with a bad request when the comment is not a valid id', () => {
    return request(app)
    .delete('/api/comments/bad_comment_id')
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
});


describe('GET: /api/users', () => {
  test('200: returns a list of all users', () => {
    return request(app)
    .get('/api/users')
    .expect(200)
    .then((response) => {
      const users = response.body.users
      expect(users.length).toBe(4)
      users.forEach((user) => {
        expect(user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String)
        })
      })
    })
  });
  // as with GET articles, errors should only occur once we have queries
});

describe('GET: /api/users/:username', () => {
  test('200: returns a complete username object', () => {
    return request(app)
    .get('/api/users/icellusedkars')
    .expect(200)
    .then((response) => {
      const user = response.body.user
      expect(user).toMatchObject({
        username: 'icellusedkars',
        name: 'sam',
        avatar_url: 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4'
      })
    })
  });
  test('404: returns not found when the username does not exist', () => {
    return request(app)
    .get('/api/users/tabularasa')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Not found')
    })
  });
});


describe('PATCH: /api/comments/:comment_id', () => {
  test('200: should update a comment and return the updated comment with the new number of votes', () => {
    const updatedComment = {
      inc_votes: 1
    }
    return request(app)
    .patch('/api/comments/1')
    .send(updatedComment)
    .expect(200)
    .then((response) => {
      const comment = response.body.comment
      expect(comment).toMatchObject({
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 17,
        author: "butter_bridge",
        article_id: 9,
        created_at: "2020-04-06T12:17:00.000Z",
      })
    })
  });
  test('200: should decrement comments', () => {
    const updatedComment = {
      inc_votes: -1
    }
    return request(app)
    .patch('/api/comments/1')
    .send(updatedComment)
    .expect(200)
    .then((response) => {
      const comment = response.body.comment
      expect(comment.votes).toBe(15)
    })
  });
  test('404: comment does not exist', () => {
    const updatedComment = {
      inc_votes: 1
    }
    return request(app)
    .patch('/api/comments/999')
    .send(updatedComment)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Not found')
    })
  });
  test('400: bad comment format', () => {
    const updatedComment = {
      inc_votes: 1
    }
    return request(app)
    .patch('/api/comments/bad_comment')
    .send(updatedComment)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
  test('400: inc_votes is in an invalid format', () => {
    const updatedComment = {
      inc_votes: 'cat'
    }
    return request(app)
    .patch('/api/comments/1')
    .send(updatedComment)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
});

describe('POST: /api/articles', () => {
  test('201: successfully adds a new article', () => {
    const newArticle = {
      title: "I know I'm not supposed to say anything",
      author: "lurker",
      body: "But I just can't handle it anymore. Lurking is not using myself to my fullest potential. Cats are cute.",
      topic: "cats",
      article_img_url: 'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(201)
    .then((response) => {
      const article = response.body.article
      expect(article).toMatchObject({
        title: "I know I'm not supposed to say anything",
        author: "lurker",
        body: "But I just can't handle it anymore. Lurking is not using myself to my fullest potential. Cats are cute.",
        topic: "cats",
        article_img_url: "https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        votes: 0,
        article_id: 14,
        created_at: expect.any(String),
        comment_count: 0
      })
    })
  });
  test('404: cannot post for an author that does not exist', () => {
    const newArticle = {
      title: "I know I'm not supposed to say anything",
      author: "tabularasa",
      body: "But I just can't handle it anymore. Lurking is not using myself to my fullest potential. Cats are cute.",
      topic: "cats",
    }
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Not found')
    })
  });
  test('404: cannot post to a topic that does not exist', () => {
    const newArticle = {
      title: "I know I'm not supposed to say anything",
      author: "lurker",
      body: "But I just can't handle it anymore. Lurking is not using myself to my fullest potential. Dogs are cute.",
      topic: "dogs",
    }
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Not found')
    })
  });
  test('400: returns bad request if given an article_img_url that is not an image', () => {
    const newArticle = {
      title: "I know I'm not supposed to say anything",
      author: "tabularasa",
      body: "But I just can't handle it anymore. Lurking is not using myself to my fullest potential. Cats are cute.",
      topic: "cats",
      article_img_url: "not_an_image"
    }
    return request(app)
    .post('/api/articles')
    .send(newArticle)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request')
    })
  });
});