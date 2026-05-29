import { error } from '@sveltejs/kit';
import { userData } from '$lib/shared/User.svelte.js';

export async function load({ url, fetch }) {
    const userId = url.searchParams.get('userId') || userData.userId;

    if (!userId) {
        throw error(400, 'Missing userId parameter');
    }

    try {
        const response = await fetch(`http://localhost:3000/teamUserTable/${userId}`);
        const teamsForUser = await response.json();

        return {teamsForUser};
    } catch (e) {
        if (e.status) throw e;
        console.error('Dashboard load error:', e);
        throw error(500, 'Internal Server Error');
    }
}