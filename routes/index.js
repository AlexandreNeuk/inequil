var express = require('express');
var mqtt = require('mqtt');
var router = express.Router();
var url = require('url');

var options = {
  port: 14106,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: 'clpfcosb',
  password: 'ILo_4ucaK3P_',
}

var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://m16.cloudmqtt.com';
var topic = process.env.CLOUDMQTT_TOPIC || 'hello';
//var client = mqtt.connect(mqtt_url);
var client = mqtt.connect('mqtt://m16.cloudmqtt.com', options);


/* GET home page. */
router.get('/', function(req, res, next) {
  var config =  url.parse(mqtt_url);
  config.topic = topic;
  res.render('index', {
	connected: client.connected,
	config: config
  });
});

client.on('connect', function() {
  router.post('/publish', function(req, res) {
	var msg = JSON.stringify({
	  date: new Date().toString(),
	  msg: req.body.msg
	});
    client.publish(topic, msg, function() {
      res.writeHead(204, { 'Connection': 'keep-alive' });
      res.end();
    });
  });

  router.get('/stream', function(req, res) {
    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    // Timeout timer, send a comment line every 20 sec
    var timer = setInterval(function() {
      res.write('event: ping' + '\n\n');
    }, 20000);

    client.subscribe(topic, function() {
      client.on('message', function(topic, msg, pkt) {
    //res.write("New message\n");
        console.log('msg : ', msg.toString('utf8'))
        //let json = JSON.stringify(msg)
        
        res.write("data: " + msg + "\n\n");
		    //var json = JSON.parse(msg);
        //res.write("data: " + json.date + ": " + json.msg + "\n\n");
        
      });
    });
  });
});

module.exports = router;
