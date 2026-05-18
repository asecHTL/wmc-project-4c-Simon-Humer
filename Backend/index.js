'use strict';

import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';



const dbFilePath = path.join(process.cwd(), 'database.sqlite');
if (fs.existsSync(dbFilePath)) {

    fs.unlinkSync(dbFilePath);
}


const db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
});


await db.exec(`
    CREATE TABLE Users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email Text not null,
    password text not null,
    firstname text not null,
    lastname text not null,
    birthday date not null
)
`);


await db.exec(`
    CREATE TABLE Projects (
    projectId INTEGER PRIMARY KEY AUTOINCREMENT,
    projectName TEXT NOT NULL,
    projectPriority Text not null,
    projectEndDate Date not null

)
`);

await db.exec(`
    CREATE TABLE Tasks (
    taskId INTEGER PRIMARY KEY AUTOINCREMENT,
    taskTitle TEXT NOT NULL,
    taskDescription Text not null,
    taskPriority Text not null,
    taskEndDate Date not null,
    fkUserId Integer not null,

    FOREIGN KEY (fkUserId) REFERENCES Users(userId)
)
`);


await db.exec(`
    CREATE TABLE ProjectUserTable (
    projectUserTableId INTEGER PRIMARY KEY AUTOINCREMENT,
    fkProjectId Integer not null,
    fkUserId Integer not null,

    FOREIGN KEY (fkUserId) REFERENCES users(userId),
    FOREIGN KEY (fkProjectId) REFERENCES Projects(projectId)

    
)
`);

await db.exec(`
    CREATE TABLE ProjectTasksTable (
    ProjectTasksTable INTEGER PRIMARY KEY AUTOINCREMENT,
    fkProjectId Integer not null,
    fkTaskId Integer not null,

    FOREIGN KEY (fkProjectId) REFERENCES Projects(projectId),
    FOREIGN KEY (fkTaskId) REFERENCES Tasks(taskId)
    
)
`);




import express from 'express';
const app = express();
const port = 3000;

app.get('', (req, res) => {
    
});






app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
