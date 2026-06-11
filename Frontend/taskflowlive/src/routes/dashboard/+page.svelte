<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import { t } from "$lib/i18n/i18n.svelte.js";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let { data } = $props();

    function updateFilter(filter) {
        const url = new URL($page.url);
        url.searchParams.set('taskGraphDate', filter);
        goto(url.toString(), { keepFocus: true, noScroll: true });
    }

    const statusMeta = $derived({
        done: {
            icon: "bi-check-circle",
            color: "text-success",
            bg: "bg-success-subtle",
            label: t("taskCompleted"),
        },
        inProgress: {
            icon: "bi-clock",
            color: "text-warning",
            bg: "bg-warning-subtle",
            label: t("inProgress"),
        },
        toDo: {
            icon: "bi-list-task",
            color: "text-primary",
            bg: "bg-primary-subtle",
            label: t("toDo") || "To Do",
        },
        review: {
            icon: "bi-eye",
            color: "text-info",
            bg: "bg-info-subtle",
            label: t("review") || "Review",
        },
        overdue: {
            icon: "bi-exclamation-circle",
            color: "text-danger",
            bg: "bg-danger-subtle",
            label: t("overdue"),
        },
    });

    const priorityColors = {
        High: "#dc3545", // Bootstrap danger
        Medium: "#ffc107", // Bootstrap warning
        Low: "#198754", // Bootstrap success
    };

    let canvas = $state(null);
    let canvasProgress = $state(null);

    let chart = null;
    let chartProgress = null;

    let chartLabels = $derived(data.tasksByPriority.map((t) => t.status));
    let chartValues = $derived(data.tasksByPriority.map((t) => t.count));
    let chartColors = $derived(
        data.tasksByPriority.map((t) => priorityColors[t.status] ?? "#ccc"),
    );

    let progressLabels = $derived(
        data.personalTasksDoneGraph.map((t) => t.date),
    );
    let progressValues = $derived(
        data.personalTasksDoneGraph.map((t) => t.count),
    );

    onMount(() => {
        if (canvas) {
            chart = new Chart(canvas, {
                type: "pie",
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            data: chartValues,
                            backgroundColor: chartColors,
                            borderWidth: 2,
                            borderColor: "#fff",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: {
                                font: { size: 12 },
                                boxWidth: 12,
                                padding: 15,
                            },
                        },
                    },
                },
            });
        }

        if (canvasProgress) {
            chartProgress = new Chart(canvasProgress, {
                type: "line",
                data: {
                    labels: progressLabels,
                    datasets: [
                        {
                            label: t("tasks"),
                            data: progressValues,
                            backgroundColor: "rgba(13, 110, 253, 0.1)",
                            borderColor: "#0d6efd",
                            fill: true,
                            tension: 0.1,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                    },
                    scales: {
                        y: { beginAtZero: true },
                        x: { display: true }
                    },
                },
            });
        }

        return () => {
            if (chart) chart.destroy();
            if (chartProgress) chartProgress.destroy();
        };
    });

    $effect(() => {
        if (chart) {
            chart.data.labels = chartLabels;
            chart.data.datasets[0].data = chartValues;
            chart.data.datasets[0].backgroundColor = chartColors;
            chart.update();
        }
        if (chartProgress) {
            chartProgress.data.labels = progressLabels;
            chartProgress.data.datasets[0].data = progressValues;
            chartProgress.update();
        }
    });
</script>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h2 mb-0">{t("dashboard")}</h1>
    </div>

    <div class="row g-4">
        <!-- Upcoming Tasks -->
        <div class="col-12 col-xl-4">
            <div class="card h-100 shadow-sm">
                <div class="card-header bg-transparent border-0 pt-4 px-4">
                    <h5 class="card-title mb-0">{t("upcomingTasks")}</h5>
                </div>
                <div class="card-body px-4">
                    <div class="list-group list-group-flush">
                        {#each data.upComingTasks as task}
                            <div class="list-group-item d-flex align-items-center px-0 border-0 mb-2">
                                <div class="badge bg-light text-primary p-2 me-3">
                                    <i class="bi bi-calendar-event"></i>
                                </div>
                                <span class="text-secondary small fw-medium">{task.taskTitle}</span>
                            </div>
                        {:else}
                            <div class="text-center py-4 text-muted">
                                <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                                {t("noTasksFound")}
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Personal Overview -->
        <div class="col-12 col-xl-8">
            <div class="card h-100 shadow-sm border-0">
                <div class="card-header bg-transparent border-0 pt-4 px-4">
                    <h5 class="card-title mb-0">{t("personalOverview")}</h5>
                </div>
                <div class="card-body px-4">
                    <div class="row g-3">
                        {#each data.overviewPersonalTasks as item}
                            {@const meta = statusMeta[item.status] ?? { icon: "bi-question", color: "text-secondary", bg: "bg-light", label: item.status }}
                            <div class="col-6 col-md-4 col-lg">
                                <div class="p-3 rounded-4 {meta.bg} h-100 d-flex flex-column align-items-center text-center">
                                    <div class="fs-4 {meta.color} mb-1">
                                        <i class="bi {meta.icon}"></i>
                                    </div>
                                    <div class="h3 fw-bold mb-0">{item.count}</div>
                                    <div class="small text-muted text-uppercase fw-bold" style="font-size: 0.7rem;">{meta.label}</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Tasks by Priority -->
        <div class="col-12 col-lg-4">
            <div class="card h-100 shadow-sm border-0">
                <div class="card-header bg-transparent border-0 pt-4 px-4">
                    <h5 class="card-title mb-0">{t("tasksByPriority")}</h5>
                </div>
                <div class="card-body px-4">
                    <div style="height: 250px;">
                        <canvas bind:this={canvas}></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Chart -->
        <div class="col-12 col-lg-8">
            <div class="card h-100 shadow-sm border-0">
                <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">{t("doneTasks")}</h5>
                    <div class="btn-group btn-group-sm">
                        <button 
                            class="btn btn-outline-primary { $page.url.searchParams.get('taskGraphDate') === '1W' ? 'active' : '' }" 
                            onclick={() => updateFilter('1W')}
                        >{t("week")}</button>
                        <button 
                            class="btn btn-outline-primary { !$page.url.searchParams.get('taskGraphDate') || $page.url.searchParams.get('taskGraphDate') === '1M' ? 'active' : '' }" 
                            onclick={() => updateFilter('1M')}
                        >{t("month")}</button>
                        <button 
                            class="btn btn-outline-primary { $page.url.searchParams.get('taskGraphDate') === '1Y' ? 'active' : '' }" 
                            onclick={() => updateFilter('1Y')}
                        >{t("year")}</button>
                    </div>
                </div>
                <div class="card-body px-4">
                    <div style="height: 250px;">
                        <canvas bind:this={canvasProgress}></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
  .rounded-4 {
    border-radius: 1rem !important;
  }
</style>