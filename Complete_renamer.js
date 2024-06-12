const { Client, Intents, WebhookClient } = require('discord.js');
const { DateTime } = require('luxon');

const bot = new Client({ 
    intents: [
        'GUILDS',
        'GUILD_MESSAGES'
    ] 
});

const webhookURL = 'WEBHOOK'; 

const cooldowns = new Map();
const mutedUsers = new Set();

function aguardarSegundos() {
    setTimeout(function() {
      console.log('Passaram-se 5 segundos.');
    }, 5000); // Espera 5000 milissegundos (5 segundos)
  }

async function enviarMensagemWebhook(conteudo) {
    try {
        const resposta = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: conteudo }),
        });

        if (!resposta.ok) {
            throw new Error(`Erro ao enviar mensagem de log: ${resposta.status} ${resposta.statusText}`);
        }

        console.log('Mensagem de log enviada com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar mensagem de log:', error.message);
    }
}

bot.on('ready', () => {
    console.log(`Conectado em Renamer ${bot.user.tag}`);
});

bot.on('message', async (message) => {
    if (message.author.bot) return;

    const args = message.content.slice('!'.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

 
    // Verificar se o usuário está silenciado
    if (mutedUsers.has(message.author.id)) {
        return message.reply('Você foi silenciado por floodar comandos.');
    }
    


    if (!cooldowns.has(command)) {
        cooldowns.set(command, new Map());
    }

    // nessa parte de codigo usei a variável  ${command} ou seja tudo que for comando o sistema de cooldown será automáticamente implementado...
    const now = Date.now();
    const timestamps = cooldowns.get(command);
    const cooldownAmount = (command === 'nome') ? 1800000 : 900000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000; 
            await message.delete();
            return message.reply(`Você precisa esperar ${timeLeft.toFixed(1)} segundos para usar o comando novamente!`)
                .then((replyMessage) => {
                    setTimeout(() => {
                        replyMessage.delete().catch(console.error);
                    }, 5000);
                })
                .catch(console.error);
        }

    }
    

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    if (command === 'nome') {
        const new_name = args.join(' ');
        const member = message.member;

        if (!member) {
            await message.delete();
            return await message.reply('Não foi possível encontrar o autor da mensagem.');
        }

        if (new_name.length > 32) {
            await message.delete();
            return await message.reply('O apelido deve ter no máximo 32 caracteres.');
        }

        try {
            await member.setNickname(new_name);
            await message.channel.send(`${member.user.username}, seu nome foi renomeado para ${new_name}.`);
            await message.delete();
        } catch (error) {
            console.error('Erro ao renomear usuário:', error);
            await message.delete();
        }

        const reply = await message.reply('Erro ao tentar renomear o usuário.');
        enviarMensagemWebhook(`Mensagem enviada: ${message.content}\nResposta enviada: ${reply.content}`);
        await reply.delete();
    }

    if (command === 'log') {
        const reply = await message.channel.send('Olá Yoku 🩷, seja bem-vinda, esta é uma mensagem de teste e será excluída em 5 segundos...');

        console.log('Mensagem enviada:', message.content);
        console.log('Resposta enviada:', reply.content);

        setTimeout(async () => {
            try {
                if (message.deletable) {
                    await message.delete();
                    console.log('Mensagem excluída:', message.content);
                }
                if (reply.deletable) {
                    await reply.delete();
                    console.log('Resposta excluída:', reply.content);
                }
            } catch (error) {
                console.error('Erro ao deletar mensagem:', error);
            }
        }, 5000);

        enviarMensagemWebhook(`Mensagem enviada: ${message.content}\nResposta enviada: ${reply.content}`);
    }

    if (command === 'log2') {
        const reply = await message.channel.send('Executando o comando...');

        console.log('Mensagem enviada:', message.content);
        console.log('Resposta enviada:', reply.content);

        setTimeout(async () => {
            try {
                if (message.deletable) {
                    aguardarSegundos();
                    await message.delete();
                    console.log('Mensagem excluída:', message.content);
                }
                if (reply.deletable) {
                    aguardarSegundos();
                    await reply.delete();
                    console.log('Resposta excluída:', reply.content);
                }
            } catch (error) {
                console.error('Erro ao deletar mensagem:', error);
            }
        }, 5000);
    }
});

bot.login('BOTKEY');
