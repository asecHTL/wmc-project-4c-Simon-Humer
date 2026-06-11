<script>
    import { userData } from "$lib/shared/User.svelte.js";
    import { t } from "$lib/i18n/i18n.svelte.js";
    let {data} = $props();

    let selectedTeamId = $state("");
    let teamMembers = $state([]);
    let allUsers = $state([]);
    let showAddMemberDialog = $state(false);

    let isUserAdmin = $derived(
        data.teamsForUser.find(t => t.teamId === Number(selectedTeamId))?.adminId === userData.userId
    );

    async function fetchTeamMembers(teamId) {
        if (!teamId) { teamMembers = []; return; }
        try {
            const response = await fetch(`http://localhost:3000/team/${teamId}/members`);
            if (response.ok) teamMembers = await response.json();
        } catch (error) { console.error(error); }
    }

    async function fetchAllUsers() {
        try {
            const response = await fetch("http://localhost:3000/users");
            if (response.ok) allUsers = await response.json();
        } catch (error) { console.error(error); }
    }

    async function addMemberToTeam(userId) {
        if (!selectedTeamId) return;
        try {
            const response = await fetch(`http://localhost:3000/teamUserTable/${selectedTeamId}?userId=${userId}`, {
                method: 'POST'
            });
            if (response.ok) {
                await fetchTeamMembers(selectedTeamId);
                showAddMemberDialog = false;
            }
        } catch (error) { console.error(error); }
    }

    $effect(() => {
        if (selectedTeamId) fetchTeamMembers(selectedTeamId);
    });

    function openAddMemberDialog() {
        fetchAllUsers();
        showAddMemberDialog = true;
    }
</script>

<div class="container-fluid py-4">
    <h1 class="h2 mb-4">{t('team')}</h1>

    <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4">
            <div class="row g-3 align-items-end">
                <div class="col-12 col-md-6 col-lg-4">
                    <label class="form-label fw-bold small text-muted text-uppercase mb-2" for="team-select">{t('teamSelection')}</label>
                    <select class="form-select" id="team-select" bind:value={selectedTeamId}>
                        <option value="" disabled selected>{t('selectTeam')}</option>
                        {#each data.teamsForUser as team}
                            <option value="{team.teamId}">{team.teamName}</option>
                        {/each}
                    </select>
                </div>

                {#if selectedTeamId && isUserAdmin}
                    <div class="col-12 col-md-auto">
                        <button class="btn btn-primary px-4 fw-bold" onclick={openAddMemberDialog}>
                            <i class="bi bi-person-plus me-2"></i> {t('addMember')}
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    {#if selectedTeamId}
        <div class="card shadow-sm border-0">
            <div class="card-header bg-transparent border-0 pt-4 px-4">
                <h5 class="card-title mb-0">{t('teamMembers')}</h5>
            </div>
            <div class="card-body p-4">
                {#if teamMembers.length > 0}
                    <div class="list-group list-group-flush border rounded overflow-hidden">
                        {#each teamMembers as member}
                            <div class="list-group-item d-flex align-items-center py-3">
                                <div class="badge bg-primary-subtle text-primary rounded-circle p-2 me-3 fs-6" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                                    {member.firstname[0]}{member.lastname[0]}
                                </div>
                                <div>
                                    <div class="fw-bold">{member.firstname} {member.lastname}</div>
                                    <div class="small text-muted">{member.email} <span class="mx-1">•</span> @{member.username}</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-5 text-muted fst-italic">
                        <i class="bi bi-people fs-1 d-block mb-2"></i>
                        {t('noMembersFound')}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

{#if showAddMemberDialog}
    <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold">{t('addTeamMember')}</h5>
                    <button class="btn-close" onclick={() => (showAddMemberDialog = false)}></button>
                </div>
                <div class="modal-body p-4">
                    <div class="list-group list-group-flush border rounded" style="max-height: 400px; overflow-auto: auto;">
                        {#each allUsers as user}
                            {#if !teamMembers.find(m => m.userId === user.userId)}
                                <button class="list-group-item list-group-item-action d-flex align-items-center py-3" onclick={() => addMemberToTeam(user.userId)}>
                                    <div class="badge bg-light text-muted rounded-circle p-2 me-3 border">
                                        {user.firstname[0]}{user.lastname[0]}
                                    </div>
                                    <div class="flex-grow-1">
                                        <div class="fw-bold small">{user.firstname} {user.lastname}</div>
                                        <div class="text-muted" style="font-size: 0.75rem;">@{user.username} • {user.email}</div>
                                    </div>
                                    <i class="bi bi-plus-circle text-primary"></i>
                                </button>
                            {/if}
                        {/each}
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0 pb-4 px-4">
                    <button class="btn btn-light" onclick={() => (showAddMemberDialog = false)}>{t('cancel')}</button>
                </div>
            </div>
        </div>
    </div>
{/if}
