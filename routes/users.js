const Boom = require('boom');
const Joi = require('joi');
const api = require('../mqtt/api');
const JWT = require('jsonwebtoken');

module.exports = [
    {
        method: 'POST',
        path: '/login',
        config: {
            tags: ['api'],
            auth: false,
            validate: {
                payload: {
                    username: Joi.string()
                        .required(),
                    password: Joi.string()
                        .required(),
                    display_name: Joi.string()
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                try {
                    const result = await db.collection('users')
                        .findOne({ username: request.payload.username, password: request.payload.password });

                    // const token = JWT.sign(result, '%$^$&8fdh32%87', { expiresIn: 24 * 60 * 60 * 1000 });
                    // db.collection('token').insert({ user: result.data._id, token: token });

                    return h.response({
                        statusCode: 200,
                        message: '/login.',
                        data: result
                    }).code(200);
                } catch (err) {
                    console.log(err);
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/users',
        config: {
            tags: ['api'],
            auth: false,
            async handler(request, h) {
                const db = request.mongo.db;
                try {
                    const result = await db.collection('users').find().toArray();
                    return h.response({
                        statusCode: 200,
                        message: 'Get all users.',
                        data: result
                    }).code(200);
                } catch (err) {
                    console.log(err);
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/users/{id}',
        config: {
            tags: ['api'],
            auth: false,
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('ObjectID'),
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;
                try {
                    const result = await db.collection('users').findOne({ _id: new ObjectID(request.params.id) });
                    const token = JWT.sign(session, process.env.JWT_SECRET);
                    return h.response({
                        statusCode: 200,
                        message: 'Get one users.',
                        data: result
                    }).code(200);
                } catch (err) {
                    console.log(err);
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/users',
        config: {
            tags: ['api'],
            auth: false,
            validate: {
                payload: {
                    username: Joi.string()
                        .required(),
                    password: Joi.string()
                        .required(),
                    display_name: Joi.string()
                        .required()
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                try {
                    await db.collection('users').insert(request.payload);
                    return h.response({
                        statusCode: 201,
                        message: 'Create users susscess.',
                        data: request.payload
                    }).code(201);
                } catch (err) {
                    console.log(err);
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        }
    },
    {
        method: 'PUT',
        path: '/users/{id}',
        config: {
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('ObjectID'),
                },
                payload: {
                    username: Joi.string(),
                    password: Joi.string(),
                    display_name: Joi.string()
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;
                try {
                    console.log(request.payload);
                    await db.collection('users').update(
                        { _id: new ObjectID(request.params.id) },
                        { $set: request.payload }
                    );

                    return h.response({
                        statusCode: 201,
                        message: 'Update users susscess.',
                        data: request.payload
                    }).code(201);
                } catch (err) {
                    console.log(err);
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/users/{id}',
        config: {
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('ObjectID'),
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;
                try {
                    await db.collection('users').deleteOne({ _id: new ObjectID(request.params.id) });
                    return h.response({
                        statusCode: 204,
                        message: 'Delete users susscess.',
                        data: request.params.id
                    }).code(201);
                } catch (err) {
                    console.log(err);
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        }
    }
];