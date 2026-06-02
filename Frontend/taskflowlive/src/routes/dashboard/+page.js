import { error } from '@sveltejs/kit';
import { userData } from '$lib/shared/User.svelte.js';

export async function  load({url, fetch}) {
    const userId = url.searchParams.get('userId') || userData.userId;
    const taskGraphDate = url.searchParams.get('taskGraphDate') || '1M';

    if (!userId) {
        throw error(400, 'Missing userId parameter');
    }

    try {
        const [res1, res2, res3, res4] = await Promise.all([
            fetch(`http://localhost:3000/dashboard/personalNextTasks/${userId}?limit=3`),
            fetch(`http://localhost:3000/dashboard/overviewPersonalTasks/${userId}`),
            fetch(`http://localhost:3000/dashboard/tasksByPriority/${userId}`),
            fetch(`http://localhost:3000/dashboard/personalTasksDoneGraph/${userId}?taskGraphDate=${taskGraphDate}`)
        ]);

        if (!res1.ok || !res2.ok || !res3.ok || !res4.ok) {
            throw error(500, 'Failed to fetch dashboard data');
        }

        const [upComingTasks, overviewPersonalTasks, tasksByPriority, personalTasksDoneGraph] = await Promise.all([
            res1.json(), res2.json(), res3.json(), res4.json()
        ]);

        return { upComingTasks, overviewPersonalTasks, tasksByPriority, personalTasksDoneGraph };
    } catch (e) {
        if (e.status) throw e;
        console.error('Dashboard load error:', e);
        throw error(500, 'Internal Server Error');
    }
}