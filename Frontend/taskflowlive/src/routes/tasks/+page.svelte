<script>
    import { userData } from "$lib/shared/User.svelte";
    import { t } from "$lib/i18n/i18n.svelte.js";
    import { onMount } from "svelte";
    import { io } from "socket.io-client";

    let { data } = $props();
    let socket = $state();

    onMount(() => {
        socket = io("http://localhost:3000");

        socket.on("connect", () => {
            console.log("Connected to WebSocket");
            socket.emit("identify", { userId: userData.userId });
        });

        socket.on("taskMoved", (updatedTask) => {
            console.log("Task move detected via WebSocket:", updatedTask);
            // Refresh window to sync all data including counts
            window.location.reload();
        });

        return () => {
            if (socket) socket.disconnect();
        };
    });

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

    const priorityClasses = {
        High: "bg-danger-subtle text-danger",
        Medium: "bg-warning-subtle text-warning",
        Low: "bg-success-subtle text-success"
    };

    async function addTask() { showDialog = true; }

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });
            if (response.ok) window.location.reload();
        } catch (error) { console.error("Error adding task:", error); }
    }

    async function lookUpTaskHistory() {
        try {
            const response = await fetch(`http://localhost:3000/taskHistoryTable/${taskSelectedId}`);
            if (response.ok) historyForTask = await response.json();
            else historyForTask = [];
        } catch (error) { console.error(error); historyForTask = []; }
    }

    async function submitHostoryToTask() {
        if (!newHistoryTask.historyText || !taskSelectedId) return;
        try {
            const response = await fetch(`http://localhost:3000/taskHistoryTable/${taskSelectedId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newHistoryTask),
            });
            if (response.ok) {
                const addedEntry = await response.json();
                const userResponse = await fetch(`http://localhost:3000/profile/user/${userData.userId}`);
                const user = await userResponse.json();
                const newEntry = { ...addedEntry, username: user.username };
                historyForTask = historyForTask ? [newEntry, ...historyForTask] : [newEntry];
                newHistoryTask.historyText = "";
            }
        } catch (error) { console.error(error); }
    }

    const statusOrder = ['toDo', 'inProgress', 'review', 'done'];

    async function moveTask(task, direction) {
        const currentIndex = statusOrder.indexOf(task.taskStatus);
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < statusOrder.length) {
            const newStatus = statusOrder[newIndex];
            try {
                const response = await fetch(`http://localhost:3000/task/${task.taskId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...task,
                        taskStatus: newStatus
                    }),
                });
                if (response.ok) window.location.reload();
            } catch (error) {
                console.error("Error moving task:", error);
            }
        }
    }
</script>

<div class="container-fluid py-4 h-100 d-flex flex-column">
    <div class="row align-items-center g-3 mb-4">
        <div class="col-auto">
            <div class="dropdown">
                <button class="btn btn-light border dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-filter me-1"></i> {t('filter') || 'Filter'}
                </button>
            </div>
        </div>
        <div class="col-auto d-none d-sm-block">
            <button class="btn btn-light border">{t('groupBy') || 'Group By'}</button>
        </div>
        <div class="col-12 col-md-auto ms-md-auto">
            <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
                <input class="form-control bg-light border-start-0" placeholder={t('searchTasks') || 'Search tasks..'} />
            </div>
        </div>
        <div class="col-auto">
            <button class="btn btn-primary" onclick={addTask}>
                {t('tasks')} <i class="bi bi-plus-lg ms-1"></i>
            </button>
        </div>
    </div>

    <!-- Kanban Board -->
    <div class="row g-3 flex-grow-1 overflow-auto pb-5 pb-md-0" style="min-height: 0;">
        {#each ['toDo', 'inProgress', 'review', 'done'] as status}
            <div class="col-12 col-md-6 col-xl-3 h-100">
                <div class="card bg-light border-0 h-100 shadow-sm">
                    <div class="card-header bg-transparent border-0 pt-3 px-3">
                        <h6 class="fw-bold d-flex align-items-center mb-0">
                            <span class="badge rounded-circle p-1 me-2 bg-{status === 'toDo' ? 'secondary' : status === 'inProgress' ? 'primary' : status === 'review' ? 'warning' : 'success'}"></span>
                            {t(status)}
                        </h6>
                    </div>
                    <div class="card-body p-2 overflow-auto">
                        {#each data.tasks || [] as task}
                            {#if task.taskStatus === status}
                                <div class="card border-0 shadow-sm mb-2 task-card" onclick={() => addHistory(task.taskId)} role="button" tabindex="0" onkeydown={() => {}}>
                                    <div class="card-body p-3">
                                        <div class="d-flex justify-content-between align-items-start mb-2">
                                            <h6 class="card-title small fw-bold mb-0 text-truncate pe-3">{task.taskTitle}</h6>
                                            <i class="bi bi-journal-text text-muted small"></i>
                                        </div>
                                        <p class="card-text small text-muted mb-3 text-truncate-2">{task.taskDescription}</p>

                                        <div class="d-flex justify-content-between align-items-center mt-auto">
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="badge {priorityClasses[task.taskPriority] || 'bg-light'} fw-medium" style="font-size: 0.65rem;">
                                                    {t(task.taskPriority.toLowerCase() + 'Priority') || task.taskPriority}
                                                </span>
                                                
                                                <div class="d-flex gap-1 border-start ps-2 ms-1">
                                                    <button 
                                                        class="btn btn-link p-0 text-muted text-decoration-none" 
                                                        style="font-size: 0.75rem;"
                                                        onclick={(e) => { e.stopPropagation(); moveTask(task, -1); }}
                                                        disabled={status === 'toDo'}
                                                    >
                                                        <i class="bi bi-chevron-left"></i>
                                                    </button>
                                                    <button 
                                                        class="btn btn-link p-0 text-muted text-decoration-none" 
                                                        style="font-size: 0.75rem;"
                                                        onclick={(e) => { e.stopPropagation(); moveTask(task, 1); }}
                                                        disabled={status === 'done'}
                                                    >
                                                        <i class="bi bi-chevron-right"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <small class="text-muted" style="font-size: 0.7rem;">
                                                <i class="bi bi-calendar-event me-1"></i> {task.taskEndDate}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    </div>
                    <div class="card-footer bg-transparent border-0 pt-0 pb-3 text-center">
                        <button class="btn btn-link btn-sm text-decoration-none text-primary fw-medium" onclick={addTask}>
                            <i class="bi bi-plus-lg me-1"></i> {t('tasks')}
                        </button>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<!-- Create Task Modal -->
{#if showDialog}
    <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold">{t('createTask')}</h5>
                    <button class="btn-close" onclick={() => showDialog = false}></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">{t('taskTitle')}</label>
                        <input class="form-control" bind:value={newTask.taskTitle} placeholder={t('taskTitle')} />
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">{t('taskDescription')}</label>
                        <textarea class="form-control" bind:value={newTask.taskDescription} placeholder={t('taskDescription')}></textarea>
                    </div>
                    <div class="row g-3">
                        <div class="col-6">
                            <label class="form-label small fw-bold text-muted">{t('taskPriority')}</label>
                            <select class="form-select" bind:value={newTask.taskPriority}>
                                <option value="High">{t('highPriority')}</option>
                                <option value="Medium">{t('mediumPriority')}</option>
                                <option value="Low">{t('lowPriority')}</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="form-label small fw-bold text-muted">{t('endDate')}</label>
                            <input type="date" class="form-control" bind:value={newTask.taskEndDate} />
                        </div>
                    </div>
                    <div class="mt-3">
                        <label class="form-label small fw-bold text-muted">{t('status')}</label>
                        <select class="form-select" bind:value={newTask.taskStatus}>
                            <option value="toDo">{t('toDo')}</option>
                            <option value="inProgress">{t('inProgress')}</option>
                            <option value="review">{t('review')}</option>
                            <option value="done">{t('taskCompleted')}</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0 pb-4 px-4">
                    <button class="btn btn-light" onclick={() => showDialog = false}>{t('cancel')}</button>
                    <button class="btn btn-primary" onclick={submitTask}>{t('createTask')}</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Task History Modal -->
{#if showDialogTaskHistory}
    <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 shadow overflow-hidden">
                <div class="modal-header bg-light py-3 px-4 border-0">
                    <h5 class="modal-title fw-bold m-0">{t('taskHistory')}</h5>
                    <button class="btn-close" onclick={() => showDialogTaskHistory = false}></button>
                </div>
                <div class="modal-body p-0 d-flex flex-column" style="max-height: 80vh;">
                    <div class="p-4 bg-light-subtle flex-grow-1 overflow-auto border-bottom">
                        <h6 class="text-uppercase small fw-bold text-muted mb-3">{t('previousEntries')}</h6>
                        {#if historyForTask && historyForTask.length > 0}
                            {#each historyForTask as entry}
                                <div class="card border-0 shadow-sm mb-3">
                                    <div class="card-body p-3">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="badge bg-primary-subtle text-primary fw-bold">{entry.username}</span>
                                            <small class="text-muted">{new Date(entry.historyDate).toLocaleString()}</small>
                                        </div>
                                        <p class="mb-0 small text-secondary" style="white-space: pre-wrap;">{entry.historyText}</p>
                                    </div>
                                </div>
                            {/each}
                        {:else}
                            <div class="text-center py-5 text-muted fst-italic">{t('noHistory')}</div>
                        {/if}
                    </div>
                    <div class="p-4 bg-white">
                        <h6 class="text-uppercase small fw-bold text-muted mb-3">{t('addNewEntry')}</h6>
                        <textarea class="form-control mb-3" rows="3" bind:value={newHistoryTask.historyText} placeholder={t('whatHappened')}></textarea>
                        <div class="d-flex justify-content-end gap-2">
                            <button class="btn btn-light btn-sm fw-bold" onclick={() => showDialogTaskHistory = false}>{t('close')}</button>
                            <button class="btn btn-primary btn-sm fw-bold" onclick={submitHostoryToTask}>{t('addEntry')}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .text-truncate-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .task-card {
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
    }
    .task-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
    }
</style>