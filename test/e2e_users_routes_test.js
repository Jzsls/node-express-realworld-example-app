//process.env.NODE_ENV = 'REST API TEST';

const chai = require('chai');
const should = chai.should() ;
const chaiHttp = require('chai-http');
var mongoose = require('mongoose');

// importing our server
const server = require('../app.js');
var router = require('../routes/index');
// Import User Model
const User = require('../models/User.js');
// use chaiHttp for making the actual HTTP requests 
chai.use(chaiHttp);
var key;
describe('e2e test : users API route',() =>{

    // testing the user registration route

    describe('PUT /api/users', ()=>{
        it('should register a new user',(done)=>{
            chai.request(server)
            .post('/api/users')
            .send({
                "user":{
                    "username":"luck",
                    "email": "luck_j@gmail.com",
                    "password": "luck123"} })
            .end((err, res) =>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.user.should.have.property('username');
                res.body.user.should.have.property('email');
                res.body.user.should.have.property('token');
            done();    
            });
        });

        it('should not register already registered user',(done)=>{
            chai.request(server)
            .post('/api/users')
            .send({
                "user":{
                    "username":"luck",
                    "email": "luck_j@gmail.com",
                    "password": "luck123"} })
            .end((err, res) =>{
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('username').eq('is already taken.');
                res.body.errors.should.have.property('email').eq('is already taken.');
            done();    
            });
        });

        it('should not register user with no username',(done)=>{
            chai.request(server)
            .post('/api/users')
            .send({
                "user":{
                    "username":"",
                    "email": "deni@gmail.com",
                    "password": "deni123"} })
            .end((err, res) =>{
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('username').eq("can't be blank");
            done();    
            });
        });

        it('should not register user with no email',(done)=>{
            chai.request(server)
            .post('/api/users')
            .send({
                "user":{
                    "username":"deni",
                    "email": "",
                    "password": "deni123"} })
            .end((err, res) =>{
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('email').eq("can't be blank");
            done();    
            });
        });

        it.skip('should not register user with no password',(done)=>{
            chai.request(server)
            .post('/api/users')
            .send({
                "user":{
                    "username":"deni",
                    "email": "deni@gmail.com",
                    "password": ""} })
            .end((err, res) =>{
                res.should.have.status(422);
            done();    
            });
        });
    });

    // testing the user login route
    describe('PUT /api/users/login', ()=>{
        it('should login a registered user',(done)=>{
            chai.request(server)
            .post('/api/users/login')
            .send({
                "user":{
                    "email": "luck_j@gmail.com",
                    "password": "luck123"} })
            .end((err, res) =>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('user');
                res.body.user.should.have.property('username');
                res.body.user.should.have.property('email');
                res.body.user.should.have.property('token');
                key = res.body.user.token;
            done();    
            });
        });

        it('should not login an unregistered user',(done)=>{
            chai.request(server)
            .post('/api/users/login')
            .send({
                "user":{
                    "email": "daby@gmail.com",
                    "password": "daby123"} })
            .end((err, res) =>{
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('email or password').eq('is invalid');
            done();    
            });
        });

        it('should not login if email is missing',(done)=>{
            chai.request(server)
            .post('/api/users/login')
            .send({
                "user":{
                    "email": "",
                    "password": "luck123"} })
            .end((err, res) =>{
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('email').eq("can't be blank");
            done();    
            });
        });

        it('should not login if password is missing',(done)=>{
            chai.request(server)
            .post('/api/users/login')
            .send({
                "user":{
                    "email": "luck_j@gmail.com",
                    "password": ""} })
            .end((err, res) =>{
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('password').eq("can't be blank");
            done();    
            });
        });

        it('should not login if both email and password are missing',(done)=>{
            chai.request(server)
            .post('/api/users/login')
            .send({
                "user":{
                    "email": "",
                    "password": ""} })
            .end((err, res) =>{
                res.should.have.status(422);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('email').eq("can't be blank");
            done();    
            });
        });
    });

    // testing the user GET route
    describe('GET /api/user', ()=>{
        it('should fetch a specific authorized user only',(done)=>{
            chai.request(server)
            .get('/api/user')
            .set('Authorization', 'Bearer ' + key, 'Content-Type','application/json')
            .end((err, res) =>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('user');
                res.body.user.should.have.property('username').eq('luck');
                res.body.user.should.have.property('email').eq('luck_j@gmail.com');
            done();    
            }).timeout(600);
        });
        it('should not fetch a specific user if not authorized',(done)=>{
            chai.request(server)
            .get('/api/user')
            //.set('Authorization', 'Bearer ' + "")
            .end((err, res) =>{
                res.should.have.status(401);
            done();    
            });
        })    
    });

    // testing users PUT route 
    describe('PUT /api/user', ()=>{
        it('should edit pre-populated properties of authorized user only',(done)=>{
            chai.request(server)
            .put('/api/user')
            .set('Authorization', 'Bearer ' + key)
            .send({
                "user":{
                    "username": "lucky"} })
            .end((err, res) =>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('user');
                res.body.user.should.have.property('email').eq('luck_j@gmail.com');
            done();    
            });
        });

        it('should not edit pre-populated properties of un-authorized user',(done)=>{
            chai.request(server)
            .put('/api/user')
            .set('Authorization', 'Bearer ' + 'token')
            .send({
                "user":{
                    "username": "lucky"} })
            .end((err, res) =>{
                res.should.have.status(401);
            done();    
            });
        });
    });    
});
