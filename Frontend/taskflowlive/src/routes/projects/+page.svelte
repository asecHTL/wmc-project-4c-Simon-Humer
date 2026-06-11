<script>
    import { userData } from "$lib/shared/User.svelte.js";
    import { t } from "$lib/i18n/i18n.svelte.js";
    let { data } = $props();
    let projects = $derived(data.projects || []);

    let newProject = $state({
        projectName: "",
        projectPriority: "Medium",
        projectEndDate: "",
    });
    let teams = $state([]);
    let selectedTeamId = $state("");
    let teamMembers = $state([]);
    let selectedMembers = $state([]);
    let subtasks = $state([]);
    
    let newSubtask = $state({
        taskTitle: "",
        taskDescription: "",
        taskPriority: "Medium",
        taskEndDate: "",
        contributorId: "",
    });
    let projectStarted = $state(false);
    let selectedProjectId = $state(null);
    let editingTask = $state(null);
    let showDialog = $state(false);
    let projectMembers = $state([]);
    let isTaskFormOpen = $state(true);

    let overview = $state([
        { status: "Done", count: 0 },
        { status: "InProgress", count: 0 },
        { status: "OnHold", count: 0 },
        { status: "Overdue", count: 0 },
    ]);

    async function selectProject(project) {
        selectedProjectId = project.projectId;
        newProject = {
            projectName: project.projectName,
            projectPriority: project.projectPriority,
            projectEndDate: project.projectEndDate,
        };
        selectedTeamId = project.fkTeamId || "";
        projectStarted = true;
        isTaskFormOpen = false;
        
        if (selectedTeamId) await fetchTeamMembers(selectedTeamId);
        
        try {
            const [tasksRes, membersRes] = await Promise.all([
                fetch(`http://localhost:3000/projectTaskTable/${project.projectId}`),
                fetch(`http://localhost:3000/project/${project.projectId}/members`)
            ]);
            if (tasksRes.ok) subtasks = await tasksRes.json();
            if (membersRes.ok) projectMembers = await membersRes.json();
        } catch (e) { console.error(e); }
    }

    async function removeProjectMember(memberId) {
        if (!confirm(t('removeMemberConfirm'))) return;
        try {
            const res = await fetch(`http://localhost:3000/projectUserTable/${selectedProjectId}?userId=${memberId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                projectMembers = projectMembers.filter(m => m.userId !== memberId);
            }
        } catch (e) { console.error(e); }
    }

    function openEditTask(task) {
        editingTask = { ...task };
        showDialog = true;
    }

    async function saveEditedTask() {
        try {
            const res = await fetch(`http://localhost:3000/task/${editingTask.taskId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editingTask)
            });
            if (res.ok) {
                subtasks = subtasks.map(t => t.taskId === editingTask.taskId ? editingTask : t);
                showDialog = false;
            }
        } catch (e) { console.error(e); }
    }

    async function deleteTask() {
        if (!confirm(t('deleteTaskConfirm'))) return;
        try {
            const res = await fetch(`http://localhost:3000/task/${editingTask.taskId}`, { method: 'DELETE' });
            if (res.ok) {
                subtasks = subtasks.filter(t => t.taskId !== editingTask.taskId);
                showDialog = false;
            }
        } catch (e) { console.error(e); }
    }

    async function fetchOverview() {
        if (!userData.userId) return;
        try {
            const response = await fetch(
                `http://localhost:3000/project/overview/${userData.userId}`,
            );
            if (response.ok) overview = await response.json();
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchUserTeams() {
        if (!userData.userId) return;
        try {
            const response = await fetch(
                `http://localhost:3000/teamUserTable/${userData.userId}`,
            );
            if (response.ok) teams = await response.json();
        } catch (e) {
            console.error(e);
        }
    }

    async function fetchTeamMembers(teamId) {
        if (!teamId) {
            teamMembers = [];
            return;
        }
        try {
            const response = await fetch(
                `http://localhost:3000/team/${teamId}/members`,
            );
            if (response.ok) teamMembers = await response.json();
        } catch (e) {
            console.error(e);
        }
    }

    $effect(() => {
        fetchOverview();
        fetchUserTeams();
    });

    function toggleMember(member) {
        if (selectedMembers.find((m) => m.userId === member.userId)) {
            selectedMembers = selectedMembers.filter(
                (m) => m.userId !== member.userId,
            );
        } else {
            selectedMembers = [...selectedMembers, member];
        }
    }

    function addSubtask() {
        if (!newSubtask.taskTitle || !newSubtask.contributorId) return;
        subtasks = [...subtasks, { ...newSubtask }];
        newSubtask = {
            taskTitle: "",
            taskDescription: "",
            taskPriority: "Medium",
            taskEndDate: "",
            contributorId: "",
        };
    }

    function startProject() {
        projectStarted = true;
    }

    async function submitProject() {
        if (!newProject.projectName) return;
        
        const isUpdate = !!selectedProjectId;
        const url = isUpdate 
            ? `http://localhost:3000/project/${selectedProjectId}`
            : `http://localhost:3000/project/${userData.userId}`;
        const method = isUpdate ? 'PUT' : 'POST';

        console.log(`${isUpdate ? 'Updating' : 'Creating'} project...`, { ...newProject, fkTeamId: selectedTeamId });
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newProject, fkTeamId: selectedTeamId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Project action failed:", errorData);
                return;
            }

            const data = await res.json();
            const projectId = isUpdate ? selectedProjectId : data.fkProjectId;
            console.log(`Project ${isUpdate ? 'updated' : 'created'} with ID:`, projectId);

            for (const m of selectedMembers) {
                if (!projectMembers.some(pm => pm.userId === m.userId)) {
                    await fetch(
                        `http://localhost:3000/projectUserTable/${projectId}?userId=${m.userId}`,
                        { method: "POST" },
                    );
                }
            }

            for (const s of subtasks) {
                if (!s.taskId) {
                    await fetch(
                        `http://localhost:3000/projectTaskTable/${projectId}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...s, fkUserId: s.contributorId }),
                        },
                    );
                }
            }
            window.location.reload();
        } catch (error) {
            console.error("Error during project submission:", error);
        }
    }
</script>

<div class="page-container">
    <h1 class="page-title">{t("projects")}</h1>

    <div class="projects-layout">
        <div class="existing-projects">
            <div class="card project-list-card">
                <h2>{t("myProjects")}</h2>
                <div class="project-cards-container">
                    {#each projects as p}
                        <div
                            class="project-detail-card"
                            onclick={() => selectProject(p)}
                            class:selected={selectedProjectId === p.projectId}
                        >
                            <div class="card-header">
                                <h4>{p.projectName}</h4>
                                <span class="creator">Erstellt von: <span class="avatar-small">MM</span></span>
                            </div>
                            <div class="card-dates">
                                # Projekt begin - {p.projectEndDate || 'Projekt Ende'}
                            </div>
                            <div class="card-contributors">
                                Contributors: <span class="avatar-text">SH</span> <span class="avatar-text">DH</span>
                            </div>
                            <div class="card-tags">
                                <span class="tag tag-progress">In Progress</span>
                                <span class="tag tag-{p.projectPriority?.toLowerCase() || 'medium'}">{p.projectPriority || 'Medium'}</span>
                            </div>
                            <div class="card-progress-container">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" style="width: 84%"></div>
                                </div>
                                <span class="progress-text">84%</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="card project-overview-card">
                <h2>{t("personalOverview")}</h2>
                <div class="stats-grid">
                    {#each overview as o}
                        <div class="stat-card status-{o.status.toLowerCase()}">
                            <span class="stat-count">{o.count}</span>
                            <small class="stat-label">{t(o.status.charAt(0).toLowerCase() + o.status.slice(1)) || o.status}</small>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div class="card creation-area">
            <h2>{t("createNewProject")}</h2>

            <div class="form-row">
                <div class="column">
                    <h3>{t('details')}</h3>
                    <div class="input-group">
                        <input
                            placeholder={t('projectName')}
                            bind:value={newProject.projectName}
                        />
                        <select bind:value={newProject.projectPriority}>
                            <option value="High">{t('highPriority')}</option>
                            <option value="Medium">{t('mediumPriority')}</option>
                            <option value="Low">{t('lowPriority')}</option>
                        </select>
                        <input
                            type="date"
                            bind:value={newProject.projectEndDate}
                        />
                        <select
                            onchange={(e) => fetchTeamMembers(e.target.value)}
                            bind:value={selectedTeamId}
                        >
                            <option value="">{t('selectTeam')}</option>
                            {#each teams as team}<option value={team.teamId}
                                    >{team.teamName}</option
                                >{/each}
                        </select>
                    </div>
                    <button
                        class="btn btn-secondary"
                        onclick={startProject}
                        disabled={projectStarted}
                    >
                        {projectStarted
                            ? t('projectSetup')
                            : t('setupProjectSteps')}
                    </button>
                </div>

                <div class="column">
                    <h3>{t('members')}</h3>
                    {#if selectedProjectId}
                        <div class="current-members">
                            <h4>{t('currentMembers')}</h4>
                            <div class="members-grid">
                                {#each projectMembers as member}
                                    <button class="member-chip active" onclick={() => removeProjectMember(member.userId)}>
                                        <span class="avatar">{member.firstname[0]}{member.lastname[0]}</span>
                                        {member.firstname} {member.lastname} (✖)
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}
                    
                    <div class="team-members-selection">
                        <h4>{t('addFromTeam')}</h4>
                        <div class="members-grid">
                            {#each teamMembers as member}
                                <button
                                    class="member-chip"
                                    class:selected={selectedMembers.find(
                                        (m) => m.userId === member.userId,
                                    )}
                                    onclick={() => toggleMember(member)}
                                >
                                    <span class="avatar"
                                        >{member.firstname[0]}{member
                                            .lastname[0]}</span
                                    >
                                    {member.firstname}
                                    {member.lastname}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>

                <div class="column">
                    <div class="section-header">
                        <h3>{t('subtasks')}</h3>
                        {#if selectedProjectId}
                            <button class="btn-toggle" onclick={() => isTaskFormOpen = !isTaskFormOpen}>
                                {isTaskFormOpen ? t('collapseForm') + ' ▴' : t('addNewTask') + ' ▾'}
                            </button>
                        {/if}
                    </div>
                    
                    {#if isTaskFormOpen || !selectedProjectId}
                        <div class="input-group" class:disabled-group={!projectStarted}>
                            <input
                                placeholder={t('taskTitle')}
                                bind:value={newSubtask.taskTitle}
                                disabled={!projectStarted}
                            />
                            <input
                                placeholder={t('taskDescription')}
                                bind:value={newSubtask.taskDescription}
                                disabled={!projectStarted}
                            />
                            <select 
                                bind:value={newSubtask.taskPriority} 
                                disabled={!projectStarted}
                            >
                                <option value="High">{t('highPriority')}</option>
                                <option value="Medium">{t('mediumPriority')}</option>
                                <option value="Low">{t('lowPriority')}</option>
                            </select>

                            <input
                                type="date"
                                bind:value={newSubtask.taskEndDate}
                                disabled={!projectStarted}
                            />

                            <select
                                bind:value={newSubtask.contributorId}
                                disabled={!projectStarted}
                            >
                                <option value="">{t('selectContributor')}</option>
                                {#each [...projectMembers, ...selectedMembers.filter(sm => !projectMembers.some(pm => pm.userId === sm.userId))] as m}
                                    <option value={m.userId}>{m.firstname}</option>
                                {/each}
                            </select>
                            <button
                                class="btn btn-secondary compact"
                                onclick={addSubtask}
                                disabled={!projectStarted}
                            >
                                {t('addSubtask')}
                            </button>
                        </div>
                    {/if}

                    <ul class="subtask-preview-list" class:expanded-list={!isTaskFormOpen}>
                        {#each subtasks as s}
                            <li onclick={() => openEditTask(s)} class="clickable-task">🔑 {s.taskTitle} ({t(s.taskPriority.toLowerCase() + 'Priority') || s.taskPriority}) - {s.taskEndDate}</li>
                        {/each}
                    </ul>
                </div>
            </div>

            <div class="form-actions">
                <button class="btn btn-primary save-btn" onclick={submitProject}
                    >{t('saveProject')}</button
                >
            </div>
        </div>
    </div>
</div>

{#if showDialog}
    <div class="dialog-overlay">
        <div class="dialog-card">
            <h2>{t('editSubtask')}</h2>
            <div class="input-group">
                <label>{t('taskTitle')}</label>
                <input bind:value={editingTask.taskTitle} />
                <label>{t('taskDescription')}</label>
                <input bind:value={editingTask.taskDescription} />
                <label>{t('taskPriority')}</label>
                <select bind:value={editingTask.taskPriority}>
                    <option value="High">{t('highPriority')}</option>
                    <option value="Medium">{t('mediumPriority')}</option>
                    <option value="Low">{t('lowPriority')}</option>
                </select>
                <label>{t('endDate')}</label>
                <input type="date" bind:value={editingTask.taskEndDate} />
                <label>{t('status')}</label>
                <select bind:value={editingTask.taskStatus}>
                    <option value="InProgress">{t('inProgress')}</option>
                    <option value="Done">{t('taskCompleted')}</option>
                    <option value="OnHold">{t('onHold')}</option>
                    <option value="Overdue">{t('overdue')}</option>
                </select>
            </div>
            <div class="dialog-actions">
                <button class="btn btn-secondary" onclick={() => showDialog = false}>{t('cancel')}</button>
                <button class="btn btn-danger" onclick={deleteTask}>{t('delete')}</button>
                <button class="btn btn-primary" onclick={saveEditedTask}>{t('save')}</button>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Global Container Setup */
    .page-container {
        font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
        color: #2d3748;
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .page-title {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: 2rem;
        color: #1a202c;
    }

    /* Layout Structures */
    .projects-layout {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .existing-projects {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    @media (max-width: 1024px) {
        .existing-projects {
            grid-template-columns: 1fr;
        }
        .form-row {
            grid-template-columns: 1fr !important;
        }
        .form-actions {
            justify-content: center;
        }
        .save-btn {
            width: 100%;
        }
    }

    /* Cards Styling */
    .card {
        background: #ffffff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border: 1px solid #e2e8f0;
    }

    .card h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 1.25rem;
        color: #2d3748;
        border-bottom: 2px solid #f1f5f9;
        padding-bottom: 0.5rem;
    }

    .card h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #4a5568;
        margin-top: 0;
        margin-bottom: 0.75rem;
    }

    /* NEW Project List Styling (Card Layout) */
    .project-cards-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-height: 400px;
        overflow-y: auto;
        padding-right: 0.5rem;
    }

    .project-detail-card {
        background: #f8fafc;
        border: 1px solid #edf2f7;
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .project-detail-card:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }

    .project-detail-card.selected {
        background: #ffffff;
        border-color: #7f77dd;
        box-shadow: 0 0 0 2px rgba(127, 119, 221, 0.2);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .card-header h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1a202c;
    }

    .creator {
        font-size: 0.7rem;
        color: #4a5568;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .avatar-small {
        background: #e2e8f0;
        color: #4a5568;
        font-size: 0.65rem;
        padding: 0.2rem 0.35rem;
        border-radius: 50%;
        font-weight: bold;
    }

    .card-dates {
        font-size: 0.75rem;
        color: #718096;
        margin-bottom: 0.5rem;
    }

    .card-contributors {
        font-size: 0.8rem;
        color: #4a5568;
        margin-bottom: 0.75rem;
    }

    .avatar-text {
        font-weight: 600;
        margin-left: 0.25rem;
    }

    .card-tags {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .tag {
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    .tag::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }

    .tag-progress {
        background: #fefcbf;
        color: #975a16;
    }
    .tag-progress::before { background: #d69e2e; }

    .tag-high {
        background: #fed7d7;
        color: #9b2c2c;
    }
    .tag-high::before { background: #e53e3e; }

    .tag-medium {
        background: #fefcbf;
        color: #975a16;
    }
    .tag-medium::before { background: #d69e2e; }

    .tag-low {
        background: #c6f6d5;
        color: #22543d;
    }
    .tag-low::before { background: #38a169; }

    .card-progress-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .progress-bar-bg {
        flex: 1;
        height: 6px;
        background: #edf2f7;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-bar-fill {
        height: 100%;
        background: #63b3ed;
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .progress-text {
        font-size: 0.75rem;
        color: #3182ce;
        font-weight: 600;
    }

    /* Personal Overview Stats Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .stat-card {
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border: 1px solid transparent;
    }

    .stat-count {
        display: block;
        font-size: 1.75rem;
        font-weight: 700;
    }

    .stat-label {
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        margin-top: 0.25rem;
    }

    /* Contextual Stat Colors */
    .status-done {
        background: #ecfdf5;
        border-color: #a7f3d0;
        color: #065f46;
    }
    .status-inprogress {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #1e40af;
    }
    .status-onhold {
        background: #fffbeb;
        border-color: #fde68a;
        color: #92400e;
    }
    .status-overdue {
        background: #fef2f2;
        border-color: #fca5a5;
        color: #991b1b;
    }

    /* Form Fields & Inputs */
    .form-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
    }

    .column {
        display: flex;
        flex-direction: column;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .disabled-group {
        opacity: 0.5;
        pointer-events: none;
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
        transition:
            border-color 0.15s,
            box-shadow 0.15s;
    }

    input:focus,
    select:focus {
        outline: none;
        border-color: #7f77dd;
        box-shadow: 0 0 0 3px rgba(127, 119, 221, 0.15);
    }

    /* Member Chips & Selection */
    .members-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 180px;
        overflow-y: auto;
        padding-right: 2px;
    }

    .member-chip {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.5rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        text-align: left;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        color: #475569;
        transition: all 0.2s;
    }

    .member-chip:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }

    .member-chip.selected {
        background: #eef2ff;
        border-color: #7f77dd;
        color: #4f46e5;
    }

    .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: #cbd5e1;
        color: #475569;
        font-size: 0.75rem;
        font-weight: bold;
        border-radius: 50%;
        text-transform: uppercase;
    }

    .member-chip.selected .avatar {
        background: #7f77dd;
        color: white;
    }

    /* Subtask Preview Items */
    .subtask-preview-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 0 0;
        max-height: 100px;
        overflow-y: auto;
    }

    .subtask-preview-list li {
        font-size: 0.85rem;
        padding: 0.4rem 0.5rem;
        background: #f1f5f9;
        border-radius: 4px;
        margin-bottom: 0.25rem;
        color: #475569;
    }

    /* Buttons Styling */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 0.65rem 1rem;
        border-radius: 6px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-primary {
        background: #7f77dd;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background: #6b62cc;
    }

    .btn-secondary {
        background: #fff;
        border-color: #cbd5e1;
        color: #475569;
    }

    .btn-secondary:hover:not(:disabled) {
        background: #f8fafc;
        border-color: #94a3b8;
        color: #1e293b;
    }

    .btn.compact {
        padding: 0.5rem;
        font-size: 0.85rem;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 1.5rem;
        border-top: 1px solid #f1f5f9;
        padding-top: 1.25rem;
    }

    .save-btn {
        min-width: 150px;
        padding: 0.75rem 1.5rem;
    }

    .clickable-task {
        cursor: pointer;
        transition: transform 0.1s;
    }

    .clickable-task:hover {
        transform: translateX(4px);
        background: #f1f5f9 !important;
    }

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

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        border-top: 1px solid #eee;
        padding-top: 1rem;
    }

    .btn-danger {
        background: #ef4444;
        color: white;
    }

    .btn-danger:hover {
        background: #dc2626;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .btn-toggle {
        background: none;
        border: none;
        color: #7f77dd;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .btn-toggle:hover {
        background: #eef2ff;
    }

    .expanded-list {
        max-height: 250px !important;
    }

    .current-members {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px dashed #e2e8f0;
    }

    .current-members h4, .team-members-selection h4 {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.025em;
    }

    .member-chip.active {
        background: #f0fdf4;
        border-color: #bbf7d0;
        color: #166534;
    }

    .member-chip.active:hover {
        background: #fee2e2;
        border-color: #fecaca;
        color: #991b1b;
    }
</style>