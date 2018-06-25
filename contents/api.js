const http = require('superagent');
let MongoClient = require('mongodb').MongoClient;
let url = 'mongodb://summer1:summer1@ds215709.mlab.com:15709/it58160433_webservice_db1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function apiCall() {
    await MongoClient.connect(url, (err, db) => {
        const dbo = db.db('it58160433_webservice_db1');

        dbo.collection("clients").find({}).toArray((err, result) => {
            for (i = 0; i < result.length; i++) {
                if ((Date.now() < result[i].expire) && result[i].switch) {
                    let arr = result[i].url.split('/');
                    arr[arr.length - 1].charAt(0) == '?' ?
                        postID = arr[arr.length - 2] :
                        postID = arr[arr.length - 1];

                    const data = {
                        id: result[i]._id,
                        token: result[i].token,
                        post: postID
                    }
                    getLike(data);
                }
            }
        });
        db.close();
    });
    await setTimeout(apiCall, 5000);
}

function getLike(data) {
    http.get('https://graph.facebook.com/v3.0/' + data.post + '/likes?summary=total_count&access_token=' + data.token)
        .end((err, res) => {
            if (JSON.parse(res.text).summary) {
                http.put('https://localhost:3000/clients/' + data.id)
                    .send({ like_counts: JSON.parse(res.text).summary.total_count })
                    .end();
            } else {
                http.put('https://localhost:3000/token')
                    .send({ expire: 0 })
                    .end();
            }
        });
}

module.exports = apiCall();