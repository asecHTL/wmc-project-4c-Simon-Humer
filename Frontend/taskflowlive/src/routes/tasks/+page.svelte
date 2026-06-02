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

    <div class="searchBar">Search taks..</div>

   
        <button class="addTask" onclick={() => addTask()}>Add Task</button>
    
</div>

<div class="toDo">
    <div class="headerStatus"><h2>ToDo {counterToDo}</h2></div>

    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "toDo"}
                <div class="taskCard">
                    <div class="taskCardTitle">{task.taskTitle}</div>
                    <div class="taskCardDescription">
                        {task.taskDescription}
                    </div>
                    <div class="taskCardPriority">{task.taskPriority}</div>
                    <div class="taskEndDate">{task.taskEndDate}</div>
                    <div class="taskProjectName">Project xy</div>
                </div>
            {/if}
        {/each}
    </ul>
</div>
<div class="inProgress">
    <div class="headerStatus"><h2>In Progress {counterInProgress}</h2></div>
    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "inProgress"}
                <div class="taskCard">
                    <div class="taskCardTitle">{task.taskTitle}</div>
                    <div class="taskCardDescription">
                        {task.taskDescription}
                    </div>
                    <div class="taskCardPriority">{task.taskPriority}</div>
                    <div class="taskEndDate">{task.taskEndDate}</div>
                    <div class="taskProjectName">Project xy</div>
                </div>
            {/if}
        {/each}
    </ul>
</div>
<div class="review">
    <div class="headerStatus"><h2>Review {counterReview}</h2></div>
    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "review"}
                <div class="taskCard">
                    <div class="taskCardTitle">{task.taskTitle}</div>
                    <div class="taskCardDescription">
                        {task.taskDescription}
                    </div>
                    <div class="taskCardPriority">{task.taskPriority}</div>
                    <div class="taskEndDate">{task.taskEndDate}</div>
                    <div class="taskProjectName">Project xy</div>
                </div>
            {/if}
        {/each}
    </ul>
</div>
<div class="done">
    <div class="headerStatus"><h2>Done {counterDone}</h2></div>
    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "done"}
                <div class="taskCard">
                    <div class="taskCardTitle">{task.taskTitle}</div>
                    <div class="taskCardDescription">
                        {task.taskDescription}
                    </div>
                    <div class="taskCardPriority">{task.taskPriority}</div>
                    <div class="taskEndDate">{task.taskEndDate}</div>
                    <div class="taskProjectName">Project xy</div>
                </div>
            {/if}
        {/each}
    </ul>
</div>
