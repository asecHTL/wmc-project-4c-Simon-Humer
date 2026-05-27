import { locales } from './locales.js';

let currentLanguage = $state('de'); // Standard-Sprache

export function setLanguage(lang) {
    if (locales[lang]) {
        currentLanguage = lang;
    }
}

export function getLanguage() {
    return currentLanguage;
}

export function t(key) {
    return locales[currentLanguage][key] || key;
}
