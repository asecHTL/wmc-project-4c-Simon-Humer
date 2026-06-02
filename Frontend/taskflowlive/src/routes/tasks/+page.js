import { error } from '@sveltejs/kit';
import { userData } from '$lib/shared/User.svelte.js';

export async function load({ url, fetch }) {
    const userId = url.searchParams.get('userId') || userData.userId;

    if (!userId) {
        throw error(400, 'Missing userId parameter');
    }

    try {
        const response = await fetch(`http://localhost:3000/dashboard/personalNextTasks/${userId}`);
        
        if (!response.ok) {
            throw error(500, 'Failed to fetch tasks');
        }

        const tasks = await response.json();
        return { tasks };
    } catch (e) {
        if (e.status) throw e;
        console.error('Tasks load error:', e);
        throw error(500, 'Internal Server Error');
    }
}