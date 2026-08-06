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
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
            <form
                onSubmit={handleSubmit}
                className='w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8'
            >
                <h1 className='text-xl font-medium text-gray-900 mb-1'>
                    Área do admin
                </h1>
                <p className='text-sm text-gray-500 mb-6'>
                    Faça login para gerenciar os agendamentos
                </p>

                <div className='space-y-4'>
                    <label className='block'>
                        <span className='text-sm text-gray-600'>Usuário</span>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent' />
                    </label>
                    <label className='block'>
                        <span className='text-sm text-gray-600'>Senha</span>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent' />
                    </label>
                </div>

                {erro && (
                    <p className='mt-4 text-sm text-red-600'>{erro}</p>
                )}

                <button
                    type="submit"
                    disabled={carregando}
                    className='mt-6 w-full rounded-lg bg-gray-900 text-white text-sm font-medium py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50'
                >
                    {carregando ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    )
}

export default Login;
