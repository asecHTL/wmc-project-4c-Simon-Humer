import { error } from '@sveltejs/kit';
import { userData } from '$lib/shared/User.svelte';


export async function load({ url, fetch }) {
    const userId = userData.userId;

    if (!userId) {
        throw error(400, 'Missing userId parameter');
    }

    try {
        const res = await fetch(`http://localhost:3000/profile/user/${userId}`);

        if (!res.ok) {
            const message = await res.text();
            throw error(res.status, message || 'Failed to fetch user profile');
        }

        const user = await res.json();
        return { user };
    } catch (e) {
        if (e.status) throw e;
        throw error(500, 'Internal Server Error');
    }
}