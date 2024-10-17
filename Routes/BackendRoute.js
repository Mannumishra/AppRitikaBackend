const express = require('express');
const { signupBacken, getBackends, deleteBackend } = require('../Controllers/BackendController');


const BackendRouter = express.Router();

BackendRouter.post('/backend/signup', signupBacken);
BackendRouter.get('/get-backend-record', getBackends);
BackendRouter.delete('/delete-backend-record', deleteBackend);

module.exports = BackendRouter;
