import React from 'react'
import { useState, useEffect } from "react";
import { apiFetch } from '../services/api';
import  PROCEDIMENTOS  from '../data/procedimentos';

const AgendamentoList = ({ atualizarLista, onEditar, onExcluir, setMensagem }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscarAgendamentos = async () => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await apiFetch("/listar-agendamentos")

      if (!response.ok) {
        throw new Error("Não foi possível carregar os agendamentos.")
      }

      const dados = await response.json()
      setAgendamentos(dados);

    } catch (err) {
      console.error('Erro ao buscar agendamentos: ', err)
      setErro("Erro ao carregar agendamentos. Tente novamente.")
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, [atualizarLista]);

  const handleExcluir = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este agendamento?")
    if (!confirmar) return;

    try {
      const response = await apiFetch(`/deletar-agendamento/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (response.ok) {
        setMensagem({ texto: result.message, tipo: "sucesso" });
        onExcluir(); //Avisa o App.jsx pra recarregar a lista
      } else {
        setMensagem({ texto: "Erro: " + result.message, tipo: "erro" });
      }
    } catch (err) {
      console.error("Erro ao excluir: ", err);
      setMensagem({ texto: "Erro de conexão com o servidor", tipo: "erro" });
    }
  };

  const formatarData = (dataIso) => {
    const [ano, mes, dia] = dataIso.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  if (carregando) {
    return (
      <div className='w-full max-w-md mt-8 text-center text-sm text-[#1C1B1A]/50'>
        Carregando agendamentos...
      </div>
    )
  }
  if (erro) {
    return (
      <div className='w-full max-w-md mt-8 rounded-sm border border-[#9A3B3B]/25 bg-[#9A3B3B]/10 text-[#9A3B3B] px-4 py-3 text-sm text-center'>
        {erro}
      </div>
    )
  }

  if (agendamentos.length === 0) {
    return (
      <div className='w-full max-w-md mt-8 text-center py-10 border border-dashed border-[#E4DFD4] rounded-sm'>
        <p className='text-sm text-[#1C1B1A]/50'>Nenhum agendamento cadastrado ainda.</p>
      </div>
    )
  }

  return (
    <div className='w-full max-w-md mt-10'>
      <p className='text-[11px] tracking-[0.2em] uppercase text-[#A97C50] font-medium mb-3'>
        Agenda
      </p>

      <div className='space-y-2.5'>
        {agendamentos.map((a) => {
          const preco = PROCEDIMENTOS.find((p) => p.nome === a.procedimento)?.preco;

          return (
            <div
              key={a.id}
              className='bg-[#FAF9F6] rounded-sm border border-[#E4DFD4] pl-4 pr-3 py-3.5 flex items-center justify-between gap-3'
              style={{ borderLeft: "3px solid #A97C50" }}
            >
              <div className='min-w-0'>
                <p className='text-sm font-medium text-[#1C1B1A] truncate'>{a.nome}</p>
                <p className='text-xs text-[#1C1B1A]/55 mt-0.5'>
                  {a.procedimento}
                  {preco !== undefined && ` · R$ ${preco.toFixed(2)}`}
                </p>
                <p className='text-xs text-[#1C1B1A]/40 mt-1'>
                  {formatarData(a.dia)} às {a.hora.slice(0, 5)}
                </p>
              </div>

              <div className='flex gap-1.5 shrink-0'>
                <button
                  onClick={() => onEditar(a)}
                  className='text-xs font-medium text-[#1C1B1A]/70 hover:text-[#1C1B1A] border border-[#E4DFD4] rounded-sm px-2.5 py-1.5 hover:bg-[#F1EFEA] transition-colors'>
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(a.id)}
                  className='text-xs font-medium text-[#9A3B3B] border border-[#9A3B3B]/25 rounded-sm px-2.5 py-1.5 hover:bg-[#9A3B3B]/10 transition-colors'>
                  Excluir
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AgendamentoList;