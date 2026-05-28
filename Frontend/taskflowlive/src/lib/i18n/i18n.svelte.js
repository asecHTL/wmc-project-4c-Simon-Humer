import { locales } from './locales.js';

let currentLanguage = $state('de'); 

export async function setLanguage(lang, userId = null) {
    if (locales[lang]) {
        currentLanguage = lang;
        
        if (userId) {
            try {
                await fetch(`http://localhost:3000/user/language/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: lang })
                });
            } catch (e) {
                console.error('Failed to sync language to backend:', e);
            }
        }
    }
}

export function getLanguage() {
    return currentLanguage;
}

export function t(key) {
    return locales[currentLanguage][key] || key;
}
