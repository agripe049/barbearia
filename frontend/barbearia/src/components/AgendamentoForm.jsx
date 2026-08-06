import { useState, useEffect } from "react";
import PROCEDIMENTOS from "../data/procedimentos";
import { apiFetch } from "../services/api";

const AgendamentoForm = ({ setMensagem, agendamentoEmEdicao, onSalvar, onCancelarEdicao }) => {
    const [nome, setNome] = useState("");
    const [procedimento, setProcedimento] = useState("");
    const [dia, setDia] = useState("");
    const [hora, setHora] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    const [carregandoHorarios, setCarregandoHorarios] = useState(false);

    const modoEdicao = Boolean(agendamentoEmEdicao);

    useEffect(() => {
        if (agendamentoEmEdicao) {
            setNome(agendamentoEmEdicao.nome)
            setProcedimento(agendamentoEmEdicao.procedimento)
            setDia(agendamentoEmEdicao.dia.split("T")[0]);
            setHora(agendamentoEmEdicao.hora.slice(0, 5));
        }
    }, [agendamentoEmEdicao]);

    // Toda vez que "dia" ou "procedimento" mudar, busca de novo os horários disponíveis
    useEffect(() => {
        const buscarHorarios = async () => {
            if (!dia || !procedimento) {
                setHorariosDisponiveis([]);
                return;
            }

            setCarregandoHorarios(true);

            try {
                let url = `/horarios-disponiveis?dia=${dia}&procedimento=${encodeURIComponent(procedimento)}`;

                if (modoEdicao) {
                    url += `&idParaIgnorar=${agendamentoEmEdicao.id}`;
                }

                const response = await apiFetch(url);
                const dados = await response.json();
                setHorariosDisponiveis(Array.isArray(dados) ? dados : []);
            } catch (err) {
                console.error("Erro ao buscar horários disponíveis: ", err);
                setHorariosDisponiveis([]);
            } finally {
                setCarregandoHorarios(false);
            }
        };

        buscarHorarios();
    }, [dia, procedimento]);

    const limparFormulario = () => {
        setNome("");
        setProcedimento("");
        setDia("");
        setHora("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!nome || !procedimento || !dia || !hora) {
            setMensagem({ texto: "Preencha todos os campos.", tipo: "erro" });
            return;
        }

        setCarregando(true);
        setMensagem({ texto: modoEdicao ? "Atualizando agendamento..." : "Aguarde, processando seu agendamento...", tipo: "info" });

        const dadosAgendamento = {
            nome,
            procedimento,
            dia,
            hora
        };

        const url = modoEdicao
            ? `/atualizar-agendamento/${agendamentoEmEdicao.id}`
            : "/salvar-agendamento";

        const metodo = modoEdicao ? "PUT" : "POST";

        try {
            const response = await apiFetch(url, {
                method: metodo,
                body: JSON.stringify(dadosAgendamento)
            });

            const result = await response.json();

            if (response.ok) {
                setMensagem({ texto: result.message, tipo: "sucesso" });
                limparFormulario();
                onSalvar?.();
            } else {
                setMensagem({ texto: "Erro: " + result.message, tipo: "erro" });
            }
        } catch (error) {
            console.error('Erro na requisição: ', error);
            setMensagem({ texto: "Erro de conexão com o servidor", tipo: "erro" });
        } finally {
            setCarregando(false);
        }
    };

    const handleCancelar = () => {
        limparFormulario();
        onCancelarEdicao?.();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >

            <h1 className="text-xl font-medium text-gray-100 mb-1">Barbearia Sr. Ofrélio</h1>
            <p className="text-sm text-gray-500 mb-6">
                {modoEdicao ? "Editando agendamento" : "Agende seu horário"}
            </p>

            <div className="space-y-4">
                <label className="block">
                    <span className="text-sm text-gray-600">Nome</span>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </label>

                <label className="block">
                    <span className="text-sm text-gray-600">Data</span>
                    <input
                        type="date"
                        value={dia}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                            setDia(e.target.value);
                            setHora("");
                        }}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </label>

                <label className="block">
                    <span className="text-sm text-gray-600">Procedimento</span>
                    <select
                        value={procedimento}
                        onChange={(e) => {
                            setProcedimento(e.target.value);
                            setHora("");
                        }}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                    >
                        <option value="">Selecione um procedimento</option>
                        {PROCEDIMENTOS.map((p) => (
                            <option key={p.nome} value={p.nome}>
                                {p.nome} - R$ {p.preco.toFixed(2)} ({p.duracao} min)
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="text-sm text-gray-600">Hora</span>
                    <select
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        disabled={!dia || !procedimento || carregandoHorarios}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                        <option value="">
                            {!dia || !procedimento
                                ? "Escolha o procedimento e a data primeiro"
                                : carregandoHorarios
                                ? "Carregando horários..."
                                : horariosDisponiveis.length === 0
                                ? "Nenhum horário disponível"
                                : "Selecione um horário"}
                        </option>
                        {horariosDisponiveis.map((h) => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="flex gap-2 mt-6">
                <button
                    type="submit"
                    disabled={carregando}
                    className="flex-1 rounded-lg bg-gray-900 text-white text-sm font-medium py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {carregando ? "Enviando..." : modoEdicao ? "Salvar alterações" : "Confirmar"}
                </button>

                {modoEdicao && (
                    <button
                        type="button"
                        onClick={handleCancelar}
                        className="rounded-lg border border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}

export default AgendamentoForm;
