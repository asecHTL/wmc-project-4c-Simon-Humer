<script>
    import { goto } from '$app/navigation';

    let username = $state('');
    let password = $state('');
    let errorMessage = $state('');
    let isLoading = $state(false);

    import { userData } from '$lib/shared/User.svelte.js';

    import { t, setLanguage } from '$lib/i18n/i18n.svelte.js';

    async function handleLogin(event) {
        event.preventDefault();
        errorMessage = '';
        isLoading = true;

        if (!username || !password) {
            errorMessage = 'Bitte füllen Sie alle Felder aus.';
            isLoading = false;
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const user = await response.json();
                console.log('Login erfolgreich:', user);
                
                userData.userId = user.userId
                if (typeof window !== 'undefined') {
                    localStorage.setItem('userId', user.userId);
                }
                if (user.language) {
                    setLanguage(user.language);
                }

                
                goto(`../dashboard?userId=${userData.userId}`);
            } else {
                const errorText = await response.text();
                errorMessage = errorText || 'Anmeldung fehlgeschlagen. Bitte prüfen Sie Ihre Daten.';
            }
        } catch (error) {
            console.error('Login Error:', error);
            errorMessage = 'Verbindung zum Server fehlgeschlagen.';
        } finally {
            isLoading = false;
        }
    }
</script>

 


<div class="login-container">
    <h1 class="main-title">Task Flow</h1>
    
    <div class="login-card">
        <form onsubmit={handleLogin}>
            <fieldset class="form-group">
                <legend>Username</legend>
                <input 
                    type="text" 
                    id="username" 
                    bind:value={username} 
                    placeholder="Input"
                    required
                />
            </fieldset>

            <fieldset class="form-group">
                <legend>Password</legend>
                <input 
                    type="password" 
                    id="password" 
                    bind:value={password} 
                    placeholder="Input"
                    required
                />
            </fieldset>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            <div class="button-wrapper">
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Lädt...' : 'Login'}
                </button>
            </div>
        </form>

        <div class="footer">
            <a href="/register">Don't have an account yet? Register now</a>
        </div>
    </div>
</div>

//Sytel wurde mit KI gemacht


<style>
    :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #f0f2f5;
    }

    .login-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
        box-sizing: border-box;
    }

    .main-title {
        font-size: 32px;
        font-weight: bold;
        color: #000000;
        margin-bottom: 40px;
        text-align: center;
    }

    .login-card {
        background: white;
        padding: 60px 40px;
        border-radius: 24px;
        width: 100%;
        max-width: 650px;
        box-sizing: border-box;
    }

    .form-group {
        border: 1px solid #999999;
        border-radius: 6px;
        margin-bottom: 30px;
        padding: 0 12px;
        background: transparent;
    }

    legend {
        font-size: 14px;
        color: #8a6d9f;
        padding: 0 6px;
        font-weight: 500;
    }

    input {
        width: 100%;
        border: none;
        padding: 14px 4px;
        font-size: 18px;
        color: #333333;
        background: transparent;
        box-sizing: border-box;
    }

    input:focus {
        outline: none;
    }

    .button-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 40px;
    }

    button {
        background-color: #222222;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 32px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover:not(:disabled) {
        background-color: #444444;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .error {
        color: #d0021b;
        background-color: #fff5f5;
        padding: 10px;
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 20px;
        text-align: center;
    }

    .footer {
        margin-top: 24px;
        text-align: center;
    }

    .footer a {
        color: #3b82f6;
        text-decoration: none;
        font-size: 13px;
    }

    .footer a:hover {
        text-decoration: underline;
    }
</style>