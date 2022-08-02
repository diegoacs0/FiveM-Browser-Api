###### Linguagens
[Português Brasileiro](https://github.com/gitBaiano/FiveM-Browser-Api/blob/main/README.br.md) <br>
[English US](https://github.com/gitBaiano/FiveM-Browser-Api)

# Baiano's FiveM Rest API
A simple Fastify REST api to be used with FiveM for communication between browser and server protocols on build.


###### Utils
+ REST handler for external use;
+ Translate files to make your js module become an universal module;
+ Simple config file, easy to use;
+ Just a single import, this is a light module.

###### Directory Structure

./ -> main directory <br>
--- ./lang -> where language.json settings are set, consider using this file to port your project for multiple languages. <br>
--- ./modules -> these are your js modules that are not working with rest api, or maybe these are your requires to your webpage. <br>
--- ./web -> these are the web modules, they are normal modules but should contain an anonymous function to work ([example.js](https://github.com/gitBaiano/FiveM-Browser-Api/blob/main/web/test.js "example.js")) <br>
--- ./config.json -> this is the settings file, where the magic happens and you set the basic options for your module. <br>
--- ./server.js -> you shouldn't edit this, this is the webserver file, the main file who makes everything work. <br>

###### Author

- [Diego ACS](https://www.github.com/gitBaiano)


