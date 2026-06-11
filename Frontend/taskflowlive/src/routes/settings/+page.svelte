<script>
    import { goto } from "$app/navigation";
    import { t, setLanguage } from "$lib/i18n/i18n.svelte.js";

    let { data } = $props();
    import { userData } from "$lib/shared/User.svelte.js";

   
    let userForm = $state({
        firstname: data.user?.firstname ?? '',
        lastname: data.user?.lastname ?? '',
        birthday: data.user?.birthday ?? '',
        username: data.user?.username ?? '',
        email: data.user?.email ?? '',
        password: data.user?.password ?? ''
    });

    $effect(() => {
        if (data.user) {
            userForm.firstname = data.user.firstname ?? '';
            userForm.lastname = data.user.lastname ?? '';
            userForm.birthday = data.user.birthday ?? '';
            userForm.username = data.user.username ?? '';
            userForm.email = data.user.email ?? '';
            userForm.password = data.user.password ?? '';
        }
    });

    async function saveUserSettings() {
        const res = await fetch(`http://localhost:3000/profile/user/${userData.userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userForm)
            });

            if (res.ok) {
                alert(t("settingsSaved"));
                goto('../settings')
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`${t("errorSaving")}: ${errData.error || res.statusText}`);
            }
    }

    async function deleteUser() {
        if(confirm(t("confirmDelete"))) {
            const userId = data.user?.userId;
            if (!userId) { alert(t("missingUserId")); return; }

            const res = await fetch(`http://localhost:3000/profile/user/${userId}`, {
                method: 'DELETE' 
            });

            if (res.ok) {
                alert(t("deleteSuccess"));
                goto('/'); 
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`${t("errorDeleting")}: ${errData.error || res.statusText}`);
            }
        }
    }
</script>

<div class="container-fluid py-4">
    <h1 class="h2 mb-4">{t('settings')}</h1>

    <div class="card shadow-sm border-0">
        <div class="card-body p-4 p-lg-5">
            <div class="row g-4">
                <div class="col-12 col-xl-9">
                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase" for="firstname">{t("firstname")}</label>
                            <input class="form-control" type="text" id="firstname" bind:value={userForm.firstname} placeholder="Value" />
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase" for="username">{t("username")}</label>
                            <input class="form-control" type="text" id="username" bind:value={userForm.username} placeholder="Value" />
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase" for="lastname">{t("lastname")}</label>
                            <input class="form-control" type="text" id="lastname" bind:value={userForm.lastname} placeholder="Value" />
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase" for="email">{t("email")}</label>
                            <input class="form-control" type="email" id="email" bind:value={userForm.email} placeholder="Value" />
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase" for="birthday">{t("birthday")}</label>
                            <input class="form-control" type="text" id="birthday" bind:value={userForm.birthday} placeholder="Value" />
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase" for="password">{t("password")}</label>
                            <input class="form-control" type="password" id="password" bind:value={userForm.password} placeholder="Value" />
                        </div>
                    </div>
                </div>

                <div class="col-12 col-xl-3 d-flex flex-column gap-2 justify-content-start border-start-xl ps-xl-4">
                    <h6 class="fw-bold text-secondary text-uppercase small mb-3">{t('actions')}</h6>
                    <button onclick={saveUserSettings} class="btn btn-success d-flex align-items-center justify-content-between px-3 py-2">
                        <span>{t("save")}</span>
                        <i class="bi bi-floppy ms-2"></i>
                    </button>
                    <button onclick={deleteUser} class="btn btn-outline-danger d-flex align-items-center justify-content-between px-3 py-2 mt-2">
                        <span>{t("deleteAccount")}</span>
                        <i class="bi bi-trash ms-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @media (min-width: 1200px) {
        .border-start-xl { border-left: 1px solid #dee2e6 !important; }
    }
</style>