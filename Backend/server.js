const http = require('http');
const conexao = require('./db');
const crypto = require('crypto');

function receberDados(req) {
    return new Promise((resolve, reject) => {
        let corpo = '';

        req.on('data', parte => {
            corpo += parte;
        });

        req.on('end', () => {
            try {
                resolve(JSON.parse(corpo));
            } catch (erro) {
                reject(erro);
            }
        });

        req.on('error', reject);
    });
}

const servidor = http.createServer(async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/teste' && req.method === 'GET') {

        try {
            const [resultado] = await conexao.query('SELECT 1 + 1 AS teste');

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                mensagem: 'Servidor conectado ao MySQL!',
                resultado: resultado[0].teste
            }));

        } catch (erro) {
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Erro ao consultar o banco de dados.'
            }));
        }

        return;
    }
        if (req.url === '/api/mestres' && req.method === 'POST') {

        try {
            const dados = await receberDados(req);

            const { userName, userEmail, password } = dados;

            if (!userName || !userEmail || !password) {
                res.writeHead(400, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    erro: 'Preencha todos os campos.'
                }));

                return;
            }

            const id = crypto.randomUUID();

            await conexao.execute(
                'INSERT INTO mestres (id, userName, userEmail, password) VALUES (?, ?, ?, ?)',
                [id, userName, userEmail, password]
            );

            res.writeHead(201, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                mensagem: 'Mestre cadastrado com sucesso!',
                id: id
            }));

        } catch (erro) {

            console.log('Erro no cadastro:', erro);

            res.writeHead(500, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Não foi possível cadastrar o mestre.'
            }));
        }

        return;
    }
        if (req.url === '/api/login' && req.method === 'POST') {

        try {
            const dados = await receberDados(req);

            const { email, password } = dados;

            if (!email || !password) {
                res.writeHead(400, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    erro: 'Informe o email e a senha.'
                }));

                return;
            }

            const [mestres] = await conexao.execute(
                'SELECT id, userName, userEmail, password FROM mestres WHERE userEmail = ? AND password = ?',
                [email, password]
            );

            if (mestres.length === 0) {
                res.writeHead(401, {
                    'Content-Type': 'application/json'
                });

                res.end(JSON.stringify({
                    erro: 'Email ou senha incorretos.'
                }));

                return;
            }

            const mestre = mestres[0];

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                mensagem: 'Login realizado com sucesso!',
                mestre: {
                    id: mestre.id,
                    userName: mestre.userName,
                    userEmail: mestre.userEmail
                }
            }));

        } catch (erro) {
            console.log('Erro no login:', erro);

            res.writeHead(500, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Não foi possível realizar o login.'
            }));
        }

        return;
    }

    res.writeHead(404, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        erro: 'Rota não encontrada.'
    }));
});

servidor.listen(3001, () => {
    console.log('Servidor iniciado em http://localhost:3001');
});