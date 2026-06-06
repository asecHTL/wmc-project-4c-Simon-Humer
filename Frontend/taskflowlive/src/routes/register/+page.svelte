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

        const userData = {
            username,
            email,
            password,
            firstname,
            lastname
        };

        try {
            const response = await fetch('http://localhost:3000/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                goto('/');
            } else {
                const errorText = await response.text();
                errorMessage = errorText || t('registrationFailed');
            }
        } catch (error) {
            console.error('Registration Error:', error);
            errorMessage = t('connectionFailed');
        } finally {
            isLoading = false;
        }
    }
</script>

//Error handeling wurde im nachhinein mit KI gemacht 

<div class="register-container">
    <h1 class="main-title">Task Flow</h1>
    
    <div class="register-card">
        <form onsubmit={handleRegister}>
            <div class="form-grid">
                <fieldset class="form-group">
                    <legend>{t('username')} *</legend>
                    <input 
                        type="text" 
                        id="username" 
                        bind:value={username} 
                        placeholder="Input"
                        required
                    />
                </fieldset>

                <fieldset class="form-group">
                    <legend>{t('firstname')} *</legend>
                    <input 
                        type="text" 
                        id="firstname" 
                        bind:value={firstname} 
                        placeholder="Input"
                        required
                    />
                </fieldset>

                <fieldset class="form-group">
                    <legend>{t('email')} *</legend>
                    <input 
                        type="email" 
                        id="email" 
                        bind:value={email} 
                        placeholder="Input"
                        required
                    />
                </fieldset>

                <fieldset class="form-group">
                    <legend>{t('lastname')} *</legend>
                    <input 
                        type="text" 
                        id="lastname" 
                        bind:value={lastname} 
                        placeholder="Input"
                        required
                    />
                </fieldset>

                <fieldset class="form-group">
                    <legend>{t('password')} *</legend>
                    <input 
                        type="password" 
                        id="password" 
                        bind:value={password} 
                        placeholder="Input"
                        required
                    />
                </fieldset>

                <fieldset class="form-group">
                    <legend>{t('birthday')}</legend>
                    <input 
                        type="text" 
                        id="birthday" 
                        placeholder="Input"
                    />
                </fieldset>
            </div>

            {#if errorMessage}
                <p class="error">{errorMessage}</p>
            {/if}

            {#if successMessage}
                <p class="success">{successMessage}</p>
            {/if}

            <div class="button-wrapper">
                <button type="submit" disabled={isLoading}>
                    {isLoading ? t('registering') : t('register')}
                </button>
            </div>
        </form>

        <div class="footer">
            <a href="/">{t('alreadyHaveAccount')} {t('registerNow')}</a>
        </div>
    </div>
</div>


//Style wurde mit KI gemacht

<style>
    :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #f0f2f5;
    }

    .register-container {
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

    .register-card {
        background: white;
        padding: 60px 40px;
        border-radius: 24px;
        width: 100%;
        max-width: 850px;
        box-sizing: border-box;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 80px;
        row-gap: 15px;
    }

    .form-group {
        border: 1px solid #999999;
        border-radius: 6px;
        margin-bottom: 15px;
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
        margin-top: 30px;
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
        grid-column: span 2;
        text-align: center;
    }

    .success {
        color: #155724;
        background-color: #d4edda;
        padding: 10px;
        border-radius: 4px;
        font-size: 14px;
        grid-column: span 2;
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

    @media (max-width: 768px) {
        .form-grid {
            grid-template-columns: 1fr;
            column-gap: 0;
        }
        
        .error, .success {
            grid-column: span 1;
        }
    }
</style>
