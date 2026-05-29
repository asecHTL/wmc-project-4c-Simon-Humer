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

    let overview = $state([
        { status: "Done", count: 0 },
        { status: "InProgress", count: 0 },
        { status: "OnHold", count: 0 },
        { status: "Overdue", count: 0 },
    ]);

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
        console.log("Submitting project...", { ...newProject, fkTeamId: selectedTeamId });
        try {
            const res = await fetch(
                `http://localhost:3000/project/${userData.userId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...newProject, fkTeamId: selectedTeamId }),
                },
            );

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Project creation failed:", errorData);
                return;
            }

            const { fkProjectId } = await res.json();
            console.log("Project created with ID:", fkProjectId);

            for (const m of selectedMembers) {
                await fetch(
                    `http://localhost:3000/projectUserTable/${fkProjectId}?userId=${m.userId}`,
                    { method: "POST" },
                );
            }

            for (const s of subtasks) {
                await fetch(
                    `http://localhost:3000/projectTaskTable/${fkProjectId}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...s, fkUserId: s.contributorId }),
                    },
                );
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
                <ul class="styled-list">
                    {#each projects as p}
                        <li>
                            <span class="project-icon">📁</span>
                            <span class="project-name">{p.projectName}</span>
                        </li>
                    {/each}
                </ul>
            </div>

            <div class="card project-overview-card">
                <h2>{t("personalOverview")}</h2>
                <div class="stats-grid">
                    {#each overview as o}
                        <div class="stat-card status-{o.status.toLowerCase()}">
                            <span class="stat-count">{o.count}</span>
                            <small class="stat-label">{o.status}</small>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div class="card creation-area">
            <h2>{t("createNewProject")}</h2>

            <div class="form-row">
                <div class="column">
                    <h3>Details</h3>
                    <div class="input-group">
                        <input
                            placeholder="Project Name"
                            bind:value={newProject.projectName}
                        />
                        <select bind:value={newProject.projectPriority}>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                        <input
                            type="date"
                            bind:value={newProject.projectEndDate}
                        />
                        <select
                            onchange={(e) => fetchTeamMembers(e.target.value)}
                            bind:value={selectedTeamId}
                        >
                            <option value="">Select Team</option>
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
                            ? "✓ Project Setup"
                            : "+ Setup Project Steps"}
                    </button>
                </div>

                <div class="column">
                    <h3>Members</h3>
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

                <div class="column">
                    <h3>Subtasks</h3>
                    <div
                        class="input-group"
                        class:disabled-group={!projectStarted}
                    >
                        <input
                            placeholder="Task Title"
                            bind:value={newSubtask.taskTitle}
                            disabled={!projectStarted}
                        />
                        <input
                            placeholder="Task Description"
                            bind:value={newSubtask.taskDescription}
                            disabled={!projectStarted}
                        />
                        <select 
                            bind:value={newSubtask.taskPriority} 
                            disabled={!projectStarted}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
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
                            <option value="">Select Contributor</option>
                            {#each selectedMembers as m}<option value={m.userId}
                                    >{m.firstname}</option
                                >{/each}
                        </select>
                        <button
                            class="btn btn-secondary compact"
                            onclick={addSubtask}
                            disabled={!projectStarted}
                        >
                            + Add Sub Task
                        </button>
                    </div>

                    <ul class="subtask-preview-list">
                        {#each subtasks as s}
                            <li>🔑 {s.taskTitle} ({s.taskPriority}) - {s.taskEndDate}</li>
                        {/each}
                    </ul>
                </div>
            </div>

            <div class="form-actions">
                <button class="btn btn-primary save-btn" onclick={submitProject}
                    >Save Project</button
                >
            </div>
        </div>
    </div>
</div>

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

    @media (max-width: 768px) {
        .existing-projects {
            grid-template-columns: 1fr;
        }
        .form-row {
            grid-template-columns: 1fr !important;
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

    /* Project List Styling */
    .styled-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 200px;
        overflow-y: auto;
    }

    .styled-list li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        background: #f8fafc;
        border: 1px solid #edf2f7;
        font-weight: 500;
    }

    .project-icon {
        font-size: 1.2rem;
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
</style>
