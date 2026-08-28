const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Pega o token guardado(se existir)
export const getToken = () => localStorage.getItem("token");

// Salva o token depois do login
export const salvarToken = (token) => localStorage.setItem("token", token);

// Remove o token (logout)
export const removerToken = () => localStorage.removeItem("token");

// Faz um fetch já incluindo o token automaticamente, quando existir
export const apiFetch = async (endpoint, opcoes = {}) => {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...opcoes.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...opcoes,
        headers,
    });

    // Se havia um token salvo e o backend recusou por causa dele (sessão
    // expirada ou token inválido), limpa o token e manda o admin de volta
    // para o login automaticamente. Usamos o texto da mensagem (em vez de
    // só o status 400/401) para não confundir com outros erros de validação
    // que também usam esses códigos, como campos obrigatórios faltando.

    if (token && (response.status === 401 || response.status === 400)) {
        try {
            const clone = response.clone();
            const dados = await clone.json();
            const mensagem = dados?.message || "";

            if (mensagem.toLowerCase().includes("login") || mensagem.toLowerCase().includes("sessão")) {
                removerToken();
                window.location.href = "/login";
            }
        } catch {

        }
    }
    return response;
}