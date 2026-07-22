import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import 'dotenv/config';


const app = express();
const PORT = 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

app.use(express.json());
app.use(cors());

const existeConflito = async (dia, hora, idParaIgnorar = null) => {
    let query = 'SELECT id from agendamentos where dia = ? AND hora = ?';
    const params = [dia, hora];

    if (idParaIgnorar) {
        query += ' AND id != ?';
        params.push(idParaIgnorar);
    }

    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
}

// Criando agendamento
app.post('/salvar-agendamento', async (req, res) => {
    const { nome, procedimento, dia, hora } = req.body;

    if (!nome || !procedimento || !dia || !hora) {
        return res.status(400).send({ message: 'Todos os campos são obrigatórios.' })
    }

    try {
        const insertQuery = `
        INSERT INTO agendamentos (nome, procedimento, dia, hora)
        VALUES (?,?,?,?);
        `;

        const [result] = await pool.execute(insertQuery, [nome, procedimento, dia, hora]);

        console.log(`Agendamento salvo com sucesso! ID: ${result.insertId}`);

        const mensagem = `Olá ${nome},
        aguardamos você para realizar o seu procedimento
        ${procedimento} no dia
        ${dia} às ${hora} horas.`;

        res.status(200).send({ message: mensagem })

    } catch (err) {
        console.error('Erro ao processar o agendamento', err);
        res.status(500).send({ message: "Erro ao salvar agendamento" });

    }
});


// Listando agendamentos
app.get('/listar-agendamentos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM agendamentos ORDER BY dia, hora');
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao listar agendamentos', err)
        res.status(500).send({ message: 'Erro interno ao buscar agendamento' })
    }
})


// Atualizar agendamentos
app.put('/atualizar-agendamento/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, procedimento, dia, hora } = req.body;

    if (!nome || !procedimento || !dia || !hora) {
        return res.status(400).send({ message: 'Todos os campos são obrigatórios.' })
    }

    try {
        const updateQuery = `
        UPDATE agendamentos
        SET nome = ?, procedimento = ?, dia = ?, hora = ?
        WHERE id = ?
        `;
        const [result] = await pool.execute(updateQuery, [nome, procedimento, dia, hora, id]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Agendamento não encontrado.' });
        }

        res.status(200).send({ message: 'Agendamento atualizado com sucesso!' })
    } catch (err) {
        console.error('Erro ao atualizar agendamento', err)
        res.status(500).send({ message: 'Erro ao atualizar agendamentos' });
    }
})

// Deletando agendamento
app.delete('/deletar-agendamento/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.execute('DELETE FROM agendamentos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Agendamento não encontrado.' })
        }

        res.status(200).send({ message: 'Agendamento excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir agendamento', err)
        res.status(500).send({ message: 'Erro ao excluir agendamento' })
    }
})


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
});


