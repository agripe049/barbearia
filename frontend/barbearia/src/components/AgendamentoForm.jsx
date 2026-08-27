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

    const procedimentoSelecionado = PROCEDIMENTOS.find((p) => p.nome === procedimento);

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-[#FAF9F6] rounded-sm border border-[#E4DFD4] shadow-[0_1px_2px_rgba(28,27,26,0.06),0_8px_24px_-8px_rgba(28,27,26,0.12)] overflow-hidden"
        >
            <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5">
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#A97C50] font-medium mb-1">
                    {modoEdicao ? "Editar horário" : "Barbearia"}
                </p>
                <h1 className="font-display text-2xl sm:text-[28px] leading-none text-[#1C1B1A] mb-3" style={{ fontWeight: 600 }}>
                    Sr. Ofrélio
                </h1>

                <div
                    className="h-[3px] w-14 rounded-full"
                    style={{
                        background: "repeating-linear-gradient(-45deg, #A97C50 0 6px, #1C1B1A 6px 12px, #FAF9F6 12px 18px)"
                    }}
                />
            </div>

            <div className="px-5 sm:px-8 pb-6 sm:pb-8 space-y-3.5 sm:space-y-4">
                <label className="block">
                    <span className="text-xs font-medium text-[#1C1B1A]/60 uppercase tracking-wide">Nome</span>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        className="mt-1.5 w-full rounded-sm border border-[#E4DFD4] bg-white px-3 py-3 sm:py-2.5 text-sm text-[#1C1B1A] placeholder:text-[#1C1B1A]/35 focus:outline-none focus:border-[#A97C50] focus:ring-1 focus:ring-[#A97C50] transition-colors"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-[#1C1B1A]/60 uppercase tracking-wide">Data</span>
                    <input
                        type="date"
                        value={dia}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                            setDia(e.target.value);
                            setHora("");
                        }}
                        className="mt-1.5 w-full rounded-sm border border-[#E4DFD4] bg-white px-3 py-3 sm:py-2.5 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#A97C50] focus:ring-1 focus:ring-[#A97C50] transition-colors"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-[#1C1B1A]/60 uppercase tracking-wide">Procedimento</span>
                    <select
                        value={procedimento}
                        onChange={(e) => {
                            setProcedimento(e.target.value);
                            setHora("");
                        }}
                        className="mt-1.5 w-full rounded-sm border border-[#E4DFD4] bg-white px-3 py-3 sm:py-2.5 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#A97C50] focus:ring-1 focus:ring-[#A97C50] transition-colors"
                    >
                        <option value="">Selecione um procedimento</option>
                        {PROCEDIMENTOS.map((p) => (
                            <option key={p.nome} value={p.nome}>
                                {p.nome} - R$ {p.preco.toFixed(2)}
                            </option>
                        ))}
                    </select>

                    {procedimentoSelecionado && (
                        <p className="mt-1.5 text-xs text-[#1C1B1A]/45">
                            Duração estimada: {procedimentoSelecionado.duracao} min
                        </p>
                    )}
                </label>

                <label className="block">
                    <span className="text-xs font-medium text-[#1C1B1A]/60 uppercase tracking-wide">Hora</span>
                    <select
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        disabled={!dia || !procedimento || carregandoHorarios}
                        className="mt-1.5 w-full rounded-sm border border-[#E4DFD4] bg-white px-3 py-3 sm:py-2.5 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#A97C50] focus:ring-1 focus:ring-[#A97C50] transition-colors disabled:bg-[#F1EFEA] disabled:text-[#1C1B1A]/35"
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

            <div className="px-5 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row gap-2">
                <button
                    type="submit"
                    disabled={carregando}
                    className="w-full sm:flex-1 rounded-sm bg-[#1C1B1A] text-[#FAF9F6] text-sm font-medium py-3 hover:bg-[#1C1B1A]/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {carregando ? "Enviando..." : modoEdicao ? "Salvar alterações" : "Agendar"}
                </button>

                {modoEdicao && (
                    <button
                        type="button"
                        onClick={handleCancelar}
                        className="w-full sm:w-auto rounded-sm border border-[#E4DFD4] text-[#1C1B1A]/70 text-sm font-medium px-4 py-3 hover:bg-[#F1EFEA] transition-colors">
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}

export default AgendamentoForm;
