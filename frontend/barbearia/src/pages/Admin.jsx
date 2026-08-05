import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AgendamentoForm from '../components/AgendamentoForm'
import AgendamentoList from '../components/AgendamentoList'
import Resposta from '../components/Resposta'
import { removerToken } from '../services/api'

const Admin = () => {
  const [mensagem, setMensagem] = useState(null);
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);
  const [atualizarLista, setAtualizarLista] = useState(0);

  const navigate = useNavigate();

  const handleSalvo = () => {
    setAgendamentoEmEdicao(null);
    setAtualizarLista((prev) => prev + 1);
  };

  const handleLogout = () => {
    removerToken();
    navigate("/admin/login");
  };

  return (
    <div>
      <div>
        <h2>Painel Administrativo</h2>
        <button>
          Sair
        </button>
      </div>

      <AgendamentoForm
        setMensagem={setMensagem}
        agendamentoEmEdicao={agendamentoEmEdicao}
        onSalvar={handleSalvo}
        onCancelarEdicao={() => setAgendamentoEmEdicao(null)}
      />
      <AgendamentoList
        atualizarLista={atualizarLista}
        onEditar={setAgendamentoEmEdicao}
        onExcluir={handleSalvo}
        setMensagem={setMensagem}
      />
    </div>
  )
}

export default Admin