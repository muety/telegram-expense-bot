const _ = require('lodash')
    , cfg = require('./../config');

const text = `
        Bem-vindo ao ExpenseBot. Este bot ajuda você a gerenciar e acompanhar suas despesas diárias. Você pode adicionar novas despesas ou obter uma visão geral ou lista de qualquer mês ou categoria.
        
        *Adicionando uma nova despesa*
        Os exemplos a seguir mostrarão várias maneiras de adicionar uma nova despesa.
        1. \`1.99 Almoço #alimentação\` ou
        2. \`${cfg.COMMANDS.NEW} 1.99 Almoço #alimentação\` adicionará uma despesa de _1.99_ (independentemente da sua moeda, isso não importa) com a descrição _Almoço_ na categoria _#alimentação_.
        
        Você pode simplesmente deixar sem a categoria (que é sempre definida pelo sinal de hashtag) - isso é apenas para você ter uma visão geral mais clara e uma separação no seu extrato.

        *Observe:* Você sempre precisa digitar um ponto decimal (por exemplo, _1.0_ em vez de simplesmente _1_). Além disso, você também pode digitar o número negativo, se tiver uma receita ou quiser compensar uma despesa.
        
        * Obtendo suas despesas *
        Para obter uma visão geral da sua situação financeira atual, faça o seguinte:
        1. \`${cfg.COMMANDS.GET}\` te permite escolher um mês.
        2. \`${cfg.COMMANDS.GET} April\` ou simplismente \`April\` - o valor total das despesas em abril. Claro que isso funciona com qualquer outro mês.
        3. \`${cfg.COMMANDS.GET} #alimentação\` ou simplismente \`#alimentação\` - o valor total de despesas na categoria _#alimentação_ no mês atual.
        4. \`${cfg.COMMANDS.GET} #alimentação April\` or simply \`#alimentação April\` - o valor total de despesas na categoria _#alimentação_ em abril
        5. O mesmo funciona para dias da semana em vez de meses, por exemplo \`Segunda-feira\`
        
        * Listando suas despesas *
        Para obter um extrato da sua situação financeira atual, faça o seguinte:
        1. \`${cfg.COMMANDS.LIST} April\` ou simplismente \`April\` - o valor total das despesas em Abril. Claro que isso funciona com qualquer outro mês.
        2. \`${cfg.COMMANDS.LIST} #alimentação\` ou simplismente \`#alimentação\` - o valor total de despesas na categoria _#alimentação_ no mês atual.
        3. \`${cfg.COMMANDS.LIST} #alimentação April\` or simply \`#alimentação April\` - o valor total de despesas na categoria _#alimentação_ em abril
        4. O mesmo funciona para dias da semana em vez de meses, por exemplo \`Segunda-feira\`
        
        * Redefinindo suas despesas *
        Para redefinir (ou seja, excluir) todas as suas despesas para um determinado mês ou categoria, você pode fazer o seguinte:
        1. \`${cfg.COMMANDS.RESET} April\` - exclua todas as despesas em abril. Claro que isso funciona com qualquer outro mês.
        2. \`${cfg.COMMANDS.RESET} #alimentação\` - exclua todas as despesas na categoria _#alimentação_ no mês atual.
        3. \`${cfg.COMMANDS.RESET} #alimentação April\` - exclua todas as despesas da categoria _#alimentação_ em abril
        4. O mesmo funciona para dias da semana em vez de meses, por exemplo \`Segunda-feira\`
    `;

module.exports = function (bot) {
    return function (message, args) {
        bot.sendMessage(new bot.classes.Message(message.chat.id, text, 'Markdown'), () => {});
    }
};
