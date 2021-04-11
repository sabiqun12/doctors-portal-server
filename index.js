const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ooccc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


app.get('/', (req, res) => {
    res.send('hello from db');
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointments");
    const doctorCollection = client.db("doctorsPortal").collection("doctor");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log(appointment)
        appointmentCollection.insertOne(appointment)
            .then(result => {
                // console.log(result.insertedCount);
                res.send(result.insertedCount > 0)

            })
    });

    app.post('/appointments', (req, res) => {
        const dateUser = req.body;
        const email = req.body.email;
        //console.log(dateUser.date)
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { date: dateUser.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        console.log(email, dateUser.date, doctors, documents)
                        res.send(documents);
                    })
            })
    });

    app.get('/allAppointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });


    app.post('/addDoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorCollection.insertOne({ name, email, image })
        .then(result => {
            res.send(result.insertedCount > 0)

        })
    })

    // app.post('/addDoctor', (req, res) => {
    //     const file = req.files.file;
    //     const name = req.body.name;
    //     const email = req.body.email;
    //     console.log(name, email, file);
    //     const filePath = `${__dirname}/doctors/${file.name}`;
    //     file.mv(filePath, err => {
    //         if (err) {
    //             console.log(err)
    //             res.status(500).send({ msg: 'failed to upload image' });
    //         }
    //          const newImg = fs.readFileSync(filePath);
    //          const encImg = newImg.toString('base64');

    //          var image = {
    //             contentType: file.mimetype,
    //             size: file.size,
    //             img: Buffer.from(encImg, 'base64')
    //         };

    //         //  return res.send({name: file.name, path:`/${file.name}`});
    //         // doctorCollection.insertOne({ name, email, img: file.name }) 
    //         doctorCollection.insertOne({ name, email, image })
    //             .then(result => {
    //                 fs.remove(filePath, err => {
    //                     if(err){
    //                        console.log(err)
    //                        res.status(500).send({ msg: 'failed to upload image' });
    //                 }
    //                     res.send(result.insertedCount > 0)
    //                     console.log(result.insertedCount);
    //                 })
    //                 // console.log(result.insertedCount);
                   
    //             })
    //     })


    // })
    // app.post('/addDoctor', (req, res) => {
    //     const imgFile = req.files.file;
    //     const name = req.body.name;
    //     const email = req.body.email;
    //     //console.log(name, email, imgFile);
    //     imgFile.mv(`${__dirname}/doctors/${imgFile.name}`)

    //    doctorCollection.insertOne({name, email, imgFile})
    //    .then(result => {
    //        console.log(result.insertedCount);
    //        res.send(result.insertedCount > 0)
    //    })
    // })


    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })



});


//   client.close();

app.listen(process.env.PORT || port)