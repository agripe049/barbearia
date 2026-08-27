import { useEffect } from "react";

const estilos = {
    sucesso: "bg-[#4B5842]/10 text-[#4B5842] border-[#4B5842]/25",
    erro: "bg-[#9A3B3B]/10 text-[#9A3B3B] border-[#9A3B3B]/25",
    info: "bg-[#1C1B1A]/5 text-[#1C1B1A]/70 border-[#1C1B1A]/15"
};

const Resposta = ({ mensagem, onFechar, duracao = 3000 }) => {
    useEffect(() => {
        if (!mensagem) return;

        const timer = setTimeout(() => {
            onFechar?.();
        }, duracao);

         // Limpa o timer se a mensagem mudar ou o componente desmontar antes do tempo acabar
        return () => clearTimeout(timer);
    }, [mensagem, onFechar, duracao]);

    if (!mensagem) return null;

    const { texto, tipo } = mensagem;

    return (
        <div className={`w-full max-w-md mt-4 rounded-sm border px-4 py-3 text-sm ${estilos[tipo] || estilos.info}`}>
            {texto}
        </div>
    );
};

export default Resposta;