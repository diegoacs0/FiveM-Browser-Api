'use strict';

/* 
Baiano's FiveM Rest API
+ REST handler for external use;

Readme before sending me something to merge:
* Preferably use json responses as default. (if possible)
* Try to make a freacking clean code.
* Pls create your own config file inside modules and do not use default ./config.json to your scripts. You are free to use ./modules as you want.
* Put all of your external responses at ./lang/lang-CODE.json for easier translations, or inside your config.
* Don't flood console out of debug mode.

*/

const config = require("./config.json");
const lang = require("./lang/"+config.language+".json");


const fastify = require('fastify');
const app = fastify({logger: config.debug});

app.get('/', (req, res) => {
  res.send(lang.defaultMessage);
});

app.get('/author', function (req, res) {
  res.send("Made by Baiano#5596, contact me for any abuses or errors")
});

app.all("*",(req, resp, next) => {
  // getting req path name
  req.path = req.raw.url.split("?")[0];
  
	if (["/", "/author"].includes(req.path))  return next();
	try {
		require("./web"+req.path+".js").run(req, resp, lang, config.key.includes(req.query.key))
	} catch (e) {
		if(config.debug) console.log(e);
		return resp.status(404).send(lang.unknownMessage.replace("{{path}}", req.path))
	}
   next();
});

app.listen({port: config.port, host: config.host}, ()=> console.log(`Listening at http://${config.host}:${config.port}`))
