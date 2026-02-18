const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirigir al inicio/login
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la petición');
    }

    return response.json();
}

export const api = {
    get: (path: string) => request(path, { method: 'GET' }),
    post: (path: string, body: any) => request(path, {
        method: 'POST',
        body: JSON.stringify(body),
    }),
    put: (path: string, body: any) => request(path, {
        method: 'PUT',
        body: JSON.stringify(body),
    }),
    delete: (path: string) => request(path, { method: 'DELETE' }),

    // Para subida de archivos (multipart/form-data)
    upload: async (path: string, formData: FormData) => {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) throw new Error('Error subiendo archivo');
        return response.json();
    }
};
