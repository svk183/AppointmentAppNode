import express, { Request, Response , Application, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { dbOperations } from './db/dbUtils';
import { Constants } from './constants';
import { getDateFromString } from './utils';
import { mongo } from 'mongoose';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

app.use(express.json());

app.post('/login', async (req: Request, res: Response) => {
    const user = await dbOperations.findOne(Constants.DB_NAMES.USERS, {userName: req.body.userName, password: req.body.password});

    if(user) {
        // Cookie available for 30 mins
        res.cookie('authCode',JSON.stringify({userName: req.body.userName, isAdmin: user.isAdmin}), 
        { maxAge: 1000 * 60 * 30, httpOnly: true, secure: true, sameSite:'none', path: '/' });
        res.status(200).send({message: 'Login Success'});
    } else {
        res.status(400).send({message: 'Invalid userName/password'});
    }
});

app.post('/register', async (req: Request, res: Response) => {
    if(req.body.canCreate) {
        if(req.body.userName?.length > 5 && req.body.password?.length > 5){
            const user = await dbOperations.findOne(Constants.DB_NAMES.USERS, {userName: req.body.userName});
        
            if(user) {
                res.status(200).send({message: 'user already exist'});
            } else {
                dbOperations.insertOne(Constants.DB_NAMES.USERS, {userName: req.body.userName, password: req.body.password, isAdmin: req.body.isAdmin || false})
                res.status(200).send({message: 'User Created'});
            }
        } else {
            res.status(400).send({message: 'Username and password should be min 5 chars length'});
        }
    } else {
        res.status(403).send({message: 'UnAuthorised'});
    }
});

app.use((req: Request, res: Response, next: NextFunction) => {
    if(req.cookies.authCode) {
        req.body.userName = JSON.parse(req.cookies.authCode).userName;
        req.body.isAdmin = JSON.parse(req.cookies.authCode).isAdmin;
        next();
    } else {
        res.status(403).send({message: 'UnAuthorised Access'});
    }
});

app.get('/appointments', async (req: Request, res: Response) => {
    res.status(200).send({appointments:await dbOperations.findMutli(Constants.DB_NAMES.APPOINTMENTS, {status: Constants.APPOINTMENT_STATUS.ACCEPTED, appointmentTime: {$gt: new Date().getTime()}})})
});


app.get('/approveAppointment/:id/:status', async (req: Request, res: Response) => {
    if(req.body.isAdmin) {
        const status = req.params.status === 'approved' ? Constants.APPOINTMENT_STATUS.ACCEPTED : Constants.APPOINTMENT_STATUS.REJECTED;
        await dbOperations.updateOne(Constants.DB_NAMES.APPOINTMENTS, {_id: new mongo.ObjectId(req.params.id)}, {status}, false);
        res.status(200).send({message: 'updated successfully'});
    } else {
        res.status(403).send({message: 'UnAuthorised Access'});
    }
});

app.get('/pendingAppointments', async (req: Request, res: Response) => {
    res.status(200).send({appointments:await dbOperations.findMutli(Constants.DB_NAMES.APPOINTMENTS, {status: Constants.APPOINTMENT_STATUS.PENDING, appointmentTime: {$gt: new Date().getTime()}})})
});

app.post('/addAppointment', async (req: Request, res: Response) => {
    await dbOperations.insertOne(Constants.DB_NAMES.APPOINTMENTS, {
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        appointmentTime: getDateFromString(req.body.date + ' ' + req.body.startTime),
        department: req.body.department,
        location: req.body.location,
        subject: req.body.subject,
        participants: req.body.participants,
        phoneNumber: req.body.phoneNumber,
        status: Constants.APPOINTMENT_STATUS.PENDING
    });
    res.status(200).send({message: 'Appointment Created Successfully!'})
});

(async () => {
    await dbOperations.connectToDB();
})();

app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});