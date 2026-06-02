<script>
    let {data} = $props();

</script>


<ul>
    {#each data.tasks as task}
        <li>{task.taskTitle}</li>
    {/each}
</ul>