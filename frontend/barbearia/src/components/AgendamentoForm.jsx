import { useState, useEffect } from "react";

const AgendamentoForm = ({ setMensagem, agendamentoEmEdicao, onSalvar, onCancelarEdicao }) => {
    const [nome, setNome] = useState("");
    const [procedimento, setProcedimento] = useState("");
    const [dia, setDia] = useState("");
    const [hora, setHora] = useState("");
    const [carregando, setCarregando] = useState(false);

    const modoEdicao = Boolean(agendamentoEmEdicao);

    useEffect(() => {
        if (agendamentoEmEdicao) {
            setNome(agendamentoEmEdicao.nome)
            setProcedimento(agendamentoEmEdicao.procedimento)
            setDia(agendamentoEmEdicao.dia.split("T")[0]);
            setHora(agendamentoEmEdicao.hora.slice(0, 5));
        }
    }, [agendamentoEmEdicao]);

    const limparFormulario = () => {
        setNome("");
        setProcedimento("");
        setDia("");
        setHora("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!nome || !procedimento || !dia || !hora) {
            setMensagem({ texto: "Preencha todos os campos.", tipo: "Erro" });
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
            ? `http://localhost:3000/atualizar-agendamento/${agendamentoEmEdicao.id}`
            : "http://localhost:3000/salvar-agendamento";

        const metodo = modoEdicao ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: metodo,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAgendamento)
            })

            const result = await response.json();

            if (response.ok) {
                setMensagem({ texto: result.message, tipo: "sucesso" });
                limparFormulario();
                onSalvar();
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
        onCancelarEdicao();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >

            <h1 className="text-xl font-medium text-gray-90 mb-1">Barbearia Sr. Ofrélio</h1>
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
                    <span className="text-sm text-gray-600">Procedimento</span>
                    <input
                        type="text"
                        value={procedimento}
                        onChange={(e) => setProcedimento(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </label>


                <label className="block">
                    <span className="text-sm text-gray-600">Data</span>
                    <input
                        type="date"
                        value={dia}
                        onChange={(e) => setDia(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </label>
                <label className="block">
                    <span className="text-sm text-gray-600">Hora</span>
                    <input
                        type="time"
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
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
                        className="rounded-lg border-gray-300 text-gray-600 text-sm font-medium px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}

export default AgendamentoForm;
