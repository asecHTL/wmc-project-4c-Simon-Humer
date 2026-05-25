<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";

    let { data } = $props();

    const statusMeta = {
        Done: {
            icon: "✓",
            color: "#5bc4a0",
            bg: "#e0f5ed",
            label: "Task completed",
        },
        InProgress: {
            icon: "🕐",
            color: "#e6b84a",
            bg: "#fdf3d7",
            label: "In Progress",
        },
        OnHold: {
            icon: "⊠",
            color: "#e8924a",
            bg: "#fdebd7",
            label: "On hold",
        },
        Overdue: {
            icon: "⊖",
            color: "#a07eda",
            bg: "#ede5f8",
            label: "Overdue",
        },
    };

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
        if (!canvas) return;

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
                                ` ${context.label}: ${context.raw} Tasks`,
                        },
                    },
                },
            },
        });

        if (canvasProgress) {
            chartProgress = new Chart(canvasProgress, {
                type: "line",
                data: {
                    labels: progressLabels,
                    datasets: [
                        {
                            label: "Anzahl Tasks",
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
            chartProgress.update();
        }
    });
</script>



<div class="dashboard">
    <h1>Dashboard</h1>

    <div class="grid">
        <!-- Up Next -->
        <div class="card">
            <h2>Up Next</h2>
            <ul class="task-list">
                {#each data.upComingTasks as task}
                    <li class="task-item">
                        <span class="task-icon">📅</span>
                        <span>{task.taskTitle}</span>
                    </li>
                {:else}
                    <li class="task-item muted">Keine Tasks gefunden.</li>
                {/each}
            </ul>
        </div>

        <!-- Overview -->
        <div class="card">
            <h2>Overview</h2>
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
            <h2>Tasks by Priority</h2>
            <div class="chart-wrapper">
                <canvas bind:this={canvas}></canvas>
            </div>
        </div>

        <div class="card">
            <h2>Tasks Progress</h2>
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
        /* Damit sich das Diagramm sauber an der Card ausrichtet */
        display: flex;
        flex-direction: column;
    }

    /* Chart Anpassung */
    .chart-wrapper {
        position: relative;
        width: 100%;
        height: 220px; /* Feste Höhe für ein sauberes Dashboard-Layout */
        margin: auto 0;
    }

    /* Up Next */
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

    /* Overview */
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

    /* Placeholder */
    .placeholder {
        color: #9ca3af;
        font-size: 0.9rem;
        padding: 2rem 0;
        text-align: center;
    }
</style>
