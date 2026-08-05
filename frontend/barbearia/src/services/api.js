const API_URL = "http://localhost:3000";

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

    return response;
}