'use strict';

import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';

const dbFilePath = path.join(process.cwd(), 'database.sqlite');

const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
});

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
    CREATE TABLE IF NOT EXISTS Projects (
        projectId INTEGER PRIMARY KEY AUTOINCREMENT,
        projectName TEXT NOT NULL,
        projectPriority TEXT NOT NULL,
        projectEndDate DATE NOT NULL,
        projectStatus Text not null,
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
        taskStatus Text,
        taskClosed Date,
        fkUserId INTEGER NOT NULL,
        FOREIGN KEY (fkUserId) REFERENCES Users(userId)
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
    CREATE TABLE IF NOT EXISTS TeamUserTable (
        teamUserId INTEGER PRIMARY KEY AUTOINCREMENT,
        fkUserId Integer,
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

const app = express();
const port = 3000;

app.use(cors());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/users', async (req, res) => {
    try {
        const users = await db.all('SELECT userId, firstname, lastname, email, username FROM Users');
        return res.json(users || []);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/user/register', async (req, res) => {
    const { username, email, password, firstname, lastname } = req.body || {};

    if (username && email && password && firstname && lastname) {
        try {
            const existingUser = await db.get('SELECT * FROM Users WHERE username = ? OR email = ?', [username, email]);
            if (existingUser) {
                return res.status(409).send('Username or Email already exists');
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await db.run(`
                INSERT INTO Users (username, email, password, firstname, lastname) 
                VALUES (?, ?, ?, ?, ?)
            `, [username, email, hashedPassword, firstname, lastname]);

            return res.status(201).json({ username, email, firstname, lastname });
        } catch (error) {
            console.error(error);
            return res.status(500).send("Database error during registration");
        }
    } else {
        return res.status(400).send('Missing params for registration');
    }
});

app.post('/user/login', async (req, res) => {
    console.log('--- New Login Request ---');
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const user = await db.get('SELECT * FROM Users WHERE username = ?', [username]);

        if (!user) {
            return res.status(404).send('No user found with the given username');
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const { password, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        } else {
            return res.status(401).send('Given Password is not valid!');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/dashboard/personalNextTasks/:userId', async (req, res) => {
    const { userId } = req.params || {};
    const tasks = await db.all('Select * from Tasks where fkUserId = ? LIMIT 3', [userId]);
    if (!tasks || tasks.length === 0) {
        return res.status(404).send('No tasks for the given user');
    } else {
        return res.json(tasks);
    }
});

app.get('/dashboard/overviewPersonalTasks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await db.all('Select * from Tasks where fkUserId = ?', [userId]) || [];

        const statusOverview = [
            { status: 'Done', count: 0 },
            { status: 'InProgress', count: 0 },
            { status: 'OnHold', count: 0 },
            { status: 'Overdue', count: 0 },
        ];

        tasks.forEach(task => {
            const entry = statusOverview.find(s => s.status === task.taskStatus);
            if (entry) entry.count++;
        });

        res.json(statusOverview);
    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.get('/dashboard/tasksByPriority/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await db.all('Select * from Tasks where fkUserId = ?', [userId]) || [];

        const taskOverviewPriority = [
            { status: 'High', count: 0 },
            { status: 'Medium', count: 0 },
            { status: 'Low', count: 0 },
        ];

        tasks.forEach(task => {
            const entry = taskOverviewPriority.find(s => s.status === task.taskPriority);
            if (entry) entry.count++;
        });

        res.json(taskOverviewPriority);
    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.get('/dashboard/personalTasksDoneGraph/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { taskGraphDate } = req.query;

        const query = `
            SELECT taskClosed AS date, COUNT(*) AS count 
            FROM Tasks 
            WHERE fkUserId = ? 
              AND taskStatus = 'Done' 
              AND taskClosed IS NOT NULL
            GROUP BY taskClosed
            ORDER BY taskClosed ASC
        `;

        const tasksStatistic = await db.all(query, [userId]) || [];

        if (taskGraphDate) {
            let taskGraphDateTasksFiltered = [];
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            let dateUntil = new Date(currentDate);

            switch (taskGraphDate) {
                case '1W':
                    dateUntil.setDate(currentDate.getDate() - 7);
                    break;
                case '1M':
                    dateUntil.setMonth(currentDate.getMonth() - 1);
                    break;
                case '1Y':
                    dateUntil.setFullYear(currentDate.getFullYear() - 1);
                    break;
                default:
                    dateUntil = null;
            }

            if (dateUntil) {
                taskGraphDateTasksFiltered = tasksStatistic.filter(x => {
                    const taskDate = new Date(x.date);
                    return taskDate >= dateUntil;
                });
                return res.json(taskGraphDateTasksFiltered);
            }
        }

        res.json(tasksStatistic);
    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.get('/profile/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await db.get('Select * from Users where userId = ?', [userId]);
        if (!user) {
            res.status(404).send('No user found with the given Id');
        } else {
            return res.json(user);
        }
    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.delete('/profile/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.run('DELETE FROM Users WHERE userId = ?', [userId]);
        if (result.changes > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.put('/profile/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await db.get('SELECT * FROM Users WHERE userId = ?', [userId]);

        if (user) {
            const firstname = req.body.firstname || user.firstname;
            const lastname = req.body.lastname || user.lastname;
            const email = req.body.email || user.email;
            const birthday = req.body.birthday || user.birthday;
            const password = req.body.password || user.password;
            const username = req.body.username || user.username;
            const language = req.body.language || user.language;

            await db.run(
                `UPDATE Users 
                 SET firstname = ?, lastname = ?, email = ?, birthday = ?, password = ?, username = ?, language = ? 
                 WHERE userId = ?`,
                [firstname, lastname, email, birthday, password, username, language, userId]
            );

            res.json({ userId, firstname, lastname, email, birthday, username, language });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put('/user/language/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { language } = req.body;

        if (!language) {
            return res.status(400).send('Language is required');
        }

        const result = await db.run(
            'UPDATE Users SET language = ? WHERE userId = ?',
            [language, userId]
        );

        if (result.changes > 0) {
            res.json({ userId, language });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/teamUserTable/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const result = await db.all(`
            SELECT t.teamId, t.teamName, t.adminId
            FROM Team t 
            JOIN TeamUserTable tu ON t.teamId = tu.fkTeamId 
            WHERE tu.fkUserId = ?
        `, [userId]);

        return res.json(result || []);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/team/:teamId', async (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const result = await db.get('SELECT * FROM Team WHERE teamId = ?', [teamId]);

        if (result) {
            return res.json(result);
        } else {
            return res.status(404).send('Team not found');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/team', async (req, res) => {
    const { teamCreationDate, adminId, teamName } = req.body || {};

    if (!teamCreationDate || !adminId || !teamName) {
        return res.status(400).send('Missing Details for creation');
    }

    try {
        const result = await db.run(`
            INSERT INTO Team (teamCreationDate, adminId, teamName) 
            VALUES (?, ?, ?)
        `, [teamCreationDate, adminId, teamName]);

        const teamId = result.lastID;

        await db.run(`
            INSERT INTO TeamUserTable (fkUserId, fkTeamId) 
            VALUES (?, ?)
        `, [adminId, teamId]);

        return res.status(201).json({ teamId, teamCreationDate, adminId, teamName });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/teamUserTable/:teamId', async (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const userId = parseInt(req.query.userId);

        if (!userId) {
            return res.status(400).send('userId is required');
        }

        const teamExists = await db.get('SELECT * FROM Team WHERE teamId = ?', [teamId]);

        if (teamExists) {
            const alreadyInTeam = await db.get('SELECT * FROM TeamUserTable WHERE fkUserId = ? AND fkTeamId = ?', [userId, teamId]);
            if (alreadyInTeam) {
                return res.status(409).send('User is already a member of this team');
            }

            const result = await db.run(`
                INSERT INTO TeamUserTable (fkUserId, fkTeamId) 
                VALUES (?, ?)
            `, [userId, teamId]);

            let teamUserTableId = result.lastID;
            return res.json({ teamUserTableId, fkUserId: userId, fkTeamId: teamId });
        } else {
            return res.status(404).send('teamId not found');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/team/:teamId/members', async (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const members = await db.all(`
            SELECT u.userId, u.firstname, u.lastname, u.email, u.username
            FROM Users u
            JOIN TeamUserTable tu ON u.userId = tu.fkUserId
            WHERE tu.fkTeamId = ?
        `, [teamId]);

        return res.json(members || []);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/team/:teamId', async (req, res) => {
    const { teamId } = req.params;
    try {
        await db.run('DELETE FROM TeamUserTable WHERE fkTeamId = ?', [teamId]);
        const result = await db.run('DELETE FROM Team WHERE teamId = ?', [teamId]);

        if (result.changes > 0) {
            return res.status(204).send();
        } else {
            return res.status(404).send('Team not found');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

// Get Projects assigned to user
app.get('/projects/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const projects = await db.all(`
            SELECT p.*
            FROM Projects p
            JOIN ProjectUserTable pu ON p.projectId = pu.fkProjectId
            WHERE pu.fkUserId = ?
        `, [userId]);

        return res.json(projects || []);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add Project
app.post('/project/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { projectName, projectPriority, projectEndDate, projectStatus, fkTeamId } = req.body || {};

        if (!userId || !projectName) {
            return res.status(400).send('userId and projectName are required');
        }

        const resultProject = await db.run(`
            INSERT INTO Projects (projectName, projectPriority, projectEndDate, projectStatus, fkTeamId) 
            VALUES (?, ?, ?, ?, ?)
        `, [projectName, projectPriority, projectEndDate, projectStatus || 'InProgress', fkTeamId]);

        const projectId = resultProject.lastID;

        await db.run(`
            INSERT INTO ProjectUserTable (fkUserId, fkProjectId) 
            VALUES (?, ?)
        `, [userId, projectId]);

        return res.json({ fkUserId: userId, fkProjectId: projectId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add users for existing Project
app.post('/projectUserTable/:projectId', async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const userId = parseInt(req.query.userId);

        if (!projectId || !userId) {
            return res.status(400).send('userId and projectId are required');
        }

        await db.run(`
            INSERT INTO ProjectUserTable (fkProjectId, fkUserId) 
            VALUES (?, ?)
        `, [projectId, userId]);

        return res.json({ fkUserId: userId, fkProjectId: projectId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Users for existing Project
app.delete('/projectUserTable/:projectId', async (req, res) => {
    const { userId } = req.query;
    const { projectId } = req.params;

    try {
        const result = await db.run('DELETE FROM ProjectUserTable WHERE fkUserId = ? AND fkProjectId = ?', [userId, projectId]);

        if (result.changes > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('Relation not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

// Add Sub Tasks for existing Project
app.post('/projectTaskTable/:projectId', async (req, res) => {
    const { taskTitle, taskDescription, taskPriority, taskEndDate, fkUserId } = req.body;

    try {
        const projectId = parseInt(req.params.projectId);

        if (!projectId || !taskTitle || !taskDescription || !taskPriority || !taskEndDate || !fkUserId) {
            return res.status(400).send('Missing properties required for Task creation!');
        }

        const resultTask = await db.run(`
            INSERT INTO Tasks (taskTitle, taskDescription, taskPriority, taskEndDate, fkUserId) 
            VALUES (?, ?, ?, ?, ?)
        `, [taskTitle, taskDescription, taskPriority, taskEndDate, fkUserId]);

        const taskId = resultTask.lastID;

        await db.run(`
            INSERT INTO ProjectTasksTable (fkProjectId, fkTaskId) 
            VALUES (?, ?)
        `, [projectId, taskId]);

        return res.json({ fkUserId: fkUserId, fkProjectId: projectId, fkTaskId: taskId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Sub Task for existing Project
app.delete('/projectTaskTable/:projectId', async (req, res) => {
    const { taskId } = req.query;
    const { projectId } = req.params;

    try {
        const result = await db.run('DELETE FROM ProjectTasksTable WHERE fkProjectId = ? AND fkTaskId = ?', [projectId, taskId]);

        if (result.changes > 0) {
            res.status(204).send();
        } else {
            res.status(404).send('Task relationship not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

// Project Overview for loggedin User
app.get('/project/overview/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        const projects = await db.all(`
            SELECT p.projectStatus
            FROM Projects p
            JOIN ProjectUserTable pu ON p.projectId = pu.fkProjectId
            WHERE pu.fkUserId = ?
        `, [userId]) || [];

        const statusOverview = [
            { status: 'Done', count: 0 },
            { status: 'InProgress', count: 0 },
            { status: 'OnHold', count: 0 },
            { status: 'Overdue', count: 0 },
        ];

        projects.forEach(p => {
            const entry = statusOverview.find(s => s.status === p.projectStatus);
            if (entry) entry.count++;
        });

        res.json(statusOverview);
    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});