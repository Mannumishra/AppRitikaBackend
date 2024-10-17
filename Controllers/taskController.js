const ExcelJS = require('exceljs');
const fs = require('fs');
const TaskModel = require('../Models/TaskModel');

const uploadTasks = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.worksheets[0];

        const tasks = [];

        // Function to parse the date in dd-mm-yyyy format
        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('-');
            return new Date(`${year}-${month}-${day}`);
        };

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip the header row
                const task = {
                    assignDate: parseDate(row.getCell(2).value), // Assuming the date is in column B in dd-mm-yyyy format
                    bankName: row.getCell(3).value, // Assuming the bank name is in column C
                    product: row.getCell(4).value, // Assuming the product is in column D
                    applicantName: row.getCell(5).value, // Assuming the applicant name is in column E
                    address: row.getCell(6).value, // Assuming the address is in column F
                    contactNumber: row.getCell(7).value, // Assuming the contact number is in column G
                    trigger: row.getCell(8).value, // Assuming the trigger is in column H
                    verifierNameOrId: row.getCell(9).value, // Assuming verifier name/id is in column I
                    teamLeaderOrId: row.getCell(10).value // Assuming team leader/id is in column J
                };
                tasks.push(task);
            }
        });

        // Check for existing records based on multiple fields
        const existingTasks = await TaskModel.find({
            $or: tasks.map(task => ({
                assignDate: task.assignDate,
                bankName: task.bankName,
                product: task.product,
                applicantName: task.applicantName,
                contactNumber: task.contactNumber
            }))
        });

        // Filter out records that already exist in the database
        const existingRecords = new Set(existingTasks.map(task =>
            `${task.assignDate}-${task.bankName}-${task.product}-${task.applicantName}-${task.contactNumber}`
        ));

        const newTasks = tasks.filter(task => {
            const taskKey = `${task.assignDate}-${task.bankName}-${task.product}-${task.applicantName}-${task.contactNumber}`;
            return !existingRecords.has(taskKey); // Insert only if the task doesn't exist
        });

        if (newTasks.length > 0) {
            await TaskModel.insertMany(newTasks);
            res.status(200).json({
                message: `${newTasks.length} new tasks added successfully.`,
            });
        } else {
            res.status(200).json({
                message: 'No new tasks to add. All records already exist.',
            });
        }

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error("Error uploading tasks:", error);
        res.status(500).json({ message: 'Error uploading tasks', error });
    }
};

const getTask = async (req, res) => {
    try {
        const tasks = await TaskModel.find()
        if (!tasks) {
            return res.status(404).json({
                success: false,
                message: "Task Not Found",
            })
        }
        res.status(200).json({
            success: true,
            message: "Task Found Successfully",
            data: tasks
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

module.exports = {
    uploadTasks, getTask
};
