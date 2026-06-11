<script>
    let { project, selectedProjectId, onSelect } = $props();
</script>

<div
    class="project-detail-card"
    onclick={() => onSelect(project)}
    class:selected={selectedProjectId === project.projectId}
    role="button"
    tabindex="0"
    onkeydown={() => {}}
>
    <div class="card-header">
        <h4>{project.projectName}</h4>
        <span class="creator">Erstellt von: <span class="avatar-small">MM</span></span>
    </div>
    <div class="card-dates">
        # Projekt begin - {project.projectEndDate || 'Projekt Ende'}
    </div>
    <div class="card-contributors">
        Contributors: <span class="avatar-text">SH</span> <span class="avatar-text">DH</span>
    </div>
    <div class="card-tags">
        <span class="tag tag-progress">In Progress</span>
        <span class="tag tag-{project.projectPriority?.toLowerCase() || 'medium'}">{project.projectPriority || 'Medium'}</span>
    </div>
    <div class="card-progress-container">
        <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: 84%"></div>
        </div>
        <span class="progress-text">84%</span>
    </div>
</div>

<style>
    .project-detail-card {
        background: #f8fafc;
        border: 1px solid #edf2f7;
        border-radius: 12px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .project-detail-card:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
    }

    .project-detail-card.selected {
        background: #ffffff;
        border-color: #7f77dd;
        box-shadow: 0 0 0 2px rgba(127, 119, 221, 0.2);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .card-header h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1a202c;
    }

    .creator {
        font-size: 0.7rem;
        color: #4a5568;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .avatar-small {
        background: #e2e8f0;
        color: #4a5568;
        font-size: 0.65rem;
        padding: 0.2rem 0.35rem;
        border-radius: 50%;
        font-weight: bold;
    }

    .card-dates {
        font-size: 0.75rem;
        color: #718096;
        margin-bottom: 0.5rem;
    }

    .card-contributors {
        font-size: 0.8rem;
        color: #4a5568;
        margin-bottom: 0.75rem;
    }

    .avatar-text {
        font-weight: 600;
        margin-left: 0.25rem;
    }

    .card-tags {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .tag {
        font-size: 0.7rem;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    .tag::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }

    .tag-progress {
        background: #fefcbf;
        color: #975a16;
    }
    .tag-progress::before { background: #d69e2e; }

    .tag-high {
        background: #fed7d7;
        color: #9b2c2c;
    }
    .tag-high::before { background: #e53e3e; }

    .tag-medium {
        background: #fefcbf;
        color: #975a16;
    }
    .tag-medium::before { background: #d69e2e; }

    .tag-low {
        background: #c6f6d5;
        color: #22543d;
    }
    .tag-low::before { background: #38a169; }

    .card-progress-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .progress-bar-bg {
        flex: 1;
        height: 6px;
        background: #edf2f7;
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-bar-fill {
        height: 100%;
        background: #63b3ed;
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .progress-text {
        font-size: 0.75rem;
        color: #3182ce;
        font-weight: 600;
    }
</style>
