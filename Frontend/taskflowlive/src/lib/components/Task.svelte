<script>
    import { t } from "$lib/i18n/i18n.svelte.js";

    let { task, moveTask, addHistory } = $props();

    const priorityClasses = {
        High: "bg-danger-subtle text-danger",
        Medium: "bg-warning-subtle text-warning",
        Low: "bg-success-subtle text-success"
    };
</script>

<div class="card border-0 shadow-sm mb-2 task-card" onclick={() => addHistory(task.taskId)} role="button" tabindex="0" onkeydown={() => {}}>
    <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="card-title small fw-bold mb-0 text-truncate pe-3">{task.taskTitle}</h6>
            <i class="bi bi-journal-text text-muted small"></i>
        </div>
        <p class="card-text small text-muted mb-3 text-truncate-2">{task.taskDescription}</p>

        <div class="d-flex justify-content-between align-items-center mt-auto">
            <div class="d-flex align-items-center gap-2">
                <span class="badge {priorityClasses[task.taskPriority] || 'bg-light'} fw-medium" style="font-size: 0.65rem;">
                    {t(task.taskPriority.toLowerCase() + 'Priority') || task.taskPriority}
                </span>
                
                <div class="d-flex gap-1 border-start ps-2 ms-1">
                    <button 
                        class="btn btn-link p-0 text-muted text-decoration-none" 
                        style="font-size: 0.75rem;"
                        onclick={(e) => { e.stopPropagation(); moveTask(task, -1); }}
                        disabled={task.taskStatus === 'toDo'}
                    >
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <button 
                        class="btn btn-link p-0 text-muted text-decoration-none" 
                        style="font-size: 0.75rem;"
                        onclick={(e) => { e.stopPropagation(); moveTask(task, 1); }}
                        disabled={task.taskStatus === 'done'}
                    >
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>
            <small class="text-muted" style="font-size: 0.7rem;">
                <i class="bi bi-calendar-event me-1"></i> {task.taskEndDate}
            </small>
        </div>
    </div>
</div>

<style>
    .text-truncate-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .task-card {
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
    }
    .task-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
    }
</style>
