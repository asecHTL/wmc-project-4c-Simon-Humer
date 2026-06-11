<script>
    import { goto } from '$app/navigation';
    import { t } from '$lib/i18n/i18n.svelte.js';

    let username = $state('');
    let email = $state('');
    let password = $state('');
    let firstname = $state('');
    let lastname = $state('');
    
    let errorMessage = $state('');
    let successMessage = $state('');
    let isLoading = $state(false);

    async function handleRegister(event) {
        event.preventDefault();
        errorMessage = '';
        successMessage = '';
        isLoading = true;

        const userData = { username, email, password, firstname, lastname };

        try {
            const response = await fetch('http://localhost:3000/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                goto('/');
            } else {
                const errorText = await response.text();
                errorMessage = errorText || t('registrationFailed');
            }
        } catch (error) {
            errorMessage = t('connectionFailed');
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container d-flex flex-column align-items-center justify-content-center min-vh-100 py-5">
    <h1 class="display-4 fw-bold mb-5 text-primary text-center">Task Flow</h1>
    
    <div class="card shadow-lg border-0 rounded-4 w-100" style="max-width: 800px;">
        <div class="card-body p-4 p-md-5">
            <h2 class="h4 fw-bold mb-4 text-center">{t('register')}</h2>
            
            <form onsubmit={handleRegister}>
                <div class="row g-3">
                    <div class="col-12 col-md-6">
                        <div class="form-floating">
                            <input type="text" class="form-control bg-light border-0" id="username" bind:value={username} placeholder="Username" required />
                            <label for="username">{t('username')} *</label>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-floating">
                            <input type="text" class="form-control bg-light border-0" id="firstname" bind:value={firstname} placeholder="Firstname" required />
                            <label for="firstname">{t('firstname')} *</label>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-floating">
                            <input type="email" class="form-control bg-light border-0" id="email" bind:value={email} placeholder="Email" required />
                            <label for="email">{t('email')} *</label>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-floating">
                            <input type="text" class="form-control bg-light border-0" id="lastname" bind:value={lastname} placeholder="Lastname" required />
                            <label for="lastname">{t('lastname')} *</label>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-floating">
                            <input type="password" class="form-control bg-light border-0" id="password" bind:value={password} placeholder="Password" required />
                            <label for="password">{t('password')} *</label>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="form-floating">
                            <input type="text" class="form-control bg-light border-0" id="birthday" placeholder="Birthday" />
                            <label for="birthday">{t('birthday')}</label>
                        </div>
                    </div>
                </div>

                {#if errorMessage}
                    <div class="alert alert-danger py-2 small text-center mt-4 mb-0" role="alert">{errorMessage}</div>
                {/if}

                <div class="d-grid mt-4 pt-2">
                    <button class="btn btn-dark btn-lg fw-bold py-3" type="submit" disabled={isLoading}>
                        {#if isLoading}
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            {t('registering')}
                        {:else}
                            {t('register')}
                        {/if}
                    </button>
                </div>
            </form>

            <div class="mt-4 text-center">
                <a href="/" class="text-decoration-none small text-muted">
                    {t('alreadyHaveAccount')} <span class="text-primary fw-bold">{t('loginNow')}</span>
                </a>
            </div>
        </div>
    </div>
</div>

<style>
    :global(body) {
        background-color: #f8f9fa;
    }
</style>