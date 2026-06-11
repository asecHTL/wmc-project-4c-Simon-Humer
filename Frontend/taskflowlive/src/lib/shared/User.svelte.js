let initialUserId = 0;
if (typeof window !== 'undefined') {
    initialUserId = Number(localStorage.getItem('userId')) || 0;
}

export const userData = $state({
    userId: initialUserId,
});




