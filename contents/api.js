var http = require('request');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://summer1:summer1@ds215709.mlab.com:15709/it58160433_webservice_db1";

async function apiCall() {
    // await MongoClient.connect(url, function(err, db) {
    //     const dbo = db.db("it58160433_webservice_db1");

    //     dbo.collection("clients").find({}).toArray(function(err, result) {
    //         for(i = 0; i < result.length; i++) {
    //             if ((Date.now() < result[i].expire) && result[i].switch) {
    //                 var arr = result[i].url.split("/");
    //                 if (arr[arr.length - 1].charAt(0) == '?') {
    //                     var postID = arr[arr.length - 2];
    //                 } else {
    //                     var postID = arr[arr.length - 1];
    //                 }
    //                 http('https://graph.facebook.com/v3.0/' + postID + '/likes?summary=total_count&access_token=' + result[i].token, (err, res, body) => {
    //                         console.log(JSON.parse(res.body).summary.total_count);
    //                     });
    //             }console.log('hi');
    //         }
    //         db.close();
    //     });
    // });
    // setTimeout(apiCall, 60000);
}

module.exports = apiCall();