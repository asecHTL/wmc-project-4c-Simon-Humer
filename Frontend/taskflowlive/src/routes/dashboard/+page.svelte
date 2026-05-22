<script>
    let {data} = $props();
</script>
<h1>Dashboard</h1>

<div class="card">
    <div class="tasksNext">
        <li>
            {#each data.upComingTasks as task}
                <ul>{task.taskTitle}</ul>
            {/each}
        </li>
    </div>
</div>


<div class="card">
    <div class="overviewTasks">
        
    </div>
</div>


<div class="card">
    <div class="tasksPriority">
        
    </div>
</div>


<div class="card">
    <div class="tasksProgressDiagramm">
        
    </div>
</div>