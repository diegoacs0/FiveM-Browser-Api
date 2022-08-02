# API FiveM Rest do Baiano
Uma API REST Fastify simples para ser usada com o FiveM para comunicação entre os protocolos do navegador e do servidor na compilação.


###### Útil
+ Handler REST para uso externo;
+ Arquivos de tradução para tornar seu módulo js um módulo universal;
+ Arquivo de configuração simples, fácil de usar;
+ Apenas uma única importação, este é um módulo leve.

###### Estrutura de diretórios

./ -> diretório principal <br>
--- ./lang -> onde as configurações de language.json são definidas, considere usar este arquivo para portar seu projeto para vários idiomas. <br>
--- ./modules -> estes são seus módulos js que não estão funcionando com rest api, ou talvez estes sejam seus requires para sua página da web. <br>
--- ./web -> esses são os módulos web, são módulos normais, mas devem conter uma função anônima para funcionar junto ao fastify ([example.js](https://github.com/gitBaiano/FiveM-Browser-Api/blob/main/web/test.js "example.js")) <br>
--- ./config.json -> este é o arquivo de configurações, onde a mágica acontece e você define as opções básicas do seu módulo. <br>
--- ./server.js -> você não deve editar isso, este é o arquivo do servidor web, o arquivo principal que faz tudo funcionar. <br>

###### Autor

- [Diego ACS](https://www.github.com/gitBaiano)

