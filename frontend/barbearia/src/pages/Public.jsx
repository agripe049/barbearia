
import AgendamentoForm from '../components/AgendamentoForm';
import Resposta from '../components/Resposta';
import { useState } from "react"

const Public = () => {
  const [mensagem, setMensagem] = useState(null);
  return (
    <div className='min-h-screen bg-[#F1EFEA] flex flex-col items-center justify-center px-4 py-10'>
      <AgendamentoForm setMensagem={setMensagem} />
      <Resposta mensagem={mensagem} />
    </div>
  )
}

export default Public