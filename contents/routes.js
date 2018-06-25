const Boom = require('boom');
const Joi = require('joi');

module.exports = [
    {
        method: 'GET',
        path: '/',
        config: {
            async handler(request, h) {
                return h.response().redirect('/documentation').code(200);
            }
        }
    },
    {
        method: 'GET',
        path: '/clients',
        config: {
            tags: ['api'],
            async handler(request, h) {
                const db = request.mongo.db;
                try {
                    const result = await db.collection('clients').find().toArray();
                    return h.response({
                        statusCode: 200,
                        message: 'Get all clients.',
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
        path: '/clients/{id}',
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
                    const result = await db.collection('clients').findOne({ _id: new ObjectID(request.params.id) });
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
        path: '/clients',
        config: {
            tags: ['api'],
            validate: {
                payload: {
                    ipaddress: Joi.string()
                        .required(),
                    url: Joi.string()
                        .required(),
                    prod_name: Joi.string()
                        .required(),
                    price: Joi.number()
                        .required(),
                    icons: {
                        promotion: {
                            amount: Joi.number(),
                            unit: Joi.string(),
                            date: Joi.string(),
                            time: Joi.string()
                        },
                        stock: {
                            quantity: Joi.number()
                        },
                        limited: {
                            quantity: Joi.number()
                        },
                        hot_sale: Joi.boolean()
                    },
                    token: Joi.string()
                        .required(),
                    expire: Joi.number()
                        .required(),
                    like_counts: Joi.number(),
                    switch: Joi.boolean()
                        .required()
                }
            },
            async handler(request, h) {
                // console.log(request.payload);
                const db = request.mongo.db;
                try {
                    await db.collection('clients').insert(request.payload);
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
                    await db.collection('clients').updateMany(
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
        path: '/clients/{id}',
        config: {
            tags: ['api'],
            validate: {
                params: {
                    id: Joi.string()
                        .required()
                        .description('ObjectID'),
                },
                payload: {
                    ipaddress: Joi.string(),
                    url: Joi.string(),
                    prod_name: Joi.string(),
                    price: Joi.number(),
                    icons: {
                        promotion: {
                            amount: Joi.number(),
                            unit: Joi.string(),
                            date: Joi.string(),
                            time: Joi.string()
                        },
                        stock: {
                            quantity: Joi.number()
                        },
                        limited: {
                            quantity: Joi.number()
                        },
                        hot_sale: Joi.boolean()
                    },
                    token: Joi.string(),
                    expire: Joi.number(),
                    like_counts: Joi.number(),
                    switch: Joi.boolean()
                }
            },
            async handler(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;
                try {
                    // console.log(request.payload);
                    (request.payload.ipaddress) ?
                        await db.collection('clients').update(
                            { _id: new ObjectID(request.params.id) },
                            request.payload
                        ) :
                        await db.collection('clients').update(
                            { _id: new ObjectID(request.params.id) },
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
        method: 'DELETE',
        path: '/clients/{id}',
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
                    await db.collection('clients').deleteOne({ _id: new ObjectID(request.params.id) });
                    return h.response({
                        statusCode: 204,
                        message: 'Delete clients susscess.',
                        data: request.params.id
                    }).code(201);
                } catch (err) {
                    console.log(err);
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        }
    },
]