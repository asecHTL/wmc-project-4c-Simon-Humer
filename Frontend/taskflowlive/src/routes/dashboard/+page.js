import { error } from '@sveltejs/kit';
import { userData } from '$lib/shared/User.svelte.js';

export async function  load({url, fetch}) {
    const userId = url.searchParams.get('userId') || userData.userId;
    const taskGraphDate = url.searchParams.get('taskGraphDate') || '1M';

    if (!userId) {
        throw error(400, 'Missing userId parameter');
    }

    try {
        const fetchJSON = async (url) => {
            try {
                const res = await fetch(url);
                return res.ok ? await res.json() : [];
            } catch (e) {
                console.error(`Fetch failed for ${url}:`, e);
                return [];
            }
        };

        const [upComingTasks, overviewPersonalTasks, tasksByPriority, personalTasksDoneGraph] = await Promise.all([
            fetchJSON(`http://localhost:3000/dashboard/personalNextTasks/${userId}?limit=3`),
            fetchJSON(`http://localhost:3000/dashboard/overviewPersonalTasks/${userId}`),
            fetchJSON(`http://localhost:3000/dashboard/tasksByPriority/${userId}`),
            fetchJSON(`http://localhost:3000/dashboard/personalTasksDoneGraph/${userId}?taskGraphDate=${taskGraphDate}`)
        ]);

        return { upComingTasks, overviewPersonalTasks, tasksByPriority, personalTasksDoneGraph };
    } catch (e) {
        if (e.status) throw e;
        console.error('Dashboard load error:', e);
        throw error(500, 'Internal Server Error');
    }
}