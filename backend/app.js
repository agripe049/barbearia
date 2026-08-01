import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import 'dotenv/config';
import PROCEDIMENTOS from './data/procedimentos.js';


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

const existeConflito = async (dia, hora, duracao, idParaIgnorar = null) => {
    let query =
        `SELECT id from agendamentos
         where dia = ? 
            AND hora < ADDTIME(?, SEC_TO_TIME(? * 60))
            AND ADDTIME(hora, SEC_TO_TIME(duracao * 60)) > ?`;
    const params = [dia, hora, duracao, hora];

    if (idParaIgnorar) {
        query += ' AND id != ?';
        params.push(idParaIgnorar);
    }

    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
}

// Converte "14:30" em 870 (minutos desde a meia-noite)
const paraMinutos = (horaTexto) => {
    const [h, m] = horaTexto.split(':').map(Number);
    return h * 60 + m;
};

// Fazendo caminho inverso: 870 minutos vira "14:30"
const paraHorario = (minutos) => {
    const h = String(Math.floor(minutos / 60)).padStart(2, '0');
    const m = String(minutos % 60).padStart(2, '0');
    return `${h}:${m}`;
};

const gerarSlotsBase = (duracao) => {
    const periodos = [
        { inicio: '08:00', fim: '11:30' },
        { inicio: '13:00', fim: '19:00' },
    ];

    const slots = [];

    for (const periodo of periodos) {
        let atual = paraMinutos(periodo.inicio);
        const fim = paraMinutos(periodo.fim);

        // Só adiciona o horário se o procedimento COUBER inteiro antes do fim do período
        while (atual + duracao <= fim) {
            slots.push(paraHorario(atual));
            atual += 30; // sempre pula de 30 em 30, independente da duração do procedimento
        }
    }
    return slots;
}


// Mostrando horários disponíveis
app.get('/horarios-disponiveis', async (req, res) => {
    const { dia, procedimento, idParaIgnorar } = req.query;

    if (!dia || !procedimento) {
        return res.status(400).send({ message: 'Informe o dia e o procedimento.' });
    }

    try {
        const dadosProcedimento = PROCEDIMENTOS[procedimento];

        if (!dadosProcedimento) {
            return res.status(400).send({ message: 'Procedimento inválido.' });
        }

        const { duracao } = dadosProcedimento;

        const slotsBase = gerarSlotsBase(duracao);

        // Busca os agendamentos já existentes nesse dia
        let query = 'SELECT hora, duracao from agendamentos where dia = ?';
        const params = [dia];

        if (idParaIgnorar) {
            query += ' AND id != ?';
            params.push(idParaIgnorar);
        }

        const [agendamentosDoDia] = await pool.execute(query, params);

        // Remove da lista o shorários que colidiram com algum agendamento existente
        const slotsDisponiveis = slotsBase.filter((slot) => {
            const inicioSlot = paraMinutos(slot);
            const fimSlot = inicioSlot + duracao;

            const temConflito = agendamentosDoDia.some((agendamento) => {
                const inicioExistente = paraMinutos(agendamento.hora.slice(0, 5));
                const fimExistente = inicioExistente + agendamento.duracao;

                return inicioSlot < fimExistente && fimSlot > inicioExistente;
            });

            return !temConflito;
        });

        res.status(200).json(slotsDisponiveis);
    } catch (err) {
        console.error('Erro ao buscar horários disponíveis', err);
        res.status(500).send({ message: 'Erro ao buscar horários disponíveis' });
    }
});

// Criando agendamento
app.post('/salvar-agendamento', async (req, res) => {
    const { nome, procedimento, dia, hora } = req.body;

    if (!nome || !procedimento || !dia || !hora) {
        return res.status(400).send({ message: 'Todos os campos são obrigatórios.' })
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataAgendamento = new Date(dia + 'T00:00:00');

    if (dataAgendamento < hoje) {
        return res.status(400).send({ message: 'Não é possível agendar em uma data que já passou' })
    }

    try {

        const dadosProcedimento = PROCEDIMENTOS[procedimento];

        if (!dadosProcedimento) {
            return res.status(400).send({ message: 'Procedimento inválido.' });
        }

        const { duracao } = dadosProcedimento;

        const conflito = await existeConflito(dia, hora, duracao);

        if (conflito) {
            return res.status(409).send({ message: 'Esse horário conflita com outro agendamento. Escolha outro' });
        }

        const insertQuery = `
        INSERT INTO agendamentos (nome, procedimento, dia, hora, duracao)
        VALUES (?,?,?,?,?);
        `;

        const [result] = await pool.execute(insertQuery, [nome, procedimento, dia, hora, duracao]);

        console.log(`Agendamento salvo com sucesso! ID: ${result.insertId}`);

        const mensagem = `Olá ${nome},
        aguardamos você para realizar o seu procedimento
        ${procedimento} no dia
        ${dia} às ${hora} horas.`;

        res.status(200).send({ message: mensagem })

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: 'Esse horário já esta agendado. Escolha outro' });
        }

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

    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    const dataAgendamento = new Date(dia + 'T00:00:00');

    if (dataAgendamento < hoje) {
        return res.status(400).send({ message: 'Não é possível agendar uma data que já passou' })
    }

    try {
        const dadosProcedimento = PROCEDIMENTOS[procedimento];

        if (!dadosProcedimento) {
            return res.status(400).send({ message: 'Procedimento inválido.' });
        }

        const { duracao } = dadosProcedimento;

        const conflito = await existeConflito(dia, hora, duracao, id);

        if (conflito) {
            return res.status(409).send({ message: 'Esse horário já está ocupado.Escolha outro.' })
        }
        const updateQuery = `
        UPDATE agendamentos
        SET nome = ?, procedimento = ?, dia = ?, hora = ?, duracao = ?
        WHERE id = ?
        `;
        const [result] = await pool.execute(updateQuery, [nome, procedimento, dia, hora, duracao, id]);

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Agendamento não encontrado.' });
        }

        res.status(200).send({ message: 'Agendamento atualizado com sucesso!' })
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: 'Esse horário já esta ocupado. Escolha outro.' })
        }
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


