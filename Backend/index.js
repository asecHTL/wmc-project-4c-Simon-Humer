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
        birthday DATE
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

app.get('/dashboard/personalNextTasks{/:userId}', (req, res) => {
    const { userId } = req.body || {};
    const tasks = await db.get('Select * from Tasks where fkUserId = ? LIMIT 3', [userId]);
    if (tasks === null) {
        return res.status(401).send('No tasks for the given user');
    } else {
        return res.json(tasks);
    }

});

app.get('/dashboard/overviewPersonalTasks{/:userId}', async (req, res) => {
    try {
        const { userId } = req.params; 
        
        const tasks = await db.get('Select * from Tasks where fkUserId = ?', [userId]) || [];

        const statusOverview = tasks.reduce((acc, task) => {
            const status = task.taskStatus;
            
            if (['Done', 'InProgress', 'OnHold', 'Overdue'].includes(status)) {
                acc[status] = (acc[status] || 0) + 1;
            }
            
            return acc;
        }, { Done: 0, InProgress: 0, OnHold: 0, Overdue: 0 }); 

        res.json(statusOverview);

    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});


app.get('/dashboard/tasksByPriority{/:userId}', async (req, res) => {
    try {
        const { userId } = req.params; 
        
        const tasks = await db.get('Select * from Tasks where fkUserId = ?', [userId]) || [];

        const taskPriority = tasks.reduce((acc, task) => {
            const priority = task.taskPriority;
            
            if (['High', 'Medium', 'Low'].includes(priority)) {
                acc[priority] = (acc[priority] || 0) + 1;
            }
            
            return acc;
        }, { Done: 0, InProgress: 0, OnHold: 0, Overdue: 0 }); 

        res.json(taskPriority);

    } catch (error) {
        res.status(500).json({ error: 'Datenbankfehler', details: error.message });
    }
});




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
