const Boom = require('boom');
const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/devices',
        config: {
            tags: ['api'],
            async handler(request, h) {
                const db = request.mongo.db;
                try {
                    const result = await db.collection('devices').find().toArray();
                    return h.response({
                        statusCode: 200,
                        message: 'Get all devices.',
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
        path: '/devices/{id}',
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
                    const result = await db.collection('devices').findOne({ _id: new ObjectID(request.params.id) });
                    return h.response({
                        statusCode: 200,
                        message: 'Get one device.',
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
        path: '/devices',
        config: {
            tags: ['api'],
            validate: {
                payload: {
                    serial_number: Joi.string()
                        .required(),
                    detail: Joi.string()
                        .required(),
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                try {
                    await db.collection('devices').insert(request.payload);
                    return h.response({
                        statusCode: 201,
                        message: 'Create devices susscess.',
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
        path: '/devices/{id}',
        config: {
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('ObjectID'),
                },
                payload: {
                    serial_number: Joi.string(),
                    detail: Joi.string()
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;
                try {
                    console.log(request.payload);
                    await db.collection('devices').update(
                        { _id: new ObjectID(request.params.id) },
                        { $set: request.payload }
                    );

                    return h.response({
                        statusCode: 201,
                        message: 'Update devices susscess.',
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
        path: '/devices/{id}',
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
                    await db.collection('devices').deleteOne({ _id: new ObjectID(request.params.id) });
                    return h.response({
                        statusCode: 204,
                        message: 'Delete devices susscess.',
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