import React from 'react'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { apiFetch, salvarToken } from '../services/api';

const Login = () => {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");

        if (!usuario || !senha) {
            setErro("Preencha usuário e senha");
            return;
        }

        setCarregando(true);

        try {
            const response = await apiFetch("/login", {
                method: "POST",
                body: JSON.stringify({ usuario, senha }),
            });

            const dados = await response.json();

            if (!response.ok) {
                setErro(dados.message || "Erro ao fazer login");
                return;
            }

            salvarToken(dados.token);
            navigate("/admin");
        } catch (err) {
            console.error("Erro no login: ", err)
            setErro("Erro de conexão com o servidor");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#F1EFEA] flex items-center justify-center px-4'>
            <form
                onSubmit={handleSubmit}
                className='w-full max-w-sm bg-[#FAF9F6] rounded-sm border border-[#E4DFD4] shadow-[0_1px_2px_rgba(28,27,26,0.06),0_8px_24px_-8px_rgba(28,27,26,0.12)] px-6 sm:px-8 py-6 sm:py-8'
            >
                <p className='text-[11px] tracking-[0.2em] uppercase text-[#A97C50] font-medium mb-1'>
                    Painel do Barbeiro
                </p>
                <h1 className='font-display text-2xl sm:text-[26px] text-[#1C1B1A] mb-1'>
                    Área do admin
                </h1>
                <div
                    className="h-[3px] w-14 rounded-full mb-6"
                    style={{ background: "repeating-linear-gradient(-45deg, #A97C50 0 6px, #1C1B1A 6px 12px, #FAF9F6 12px 18px)" }}
                />

                <div className='space-y-4'>
                    <label className="block">
                        <span className="text-xs font-medium text-[#1C1B1A]/60 uppercase tracking-wide">Usuário</span>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder='Digite seu usuário'
                            className="mt-1.5 w-full rounded-sm border border-[#E4DFD4] bg-white px-3 py-3 sm:py-2.5 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#A97C50] focus:ring-1 focus:ring-[#A97C50] transition-colors"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-medium text-[#1C1B1A]/60 uppercase tracking-wide">Senha</span>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder='Digite sua senha'
                            className="mt-1.5 w-full rounded-sm border border-[#E4DFD4] bg-white px-3 py-3 sm:py-2.5 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#A97C50] focus:ring-1 focus:ring-[#A97C50] transition-colors"
                        />
                    </label>
                </div>

                {erro && (
                    <p className='mt-4 text-sm text-[#9a3b3b]'>{erro}</p>
                )}

                <button
                    type="submit"
                    disabled={carregando}
                    className="mt-6 w-full rounded-sm bg-[#1C1B1A] text-[#FAF9F6] text-sm font-medium py-3 hover:bg-[#1C1B1A]/90 transition-colors disabled:opacity-50"
                >
                    {carregando ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    )
}

export default Login;
