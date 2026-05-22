'use strict';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcrypt';

const dbFilePath = path.join(process.cwd(), 'database.sqlite');

const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
});

// ── Users ────────────────────────────────────────────────────────────────────

const rawUsers = [
    { username: 'maxmuster',   email: 'max.muster@example.com',    password: 'Password1!', firstname: 'Max',      lastname: 'Mustermann', birthday: '1990-04-12' },
    { username: 'annaschmidt', email: 'anna.schmidt@example.com',  password: 'Password2!', firstname: 'Anna',     lastname: 'Schmidt',    birthday: '1993-07-23' },
    { username: 'lukashuber',  email: 'lukas.huber@example.com',   password: 'Password3!', firstname: 'Lukas',    lastname: 'Huber',      birthday: '1988-11-05' },
    { username: 'sofieweber',  email: 'sofie.weber@example.com',   password: 'Password4!', firstname: 'Sofie',    lastname: 'Weber',      birthday: '1995-02-18' },
    { username: 'tobiasbauer', email: 'tobias.bauer@example.com',  password: 'Password5!', firstname: 'Tobias',   lastname: 'Bauer',      birthday: '1991-09-30' },
    { username: 'larakoch',    email: 'lara.koch@example.com',     password: 'Password6!', firstname: 'Lara',     lastname: 'Koch',       birthday: '1997-06-14' },
    { username: 'felixwolf',   email: 'felix.wolf@example.com',    password: 'Password7!', firstname: 'Felix',    lastname: 'Wolf',       birthday: '1985-03-27' },
    { username: 'mariafischer',email: 'maria.fischer@example.com', password: 'Password8!', firstname: 'Maria',    lastname: 'Fischer',    birthday: '1999-12-01' },
];

console.log('🌱 Seeding Users...');
const userIds = [];
for (const u of rawUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    const result = await db.run(
        `INSERT OR IGNORE INTO Users (username, email, password, firstname, lastname, birthday)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [u.username, u.email, hashed, u.firstname, u.lastname, u.birthday]
    );
    const row = await db.get('SELECT userId FROM Users WHERE username = ?', [u.username]);
    userIds.push(row.userId);
}
console.log(`   ✓ ${userIds.length} Users`);

// ── Projects ─────────────────────────────────────────────────────────────────

const projects = [
    { projectName: 'Website Relaunch',        projectPriority: 'High',   projectEndDate: '2025-06-30' },
    { projectName: 'Mobile App v2',           projectPriority: 'High',   projectEndDate: '2025-08-15' },
    { projectName: 'CRM Integration',         projectPriority: 'Medium', projectEndDate: '2025-07-01' },
    { projectName: 'Internal HR Portal',      projectPriority: 'Low',    projectEndDate: '2025-10-01' },
    { projectName: 'Data Analytics Dashboard',projectPriority: 'High',   projectEndDate: '2025-05-20' },
    { projectName: 'API Gateway Refactor',    projectPriority: 'Medium', projectEndDate: '2025-09-10' },
    { projectName: 'Customer Onboarding Flow',projectPriority: 'Medium', projectEndDate: '2025-07-25' },
    { projectName: 'Security Audit 2025',     projectPriority: 'High',   projectEndDate: '2025-06-01' },
];

console.log('🌱 Seeding Projects...');
const projectIds = [];
for (const p of projects) {
    const result = await db.run(
        `INSERT OR IGNORE INTO Projects (projectName, projectPriority, projectEndDate)
         VALUES (?, ?, ?)`,
        [p.projectName, p.projectPriority, p.projectEndDate]
    );
    const row = await db.get('SELECT projectId FROM Projects WHERE projectName = ?', [p.projectName]);
    projectIds.push(row.projectId);
}
console.log(`   ✓ ${projectIds.length} Projects`);

// ── Tasks ─────────────────────────────────────────────────────────────────────

const taskTemplates = [
    { taskTitle: 'UI/UX Design Review',        taskDescription: 'Review the latest Figma mockups and provide feedback.',         taskPriority: 'High',   taskEndDate: '2025-05-10', taskStatus: 'Done'       },
    { taskTitle: 'Client Meeting Preparation',  taskDescription: 'Prepare agenda and slides for the upcoming client call.',      taskPriority: 'High',   taskEndDate: '2025-05-12', taskStatus: 'Done'       },
    { taskTitle: 'Project Review',              taskDescription: 'Conduct mid-sprint project review with the full team.',        taskPriority: 'Medium', taskEndDate: '2025-05-14', taskStatus: 'Done'       },
    { taskTitle: 'Write Unit Tests',            taskDescription: 'Add unit tests for the authentication module.',                taskPriority: 'Medium', taskEndDate: '2025-05-20', taskStatus: 'InProgress' },
    { taskTitle: 'Database Schema Migration',   taskDescription: 'Migrate legacy schema to the new normalized structure.',       taskPriority: 'High',   taskEndDate: '2025-05-25', taskStatus: 'InProgress' },
    { taskTitle: 'Update API Documentation',    taskDescription: 'Update Swagger docs to reflect the latest endpoint changes.',  taskPriority: 'Low',    taskEndDate: '2025-06-01', taskStatus: 'InProgress' },
    { taskTitle: 'Performance Profiling',       taskDescription: 'Profile the dashboard load time and identify bottlenecks.',   taskPriority: 'Medium', taskEndDate: '2025-06-05', taskStatus: 'OnHold'     },
    { taskTitle: 'Accessibility Audit',         taskDescription: 'Run WCAG 2.1 AA audit on all public-facing pages.',           taskPriority: 'Low',    taskEndDate: '2025-06-10', taskStatus: 'OnHold'     },
    { taskTitle: 'Integrate Payment Gateway',   taskDescription: 'Connect Stripe API for subscription billing.',                taskPriority: 'High',   taskEndDate: '2025-04-30', taskStatus: 'Overdue'    },
    { taskTitle: 'Fix Login Redirect Bug',      taskDescription: 'Users are not being redirected correctly after OAuth login.', taskPriority: 'High',   taskEndDate: '2025-04-28', taskStatus: 'Overdue'    },
    { taskTitle: 'Deploy Staging Environment',  taskDescription: 'Set up Docker-based staging server on AWS EC2.',              taskPriority: 'Medium', taskEndDate: '2025-05-18', taskStatus: 'Done'       },
    { taskTitle: 'Code Review Sprint 7',        taskDescription: 'Review all PRs opened during sprint 7.',                      taskPriority: 'Low',    taskEndDate: '2025-05-22', taskStatus: 'InProgress' },
    { taskTitle: 'Design Email Templates',      taskDescription: 'Create branded HTML email templates for notifications.',      taskPriority: 'Low',    taskEndDate: '2025-06-15', taskStatus: 'OnHold'     },
    { taskTitle: 'Security Pen Test',           taskDescription: 'Schedule and coordinate third-party penetration testing.',    taskPriority: 'High',   taskEndDate: '2025-05-01', taskStatus: 'Overdue'    },
    { taskTitle: 'Refactor State Management',   taskDescription: 'Replace Redux with Zustand in the frontend app.',             taskPriority: 'Medium', taskEndDate: '2025-07-01', taskStatus: 'InProgress' },
];

console.log('🌱 Seeding Tasks...');
const taskIds = [];
for (const u of userIds) {
    for (const t of taskTemplates) {
        const result = await db.run(
            `INSERT INTO Tasks (taskTitle, taskDescription, taskPriority, taskEndDate, taskStatus, fkUserId)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [t.taskTitle, t.taskDescription, t.taskPriority, t.taskEndDate, t.taskStatus, u]
        );
        taskIds.push(result.lastID);
    }
}
console.log(`   ✓ ${taskIds.length} Tasks (${taskTemplates.length} per user)`);

// ── ProjectUserTable ──────────────────────────────────────────────────────────

console.log('🌱 Seeding ProjectUserTable...');
let puCount = 0;
for (let i = 0; i < projectIds.length; i++) {
    // Each project gets 2–4 users assigned
    const assigned = userIds.slice(0, (i % 4) + 2);
    for (const uid of assigned) {
        await db.run(
            `INSERT INTO ProjectUserTable (fkProjectId, fkUserId) VALUES (?, ?)`,
            [projectIds[i], uid]
        );
        puCount++;
    }
}
console.log(`   ✓ ${puCount} ProjectUser assignments`);

// ── ProjectTasksTable ─────────────────────────────────────────────────────────

console.log('🌱 Seeding ProjectTasksTable...');
let ptCount = 0;
for (let i = 0; i < projectIds.length; i++) {
    // Assign ~6 tasks per project (round-robin from taskIds)
    const start = (i * 6) % taskIds.length;
    for (let j = 0; j < 6; j++) {
        const tid = taskIds[(start + j) % taskIds.length];
        await db.run(
            `INSERT INTO ProjectTasksTable (fkProjectId, fkTaskId) VALUES (?, ?)`,
            [projectIds[i], tid]
        );
        ptCount++;
    }
}
console.log(`   ✓ ${ptCount} ProjectTask assignments`);

console.log('\n✅ Database seeding complete!');
await db.close();
