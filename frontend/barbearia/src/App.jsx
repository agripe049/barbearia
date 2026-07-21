import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import AgendamentoForm from './components/AgendamentoForm'
import Resposta from './components/Resposta'
import AgendamentoList from './components/AgendamentoList'

function App() {
  const [mensagem, setMensagem] = useState(null);
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);
  const [atualizarLista, setAtualizarLista] = useState(0)

  const handleSalvo = () => {
    setAgendamentoEmEdicao(null)
    setAtualizarLista(prev => prev + 1)
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10'>
      <AgendamentoForm
        setMensagem={setMensagem}
        agendamentoEmEdicao={agendamentoEmEdicao}
        onSalvar={handleSalvo}
        onCancelarEdicao={() => setAgendamentoEmEdicao(null)}
      />
      <Resposta mensagem={mensagem} />
      <AgendamentoList 
        atualizarLista={atualizarLista}
        onEditar={setAgendamentoEmEdicao}
        onExcluir={handleSalvo}
        setMensagem={setMensagem}
      />
    </div>

  )
}

export default App
