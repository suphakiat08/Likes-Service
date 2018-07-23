const Boom = require('boom');
const Joi = require('joi');
const api = require('../mqtt/api');

module.exports = [
    {
        method: 'GET',
        path: '/monitor',
        config: {
            tags: ['api'],
            async handler(request, h) {
                const db = request.mongo.db;
                try {
                    const result = await db.collection('monitor').find().toArray();
                    return h.response({
                        statusCode: 200,
                        message: 'Get all monitor.',
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
        path: '/monitor/{id}',
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
                    const result = await db.collection('monitor').findOne({ _id: new ObjectID(request.params.id) });
                    return h.response({
                        statusCode: 200,
                        message: 'Get one client.',
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
        path: '/monitor',
        config: {
            tags: ['api'],
            validate: {
                payload: {
                    device: {
                        serial_number: Joi.string()
                            .required(),
                        detail: Joi.string()
                            .required(),
                    },
                    url: Joi.string()
                        .required(),
                    post_id: Joi.string()
                        .required(),
                    prod_name: Joi.string()
                        .required(),
                    price: Joi.number()
                        .required(),
                    icons: {
                        promotion: {
                            amount: Joi.number(),
                            unit: Joi.string(),
                            date: Joi.string()
                        },
                        stock: Joi.boolean(),
                        limited: Joi.boolean(),
                        hot_sale: Joi.boolean()
                    },
                    token: Joi.string()
                        .required(),
                    expire: Joi.number()
                        .required(),
                    switch: Joi.boolean()
                        .required(),
                    status: Joi.number()
                        .required()
                }
            },
            async handler(request, h) {
                // console.log(request.payload);
                const db = request.mongo.db;
                try {
                    await db.collection('monitor').insert(request.payload);
                    api.clearTime();
                    api.apiCall();
                    return h.response({
                        statusCode: 201,
                        message: 'Create client susscess.',
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
        path: '/token',
        config: {
            tags: ['api'],
            validate: {
                payload: {
                    token: Joi.string(),
                    expire: Joi.number()
                }
            },
            async handler(request, h) {
                // console.log(request.payload);
                const db = request.mongo.db;
                try {
                    await db.collection('monitor').updateMany(
                        {},
                        { $set: request.payload }
                    );
                    return h.response({
                        statusCode: 201,
                        message: 'Update client susscess.',
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
        path: '/monitor/{id}',
        config: {
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('ObjectID'),
                },
                payload: {
                    device: {
                        serial_number: Joi.string(),
                        detail: Joi.string()
                    },
                    url: Joi.string(),
                    prod_name: Joi.string(),
                    post_id: Joi.string(),
                    price: Joi.number(),
                    icons: {
                        promotion: {
                            amount: Joi.number(),
                            unit: Joi.string(),
                            date: Joi.string()
                        },
                        stock: Joi.boolean(),
                        limited: Joi.boolean(),
                        hot_sale: Joi.boolean()
                    },
                    token: Joi.string(),
                    expire: Joi.number(),
                    switch: Joi.boolean(),
                    status: Joi.number()
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;
                try {
                    console.log(request.payload);
                    (request.payload.prod_name) ?
                        await db.collection('monitor').update(
                            { _id: new ObjectID(request.params.id) },
                            request.payload
                        ) :
                        await db.collection('monitor').update(
                            { _id: new ObjectID(request.params.id) },
                            { $set: request.payload }
                        );

                    if (request.payload.switch) {
                        api.clearTime();
                        api.apiCall();
                    } else if (request.payload.device && !request.payload.prod_name) {
                        api.clearTime();
                        api.switchOff(request.payload.device.serial_number);
                    }

                    return h.response({
                        statusCode: 201,
                        message: 'Update client susscess.',
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
        path: '/monitor/{id}',
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
                    await db.collection('monitor').deleteOne({ _id: new ObjectID(request.params.id) });
                    return h.response({
                        statusCode: 204,
                        message: 'Delete monitor susscess.',
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