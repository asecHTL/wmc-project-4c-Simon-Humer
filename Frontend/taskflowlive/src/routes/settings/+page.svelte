<script>
    let { data } = $props();


    async function saveUserSettings() {
        
    }

    async function deleteUser() {
        
    }
</script>

<div class="row1">
    <span>Firstname</span>
    <input type="text" name="inpFirstanem" bind:value={data.user.firstname} />
    <br />

    <span>Lastname</span>
    <input type="text" name="inpLastname" bind:value={data.user.lastname} />

    <span>Birthday</span>
    <input type="text" name="inpBirthday" bind:value={data.user.birthday} />
</div>

<div class="row2">
    <span>Username</span>
    <input type="text" name="inpUsername" bind:value={data.user.username} />
    <br />

    <span>Email</span>
    <input type="text" name="inpEmail" bind:value={data.user.email} />

    <span>Password</span>
    <input type="text" name="inpPassword" bind:value={data.user.password} />
</div>

<div class="row3">
    <span>Language</span>
    <input type="text" name="inpLanguage" bind:value={data.user.language} />
    <br />

   
</div>


<div class="buttons">
    <button onclick={()=> saveUserSettings()}>Save</button>
    <button onclick={()=> deleteUser()}>Delete</button>
</div>
<style>
</style>
