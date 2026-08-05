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
        <div>
            <form
                onSubmit={handleSubmit}
                className=''
            >
                <h1>Área do admin</h1>
                <p>Faça login para gerenciar os agendamentos</p>
            </form>
        </div>
    )
}

export default Login;
