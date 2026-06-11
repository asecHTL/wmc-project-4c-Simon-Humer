import { error } from '@sveltejs/kit';
import { userData } from '$lib/shared/User.svelte.js';

export async function load({ url, fetch }) {
    const userId = url.searchParams.get('userId') || userData.userId;

    if (!userId) {
        throw error(400, 'Missing userId parameter');
    }

    try {
        const res = await fetch(`http://localhost:3000/dashboard/personalNextTasks/${userId}`);
        const tasks = res.ok ? await res.json() : [];
        return { tasks };
    } catch (e) {
        console.error('Tasks load error:', e);
        return { tasks: [] };
    }
}