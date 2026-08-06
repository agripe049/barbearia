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
    navigate("/login");
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10'>
      <div className='w-full max-w-md flex justify-between items-center mb-4'>
        <h2 className='text-sm font-medium text-gray-500'>Painel Administrativo</h2>
        <button
          onClick={handleLogout}
          className='text-xs text-gray-500 hover:text-gray-900 cursor-pointer'
        >
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