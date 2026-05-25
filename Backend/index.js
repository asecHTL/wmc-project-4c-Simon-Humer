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
        projectEndDate DATE NOT NULL
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
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
        console.warn('Warning: Request body is empty.');
    }

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
    if (tasks === null) {
        return res.status(401).send('No tasks for the given user');
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

            console.log(entry);
        });


        res.json(taskOverviewPriority);

    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.get('/dashboard/personalTasksDoneGraph/:userId', async (req, res) => {
    try {
        const { userId } = req.params;


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



        res.json(tasksStatistic);

    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});

app.get('/profile/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await db.get('Select * from Users where userId = ?', [userId]);
        if (user === null) {
            res.status(405).send('No user found with the given Id');
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


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
