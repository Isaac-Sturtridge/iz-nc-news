# Northcoders News API

## Summary

This is an API designed for a news site. It can host articles, which accept comments from users. Articles can be voted on and filtered by topic.

Currently available endpoints are listed in app.js.

The project uses Node, Express and PostgreSQL.

## Hosting

The project is hosted at https://iz-nc-news.onrender.com

## Using

To clone, use `git clone <repo url>`

The following dependencies will need to be installed with `npm install <dependency>`:

### Dependencies
    dotenv: ^16.3.1
    express: ^4.18.2
    pg: ^8.11.3
    pg-format: ^1.0.4

### Dev_dependencies
    husky: ^8.0.2
    jest: ^27.5.1
    jest-extended: ^2.0.0
    jest-sorted: ^1.0.14
    nodemon: ^3.0.1
    supertest: ^6.3.3

To seed, use `npm run seed` to seed the development database.

To test, use `npm run test`.


## ENV files info:

To create local databases, *.env.test* and *.env.development* are needed. They connect to local databases **nc_news_test** and **nc_news** respectively.

## Versions

This API was made with Node v21.1.0 and PSQL v15.4 and is supported for those versions onward only.
