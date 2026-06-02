<script>
    import { userData } from "$lib/shared/User.svelte";

    let { data } = $props();

    async function addTask() {}

    let counterToDo = $state(0);
    let counterInProgress = $state(0);
    let counterReview = $state(0);
    let counterDone = $state(0);
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
                        <div class="taskCardDescription">{task.taskDescription}</div>
                        <div class="taskCardPriority">{task.taskPriority}</div>
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
                        <div class="taskCardDescription">{task.taskDescription}</div>
                        <div class="taskCardPriority">{task.taskPriority}</div>
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
                        <div class="taskCardDescription">{task.taskDescription}</div>
                        <div class="taskCardPriority">{task.taskPriority}</div>
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
                        <div class="taskCardDescription">{task.taskDescription}</div>
                        <div class="taskCardPriority">{task.taskPriority}</div>
                        <div class="taskEndDate">{task.taskEndDate}</div>
                        <div class="taskProjectName">Project xy</div>
                    </div>
                {/if}
            {/each}
        </ul>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: #F3F4F9;
        color: #1F2937;
    }

    :global(.main-content) {
        display: flex;
        flex-direction: column;
        padding: 40px;
        box-sizing: border-box;
        height: 100vh;
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

    .filter, .groupBy, .sortBy {
        background-color: #FFFFFF;
        border: 1px solid #E5E7EB;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #4B5563;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .filter::before { content: "⧩ "; margin-right: 6px; }
    .groupBy::after, .sortBy::after { content: " ▼"; font-size: 10px; color: #9CA3AF; margin-left: auto; padding-left: 8px; }

    .searchBar {
        background-color: #E5E7EB;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        color: #1F2937;
        width: 200px;
        margin-left: auto;
        outline: none;
    }

    .addTask {
        background-color: #5B7FFF;
        color: #FFFFFF;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .addTask:hover {
        background-color: #476BE6;
    }

    /* --- BOARD WRAPPER --- */
    .board {
        display: flex;
        gap: 20px;
        flex: 1;
        overflow: hidden;
    }

    /* --- SPALTEN --- */
    .toDo, .inProgress, .review, .done {
        flex: 1;
        min-width: 0;
        height: calc(100vh - 160px);
        background-color: #FFFFFF;
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
        background-color: #E5E7EB;
        border-radius: 3px;
    }

    .headerStatus {
        flex-shrink: 0;
        margin-bottom: 16px;
    }

    .headerStatus h2 {
        font-size: 16px;
        font-weight: 600;
        color: #1F2937;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .toDo .headerStatus h2::before { content: ""; display: inline-block; width: 8px; height: 8px; background-color: #9CA3AF; border-radius: 50%; }
    .inProgress .headerStatus h2::before { content: ""; display: inline-block; width: 8px; height: 8px; background-color: #3B82F6; border-radius: 50%; }
    .review .headerStatus h2::before { content: ""; display: inline-block; width: 8px; height: 8px; background-color: #F59E0B; border-radius: 50%; }
    .done .headerStatus h2::before { content: ""; display: inline-block; width: 8px; height: 8px; background-color: #10B981; border-radius: 50%; }

    /* --- TASK CARDS --- */
    .taskCard {
        background-color: #FFFFFF;
        border: 2px solid #D1D5DB;
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
        font-size: 12px;
        color: #9CA3AF;
    }

    .taskCardDescription {
        font-size: 13px;
        color: #6B7280;
        line-height: 1.4;
        margin: 0;
    }

    .taskProjectName {
        background-color: #EEF2FF;
        color: #4F46E5;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
        align-self: flex-start;
    }

    .taskCardPriority, .taskEndDate {
        display: inline-flex;
        align-items: center;
        font-size: 11px;
        font-weight: 500;
        border-radius: 6px;
        padding: 3px 8px;
        width: fit-content;
    }

    .taskCardPriority {
        background-color: #FEE2E2;
        color: #EF4444;
    }

    .taskCardPriority.medium {
        background-color: #FEF3C7;
        color: #D97706;
    }

    .taskCardPriority.low {
        background-color: #D1FAE5;
        color: #059669;
    }

    .taskEndDate {
        background-color: #F3F4F6;
        color: #374151;
    }

    .taskEndDate::before {
        content: "📅 ";
        font-size: 10px;
    }

    ul::after {
        content: "+ Add Task";
        display: block;
        color: #5B7FFF;
        font-size: 13px;
        font-weight: 500;
        padding: 8px 0;
        cursor: pointer;
        margin-top: auto;
        flex-shrink: 0;
    }
</style>