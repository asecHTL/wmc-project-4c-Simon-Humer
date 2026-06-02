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
            icon: "✓",
            color: "#5bc4a0",
            bg: "#e0f5ed",
            label: t("taskCompleted"),
        },
        inProgress: {
            icon: "🕐",
            color: "#e6b84a",
            bg: "#fdf3d7",
            label: t("inProgress"),
        },
        toDo: {
            icon: "📋",
            color: "#4a90e2",
            bg: "#e1f0ff",
            label: t("toDo") || "To Do",
        },
        review: {
            icon: "👁",
            color: "#e8924a",
            bg: "#fdebd7",
            label: t("review") || "Review",
        },
        overdue: {
            icon: "⊖",
            color: "#a07eda",
            bg: "#ede5f8",
            label: t("overdue"),
        },
    });

    const priorityColors = {
        High: "#e05c5c",
        Medium: "#e6b84a",
        Low: "#5bc4a0",
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
                                font: { family: "'DM Sans', sans-serif", size: 12 },
                                boxWidth: 12,
                                padding: 15,
                            },
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) =>
                                    ` ${context.label}: ${context.raw} ${t("tasks")}`,
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
                            backgroundColor: "#5bc4a0",
                            borderRadius: 6,
                            backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(
                                    0,
                                    0,
                                    0,
                                    220,
                                );
                                gradient.addColorStop(
                                    0,
                                    "rgba(59, 130, 246, 0.3)",
                                );
                                gradient.addColorStop(
                                    1,
                                    "rgba(59, 130, 246, 0.0)",
                                );
                                return gradient;
                            },
                            fill: true,
                            tension: 0.1,
                            pointRadius:5,
                            pointHoverRadius:7,
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
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: false
                            }
                        },
                        x:{
                            display : true,
                            grid: {
                                display: false
                            },
                            ticks: {
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 45,
                                callback: function(val, index) {
                                    const filter = new URL(window.location.href).searchParams.get('taskGraphDate') || '1M';
                                    if (filter === '1W') return this.getLabelForValue(val);
                                    if (filter === '1M') return index % 2 === 0 ? this.getLabelForValue(val) : '';
                                    if (filter === '1Y') return index % 3 === 0 ? this.getLabelForValue(val) : '';
                                    return this.getLabelForValue(val);
                                }
                            }
                        }
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
            chartProgress.data.datasets[0].label = t("tasks");
            chartProgress.update();
        }
    });
</script>



<div class="dashboard">
    <h1>{t("dashboard")}</h1>

    <div class="grid">
        <div class="card">
            <h2>{t("upcomingTasks")}</h2>
            <ul class="task-list">
                {#each data.upComingTasks as task}
                    <li class="task-item">
                        <span class="task-icon">📅</span>
                        <span>{task.taskTitle}</span>
                    </li>
                {:else}
                    <li class="task-item muted">{t("noTasksFound")}</li>
                {/each}
            </ul>
        </div>

        <div class="card">
            <h2>{t("personalOverview")}</h2>
            <div class="overview-grid">
                {#each data.overviewPersonalTasks as item}
                    {@const meta = statusMeta[item.status] ?? {
                        icon: "?",
                        color: "#888",
                        bg: "#eee",
                        label: item.status,
                    }}
                    <div class="overview-item">
                        <div
                            class="overview-icon"
                            style="background:{meta.bg}; color:{meta.color}"
                        >
                            {meta.icon}
                        </div>
                        <div class="overview-count">{item.count}</div>
                        <div class="overview-label">{meta.label}</div>
                    </div>
                {/each}
            </div>
        </div>

        <div class="card">
            <h2>{t("tasksByPriority")}</h2>
            <div class="chart-wrapper">
                <canvas bind:this={canvas}></canvas>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2>{t("doneTasks")}</h2>
                <div class="filter-buttons">
                    <button 
                        class:active={$page.url.searchParams.get('taskGraphDate') === '1W'} 
                        onclick={() => updateFilter('1W')}
                    >
                        {t("week")}
                    </button>
                    <button 
                        class:active={!$page.url.searchParams.get('taskGraphDate') || $page.url.searchParams.get('taskGraphDate') === '1M'} 
                        onclick={() => updateFilter('1M')}
                    >
                        {t("month")}
                    </button>
                    <button 
                        class:active={$page.url.searchParams.get('taskGraphDate') === '1Y'} 
                        onclick={() => updateFilter('1Y')}
                    >
                        {t("year")}
                    </button>
                </div>
            </div>
            <div class="placeholder">
                <canvas bind:this={canvasProgress}></canvas>
            </div>
        </div>
    </div>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap");

    .dashboard {
        font-family: "DM Sans", sans-serif;
        background: #f0f2f7;
        min-height: 100vh;
        padding: 2rem;
        color: #1a1a2e;
    }

    h1 {
        font-size: 2rem;
        font-weight: 600;
        margin: 0 0 2rem;
    }

    h2 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 1.25rem;
        color: #1a1a2e;
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1.25rem;
    }

    .card {
        background: #fff;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
    }

    .card-header h2 {
        margin-bottom: 0;
    }

    .filter-buttons {
        display: flex;
        gap: 0.5rem;
    }

    .filter-buttons button {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 0.75rem;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s;
    }

    .filter-buttons button:hover {
        background: #e5e7eb;
    }

    .filter-buttons button.active {
        background: #7f77dd;
        color: white;
        border-color: #7f77dd;
    }

    .chart-wrapper {
        position: relative;
        width: 100%;
        height: 220px;
        margin: auto 0;
    }

    .task-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .task-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.95rem;
        color: #374151;
    }

    .task-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: #f0f0e0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        flex-shrink: 0;
    }

    .muted {
        color: #9ca3af;
    }

    .overview-grid {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
    }

    .overview-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.4rem;
    }

    .overview-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .overview-count {
        font-size: 1.4rem;
        font-weight: 600;
        line-height: 1;
    }

    .overview-label {
        font-size: 0.78rem;
        color: #9ca3af;
    }

    .placeholder {
        color: #9ca3af;
        font-size: 0.9rem;
        padding: 2rem 0;
        text-align: center;
    }
</style>
