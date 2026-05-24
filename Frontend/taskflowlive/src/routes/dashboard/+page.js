export async function  load({url}) {
    const userId = url.searchParams.get('userId') || '';


    const [res1, res2, res3, res4] = await Promise.all([
    fetch(`http://localhost:3000/dashboard/personalNextTasks/${userId}`),
    fetch(`http://localhost:3000/dashboard/overviewPersonalTasks/${userId}`),
    fetch(`http://localhost:3000/dashboard/tasksByPriority/${userId}`),
    fetch(`http://localhost:3000/dashboard/personalTasksDoneGraph/${userId}`)
]);

const [upComingTasks, overviewPersonalTasks, tasksByPriority, personalTasksDoneGraph] = await Promise.all([
    res1.json(), res2.json(), res3.json(), res4.json()
]);

    return { upComingTasks, overviewPersonalTasks, tasksByPriority,personalTasksDoneGraph };

}