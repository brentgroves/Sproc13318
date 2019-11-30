const mysql = require('mysql');
const mqtt = require('mqtt');
const config = require('../Config13318/config.json');

function DS13318(transDate) {
  var con = mysql.createConnection(config.Database);

  con.connect(function(err) {
    if (err) throw err;

    /* https://www.sitepoint.com/using-node-mysql-javascript-client/ */
    con.query(`CALL DS13318('${transDate}')`,function(err, rows){
      if (err) throw err;
      console.log('Data received from Db:\n');
      console.log(rows);
    });
  });
}

function main() {
  let mqttClient = mqtt.connect(config.MQTT);

  mqttClient.on('connect', function() {
    mqttClient.subscribe('Alarm13318-2', function(err) {
      if (!err) {
        console.log('subscribed to: Alarm13318-2');
      }
    });
  });
  // message is a buffer
  mqttClient.on('message', function(topic, message) {
    const obj = JSON.parse(message.toString()); // payload is a buffer
    let transDate = obj.TransDate;
    console.log(`TransDate => ${transDate} `);
    DS13318(transDate);
  });
}
main();
