import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import screenshotRouter from './routes/screenshot.router';
import aiSelectorsRouter from './routes/ai-selectors.router';
import elementDetails from './routes/element-details.router';
import aiFrameworkFiles from './routes/ai-create-framework-files.router';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/ai-selectors', aiSelectorsRouter);
app.use('/screenshot', screenshotRouter);
app.use('/element-details', elementDetails);
app.use('/ai-framework-files', aiFrameworkFiles);

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
