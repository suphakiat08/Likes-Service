const http = require("superagent");
const mqtt = require("mqtt").connect("mqtt://localhost:1883");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://summer1:summer1@ds215709.mlab.com:15709/it58160433_webservice_db1";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var timeout;

async function apiCall() {
  await MongoClient.connect(url, (err, db) => {
    try {
      const dbo = db.db("it58160433_webservice_db1");
      dbo.collection("monitor").find({}).toArray((err, result) => {
        for (i = 0; i < result.length; i++) {
          if (Date.now() < result[i].expire && result[i].switch) {
            getSocial(result[i]);
          }
        }
      });
      db.close();
    } catch (e) {
      console.log(e);
    }
  });
  timeout = setTimeout(apiCall, 15000);
}

async function getSocial(data) {
  try {
    await http.get("https://graph.facebook.com/v3.0/" + data.post_id + "/likes?summary=total_count&access_token=" + data.token)
      .then((res) => {
        data.like_counts = JSON.parse(res.text).summary.total_count;
        console.log("Likes", data.like_counts);
      });
    await http.get("https://graph.facebook.com/v3.0/" + data.post_id + "?fields=shares&access_token=" + data.token)
      .then((res) => {
        data.shares = JSON.parse(res.text).shares ?
          JSON.parse(res.text).shares.count :
          0;
        console.log("Shares", data.shares);
      });

    publisher(data);
  } catch (e) {
    console.log(e);
  }
}

function publisher(client) {
  let icons = '';
  if (client.icons) {
    icons = '"icons": {';
    if (client.icons.promotion) {
      icons += '"promotion": {'
      icons += '"amount": ' + client.icons.promotion.amount + ', ';
      icons += '"unit": "' + client.icons.promotion.unit + '", ';
      icons += '"date": "' + client.icons.promotion.date + '"';
      icons += '}, ';
    }

    if (client.icons.stock) {
      icons += '"stock": ' + client.icons.stock + ', ';
    }
    if (client.icons.limited) {
      icons += '"limited": ' + client.icons.limited + ', ';
    }
    if (client.icons.hot_sale) {
      icons += '"hot_sale": ' + client.icons.hot_sale + ', ';
    }
    icons = icons.substring(0, icons.length - 2)
    icons += '},';
  }

  const data = "{"
    + '"prod_name": "' + client.prod_name + '", '
    + '"price": ' + client.price + ", "
    + '"likes": ' + client.like_counts + ", "
    + '"shares": ' + client.shares + ", "
    + icons
    + '"switch": ' + client.switch
    + "}";

  console.log("/devices/" + client.device.serial_number);
  mqtt.publish("/devices/" + client.device.serial_number, data);

  http.put("https://localhost:3000/monitor/" + client._id)
    .send({ status: client.status + 1 })
    .end();
}

function switchOff(serial_number) {
  mqtt.publish("/devices/" + serial_number, '{"switch": false}');
}

function clearTime() {
  clearTimeout(timeout);
}

mqtt.on("connect", function () {
  mqtt.subscribe("/devices/heartbeat");
});

mqtt.on("message", function (topic, message) {
  try {
    http.get("https://localhost:3000/monitor")
      .then((res) => {
        let result = JSON.parse(res.text).data;
        for (let i = 0; i < result.length; i++) {
          if (result[i].device.serial_number == message.toString()) {
            result[i].switch ?
              http.put("https://localhost:3000/monitor/" + result[i]._id)
                .send({ status: 1 })
                .end() :
              http.put("https://localhost:3000/monitor/" + result[i]._id)
                .send({ status: 0 })
                .end();
          }
        }
      });
  } catch (e) {
    console.log(e);
  }
});

module.exports = { apiCall, clearTime, switchOff };