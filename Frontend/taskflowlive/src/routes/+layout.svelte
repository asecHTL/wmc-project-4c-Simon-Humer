<script>
  import { t, setLanguage } from "$lib/i18n/i18n.svelte.js";
  import favicon from "$lib/assets/favicon.svg";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { userData } from "$lib/shared/User.svelte.js";

  let { children } = $props();

  const links = $derived([
    { href: `/dashboard?userId=${userData.userId}`, label: t("dashboard"), icon: "bi-speedometer2" },
    { href: `/projects?userId=${userData.userId}`, label: t("projects"), icon: "bi-folder" },
    { href: `/tasks?userId=${userData.userId}`, label: t("tasks"), icon: "bi-check2-square" },
    { href: `/team?userId=${userData.userId}`, label: t("team"), icon: "bi-people" },
    { href: `/settings?userId=${userData.userId}`, label: t("settings"), icon: "bi-gear" },
  ]);

  let isLoginPage = $derived($page.url.pathname === "/" || $page.url.pathname === "/register");
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Task Flow</title>
</svelte:head>

<div class="container-fluid p-0">
  <div class="row g-0 min-vh-100 flex-column flex-md-row">
    {#if !isLoginPage}
      <!-- Sidebar for MD and up -->
      <nav class="col-md-2 col-lg-1 bg-light border-end d-none d-md-flex flex-column align-items-center py-4 sticky-top vh-100">
        <div class="badge bg-primary p-2 mb-4 fs-6">Task Flow</div>

        <div class="nav nav-pills flex-column w-100 px-2 gap-2">
          {#each links as link}
            <a
              href={link.href}
              class="nav-link text-center py-3 {$page.url.pathname.startsWith(link.href) ? 'active' : 'text-dark'}"
            >
              <i class="bi {link.icon} d-block fs-4 mb-1"></i>
              <span class="small">{link.label}</span>
            </a>
          {/each}
        </div>

        <div class="mt-auto w-100 px-2 text-center">
          <div class="btn-group btn-group-sm mb-3">
            <button class="btn btn-outline-secondary" onclick={() => setLanguage('en', userData.userId)}>EN</button>
            <button class="btn btn-outline-secondary" onclick={() => setLanguage('de', userData.userId)}>DE</button>
          </div>

          <div class="d-flex flex-column align-items-center gap-2 mb-3">
            <button class="btn btn-link text-danger p-0 fs-4" onclick={() => {
                userData.userId = 0;
                if (typeof window !== 'undefined') localStorage.removeItem('userId');
                goto("/");
            }} title={t("logout")}>
              <i class="bi bi-box-arrow-right"></i>
            </button>
            <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">MM</div>
            <span class="small text-muted text-truncate w-100 px-1">Max Mustermann</span>
          </div>
        </div>
      </nav>

      <!-- Bottom Nav for Mobile -->
      <nav class="navbar fixed-bottom navbar-light bg-light border-top d-md-none p-0">
        <div class="container-fluid p-0">
          <div class="nav nav-pills nav-justified w-100">
            {#each links as link}
              <a
                href={link.href}
                class="nav-link rounded-0 py-2 {$page.url.pathname.startsWith(link.href) ? 'active' : 'text-dark'}"
              >
                <i class="bi {link.icon} fs-5"></i>
                <div style="font-size: 10px;">{link.label}</div>
              </a>
            {/each}
          </div>
        </div>
      </nav>
    {/if}

    <main class="col flex-grow-1 overflow-auto bg-white">
      <div class="container-fluid py-4 mb-5 mb-md-0">
        {@render children()}
      </div>
    </main>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #fff;
  }
  
  .nav-link {
    transition: all 0.2s ease-in-out;
  }
  
  .nav-link:not(.active):hover {
    background-color: rgba(0,0,0,0.05);
  }

  main {
    scrollbar-width: thin;
    /* Ensure content is always scrollable if it exceeds viewport */
    height: 100dvh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  @media (max-width: 767.98px) {
    main {
      /* On mobile, adjust height for the bottom navbar if needed, 
         though fixed-bottom usually sits on top. 
         Adding padding-bottom is safer. */
      height: calc(100dvh - 60px); 
    }
  }
</style>