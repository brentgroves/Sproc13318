const mysql = require('mysql');
const mqtt = require('mqtt');
const config = require('../Config13318/config.json');
var datetime = require('node-datetime');
var mqttClient;

function DS13318(transDate) {
  var con = mysql.createConnection(config.Database);

  con.connect(function(err) {
    if (err) throw err;

    /* https://www.sitepoint.com/using-node-mysql-javascript-client/ */
    // con.query(`select * from DS13318`,function(err, resultSet){
    // con.query(`CALL DS13318("2019-12-15 09:00")`,function(err, rows){
    // con.query(`CALL DS13318('${transDate}')`,function(err, resultSet){
    con.query('CALL DS13318(?)', [transDate], function(err, resultSet) {
      if (err) throw err;
      console.log(`Data received from Db on ${transDate}:\n`);
      // console.log(resultSet[0][1]);
      resultSet[0].forEach(function(item, index) {
        var tz_transDate = item.TransDate;
        var pastDateTime = datetime.create(tz_transDate);
        var fmt = pastDateTime.format('Y-m-d H:M:S');
        item.TransDate=fmt;  
        // console.log(item, index);
      });
      console.log(resultSet[0]);
      let msgString = JSON.stringify(resultSet[0]);         
      mqttClient.publish('Sproc13318', msgString);         
    });
  });
}

function main() {
  mqttClient = mqtt.connect(config.MQTT);

  DS13318('2019-12-15 09:00');
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
