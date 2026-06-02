<script>
    let { data } = $props();
</script>

<div class="toDo">
    <h2>ToDo</h2>

    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "toDo"}
                <li>{task.taskTitle}</li>
            {/if}
        {/each}
    </ul>
</div>
<div class="inProgress">
    <h2>In Progress</h2>
    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "inProgress"}
                <li>{task.taskTitle}</li>
            {/if}
        {/each}
    </ul>
</div>
<div class="review">
    <h2>Review</h2>
    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "review"}
                <li>{task.taskTitle}</li>
            {/if}
        {/each}
    </ul>
</div>
<div class="done">
    <h2>Done</h2>
    <ul>
        {#each data.tasks as task}
            {#if task.taskStatus === "done"}
                <li>{task.taskTitle}</li>
            {/if}
        {/each}
    </ul>
</div>
