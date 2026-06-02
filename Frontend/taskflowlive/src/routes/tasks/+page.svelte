<script>
    import { userData } from "$lib/shared/User.svelte";

    let { data } = $props();

    let newTask = $state({
        taskTitle: "",
        taskDescription: "",
        taskPriority: "Medium",
        taskEndDate: "",
        taskStatus: "toDo",
        fkUserId: userData.userId
    });

    let showDialog = $state(false);

    async function addTask() {
        showDialog = true;
    }

    async function submitTask() {
        if (!newTask.taskTitle || !newTask.taskEndDate) return;

        try {
            const response = await fetch('http://localhost:3000/task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask)
            });

            if (response.ok) {
                showDialog = false;
                newTask = {
                    taskTitle: "",
                    taskDescription: "",
                    taskPriority: "Medium",
                    taskEndDate: "",
                    taskStatus: "toDo",
                    fkUserId: userData.userId
                };
                window.location.reload();
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }

    let counterToDo = $state(0);


    


</script>

<div class="header">
    <div class="filter">Filter</div>
    <div class="groupBy">Group By</div>
    <div class="sortBy">Sort by</div>

    <div class="searchBar">Search tasks..</div>

    <button class="addTask" onclick={() => addTask()}>Add Task</button>
</div>

<div class="board">
    <div class="toDo">
        <div class="headerStatus"><h2>ToDo</h2></div>
        <ul>
            {#each data.tasks as task}
                {#if task.taskStatus === "toDo"}
                    <div class="taskCard">
                        <div class="taskCardTitle">{task.taskTitle}</div>
                        <div class="taskCardDescription">
                            {task.taskDescription}
                        </div>
                        <div
                            class="taskCardPriority {task.taskPriority.toLowerCase()}"
                        >
                            {task.taskPriority}
                        </div>
                        <div class="taskEndDate">{task.taskEndDate}</div>
                        <div class="taskProjectName">Project xy</div>
                    </div>
                {/if}
            {/each}
        </ul>
    </div>

    <div class="inProgress">
        <div class="headerStatus"><h2>In Progress</h2></div>
        <ul>
            {#each data.tasks as task}
                {#if task.taskStatus === "inProgress"}
                    <div class="taskCard">
                        <div class="taskCardTitle">{task.taskTitle}</div>
                        <div class="taskCardDescription">
                            {task.taskDescription}
                        </div>
                        <div
                            class="taskCardPriority {task.taskPriority.toLowerCase()}"
                        >
                            {task.taskPriority}
                        </div>
                        <div class="taskEndDate">{task.taskEndDate}</div>
                        <div class="taskProjectName">Project xy</div>
                    </div>
                {/if}
            {/each}
        </ul>
    </div>

    <div class="review">
        <div class="headerStatus"><h2>Review</h2></div>
        <ul>
            {#each data.tasks as task}
                {#if task.taskStatus === "review"}
                    <div class="taskCard">
                        <div class="taskCardTitle">{task.taskTitle}</div>
                        <div class="taskCardDescription">
                            {task.taskDescription}
                        </div>
                        <div
                            class="taskCardPriority {task.taskPriority.toLowerCase()}"
                        >
                            {task.taskPriority}
                        </div>
                        <div class="taskEndDate">{task.taskEndDate}</div>
                        <div class="taskProjectName">Project xy</div>
                    </div>
                {/if}
            {/each}
        </ul>
    </div>

    <div class="done">
        <div class="headerStatus"><h2>Done</h2></div>
        <ul>
            {#each data.tasks as task}
                {#if task.taskStatus === "done"}
                    <div class="taskCard">
                        <div class="taskCardTitle">{task.taskTitle}</div>
                        <div class="taskCardDescription">
                            {task.taskDescription}
                        </div>
                        <div
                            class="taskCardPriority {task.taskPriority.toLowerCase()}"
                        >
                            {task.taskPriority}
                        </div>
                        <div class="taskEndDate">{task.taskEndDate}</div>
                        <div class="taskProjectName">Project xy</div>
                    </div>
                {/if}
            {/each}
        </ul>
    </div>
</div>

{#if showDialog}
    <div class="dialog-overlay">
        <div class="dialog-card">
            <h2>Create New Task</h2>
            <div class="input-group">
                <label>Title</label>
                <input bind:value={newTask.taskTitle} placeholder="Task Title" />
                <label>Description</label>
                <input bind:value={newTask.taskDescription} placeholder="Task Description" />
                <label>Priority</label>
                <select bind:value={newTask.taskPriority}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
                <label>End Date</label>
                <input type="date" bind:value={newTask.taskEndDate} />
                <label>Status</label>
                <select bind:value={newTask.taskStatus}>
                    <option value="toDo">ToDo</option>
                    <option value="inProgress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                </select>
            </div>
            <div class="dialog-actions">
                <button class="btn btn-secondary" onclick={() => showDialog = false}>Cancel</button>
                <button class="btn btn-primary" onclick={submitTask}>Create Task</button>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(body) {
        margin: 0;
        font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
        background-color: #f3f4f9;
        color: #1f2937;
    }

    :global(.main-content) {
        display: flex;
        flex-direction: column;
        padding: 40px;
        box-sizing: border-box;
        height: 100vh;
    }

    /* --- DIALOG STYLES --- */
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dialog-card {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }

    .dialog-card h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }

    .dialog-card label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748b;
        margin-top: 0.5rem;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    input, select {
        width: 100%;
        padding: 0.65rem 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.9rem;
        background-color: #fff;
        color: #334155;
        box-sizing: border-box;
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        border-top: 1px solid #eee;
        padding-top: 1rem;
    }

    .btn {
        padding: 0.65rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
    }

    .btn-primary {
        background: #5b7fff;
        color: white;
    }

    .btn-secondary {
        background: #fff;
        border-color: #cbd5e1;
        color: #4b5563;
    }

    /* --- HEADER / TOOLBAR --- */
    .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 30px;
        width: 100%;
        flex-shrink: 0;
    }

    .filter,
    .groupBy,
    .sortBy {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #4b5563;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .filter::before {
        content: "⧩ ";
        margin-right: 6px;
    }
    .groupBy::after,
    .sortBy::after {
        content: " ▼";
        font-size: 10px;
        color: #9ca3af;
        margin-left: auto;
        padding-left: 8px;
    }

    .searchBar {
        background-color: #e5e7eb;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        color: #1f2937;
        width: 200px;
        margin-left: auto;
        outline: none;
    }

    .addTask {
        background-color: #5b7fff;
        color: #ffffff;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .addTask:hover {
        background-color: #476be6;
    }

    /* --- BOARD WRAPPER --- */
    .board {
        display: flex;
        gap: 20px;
        flex: 1;
        overflow: hidden;
    }

    /* --- SPALTEN --- */
    .toDo,
    .inProgress,
    .review,
    .done {
        flex: 1;
        min-width: 0;
        height: calc(100vh - 160px);
        background-color: #ffffff;
        border-radius: 16px;
        padding: 16px;
        box-sizing: border-box;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
        overflow-y: auto;
        flex-grow: 1;
        padding-right: 4px;
    }

    ul::-webkit-scrollbar {
        width: 6px;
    }
    ul::-webkit-scrollbar-thumb {
        background-color: #e5e7eb;
        border-radius: 3px;
    }

    .headerStatus {
        flex-shrink: 0;
        margin-bottom: 16px;
    }

    .headerStatus h2 {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .toDo .headerStatus h2::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #9ca3af;
        border-radius: 50%;
    }
    .inProgress .headerStatus h2::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #3b82f6;
        border-radius: 50%;
    }
    .review .headerStatus h2::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #f59e0b;
        border-radius: 50%;
    }
    .done .headerStatus h2::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #10b981;
        border-radius: 50%;
    }

    /* --- TASK CARDS --- */
    .taskCard {
        background-color: #ffffff;
        border: 2px solid #d1d5db;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex-shrink: 0;
    }

    .taskCardTitle {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        padding-right: 20px;
    }

    .taskCardTitle::after {
        content: "📄";
        position: absolute;
        top: 16px;
        right: 16px;
        font-size: 18px; /* war 12px */
        color: #9ca3af;
    }

    .taskCardDescription {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
        margin: 0;
    }

    .taskProjectName {
        background-color: #eef2ff;
        color: #4f46e5;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
        align-self: flex-start;
    }

    .taskCardPriority,
    .taskEndDate {
        display: inline-flex;
        align-items: center;
        font-size: 11px;
        font-weight: 500;
        border-radius: 6px;
        padding: 3px 8px;
        width: fit-content;
    }

    .taskCardPriority {
        background-color: #fee2e2;
        color: #ef4444;
    }

    .taskCardPriority.medium {
        background-color: #fef3c7;
        color: #d97706;
    }

    .taskCardPriority.low {
        background-color: #d1fae5;
        color: #059669;
    }

    .taskEndDate {
        background-color: #f3f4f6;
        color: #374151;
    }

    .taskEndDate::before {
        content: "📅 ";
        font-size: 10px;
    }

    ul::after {
        content: "+ Add Task";
        display: block;
        color: #5b7fff;
        font-size: 13px;
        font-weight: 500;
        padding: 8px 0;
        cursor: pointer;
        margin-top: auto;
        flex-shrink: 0;
    }
</style>
