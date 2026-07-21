import React from 'react'

const estilos = {
    sucesso: "bg-green-50 text-green-700 border-green-200",
    erro: "bg-red-50 text-red-700 border-red-200",
    info: "bg-gray-50 text-gray-600 border-gray-200"
};

const Resposta = ({ mensagem }) => {

    if(!mensagem) return null;

    const {texto, tipo} = mensagem;

    return (
        <div className={`w-full max-w-md mt-4 rounded-lg border px-4 py-3 text-sm ${estilos[tipo] || estilos.info}`}>
            <p>{texto}</p>
        </div>
    )
}

export default Resposta