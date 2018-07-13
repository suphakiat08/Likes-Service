const http = require("superagent");
const mqtt = require("mqtt").connect("mqtt://localhost:1883");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://summer1:summer1@ds215709.mlab.com:15709/it58160433_webservice_db1";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var timeout;

async function apiCall() {
  await MongoClient.connect(url, (err, db) => {
    const dbo = db.db("it58160433_webservice_db1");
    dbo.collection("clients").find({}).toArray((err, result) => {
      for (i = 0; i < result.length; i++) {
        if (Date.now() < result[i].expire && result[i].switch) {
          getSocial(result[i]);
        }
      }
    });
    db.close();
  });
  timeout = setTimeout(apiCall, 20000);
}

async function getSocial(data) {
  await http.get("https://graph.facebook.com/v3.0/" + data.post_id + "/likes?summary=total_count&access_token=" + data.token)
    .then((res) => {
      // if (JSON.parse(res.text).summary) {
      data.like_counts = JSON.parse(res.text).summary.total_count;
      // console.log(data.like_counts);
      // } else {
      //   http.put("https://localhost:3000/token")
      //     .send({ expire: 0 })
      //     .end(res => console.log("token expired."));
      // }
    });
  await http.get("https://graph.facebook.com/v3.0/" + data.post_id + "?fields=shares&access_token=" + data.token)
    .then((res) => {
      data.shares = JSON.parse(res.text).shares ?
        JSON.parse(res.text).shares.count :
        0;
      // console.log(data.shares);
    });

  publisher(data);
}

function publisher(client) {
  let icons = '';
  if (client.icons) {
    icons = '"icons": {';
    if (client.icons.promotion) {
      icons += '"promotion": {'
      icons += '"amount": ' + client.icons.promotion.amount + ', ';
      icons += '"unit": "' + client.icons.promotion.unit + '", ';
      icons += '"date": "' + client.icons.promotion.date + '", ';
      icons += '"time": "' + client.icons.promotion.time + '"';
      icons += '}';
    }

    if (client.icons.stock) {
      if (icons.charAt(icons.length - 1) == "}") icons += ', ';
      icons += '"stock": ' + client.icons.stock.quantity;
    }
    if (client.icons.limited) {
      if (icons.charAt(icons.length - 1) == "}") icons += ', ';
      icons += '"limited": ' + client.icons.limited.quantity;
    }
    if (client.icons.hot_sale) {
      if (icons.charAt(icons.length - 1) == "}") icons += ', ';
      icons += '"hot_sale": ' + client.icons.hot_sale;
    }

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

  console.log("/clients/" + client.serial_number);
  mqtt.subscribe("/clients/" + client.serial_number);
  mqtt.publish("/clients/" + client.serial_number, data);
}

function switchOff(serial_number) {
  mqtt.publish("/clients/" + serial_number, '{"switch": false}');
}

function clearTime() {
  clearTimeout(timeout);
}

module.exports = { apiCall, clearTime, switchOff };