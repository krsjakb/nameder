import { API_URL } from './client';

const ADMIN_SECRET_KEY = 'nameder_admin_secret';

export const getAdminHeaders = () => {
    const secret = localStorage.getItem(ADMIN_SECRET_KEY);
    return {
        'Content-Type': 'application/json',
        'x-admin-secret': secret || '',
    };
};

export const loginAdmin = async (password: string) => {
    const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error);
    }

    if (data.token) {
        localStorage.setItem(ADMIN_SECRET_KEY, data.token);
    }

    return data;
};

export const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_SECRET_KEY);
};

export const getAdminStats = async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
        headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
};

export const getAdminSessions = async (limit = 20, offset = 0) => {
    const response = await fetch(`${API_URL}/admin/sessions?limit=${limit}&offset=${offset}`, {
        headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch sessions');
    return response.json();
};

export const getAdminTopNames = async (limit = 20) => {
    const response = await fetch(`${API_URL}/admin/names/top?limit=${limit}`, {
        headers: getAdminHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch top names');
    return response.json();
};
