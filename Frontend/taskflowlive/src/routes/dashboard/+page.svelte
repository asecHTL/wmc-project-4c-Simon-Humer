<script>
    let { data } = $props();
</script>

<h1>Dashboard</h1>

<div class="card">
    <div class="tasksNext">
        <ul>
            {#each data.upComingTasks as task}
                <li>{task.taskTitle}</li>
            {:else}
                <li>Keine Tasks gefunden.</li>
            {/each}
        </ul>
    </div>
</div>

<div class="card">
    <div class="overviewTasks">
        <table>
            <thead>
                <tr>
                    <th>Priorität</th>
                    <th>Counter</th>
                </tr>
            </thead>
            <tbody>
                {#each data.overviewPersonalTasks as singleTaskOverview}
                    <tr>
                        <td>{singleTaskOverview.status}</td>
                        <td>{singleTaskOverview.count}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<div class="card">
    <div class="tasksPriority">
        <table>
            <thead>
                <tr>
                    <th>Priorität</th>
                    <th>Counter</th>
                </tr>
            </thead>
            <tbody>
                {#each data.tasksByPriority as taskPriority}
                    <tr>
                        <td>{taskPriority.status}</td>
                        <td>{taskPriority.count}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<div class="card">
    <div class="tasksProgressDiagramm"></div>
</div>


