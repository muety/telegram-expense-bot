# telegram-expense-bot
Este é um bot para o aplicativo de mensagens [Telegram] (https://telegram.org/) usando sua [plataforma bot] (https://core.telegram.org/bots). O código é de código aberto e, consequentemente, qualquer um pode configurar uma própria instância do bot. Para saber mais sobre este bot, consulte [este artigo do blog] (https://ferdinand-muetsch.de/telegram-expensebot-doodlerbot.html) ou apenas envie uma mensagem ao bot com o comando `/ help`.

![](https://anchr.io/i/rbtPU.png)

## O que isso faz?
O objetivo desse bot é ajudar as pessoas a gerenciar suas despesas diárias e acompanhar sua situação financeira. Os usuários podem adicionar despesas de onde estiverem usando alguns comandos simples do bate-papo e ficar de olho no quanto gastaram em um mês ou dia. Isso evita a necessidade de confundir planilhas do Excel ou anotações em papel.

## Como hospedá-lo eu mesmo?
### Pré-requisitos
Para hospedar esse bot por conta própria, você precisa de algumas coisas.
* Servidor para executar o bot (já que o bot usa o método de pesquisa longa para [obter atualizações])
* Node.js (de preferência na versão mais recente)
* Um banco de dados do MongoDB (você pode usar [mongodb.com] (https://www.mongodb.com/cloud/atlas) para obter um MongoDB hospedado gratuitamente)
* Um token de bot, que você obtém ao registrar um novo bot no [@BotFather] (https://telegram.me/BotFather)

### Configuração

Para configurar seu bot, clone este repositório e edite o arquivo `config.json`.
* `DB_URL`: o URL completo do MongoDB, incluindo nome de usuário e senha(se estiver usando _mongodb atlas_, você pode simplesmente copiá-lo do site)
* `DB_NAME`: Nome do banco de dados MongoDB
* `DB_COLLECTION`: o nome da collection do banco de dados onde seus dados devem ser armazenados, ex: "despesas"_
* `BOT_TOKEN`: o token que você recebeu do _BotFather_
* `BOT_NAME`: o nome do bot, por exemplo _ "GranaTrack" _ no meu caso
* `BOT_TELEGRAM_USERNAME`: o nome de usuário único e real do telegrama do bot, por exemplo _ "@GranaTrackBot" _ no meu caso (observe que isso pode ser diferente do `BOT_NAME`, que não é unico)

### Executar
```bash
$ npm start
```

## Licença e autoria
Original MIT @ [Ferdinand Mütsch](https://ferdinand-muetsch.de)
Fork para atualização e melhorias MIT @ [Samuel Pozae](https://www.pozae.com)