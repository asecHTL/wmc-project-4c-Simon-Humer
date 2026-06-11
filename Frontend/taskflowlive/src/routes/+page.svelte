<script>
    import { goto } from '$app/navigation';
    import { userData } from '$lib/shared/User.svelte.js';
    import { t, setLanguage } from '$lib/i18n/i18n.svelte.js';

    let username = $state('');
    let password = $state('');
    let errorMessage = $state('');
    let isLoading = $state(false);

    async function handleLogin(event) {
        event.preventDefault();
        errorMessage = '';
        isLoading = true;

        if (!username || !password) {
            errorMessage = t('fillAllFields');
            isLoading = false;
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const user = await response.json();
                userData.userId = user.userId
                if (typeof window !== 'undefined') localStorage.setItem('userId', user.userId);
                if (user.language) setLanguage(user.language);
                goto(`../dashboard?userId=${userData.userId}`);
            } else {
                const errorText = await response.text();
                errorMessage = errorText || t('loginFailed');
            }
        } catch (error) {
            errorMessage = t('connectionFailed');
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container d-flex flex-column align-items-center justify-content-center min-vh-100 py-5">
    <h1 class="display-4 fw-bold mb-5 text-primary">Task Flow</h1>
    
    <div class="card shadow-lg border-0 rounded-4 w-100" style="max-width: 500px;">
        <div class="card-body p-5">
            <h2 class="h4 fw-bold mb-4 text-center">{t('login')}</h2>
            
            <form onsubmit={handleLogin}>
                <div class="form-floating mb-3">
                    <input 
                        type="text" 
                        class="form-control bg-light border-0" 
                        id="username" 
                        bind:value={username} 
                        placeholder="Username"
                        required
                    />
                    <label for="username">{t('username')}</label>
                </div>

                <div class="form-floating mb-4">
                    <input 
                        type="password" 
                        class="form-control bg-light border-0" 
                        id="password" 
                        bind:value={password} 
                        placeholder="Password"
                        required
                    />
                    <label for="password">{t('password')}</label>
                </div>

                {#if errorMessage}
                    <div class="alert alert-danger py-2 small text-center mb-4" role="alert">
                        {errorMessage}
                    </div>
                {/if}

                <div class="d-grid">
                    <button class="btn btn-dark btn-lg fw-bold py-3" type="submit" disabled={isLoading}>
                        {#if isLoading}
                            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                            {t('loading')}
                        {:else}
                            {t('login')}
                        {/if}
                    </button>
                </div>
            </form>

            <div class="mt-4 text-center">
                <a href="/register" class="text-decoration-none small text-muted">
                    {t('noAccountYet')} <span class="text-primary fw-bold">{t('registerNow')}</span>
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