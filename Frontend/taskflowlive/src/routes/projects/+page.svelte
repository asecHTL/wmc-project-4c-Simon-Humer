<script>
    import { userData } from "$lib/shared/User.svelte.js";
    import { t } from "$lib/i18n/i18n.svelte.js";
    let { data } = $props();
    let projects = $derived(data.projects || []);

    let newProject = $state({ projectName: "", projectPriority: "Medium", projectEndDate: "" });
    let teams = $state([]);
    let selectedTeamId = $state("");
    let teamMembers = $state([]);
    let selectedMembers = $state([]);
    let subtasks = $state([]);
    let newSubtask = $state({ taskTitle: "", taskDescription: "", taskPriority: "Medium", taskEndDate: "", contributorId: "" });
    let projectStarted = $state(false);

    let overview = $state([{status: 'Done', count:0}, {status: 'InProgress', count:0}, {status: 'OnHold', count:0}, {status: 'Overdue', count:0}]);

    async function fetchOverview() {
        if (!userData.userId) return;
        try {
            const response = await fetch(`http://localhost:3000/project/overview/${userData.userId}`);
            if (response.ok) overview = await response.json();
        } catch(e) { console.error(e); }
    }
    
    async function fetchUserTeams() {
        if (!userData.userId) return;
        try {
            const response = await fetch(`http://localhost:3000/teamUserTable/${userData.userId}`);
            if (response.ok) teams = await response.json();
        } catch (e) { console.error(e); }
    }

    async function fetchTeamMembers(teamId) {
        if (!teamId) { teamMembers = []; return; }
        try {
            const response = await fetch(`http://localhost:3000/team/${teamId}/members`);
            if (response.ok) teamMembers = await response.json();
        } catch (e) { console.error(e); }
    }

    $effect(() => { 
        fetchOverview();
        fetchUserTeams(); 
    });

    function toggleMember(member) {
        if (selectedMembers.find(m => m.userId === member.userId)) {
            selectedMembers = selectedMembers.filter(m => m.userId !== member.userId);
        } else {
            selectedMembers = [...selectedMembers, member];
        }
    }

    function addSubtask() {
        if (!newSubtask.taskTitle || !newSubtask.contributorId) return;
        subtasks = [...subtasks, { ...newSubtask }];
        newSubtask = { taskTitle: "", taskDescription: "", taskPriority: "Medium", taskEndDate: "", contributorId: "" };
    }

    function startProject() { projectStarted = true; }

    async function submitProject() {
        if (!newProject.projectName) return;
        const res = await fetch(`http://localhost:3000/project/${userData.userId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newProject)
        });
        const { fkProjectId } = await res.json();
        
        for (const m of selectedMembers) {
            await fetch(`http://localhost:3000/projectUserTable/${fkProjectId}?userId=${m.userId}`, { method: 'POST' });
        }
        
        for (const s of subtasks) {
            await fetch(`http://localhost:3000/projectTaskTable/${fkProjectId}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ ...s, fkUserId: s.contributorId })
            });
        }
        window.location.reload();
    }
</script>

<h1>{t('projects')}</h1>

<div class="projects-layout">
    <div class="existing-projects">
        <div class="project-list">
            <h2>{t('myProjects')}</h2>
            {#each projects as p}<li>{p.projectName}</li>{/each}
        </div>
        <div class="project-overview">
            <h2>{t('personalOverview')}</h2>
            <div class="stats">
                {#each overview as o}
                <div class="stat-card"><span>{o.count}</span><small>{o.status}</small></div>
                {/each}
            </div>
        </div>
    </div>
    
    <div class="creation-area">
        <h2>{t('createNewProject')}</h2>
        <div class="form-row">
            <div class="column">
                <h3>Details</h3>
                <input placeholder="Project Name" bind:value={newProject.projectName} />
                <select bind:value={newProject.projectPriority}><option>High</option><option>Medium</option><option>Low</option></select>
                <input type="date" bind:value={newProject.projectEndDate} />
                <select onchange={(e) => fetchTeamMembers(e.target.value)} bind:value={selectedTeamId}>
                    <option value="">Select Team</option>
                    {#each teams as team}<option value={team.teamId}>{team.teamName}</option>{/each}
                </select>
                <button onclick={startProject} disabled={projectStarted}>+ Project</button>
            </div>
            <div class="column">
                <h3>Members</h3>
                {#each teamMembers as member}
                    <button class:selected={selectedMembers.find(m => m.userId === member.userId)} onclick={() => toggleMember(member)}>
                        {member.firstname} {member.lastname}
                    </button>
                {/each}
            </div>
            <div class="column">
                <h3>Subtasks</h3>
                <input placeholder="Title" bind:value={newSubtask.taskTitle} disabled={!projectStarted} />
                <select bind:value={newSubtask.contributorId} disabled={!projectStarted}>
                    <option value="">Select Contributor</option>
                    {#each selectedMembers as m}<option value={m.userId}>{m.firstname}</option>{/each}
                </select>
                <button onclick={addSubtask} disabled={!projectStarted}>+ Add Sub Task</button>
                <ul>{#each subtasks as s}<li>{s.taskTitle}</li>{/each}</ul>
            </div>
        </div>
        <button class="save-btn" onclick={submitProject}>Save Project</button>
    </div>
</div>

<style>
    .projects-layout { display: flex; flex-direction: column; gap: 2rem; }
    .existing-projects { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .column { display: flex; flex-direction: column; gap: 0.5rem; }
    .selected { background: #7f77dd; color: white; }
    .stat-card { background: #f0f0ff; padding: 1rem; border-radius: 8px; text-align: center; min-width: 100px; }
    .stat-card span { display: block; font-size: 1.5rem; font-weight: bold; color: #534ab7; }
    .save-btn { margin-top: 1rem; padding: 0.5rem 1rem; background: #7f77dd; color: white; border: none; border-radius: 4px; cursor: pointer; }
</style>