import React from 'react'
import { useState, useEffect } from "react";

const AgendamentoList = ({ atualizarLista, onEditar, onExcluir, setMensagem }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscarAgendamentos = async () => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await fetch("http://localhost:3000/listar-agendamentos")

      if (!response.ok) {
        throw new Error("Não foi possível carregar os agendamentos.")
      }

      const dados = await response.json()
      console.log(dados);
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
      const response = await fetch(`http://localhost:3000/deletar-agendamento/${id}`, {
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
      <div className='w-full max-w-md mt-6 text-center text-sm text-gray-500'>
        Carregando agendamentos...
      </div>
    )
  }
  if (erro) {
    return (
      <div className='w-full max-w-md mt-16 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm text-center'>
        {erro}
      </div>
    )
  }

  if (agendamentos.length === 0) {
    return (
      <div className='w-full max-w-md mt-6 text-center text-sm text-gray-500'>
        Nenhum agendamento cadastrado ainda.
      </div>
    )
  }

  return (
    <div className='w-full max-w-md mt-6'>
      <h2 className='text-sm font-medium text-gray-500 mb-3'>Agendamentos</h2>

      <div className='space-y-3'>
        {agendamentos.map((a) => (
          <div
            key={a.id}
            className='bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between'
          >
            <div>
              <p className='text-sm font-medium text-gray-900'>{a.nome}</p>
              <p className='text-sm text-gray-500'>{a.procedimento}</p>
              <p className='text-xs text-gray-400 mt-1'>{formatarData(a.dia)} às {a.hora.slice(0, 5)}</p>
            </div>

            <div className='flex gap-2'>
              <button 
                onClick={() => onEditar(a)}
                className='text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors'>
                Editar
              </button>
              <button 
                onClick={() => handleExcluir(a.id)}
                className='text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors'>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgendamentoList;