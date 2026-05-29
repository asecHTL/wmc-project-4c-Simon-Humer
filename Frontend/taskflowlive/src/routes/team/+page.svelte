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
        if (!teamId) {
            teamMembers = [];
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/team/${teamId}/members`);
            if (response.ok) {
                teamMembers = await response.json();
            } else {
                teamMembers = [];
            }
        } catch (error) {
            console.error("Error fetching team members:", error);
            teamMembers = [];
        }
    }

    async function fetchAllUsers() {
        try {
            const response = await fetch("http://localhost:3000/users");
            if (response.ok) {
                allUsers = await response.json();
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
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
            } else {
                const errorText = await response.text();
                alert(errorText || "Failed to add member");
            }
        } catch (error) {
            console.error("Error adding member:", error);
        }
    }

    $effect(() => {
        if (selectedTeamId) {
            fetchTeamMembers(selectedTeamId);
        }
    });

    function openAddMemberDialog() {
        fetchAllUsers();
        showAddMemberDialog = true;
    }
</script>


<h1>{t('team')}</h1>

<div class="team-header">
    <div>
        <label for="team-select">{t('teamSelection')}</label>
        <select id="team-select" bind:value={selectedTeamId}>
            <option value="" disabled selected>{t('selectTeam')}</option>
            {#each data.teamsForUser as team}
                <option value="{team.teamId}">{team.teamName}</option>
            {/each}
        </select>
    </div>

    {#if selectedTeamId && isUserAdmin}
        <button class="add-btn" onclick={openAddMemberDialog}>
            <i class="ti ti-plus"></i> {t('addMember')}
        </button>
    {/if}
</div>

{#if selectedTeamId}
    <div class="members-section">
        <h2>{t('teamMembers')}</h2>
        {#if teamMembers.length > 0}
            <ul>
                {#each teamMembers as member}
                    <li>
                        <strong>{member.firstname} {member.lastname}</strong> ({member.username})
                        <br>
                        <small>{member.email}</small>
                    </li>
                {/each}
            </ul>
        {:else}
            <p>{t('noMembersFound')}</p>
        {/if}
    </div>
{/if}

{#if showAddMemberDialog}
    <div class="modal-overlay" onclick={() => (showAddMemberDialog = false)}>
        <div class="modal-content" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>{t('addTeamMember')}</h2>
                <button class="close-btn" onclick={() => (showAddMemberDialog = false)}>&times;</button>
            </div>
            <div class="user-list">
                {#each allUsers as user}
                    {#if !teamMembers.find(m => m.userId === user.userId)}
                        <button class="user-item" onclick={() => addMemberToTeam(user.userId)}>
                            <div class="user-info">
                                <strong>{user.firstname} {user.lastname}</strong>
                                <span>{user.username}</span>
                            </div>
                            <small>{user.email}</small>
                        </button>
                    {/if}
                {/each}
            </div>
        </div>
    </div>
{/if}

<style>
    .team-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 2rem;
    }

    .add-btn {
        background: #7f77dd;
        color: white;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        transition: background 0.2s;
    }

    .add-btn:hover {
        background: #6a61c4;
    }

    .members-section {
        margin-top: 2rem;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        background: #f9f9f9;
        margin-bottom: 0.5rem;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #eee;
    }
    select {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #ccc;
        width: 100%;
        max-width: 300px;
        margin-top: 0.5rem;
    }
    label {
        display: block;
        font-weight: bold;
    }

    /* Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 1rem;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }

    .user-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .user-item {
        background: none;
        border: 1px solid #eee;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        display: flex;
        flex-direction: column;
    }

    .user-item:hover {
        background: #f0f0ff;
        border-color: #7f77dd;
    }

    .user-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .user-info span {
        font-size: 0.85rem;
        color: #666;
    }

    small {
        color: #888;
    }
</style>