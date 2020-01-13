var express = require('express')
var mqtt = require('mqtt')
var router = express.Router()
var url = require('url')
const sql = require('mssql')

var options = {
  port: 11718,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: 'fgwuwgpw',
  password: 'ESQXpO-H7-1y',
}

var mqtt_url = process.env.CLOUDMQTT_URL || 'mqtt://m14.cloudmqtt.com';
var topic = process.env.CLOUDMQTT_TOPIC || 'hello';
//var client = mqtt.connect(mqtt_url);
var client = mqtt.connect('mqtt://m14.cloudmqtt.com', options);


/* GET home page. */
router.get('/', function(req, res, next) {
  //
  var config =  url.parse(mqtt_url)
  config.topic = topic
  res.render('index', {
	  connected: client.connected,
	  config: config
  })
})

client.on('connect', function() {
  //
  router.post('/publish', function(req, res) {
    //
	  var msg = JSON.stringify({
	    date: new Date().toString(),
	    msg: req.body.msg
	  })
    //
    client.publish(topic, msg, function() {
      res.writeHead(204, { 'Connection': 'keep-alive' })
      res.end()
    })
  })

  router.get('/stream', function(req, res) {
    //
    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })
    //
    res.write('\n');

    // Timeout timer, send a comment line every 20 sec
    var timer = setInterval(function() {
      res.write('event: ping' + '\n\n')
    }, 20000)
    //
    client.subscribe(topic, function() {
      //
      client.on('message', function(topic, msg, pkt) {
      //res.write("New message\n");
        console.log('msg : ', msg.toString('utf8'))
        //let json = JSON.stringify(msg)
        post_temp(msg.toString('utf8'))
        res.write("data: " + msg + "\n\n")
		    //var json = JSON.parse(msg);
        //res.write("data: " + json.date + ": " + json.msg + "\n\n");
        
      })
    })
  })
})

const config = {
  user: 'DB_A4925A_connector_admin',
  password: 'HUdgf!@S45G',
  server: 'sql5018.site4now.net', // You can use 'localhost\\instance' to connect to named instance
  database: 'db_a4925a_connector',
}

async function post_temp (val) {
  try {
      let pool = await sql.connect(config)

      const request = pool.request()
      request.input('Id_ColetorTopico', sql.Int, 1)
      //
      var nDate = new Date().toLocaleString({
        timeZone: 'America/Sao_Paulo'
      })
      //
      request.input('DataHora', sql.DateTime, nDate)
      request.input('Valor', sql.VarChar, val)
      //nDate.setHours(nDate.getHours()+1);
      //insert into programa (Id_Empresa, Descricao) values (17, 'Haaaa')
      //insert into ColetorTopicoLog (Id_ColetorTopico, DataHora, Valor) values ()
      //
      //console.log('Teste insert log - ', date_ob)
      request.query('insert into ColetorTopicoLog (Id_ColetorTopico, DataHora, Valor) values (@Id_ColetorTopico, @DataHora, @Valor)', (err, result) => {
        console.dir(result)
      })

  } catch (err) {
      // ... error checks
      console.log('SQL error: ', err)
  }
}

//post_temp('35')

sql.on('error', err => {
  // ... error handler
  console.log('SQL error: ', err)
})


module.exports = router
