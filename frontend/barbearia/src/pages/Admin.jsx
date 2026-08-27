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
    <div className='min-h-screen bg-[#F1EFEA] flex flex-col items-center px-4 py-6 sm:py-10'>
      <div className='w-full max-w-md flex justify-between items-center mb-5 sm:mb-6'>
        <h2 className='text-[11px] tracking-[0.2em] uppercase text-[#A97C50] font-medium'>
          Painel do Barbeiro
        </h2>
        <button
          onClick={handleLogout}
          className='text-sm font-medium text-[#1C1B1A]/50 hover:text-[#1C1B1A] transition-colors cursor-pointer'
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

      <Resposta mensagem={mensagem} onFechar={() => setMensagem(null)}/>

      <AgendamentoList
        atualizarLista={atualizarLista}
        onEditar={setAgendamentoEmEdicao}
        onExcluir={handleSalvo}
        setMensagem={setMensagem}
      />
    </div>
  )
}

export default Admin;