<script>
    import { userData } from "$lib/shared/User.svelte";

    let { data } = $props();

    let newTask = $state({
        taskTitle: "",
        taskDescription: "",
        taskPriority: "Medium",
        taskEndDate: "",
        taskStatus: "toDo",
        fkUserId: userData.userId,
    });

    let newHistoryTask = $state({
        fkUserId: userData.userId,
        historyText: "",
        historyDate: Date.now(),
    });

    let historyForTask = $state();

    let showDialog = $state(false);
    let showDialogTaskHistory = $state(false);

    let taskSelectedId = $state(0);

    async function addTask() {
        showDialog = true;
    }

    async function addHistory(taskId) {
        taskSelectedId = taskId;
        await lookUpTaskHistory();
        showDialogTaskHistory = true;
    }

    async function submitTask() {
        if (!newTask.taskTitle || !newTask.taskEndDate) return;

        try {
            const response = await fetch("http://localhost:3000/task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTask),
            });

            if (response.ok) {
                showDialog = false;
                newTask = {
                    taskTitle: "",
                    taskDescription: "",
                    taskPriority: "Medium",
                    taskEndDate: "",
                    taskStatus: "toDo",
                    fkUserId: userData.userId,
                };
                window.location.reload();
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    async function lookUpTaskHistory() {
        try {
            const response = await fetch(
                `http://localhost:3000/taskHistoryTable/${taskSelectedId}`,
            );
            if (response.ok) {
                historyForTask = await response.json();
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    async function submitHostoryToTask() {
        if (
            !newHistoryTask.historyDate ||
            !newHistoryTask.historyText ||
            taskSelectedId === 0 ||
            !taskSelectedId
        )
            return;
        try {
            const response = await fetch(
                `http://localhost:3000/taskHistoryTable/${taskSelectedId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newHistoryTask),
                },
            );

            if (response.ok) {
                const addedEntry = await response.json();
                // Fetch the username from userData (since the current user added it)
                const userResponse = await fetch(`http://localhost:3000/profile/user/${userData.userId}`);
                const user = await userResponse.json();
                
                const newEntryForList = {
                    ...addedEntry,
                    username: user.username
                };

                if (historyForTask) {
                    historyForTask = [newEntryForList, ...historyForTask];
                } else {
                    historyForTask = [newEntryForList];
                }

                newHistoryTask = {
                    fkUserId: userData.userId,
                    historyText: "",
                    historyDate: Date.now(),
                };
            }
        } catch (error) {
            console.error("Error adding task:", error);
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
                    <div
                        class="taskCard"
                        class:selected={taskSelectedId === task.taskId}
                    >
                        <button
                            class="history-icon"
                            onclick={(e) => {
                                e.stopPropagation();
                                addHistory(task.taskId);
                            }}>📜</button
                        >
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
                    <div
                        class="taskCard"
                        class:selected={taskSelectedId === task.taskId}
                    >
                        <button
                            class="history-icon"
                            onclick={(e) => {
                                e.stopPropagation();
                                addHistory(task.taskId);
                            }}>📜</button
                        >
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
                    <div
                        class="taskCard"
                        class:selected={taskSelectedId === task.taskId}
                    >
                        <button
                            class="history-icon"
                            onclick={(e) => {
                                e.stopPropagation();
                                addHistory(task.taskId);
                            }}>📜</button
                        >
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
                    <div
                        class="taskCard"
                        class:selected={taskSelectedId === task.taskId}
                    >
                        <button
                            class="history-icon"
                            onclick={(e) => {
                                e.stopPropagation();
                                addHistory(task.taskId);
                            }}>📜</button
                        >
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
                <input
                    bind:value={newTask.taskTitle}
                    placeholder="Task Title"
                />
                <label>Description</label>
                <input
                    bind:value={newTask.taskDescription}
                    placeholder="Task Description"
                />
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
                <button
                    class="btn btn-secondary"
                    onclick={() => (showDialog = false)}>Cancel</button
                >
                <button class="btn btn-primary" onclick={submitTask}
                    >Create Task</button
                >
            </div>
        </div>
    </div>
{/if}

{#if showDialogTaskHistory}
    <div class="dialog-overlay">
        <div class="dialog-card history-dialog">
            <div class="dialog-header">
                <h2>Task History</h2>
                <button class="close-btn" onclick={() => (showDialogTaskHistory = false)}>✕</button>
            </div>
            
            <div class="history-section">
                <h3>Previous Entries</h3>
                <div class="history-scroll-container">
                    {#if historyForTask && historyForTask.length > 0}
                        {#each historyForTask as singleHistoryTask}
                            <div class="history-item">
                                <div class="history-item-header">
                                    <span class="history-user">{singleHistoryTask.username}</span>
                                    <span class="history-date">{new Date(singleHistoryTask.historyDate).toLocaleString()}</span>
                                </div>
                                <div class="history-item-content">
                                    {singleHistoryTask.historyText}
                                </div>
                            </div>
                        {/each}
                    {:else}
                        <div class="no-history">No history entries yet.</div>
                    {/if}
                </div>
            </div>

            <div class="new-history-section">
                <h3>Add New Entry</h3>
                <div class="input-group">
                    <textarea
                        bind:value={newHistoryTask.historyText}
                        placeholder="What happened? Describe the progress..."
                        rows="3"
                    ></textarea>
                </div>

                <div class="dialog-actions">
                    <button
                        class="btn btn-secondary"
                        onclick={() => (showDialogTaskHistory = false)}
                        >Close</button
                    >
                    <button class="btn btn-primary" onclick={submitHostoryToTask}
                        >Add Entry</button
                    >
                </div>
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

    /* --- TASK CARD SELECTION --- */
    .taskCard {
        cursor: pointer;
        transition:
            transform 0.2s,
            border-color 0.2s;
        position: relative;
    }

    .history-icon {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #9ca3af;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
        z-index: 10;
    }

    .history-icon:hover {
        color: #5b7fff;
    }

    .taskCardTitle {
        font-size: 14px;
        font-weight: 600;
        color: #111827;
        padding-right: 24px;
    }

    .taskCard:hover {
        transform: translateY(-2px);
        border-color: #5b7fff;
    }

    .taskCard.selected {
        border-color: #5b7fff;
        background-color: #f0f4ff;
    }

    /* --- DIALOG STYLES --- */
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
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
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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

    input,
    select {
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

    /* --- HISTORY DIALOG SPECIFIC --- */
    .history-dialog {
        max-width: 600px;
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        padding: 0;
        overflow: hidden;
    }

    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .dialog-header h2 {
        margin: 0;
        border: none;
        padding: 0;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #94a3b8;
        cursor: pointer;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: #1e293b;
    }

    .history-section, .new-history-section {
        padding: 1.5rem 2rem;
    }

    .history-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        background-color: #f8fafc;
    }

    .history-section h3, .new-history-section h3 {
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .history-scroll-container {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-right: 0.5rem;
    }

    .history-scroll-container::-webkit-scrollbar {
        width: 6px;
    }

    .history-scroll-container::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
    }

    .history-scroll-container::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    .history-item {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .history-item-header {
        margin-bottom: 0.5rem;
    }

    .history-date {
        font-size: 0.75rem;
        font-weight: 600;
        color: #5b7fff;
    }

    .history-item-content {
        font-size: 0.9rem;
        color: #334155;
        line-height: 1.5;
        white-space: pre-wrap;
    }

    .no-history {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
        font-style: italic;
    }

    textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.9rem;
        resize: vertical;
        box-sizing: border-box;
    }

    textarea:focus {
        outline: none;
        border-color: #5b7fff;
        box-shadow: 0 0 0 3px rgba(91, 127, 255, 0.1);
    }

    .new-history-section {
        border-top: 1px solid #e2e8f0;
        background: white;
    }

    .new-history-section .dialog-actions {
        margin-top: 1rem;
        padding-top: 0;
        border: none;
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
