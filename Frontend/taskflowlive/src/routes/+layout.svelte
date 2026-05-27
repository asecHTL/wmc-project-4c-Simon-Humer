<script>
  import { t, setLanguage } from "$lib/i18n/i18n.svelte.js";
  import favicon from "$lib/assets/favicon.svg";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  let { children } = $props();

  const links = $derived([
    { href: "/dashboard", label: t("dashboard") || "Dashboard", icon: "ti-layout-dashboard" },
    { href: "/projects", label: t("projects") || "Projects", icon: "ti-folder" },
    { href: "/tasks", label: t("tasks") || "Tasks", icon: "ti-checkbox" },
    { href: "/team", label: t("team") || "Team", icon: "ti-users" },
    { href: "/settings", label: t("settings") || "Settings", icon: "ti-settings" },
  ]);

  let isLoginPage = $derived($page.url.pathname === "/");
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
  />
</svelte:head>

<div class="layout">
  {#if !isLoginPage}
    <nav class="sidebar">
      <div class="logo">Task Flow</div>

      {#each links as link}
        <a
          href={link.href}
          class="nav-link"
          class:active={$page.url.pathname.startsWith(link.href)}
        >
          <i class="ti {link.icon}" aria-hidden="true"></i>
          {link.label}
        </a>
      {/each}

      <div class="spacer"></div>
      
      <div class="lang-switch">
        <button onclick={() => setLanguage('en')}>EN</button>
        <button onclick={() => setLanguage('de')}>DE</button>
      </div>

      <div class="user-block">
        <button onclick={() => goto("/")}>Logout</button>
        <div class="avatar">MM</div>
        <span class="user-name">Max Mustermann</span>
      </div>
    </nav>
  {/if}

  <main class="content">
    {@render children()}
  </main>
</div>

<style>
  .layout {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 110px;
    background-color: #f0f0f0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 0;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .logo {
    background: #7f77dd;
    color: #fff;
    font-weight: 500;
    font-size: 14px;
    border-radius: 8px;
    padding: 10px 16px;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 80px;
    padding: 10px 8px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 12px;
    color: #555;
  }

  .nav-link :global(.ti) {
    font-size: 20px;
  }

  .nav-link:hover {
    background: #e0e0e0;
    color: #333;
  }

  .nav-link.active {
    background: #eeedfe;
    color: #534ab7;
  }

  .lang-switch {
    display: flex;
    gap: 4px;
    margin-bottom: 1rem;
  }

  .lang-switch button {
    background: #e0e0e0;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 10px;
  }

  .lang-switch button:hover {
    background: #d0d0d0;
  }

  .spacer {
    flex: 1;
  }

  .user-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-bottom: 0.5rem;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    color: #555;
  }

  .user-name {
    font-size: 11px;
    color: #555;
    text-align: center;
  }

  .content {
    flex: 1;
    padding: 2rem;
  }
</style>
