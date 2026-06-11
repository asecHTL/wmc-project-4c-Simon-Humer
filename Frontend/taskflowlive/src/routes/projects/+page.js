import { error } from '@sveltejs/kit';
import { userData } from '$lib/shared/User.svelte.js';

export async function load({ url, fetch }) {
    const userId = url.searchParams.get('userId') || userData.userId;

    if (!userId) {
        throw error(400, 'Missing userId parameter');
    }

    try {
        const response = await fetch(`http://localhost:3000/projects/${userId}`);
        const projects = response.ok ? await response.json() : [];
        return { projects };
    } catch (e) {
        console.error('Projects load error:', e);
        return { projects: [] };
    }
}