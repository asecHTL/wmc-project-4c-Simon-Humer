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

console.log('🧹 Dropping old tables to ensure schema matches...');
await db.exec(`
    DROP TABLE IF EXISTS ProjectTasksTable;
    DROP TABLE IF EXISTS ProjectUserTable;
    DROP TABLE IF EXISTS TeamUserTable;
    DROP TABLE IF EXISTS Tasks;
    DROP TABLE IF EXISTS Projects;
    DROP TABLE IF EXISTS Team;
    DROP TABLE IF EXISTS Users;
`);

console.log('🛠️ Creating tables...');
await db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
        userId INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        birthday DATE,
        language Text
    )
`);

await db.exec(`
    CREATE TABLE IF NOT EXISTS Team (
        teamId INTEGER PRIMARY KEY AUTOINCREMENT,
        teamName Text,
        adminId Integer not null,
        teamCreationDate Date not null
    )
`);

await db.exec(`
    CREATE TABLE IF NOT EXISTS Projects (
        projectId INTEGER PRIMARY KEY AUTOINCREMENT,
        projectName TEXT NOT NULL,
        projectPriority TEXT NOT NULL,
        projectEndDate DATE NOT NULL,
        fkTeamId Integer,
        FOREIGN KEY (fkTeamId) REFERENCES Team(teamId)
    )
`);

await db.exec(`
    CREATE TABLE IF NOT EXISTS Tasks (
        taskId INTEGER PRIMARY KEY AUTOINCREMENT,
        taskTitle TEXT NOT NULL,
        taskDescription TEXT NOT NULL,
        taskPriority TEXT NOT NULL,
        taskEndDate DATE NOT NULL,
        taskStatus Text not null,
        taskClosed Date,
        fkUserId INTEGER NOT NULL,
        FOREIGN KEY (fkUserId) REFERENCES Users(userId)
    )
`);

await db.exec(`
    CREATE TABLE IF NOT EXISTS TeamUserTable (
        teamUserId INTEGER PRIMARY KEY AUTOINCREMENT,
        fkUserId Integer not null,
        fkTeamId Integer not null,
        FOREIGN KEY (fkUserId) REFERENCES Users(userId),
        FOREIGN KEY (fkTeamId) REFERENCES Team(teamId)
    )
`);

await db.exec(`
    CREATE TABLE IF NOT EXISTS ProjectUserTable (
        projectUserTableId INTEGER PRIMARY KEY AUTOINCREMENT,
        fkProjectId INTEGER NOT NULL,
        fkUserId INTEGER NOT NULL,
        FOREIGN KEY (fkUserId) REFERENCES Users(userId),
        FOREIGN KEY (fkProjectId) REFERENCES Projects(projectId)
    )
`);

await db.exec(`
    CREATE TABLE IF NOT EXISTS ProjectTasksTable (
        ProjectTasksTableId INTEGER PRIMARY KEY AUTOINCREMENT,
        fkProjectId INTEGER NOT NULL,
        fkTaskId INTEGER NOT NULL,
        FOREIGN KEY (fkProjectId) REFERENCES Projects(projectId),
        FOREIGN KEY (fkTaskId) REFERENCES Tasks(taskId)
    )
`);

const rawUsers = [
    { username: 'maxmuster',   email: 'max.muster@example.com',   password: 'Password1!', firstname: 'Max',      lastname: 'Mustermann', birthday: '1990-04-12' },
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
        `INSERT INTO Users (username, email, password, firstname, lastname, birthday)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [u.username, u.email, hashed, u.firstname, u.lastname, u.birthday]
    );
    userIds.push(result.lastID);
}
console.log(`   ✓ ${userIds.length} Users`);


console.log('🌱 Seeding Teams...');
const teamIds = [];
const teamData = [
    { adminId: userIds[0],teamName: 'Team1', teamCreationDate: '2025-01-10' },
    { adminId: userIds[2],teamName: 'Team2', teamCreationDate: '2025-02-15' },
    { adminId: userIds[4],teamName: 'Team3', teamCreationDate: '2025-03-20' },
];

for (const t of teamData) {
    const result = await db.run(
        `INSERT INTO Team (adminId,teamName, teamCreationDate) VALUES (?, ?, ?)`,
        [t.adminId,t.teamName, t.teamCreationDate]
    );
    teamIds.push(result.lastID);
}
console.log(`   ✓ ${teamIds.length} Teams`);


console.log('🌱 Seeding TeamUserTable...');
let tuCount = 0;
for (let i = 0; i < teamIds.length; i++) {
    const tid = teamIds[i];
    const members = userIds.slice(i * 2, (i * 2) + 4);
    for (const uid of members) {
        await db.run(
            `INSERT INTO TeamUserTable (fkUserId, fkTeamId) VALUES (?, ?)`,
            [uid, tid]
        );
        tuCount++;
    }
}
console.log(`   ✓ ${tuCount} TeamUser assignments`);


const projects = [
    { projectName: 'Website Relaunch',         projectPriority: 'High',   projectEndDate: '2025-06-30' },
    { projectName: 'Mobile App v2',            projectPriority: 'High',   projectEndDate: '2025-08-15' },
    { projectName: 'CRM Integration',          projectPriority: 'Medium', projectEndDate: '2025-07-01' },
    { projectName: 'Internal HR Portal',       projectPriority: 'Low',    projectEndDate: '2025-10-01' },
    { projectName: 'Data Analytics Dashboard', projectPriority: 'High',   projectEndDate: '2025-05-20' },
    { projectName: 'API Gateway Refactor',     projectPriority: 'Medium', projectEndDate: '2025-09-10' },
    { projectName: 'Customer Onboarding Flow', projectPriority: 'Medium', projectEndDate: '2025-07-25' },
    { projectName: 'Security Audit 2025',      projectPriority: 'High',   projectEndDate: '2025-06-01' },
];

console.log('🌱 Seeding Projects...');
const projectIds = [];
for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    // Assign a team only to 75% of projects
    const teamId = Math.random() > 0.25 ? teamIds[i % teamIds.length] : null;
    const result = await db.run(
        `INSERT INTO Projects (projectName, projectPriority, projectEndDate, fkTeamId)
         VALUES (?, ?, ?, ?)`,
        [p.projectName, p.projectPriority, p.projectEndDate, teamId]
    );
    projectIds.push(result.lastID);
}
console.log(`   ✓ ${projectIds.length} Projects`);


const taskTemplates = [
    { taskTitle: 'UI/UX Design Review',        taskDescription: 'Review the latest Figma mockups and provide feedback.',         taskPriority: 'High',   taskEndDate: '2026-05-10', defaultStatus: 'Done' },
    { taskTitle: 'Client Meeting Preparation',  taskDescription: 'Prepare agenda and slides for the upcoming client call.',      taskPriority: 'High',   taskEndDate: '2026-05-12', defaultStatus: 'Done' },
    { taskTitle: 'Project Review',              taskDescription: 'Conduct mid-sprint project review with the full team.',        taskPriority: 'Medium', taskEndDate: '2026-05-14', defaultStatus: 'Done' },
    { taskTitle: 'Write Unit Tests',            taskDescription: 'Add unit tests for the authentication module.',                taskPriority: 'Medium', taskEndDate: '2026-05-20', defaultStatus: 'InProgress' },
    { taskTitle: 'Database Schema Migration',   taskDescription: 'Migrate legacy schema to the new normalized structure.',       taskPriority: 'High',   taskEndDate: '2026-05-25', defaultStatus: 'InProgress' },
    { taskTitle: 'Update API Documentation',    taskDescription: 'Update Swagger docs to reflect the latest endpoint changes.',  taskPriority: 'Low',    taskEndDate: '2026-03-01', defaultStatus: 'InProgress' },
    { taskTitle: 'Performance Profiling',       taskDescription: 'Profile the dashboard load time and identify bottlenecks.',   taskPriority: 'Medium', taskEndDate: '2026-03-05', defaultStatus: 'OnHold' },
    { taskTitle: 'Accessibility Audit',         taskDescription: 'Run WCAG 2.1 AA audit on all public-facing pages.',           taskPriority: 'Low',    taskEndDate: '2026-02-10', defaultStatus: 'OnHold' },
    { taskTitle: 'Integrate Payment Gateway',   taskDescription: 'Connect Stripe API for subscription billing.',                taskPriority: 'High',   taskEndDate: '2026-04-30', defaultStatus: 'Overdue' },
    { taskTitle: 'Fix Login Redirect Bug',      taskDescription: 'Users are not being redirected correctly after OAuth login.', taskPriority: 'High',   taskEndDate: '2026-04-28', defaultStatus: 'Overdue' },
    { taskTitle: 'Deploy Staging Environment',  taskDescription: 'Set up Docker-based staging server on AWS EC2.',              taskPriority: 'Medium', taskEndDate: '2026-05-18', defaultStatus: 'Done' },
    { taskTitle: 'Code Review Sprint 7',        taskDescription: 'Review all PRs opened during sprint 7.',                      taskPriority: 'Low',    taskEndDate: '2026-05-22', defaultStatus: 'InProgress' },
    { taskTitle: 'Design Email Templates',      taskDescription: 'Create branded HTML email templates for notifications.',      taskPriority: 'Low',    taskEndDate: '2026-05-28', defaultStatus: 'OnHold' },
    { taskTitle: 'Security Pen Test',           taskDescription: 'Schedule and coordinate third-party penetration testing.',    taskPriority: 'High',   taskEndDate: '2026-05-01', defaultStatus: 'Overdue' },
    { taskTitle: 'Refactor State Management',   taskDescription: 'Replace Redux with Zustand in the frontend app.',             taskPriority: 'Medium', taskEndDate: '2026-01-01', defaultStatus: 'InProgress' },
];

console.log('🌱 Seeding Tasks...');
const taskIds = [];

for (const u of userIds) {
    const numberOfTasksForUser = Math.floor(Math.random() * 51) + 50;

    for (let i = 0; i < numberOfTasksForUser; i++) {
        const randomTemplate = taskTemplates[Math.floor(Math.random() * taskTemplates.length)];
        
        let currentStatus = randomTemplate.defaultStatus;
        let taskClosedValue = null;

        if (Math.random() < 0.70) {
            currentStatus = 'Done';
        }

        if (currentStatus === 'Done') {
            const now = new Date();
            const randomDaysAgo = Math.floor(Math.random() * 45);
            
            let effectiveDaysAgo = randomDaysAgo;
            if (Math.random() < 0.3) {
                effectiveDaysAgo = Math.floor(randomDaysAgo / 7) * 7; 
            }

            const taskDate = new Date(now.getTime() - effectiveDaysAgo * 24 * 60 * 60 * 1000);
            taskClosedValue = taskDate.toISOString().split('T')[0];
        }

        const result = await db.run(
            `INSERT INTO Tasks (taskTitle, taskDescription, taskPriority, taskEndDate, taskStatus, taskClosed, fkUserId)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                randomTemplate.taskTitle, 
                randomTemplate.taskDescription, 
                randomTemplate.taskPriority, 
                randomTemplate.taskEndDate, 
                currentStatus, 
                taskClosedValue, 
                u
            ]
        );
        taskIds.push(result.lastID);
    }
}
console.log(`   ✓ ${taskIds.length} Gesamt-Tasks verteilt generiert.`);


console.log('🌱 Seeding ProjectUserTable...');
let puCount = 0;
for (let i = 0; i < projectIds.length; i++) {
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


console.log('🌱 Seeding ProjectTasksTable...');
let ptCount = 0;
for (let i = 0; i < projectIds.length; i++) {
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
