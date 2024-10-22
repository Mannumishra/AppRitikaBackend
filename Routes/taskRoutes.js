const express = require('express');
const { uploadTasks, getTask, updateTask } = require('../Controllers/taskController');
const upload = require('../Middleware/Multer');
const TaskRouter = express.Router();

TaskRouter.post('/upload-task', upload.single('file'), uploadTasks);
TaskRouter.get('/get-all-task', getTask);
TaskRouter.put('/update-task/:id', updateTask);

module.exports = TaskRouter;
