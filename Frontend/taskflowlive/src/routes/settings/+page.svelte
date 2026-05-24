<script>
    import { goto } from "$app/navigation";

    let { data } = $props();

   
    let userForm = $state({
        firstname: data.user?.firstname ?? '',
        lastname: data.user?.lastname ?? '',
        birthday: data.user?.birthday ?? '',
        username: data.user?.username ?? '',
        email: data.user?.email ?? '',
        password: data.user?.password ?? '',
        language: data.user?.language ?? 'Englisch'
    });

    $effect(() => {
        if (data.user) {
            userForm.firstname = data.user.firstname ?? '';
            userForm.lastname = data.user.lastname ?? '';
            userForm.birthday = data.user.birthday ?? '';
            userForm.username = data.user.username ?? '';
            userForm.email = data.user.email ?? '';
            userForm.password = data.user.password ?? '';
            userForm.language = data.user.language ?? 'Englisch';
        }
    });

    async function saveUserSettings() {
        console.log("Speichere:", userForm);
    }

    async function deleteUser() {
        if(confirm("Möchtest du diesen Benutzer wirklich löschen?")) {
            console.log("Lösche User:", data.user?.userId);
        }
    }
</script>

<div class="settings-container">
    <div class="header-row">
        <h1>Settings</h1>
        <button class="btn-new-member">+ New Member</button>
    </div>

    <div class="card">
        <div class="form-grid">
            <div class="form-group">
                <label for="firstname">Firstname</label>
                <input type="text" id="firstname" bind:value={userForm.firstname} placeholder="Value" />
            </div>

            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" bind:value={userForm.username} placeholder="Value" />
            </div>

            <div class="form-group">
                <label for="language">Language</label>
                <div class="select-wrapper">
                    <select id="language" bind:value={userForm.language}>
                        <option value="Englisch">Englisch</option>
                        <option value="Deutsch">Deutsch</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="lastname">Lastname</label>
                <input type="text" id="lastname" bind:value={userForm.lastname} placeholder="Value" />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" bind:value={userForm.email} placeholder="Value" />
            </div>

            <div class="empty-space"></div>

            <div class="form-group">
                <label for="birthday">Birthday</label>
                <input type="text" id="birthday" bind:value={userForm.birthday} placeholder="Value" />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" bind:value={userForm.password} placeholder="Value" />
            </div>
        </div>

        <div class="action-buttons">
            <button onclick={deleteUser} class="btn-delete">
                Delete <i class="ti ti-trash"></i>
            </button>
            <button onclick={saveUserSettings} class="btn-save">
                Save <i class="ti ti-device-floppy"></i>
            </button>
        </div>
    </div>
</div>

<style>
    .settings-container {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 1100px;
        margin: 0 auto;
    }

    .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .header-row h1 {
        font-size: 28px;
        font-weight: 700;
        margin: 0;
        color: #000;
    }

    .btn-new-member {
        background-color: #93a5e6;
        color: #1a233a;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 500;
        font-size: 13px;
        cursor: pointer;
    }

    .card {
        background: #ffffff;
        border-radius: 12px;
        padding: 2.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 3rem;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: 2.5rem;
        row-gap: 1.5rem;
        flex: 1;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .form-group label {
        font-size: 14px;
        color: #4a4a4a;
        font-weight: 500;
    }

    .form-group input, 
    .form-group select {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 14px;
        color: #333;
        outline: none;
        width: 100%;
        box-sizing: border-box;
    }

    .form-group input::placeholder {
        color: #a0aec0;
    }

    .select-wrapper {
        position: relative;
        width: 100%;
    }

    .form-group select {
        appearance: none; 
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%234a4a4a' stroke-width='2' viewBox='0 0 24 24'><path d='M6 9l6 6 6-6'/></svg>");
        background-repeat: no-repeat;
        background-position: right 14px center;
        padding-right: 35px;
        cursor: pointer;
    }

    .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 110px;
        margin-top: 1.5rem; 
    }

    .action-buttons button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        border: none;
        cursor: pointer;
        width: 100%;
    }

    .btn-delete {
        background-color: #fbc4c4;
        color: #721c24;
    }

    .btn-save {
        background-color: #e2fcd4;
        color: #155724;
    }

    .action-buttons button i {
        font-size: 16px;
    }
</style>