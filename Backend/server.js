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
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
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

    if(req.url.startsWith('/api/sessions') && req.method === 'GET'){
        try {
            const url = new URL(req.url, 'http://localhost:3001');
            const masterId = url.searchParams.get('masterId');

            if(!masterId){
                res.writeHead(400,{
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify({
                    erro: 'ID do mestre não encontrado.'
                }));
                return;
            }
            const [sessions] = await conexao.execute(
                'SELECT id, name, `system`, masterId FROM sessions WHERE masterId = ?',
            [masterId]
            );
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify(sessions));
            
        } catch (erro){
            console.log('Erro ao carregar sessões', erro);
            
            res.writeHead(500,{
                'Content-Type' : 'application/json'
            });
        
            res.end(JSON.stringify({
                erro: 'Não foi possível carregar as sessões.'
            }));
        }
        return;
    }
    if (req.url === '/api/sessions' && req.method === 'POST') {
    try {
        const dados = await receberDados(req);

        const { name, system, masterId } = dados;

        if (!name || !system || !masterId) {
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
            'INSERT INTO sessions (id, name, `system`, masterId) VALUES (?, ?, ?, ?)',
            [id, name, system, masterId]
        );

        res.writeHead(201, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            mensagem: 'Sessão criada com sucesso!',
            id: id
        }));

    } catch (erro) {
        console.log('Erro ao criar sessão:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível criar a sessão.'
        }));
    }

    return;
}
if (req.url.startsWith('/api/session/') && req.method === 'GET') {
    try {
        const sessionId = req.url.split('/')[3];

        const [sessions] = await conexao.execute(
            'SELECT id, name, `system`, masterId FROM sessions WHERE id = ?',
            [sessionId]
        );

        if (sessions.length === 0) {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Sessão não encontrada.'
            }));

            return;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(sessions[0]));

    } catch (erro) {
        console.log('Erro ao buscar sessão:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível carregar a sessão.'
        }));
    }

    return;
}
if (req.method === 'DELETE' && req.url.startsWith('/api/session/')) {
    
    try {
        const sessionId = req.url.split('/')[3];

        const [resultado] = await conexao.execute(
            'DELETE FROM sessions WHERE id = ?',
            [sessionId]
        );

        if (resultado.affectedRows === 0) {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Sessão não encontrada.'
            }));

            return;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            mensagem: 'Sessão excluída com sucesso!'
        }));

    } catch (erro) {
        console.log('Erro ao excluir sessão:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível excluir a sessão.'
        }));
    }

    return;
}
   

if (req.method === 'GET' && req.url.split('?')[0] === '/api/characters') {
    try {
        const url = new URL(req.url, 'http://localhost:3001');
        const sessionId = url.searchParams.get('sessionId');

        if (!sessionId) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'ID da sessão não informado.'
            }));

            return;
        }

        const [characters] = await conexao.execute(
            'SELECT * FROM characters WHERE sessionId = ?',
            [sessionId]
        );

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(characters));

    } catch (erro) {
        console.log('Erro ao carregar personagens:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível carregar os personagens.'
        }));
    }

    return;
}

if (req.method === 'GET' && req.url.startsWith('/api/characters/')) {
    try {
        const charId = req.url.split('/')[3];

        const [characters] = await conexao.execute(
            'SELECT * FROM characters WHERE id = ?',
            [charId]
        );

        if (characters.length === 0) {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Personagem não encontrado.'
            }));

            return;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify(characters[0]));

    } catch (erro) {
        console.log('Erro ao buscar personagem:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível buscar o personagem.'
        }));
    }

    return;
}

if (req.method === 'POST' && req.url === '/api/characters') {
    try {
        const dados = await receberDados(req);

        const {
            type,
            name,
            class: charClass,
            hp,
            maxHp,
            sanity,
            sanityMax,
            sessionId
        } = dados;

        if (!type || !name || hp === undefined || maxHp === undefined || !sessionId) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Preencha os campos obrigatórios.'
            }));

            return;
        }

        const id = crypto.randomUUID();

        await conexao.execute(
            `INSERT INTO characters
            (id, type, name, class, level, hp, maxHp, sanity, sanityMax, status, sessionId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                type,
                name,
                charClass || null,
                1,
                Number(hp),
                Number(maxHp),
                Number(sanity || 0),
                Number(sanityMax || 0),
                'vivo',
                sessionId
            ]
        );

        res.writeHead(201, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            mensagem: 'Personagem cadastrado com sucesso!',
            id: id
        }));

    } catch (erro) {
        console.log('Erro ao cadastrar personagem:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível cadastrar o personagem.'
        }));
    }

    return;
}

if (req.method === 'PATCH' && req.url.startsWith('/api/characters/')) {
    try {
        const charId = req.url.split('/')[3];

        const dados = await receberDados(req);

        // Campos que permitimos atualizar
        const camposPermitidos = ['hp', 'status', 'sanity'];

        const campos = camposPermitidos.filter(
            campo => dados[campo] !== undefined
        );

        if (campos.length === 0) {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Nenhum campo válido para atualizar.'
            }));

            return;
        }

        const valores = campos.map(campo => dados[campo]);

        const atualizacao = campos
            .map(campo => `${campo} = ?`)
            .join(', ');

        valores.push(charId);

        const [resultado] = await conexao.execute(
            `UPDATE characters SET ${atualizacao} WHERE id = ?`,
            valores
        );

        if (resultado.affectedRows === 0) {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Personagem não encontrado.'
            }));

            return;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            mensagem: 'Personagem atualizado com sucesso!'
        }));

    } catch (erro) {
        console.log('Erro ao atualizar personagem:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível atualizar o personagem.'
        }));
    }

    return;
}

if (req.method === 'DELETE' && req.url.startsWith('/api/characters/')) {
    try {
        const url = new URL(req.url, 'http://localhost:3001');
        const charId = url.pathname.split('/')[3];

        const [resultado] = await conexao.execute(
            'DELETE FROM characters WHERE id = ?',
            [charId]
        );

        if (resultado.affectedRows === 0) {
            res.writeHead(404, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                erro: 'Personagem não encontrado.'
            }));

            return;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            mensagem: 'Personagem excluído com sucesso!'
        }));

    } catch (erro) {
        console.log('Erro ao excluir personagem:', erro);

        res.writeHead(500, {
            'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
            erro: 'Não foi possível excluir o personagem.'
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