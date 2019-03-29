// routes/routes.js
const mysql = require('mysql');
const bodyParser = require('body-parser');
const config = require('../config/mainconf');
const fs = require("fs");
const fsextra = require('fs-extra');
const request = require("request");
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const async = require('async');
const crypto = require('crypto');
const rimraf = require("rimraf");
const mkdirp = require("mkdirp");
const multiparty = require('multiparty');
const path    = require('path');
// var exec = require('child_process').exec, child;

const upload_Dir = config.Upload_Dir; //contains pending and rejected
const geoData_Dir = config.GeoData_Dir; //approve folder
const Delete_Dir = config.Delete_Dir; //trash folder
const downloadPath = config.Download_Path;
const con_CS = mysql.createConnection(config.commondb_connection);
const num_backups = config.num_backups;
const download_interval = config.download_interval;

const fileInputName = process.env.FILE_INPUT_NAME || "qqfile";
const maxFileSize = process.env.MAX_FILE_SIZE || 0; // in bytes, 0 for unlimited

let transactionID, myStat, myVal, myErrMsg, token, errStatus, mylogin;
let today, date2, date3, time2, time3, dateTime, tokenExpire;
let downloadFalse = true;

const smtpTrans = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'aaaa.zhao@g.northernacademy.org',
        pass: "12344321"
    }
});

con_CS.query('USE ' + config.Login_db); // Locate Login DB

module.exports = function (app, passport) {

    removeFile();
    setInterval(copyXML, download_interval); // run the function one time a (day
    // setInterval(predownloadXml, 3660000);

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cors({
        origin: '*',
        credentials: true
    }));

    // =====================================
    // CS APP Home Section =================
    // =====================================

    app.get('/',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        // res.render('homepage.ejs');
        res.render('homepage.ejs', {
            message: req.flash('loginMessage'),
            error: "Your username and password don't match."
        })
    });

    // function downloadImage () {
    //     // const url = 'http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities';
    //     const url = 'https://unsplash.com/photos/AaEQmoufHLk/download?force=true';
    //     const downloadDir = path.resolve(__dirname, downloadPath, 'code1.jpg');
    //
    //     request(url).pipe(fs.createWriteStream(downloadDir));
    //     fs.createWriteStream(downloadDir).end();
    //
    // }

    // downloadImage();

    app.get('/homepageLI', isLoggedIn, function (req, res) {
        let myStat = "SELECT userrole FROM UserLogin WHERE username = '" + req.user.username + "';";
        let state2 = "SELECT firstName FROM UserProfile WHERE username = '" + req.user.username + "';";

        con_CS.query(myStat + state2, function (err, results, fields) {
            if (!results[0][0].userrole) {
                console.log("Error2");
            } else if (!results[1][0].firstName) {
                console.log("Error1")
            } else {
                console.log(req.user);
                res.render('homepageUSER.ejs', {
                    user: req.user, // get the user out of session and pass to template
                    firstName: results[1][0].firstName,
                    lastName: results[1][0].lastName
                });
            }
        });
    });

    app.get('/position',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        var layername = req.query.layername;
        // console.log("Layername Below: ");
        // console.log(layername);
        var parsedLayers = layername.split(",");
        // console.log("Parsed Layers: ");
        // console.log(parsedLayers);

        con_CS.query('SELECT LayerName, Longitude, Latitude, Altitude, ThirdLayer FROM LayerMenu WHERE LayerName = ?', parsedLayers[0], function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "no result found!"});
            } else {
                res.json(results);
                // console.log("Results:");
                // console.log(results);
            }
        });
        // con_CS.query("SELECT LayerName, Longitude, Latitude, Altitude, ThirdLayer FROM LayerMenu Where LayerName = ?", parsedLayers[0], function (err, results) {
        //     console.log (results);
        //     res.json({"Longitude": results[0].Longitude, "Latitude" : results[0].Latitude, "Altitude" : results[0].Altitude, "ThirdLayer": results[0].ThirdLayer, "LayerName":results[0].LayerName});
        // })
    });

    app.get('/thirdL',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        var thirdlayer = req.query.thirdlayer;
        var queryState = 'SELECT FirstLayer, SecondLayer, ThirdLayer, Longitude, Latitude, Altitude FROM LayerMenu WHERE ThirdLayer = ?';
        con_CS.query(queryState, thirdlayer, function (err, results) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json(results);
                console.log(results);
            }
        });
    });


    app.get('/request',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        res.render('login.ejs');
    });

    // =====================================
    // LOGIN Section =======================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            message: req.flash('loginMessage'),
            error: "Your username and password don't match."
        })
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/loginUpdate', // redirect to the secure profile section
            failureRedirect: '/login', // redirect to the login page if there is an error
            failureFlash: true // allow flash messages
        }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
                req.session.cookie.expires = false;
            }
            //res.redirect('/login');
        });

    // Update user login status
    app.get('/loginUpdate', isLoggedIn, function (req, res) {
        dateNtime();

        myStat = "UPDATE UserLogin SET status = 'Active', lastLoginTime = ? WHERE username = ?";
        myVal = [dateTime, req.user.username];
        myErrMsg = "Please try to login again";
        updateDBNredir(myStat, myVal, myErrMsg, "login.ejs", "/userhome", res);
    });

    app.get('/forgot', function (req, res) {
        res.render('forgotPassword.ejs', {message: req.flash('forgotPassMessage')});

    });


    app.get('/placemark', function(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        var select = "SELECT * FROM CitySmart2.LayerMenu WHERE LayerType = 'Placemark'";
        con_CS.query( select, function (err, result) {
            if (err) throw err;
            else {
                // console.log(result);
                res.json({"err": false, "data": result});
            }
        });
    });




    // app.listen(3005, function(){ console.log('Example app listening on port 3005!')});


    app.post('/email', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let statement = "SELECT * FROM UserLogin WHERE username = '" + req.body.username + "';";

        con_CS.query(statement, function (err, results, fields) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else if (results.length === 0) {
                res.json({"error": true, "message": "Please verify your email address !"});
            } else {
                var username = req.body.username;
                var subject = "Password Reset";
                var text = 'the reset of the password for your account.';
                var url = "http://" + req.headers.host + "/reset/";
                sendToken(username, subject, text, url, res);
            }
        });
    });

    app.get('/reset/:token', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        myStat = "SELECT * FROM UserLogin WHERE resetPasswordToken = '" + req.params.token + "'";

        con_CS.query(myStat, function (err, user) {
            dateNtime();
            // console.log(user);

            if (!user || dateTime > user[0].resetPasswordExpires) {
                res.send('Password reset token is invalid or has expired. Please contact Administrator.');
            } else {
                res.render('reset.ejs', {
                    user: user[0]
                });
            }
        });
    });

    app.post('/reset/:token', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        async.waterfall([
            function (done) {

                myStat = "SELECT * FROM UserLogin WHERE resetPasswordToken = '" + req.params.token + "'";

                con_CS.query(myStat, function (err, user) {
                    let userInfo = JSON.stringify(user, null, "\t");

                    if (!user) {
                        res.json({"error": true, 'message': 'Password reset token is invalid or has expired. Please contact Administrator.'});
                    } else {
                        let newPass = {
                            Newpassword: bcrypt.hashSync(req.body.NewPassword, null, null),
                            confirmPassword: bcrypt.hashSync(req.body.Confirmpassword, null, null)
                        };

                        let passReset = "UPDATE UserLogin SET password = '" + newPass.Newpassword + "' WHERE resetPasswordToken = '" + req.params.token + "'";
                        con_CS.query(passReset, function (err, rows) {
                            if (err) {
                                console.log(err);
                                res.json({"error": true, "message": "New Password Insert Fail!"});
                            } else {
                                var username = req.body.username;
                                var subject = "Your password has been changed";
                                var text = 'Hello,\n\n' + 'This is a confirmation that the password for your account, ' + changeMail(username) + ' has just been changed.\n';
                                done(err, username, subject, text);
                            }
                        });
                    }

                });
            }, function (user, done, err) {

                let message = {
                    from: 'FTAA <aaaa.zhao@g.northernacademy.org>',
                    to: req.body.username,
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account, ' + changeMail(req.body.username) + ' has just been changed.\n'
                };

                smtpTrans.sendMail(message, function (error) {
                    if (error) {
                        console.log(error.message);
                        // alert('Something went wrong! Please double check if your email is valid.');
                        return;
                    } else {
                        res.redirect('/login');
                    }
                });
            }
        ]);
    });

    //show the signout form
    app.get('/signout', function (req, res) {
        req.session.destroy();
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // USER Home Section ===================
    // =====================================

    app.get('/userhome', isLoggedIn, function (req, res) {
        let myStat = "SELECT userrole FROM UserLogin WHERE username = '" + req.user.username + "';";
        let state2 = "SELECT firstName, lastName FROM UserProfile WHERE username = '" + req.user.username + "';"; //define last name

        con_CS.query(myStat + state2, function (err, results, fields) {
            // console.log("Users: ");
            // console.log(results);

            if (!results[0][0].userrole) {
                console.log("Error2");
            } else if (!results[1][0].firstName) {
                console.log("Error1")
            } else {
                // console.log("Yes");
                // console.log(req.user);
                res.render('userHome.ejs', {
                    user: req.user, // get the user out of session and pass to template
                    firstName: results[1][0].firstName,
                    lastName: results[1][0].lastName,
                });
            }
        });
    });

    app.get('/deleteRow', isLoggedIn, function (req, res) { //this is what I have been experiencing thus far
        del_recov("Deleted", "Deletion failed!", "/userHome", req, res);
    });

    function del_recov(StatusUpd, ErrMsg, targetURL, req, res) {

        transactionID = req.query.transactionIDStr.split(",");
        // console.log(transactionID);
        let statementGeneral = "UPDATE Request_Form SET Current_Status = '" + StatusUpd + "'"; //this is where the problem is

        for (let i = 0; i < transactionID.length; i++) {
            if (i === 0) {
                statementGeneral += " WHERE RID = '" + transactionID[i] + "'";
                // statementDetailedS += " WHERE transactionID = '" + transactionID[i] + "'";
                // statementDetailedT += " WHERE transactionID = '" + transactionID[i] + "'";

                if (i === transactionID.length - 1) {
                    statementGeneral += ";";
                    // statementDetailedS += ";";
                    // statementDetailedT += ";";
                    myStat = statementGeneral;
                    updateDBNres(myStat, "", ErrMsg, targetURL, res);
                }
            } else {
                statementGeneral += " OR RID = '" + transactionID[i] + "'";
                // statementDetailedS += " OR transactionID = '" + transactionID[i] + "'";
                // statementDetailedT += " OR transactionID = '" + transactionID[i] + "'";

                if (i === transactionID.length - 1) {
                    statementGeneral += ";";
                    // statementDetailedS += ";";
                    // statementDetailedT += ";";
                    myStat = statementGeneral;
                    updateDBNres(myStat, "", ErrMsg, targetURL, res);
                }
            }
        }
    }

    function updateDBNres(SQLstatement, Value, ErrMsg, targetURL, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        con_CS.query(SQLstatement, Value, function (err, rows) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": ErrMsg});
            } else {
                res.json({"error": false, "message": targetURL});
            }
        })
    }
    //Copy the record directly to Layer Menu if the PStatus was approved.

    app.get('/recoverRow', isLoggedIn, function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        // del_recov("Approved", "Recovery failed!", "/userHome", req, res);
        let pictureStr = req.query.pictureStr.split(',');
        let transactionPrStatusStr = req.query.transactionStatusStr;
        console.log("tran:"+transactionPrStatusStr);

        // mover folder
        for(var a=0; a<transactionPrStatusStr.length; a++) {

            if (transactionPrStatusStr[a] ==="Pending") {
                del_recov('Pending', "Recovery failed!", "/userHome", req, res);
                for (let i = 0; i < pictureStr.length; i++) {
                    fs.rename('' + Delete_Dir + '/' + pictureStr[i] + '', '' + upload_Dir + '/' + pictureStr[i] + '', function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Recovery process is successful");
                        }
                 });
                }
            }else{
                for (let i = 0; i < pictureStr.length; i++) {
                    del_recov('Approved', "Recovery failed!", "/userHome", req, res);
                    fs.rename('' + Delete_Dir + '/' + pictureStr[i] + '', '' + geoData_Dir + '/' + pictureStr[i] + '', function (err) {
                        if (err) {
                            console.log(err);
                        } else {//if successful
                            console.log("Recovery process is successful");
                        }
                    });
                }
            }
        }
    });


    // =====================================
    // REQUEST QUERY   =====================
    // =====================================

    // show the data history ejs
    app.get('/dataHistory', isLoggedIn, function (req, res) {

        let state2 = "SELECT firstName FROM UserProfile WHERE username = '" + req.user.username + "';";

        con_CS.query(state2, function (err, results, fields) {
            // console.log(results);
            if (!results[0].firstName) {
                console.log("Error2");
            } else {
                res.render('dataHistory.ejs', {
                    user: req.user, // get the user out of session and pass to template
                    firstName: results[0].firstName //get the firstName our of session ans pass to template
                });
            }
        });

    });

    app.get('/disapprove',function (req,res) { //maybe this is the successful server side code for record deletion; should ask Mr.Anson
        res.setHeader("Access-Control-Allow-Origin", "*");
        let transactionID = req.query.transactionIDStr.split(',');
        let pictureStr = req.query.pictureStr.split(',');
        let LayerName = req.query.LayerName.split(',');
        for (let i = 0; i < transactionID.length; i++) {
            let statement = "UPDATE Request_Form SET Current_Status = 'Pending' WHERE RID = '" + transactionID[i] + "';";
            let statement1 = "UPDATE LayerMenu SET Status = 'Disapproved' WHERE ThirdLayer = '" + LayerName  + "';";
            fs.rename(''+ geoData_Dir + '/' + pictureStr[i] + '' , '' + upload_Dir + '/' + pictureStr[i] + '',  function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Delete successfully!");
                }
            });
            con_CS.query(statement + statement1, function (err, results) {
                if (err) throw err;
                res.json(results[i]);
            });
        }
    });

    app.get('/filterQuery', isLoggedIn, function (req, res) {
        // console.log(req.query);
        var sqlStat = "SELECT UserProfile.firstName, UserProfile.lastName, Request_Form.* FROM Request_Form INNER JOIN UserProfile ON UserProfile.username = Request_Form.UID";
        var myQueryObj = [ //change everything because we need to make sure it matches what we want to happen in client side
            {
                fieldVal: req.query.firstName,
                dbCol: "firstName",
                op: " = '",
                adj: req.query.firstName,
                table: 1
            },
            {
                fieldVal: req.query.lastName,
                dbCol: "lastName",
                op: " = '",
                adj: req.query.lastName,
                table: 1
            },
            {
                fieldVal: req.query.startDate,
                dbCol: "date",
                op: " >= '",
                adj: req.query.startDate,
                table: 1
            },
            {
                fieldVal: req.query.endDate,
                dbCol: "date",
                op: " <= '",
                adj: req.query.endDate,
                table: 1
            },
            {
                fieldVal: req.query.Current_Status1,
                dbCol: req.query.Current_Status,
                op: " = '",
                adj: req.query.Current_Status1,
                table: req.query.filter1
            },
            {
                fieldVal: req.query.Current_Status2,
                dbCol: req.query.Current_Status,
                op: " = '",
                adj: req.query.Current_Status2,
                table: req.query.filter2
            },
            {
                fieldVal: req.query.UID,
                dbCol: req.query.UID,
                op: " = '",
                adj: req.query.UID,
                table: req.query.filter3
            }
        ];
        QueryStat(myQueryObj, sqlStat, res)
    });

    app.get('/layerReqQuery', isLoggedIn, function (req, res) {
        console.log(req.query);
        let iniStat = "SELECT * FROM Request_Form";
        let myQueryObj = [ //change everything because we need to make sure it matches what we want to happen in client side
            //one big object that stores everything and the QueryStat creates the full statement request//work to display everything in User Home
            {
                fieldVal: req.query.UID,
                dbCol: "UID",
                op: " = '",
                adj: req.query.UID,
                // table: 1
            },
            {
                fieldVal: req.query.Current_Status,
                dbCol: "Current_Status",
                op: " = '",
                adj: req.query.Current_Status,
                // table: 1
            },
            {
                fieldVal: req.query.firstName,
                dbCol: "firstName",
                op: " = '",
                adj: req.query.firstName,
                // table: req.query.filter2
            },
            {
                fieldVal: req.query.lastName,
                dbCol: "lastName",
                op: " = '",
                adj: req.query.lastName,
                // table: req.query.filter3
            },
            {
                fieldVal: req.query.startDate,
                dbCol: "date",
                op: " >= '",
                adj: req.query.startDate,
                // table: 1
            },
            {
                fieldVal: req.query.endDate,
                dbCol: "date",
                op: " <= '",
                adj: req.query.endDate,
                // table: 1
            }
        ];
        // console.log("MyQueryObj: ");
        // console.log(myQueryObj);
        QueryStat(myQueryObj, iniStat, res)
        //this loop creates the exact statement depending on request; it tells the conditions for different pages and different required conditions
        //we do not need UID b/c empty so we just use Date

    });

    // =====================================
    // USER PROFILE  =======================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    // Show user profile page
    app.get('/profile', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT * FROM UserProfile", function (err, results) {
            if (err) throw err;
            res.json(results);
        })
    });

    app.post('/checkpassword',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let password = req.body.pass;
        let statement = "SELECT password FROM UserLogin WHERE username = '" + req.body.username + "';";
        // console.log(password);
        // console.log(statement);
        // console.log(req.body.username);
        con_CS.query(statement,function (err,results) {
            res.json((!bcrypt.compareSync(password, results[0].password)));
        });
    });

    app.get('/userProfile', isLoggedIn, function (req, res) {
        res.render('userProfile.ejs', {
            user: req.user,
        });
    });

    app.post('/userProfile', isLoggedIn, function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        // new password (User Login)
        let user = req.user;
        let newPass = {
            currentpassword: req.body.CurrentPassword,
            Newpassword: bcrypt.hashSync(req.body.NewPassword, null, null),
            confirmPassword: bcrypt.hashSync(req.body.ConfirmNewPassword, null, null)
        };

        let passComp = bcrypt.compareSync(newPass.currentpassword, user.password);

        if (!!req.body.NewPassword && passComp) {
            let passReset = "UPDATE UserLogin SET password = '" + newPass.Newpassword + "' WHERE username = '" + user.username + "'";

            con_CS.query(passReset, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.json({"error": true, "message": "Fail !"});
                } else {
                    // res.json({"error": false, "message": "Success !"});
                    basicInformation();
                }
            });
        } else {
            basicInformation();
        }

        // User Profile
        function basicInformation() {
            let result = Object.keys(req.body).map(function (key) {
                return [String(key), req.body[key]];
            });

            var update1 = "UPDATE UserProfile SET ";
            let update2 = "";
            var update3 = " WHERE username = '" + req.user.username + "'";
            for (let i = 1; i < result.length - 3; i++) {
                if (i === result.length - 4) {
                    update2 += result[i][0] + " = '" + result[i][1] + "'";
                } else {
                    update2 += result[i][0] + " = '" + result[i][1] + "', ";
                }
            }
            let statement1 = update1 + update2 + update3;

            con_CS.query(statement1, function (err, result) {
                if (err) {
                    res.json({"error": true, "message": "Fail !"});
                } else {
                    // res.json({"error": false, "message": "Success !"});
                    let oldname = req.user.username;
                    let newname = req.body.username;

                    if (newname !== oldname) {
                        let statement = "UPDATE UserLogin SET PendingUsername = '"+ newname + "' WHERE username = '" + oldname + "';";
                        con_CS.query(statement, function (err,result) {
                            if (err) {
                                console.log(err);
                                res.json({"error": true, "message": "An unexpected error occurred !"});
                            } else if (result.length === 0) {
                                res.json({"error": true, "message": "Please verify your email address !"});
                            } else {
                                var username = newname;
                                var subject = "Email verify";
                                var text = 'to verify the new username(email).';
                                var url = "http://" + req.headers.host + "/verifyemail/";
                                sendname(username, subject, text, url, res);
                            }
                        });
                    } else {
                        res.json({"error": false, "message": "Success !"});
                    }
                }
            });
        }
    });

    // Update user profile page
    app.post('/newPass', isLoggedIn, function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let user = req.user;
        let newPass = {
            // firstname: req.body.usernameF,
            // lastname: req.body.usernameL,
            currentpassword: req.body.CurrentPassword,
            Newpassword: bcrypt.hashSync(req.body.NewPassword, null, null),
            confirmPassword: bcrypt.hashSync(req.body.ConfirmNewPassword, null, null)
        };

        let passComp = bcrypt.compareSync(newPass.currentpassword, user.password);

        if (!!req.body.NewPassword && passComp) {
            let passReset = "UPDATE UserLogin SET password = '" + newPass.Newpassword + "' WHERE username = '" + user.username + "'";

            con_CS.query(passReset, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.json({"error": true, "message": "Fail !"});
                } else {
                    res.json({"error": false, "message": "Success !"});
                }
            });
        }
    });


    // =====================================
    // USER MANAGEMENT =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    // Show user management bak page
    app.get('/userManagement', isLoggedIn, function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        myStat = "SELECT userrole FROM UserLogin WHERE username = '" + req.user.username + "';";
        let state2 = "SELECT firstName FROM UserProfile WHERE username = '" + req.user.username + "';";

        con_CS.query(myStat + state2, function (err, results, fields) {

            if (!results[0][0].userrole) {
                console.log("Error2");
            } else if (!results[1][0].firstName) {
                console.log("Error1")
            } else if (results[0][0].userrole === "Admin" || "Regular") {
                // process the signup form
                res.render('userManagement.ejs', {
                    user: req.user, // get the user out of session and pass to template
                    firstName: results[1][0].firstName
                });
            }
        });
    });

    // show the signup form
    app.get('/signup', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {
            message: req.flash('signupMessage')
        });
    });

    app.post('/signup', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        // con_CS.query('USE ' + config.Login_db); // Locate Login DB

        let newUser = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: bcrypt.hashSync(req.body.password, null, null),  // use the generateHash function
            userrole: req.body.userrole,
            dateCreated: req.body.dateCreated,
            createdUser: req.body.createdUser,
            dateModified: req.body.dateCreated,
            status: req.body.status
        };

        myStat = "INSERT INTO UserLogin ( username, password, userrole, dateCreated, dateModified, createdUser, status) VALUES ( '" + newUser.username + "','" + newUser.password+ "','" + newUser.userrole+ "','" + newUser.dateCreated+ "','" + newUser.dateModified+ "','" + newUser.createdUser + "','" + newUser.status + "');";
        mylogin = "INSERT INTO UserProfile ( username, firstName, lastName) VALUES ('"+ newUser.username + "','" + newUser.firstName+ "','" + newUser.lastName + "');";
        con_CS.query(myStat + mylogin, function (err, rows) {
            // newUser.id = rows.insertId;
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred!"});
                res.end();
            } else {
                var username = req.body.username;
                var subject = "Sign Up";
                var text = 'to sign up an account with this email.';
                var url = "http://" + req.headers.host + "/verify/";
                sendToken(username, subject, text, url, res);
            }
        });
    });

    // show the addUser form
    app.get('/addUser', isLoggedIn, function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('adduser.ejs', {
            user: req.user,
            message: req.flash('addUserMessage')
        });
    });

    app.post('/addUser', isLoggedIn, function (req, res) {

        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        // connection.query('USE ' + config.Login_db); // Locate Login DB

        var newUser = {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: bcrypt.hashSync(req.body.password, null, null),  // use the generateHash function
            userrole: req.body.userrole,
            dateCreated: req.body.dateCreated,
            createdUser: req.body.createdUser,
            dateModified: req.body.dateCreated,
            status: req.body.status
        };

        myStat = "INSERT INTO UserLogin ( username, password, userrole, dateCreated, dateModified, createdUser, status) VALUES ( '" + newUser.username + "','" + newUser.password+ "','" + newUser.userrole+ "','" + newUser.dateCreated+ "','" + newUser.dateModified+ "','" + newUser.createdUser + "','" + newUser.status + "');";
        mylogin = "INSERT INTO UserProfile ( username, firstName, lastName) VALUES ('"+ newUser.username + "','" + newUser.firstName+ "','" + newUser.lastName + "');";
        con_CS.query(myStat + mylogin, function (err, rows) {
            //newUser.id = rows.insertId;
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else {
                res.json({"error": false, "message": "Success"});
            }
        });
    });

    app.get('/verify/:token', function(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        async.waterfall([
            function(done) {
                myStat = "SELECT * FROM UserLogin WHERE resetPasswordToken = '" + req.params.token + "'";
                con_CS.query(myStat, function(err, results) {
                    dateNtime();

                    if (results.length === 0 || dateTime > results[0].expires) {
                        res.send('Password reset token is invalid or has expired. Please contact Administrator.');
                    } else {
                        done(err, results[0].username);
                    }
                });
            }, function(username, done) {
                myStat = "UPDATE UserLogin SET status = 'Never Logged In' WHERE username = '" + username + "';";

                con_CS.query(myStat, function(err, user) {
                    if (err) {
                        console.log(err);
                        res.send("An unexpected error occurred !");
                    } else {
                        var subject = "Account Activated";
                        var text = 'Hello,\n\n' + 'This is a confirmation for your account, ' + changeMail(username) + ' has just been activated.\n';
                        done(err, username, subject, text);
                    }

                });
            }, function(username, subject, text) {
                successMail(username, subject, text, res);
            }
        ]);
    });

    app.get('/verifyemail/:token', function(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        async.waterfall([
            function(done) {
                myStat = "SELECT * FROM UserLogin WHERE resetPasswordToken = '" + req.params.token + "'";
                con_CS.query(myStat, function(err, results) {
                    dateNtime();
                    if (results.length === 0 || dateTime > results[0].expires) {
                        res.send('Password reset token is invalid or has expired. Please contact Administrator.');
                    } else {
                        done(err, results[0].PendingUsername);
                    }
                });
            }, function(PendingUsername, done) {
                myStat = "UPDATE UserLogin SET username = '"+ PendingUsername  + "', PendingUsername = '' WHERE PendingUsername = '"+ PendingUsername + "';";
                // mylogin = "UPDATE UserLogin SET PendingUsername = '' WHERE PendingUsername = '" + PendingUsername + "';";
                var myProfile = "UPDATE UserProfile SET username = '" + PendingUsername + "' WHERE username = '" + req.user.username + "';";
                con_CS.query(myStat + myProfile, function(err, user) {
                    if (err) {
                        console.log(err);
                        res.send("An unexpected error occurred !");
                    } else {
                        var subject = "Account Activated";
                        var text = 'Hello,\n\n' + 'This is a confirmation for your account, ' + changeMail(PendingUsername) + ' has just been activated.\n';
                        done(err, PendingUsername, subject, text);
                    }

                });
            }, function(username, subject, text) {
                successMail(username, subject, text, res);
            }
        ]);
    });

    //AddData to table
    app.get('/AddData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query('SELECT * FROM Request_Form', function (err, results) {
            if (err) throw err;
            res.json(results);
            //there are no filters here so the whole table shows up in client side
            //this means in server side we should filter
        })
    });
    // Filter by search criteria
    app.get('/filterUser', isLoggedIn, function (req, res) {
        // res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        myStat = "SELECT UserProfile.*, UserLogin.* FROM UserLogin INNER JOIN UserProfile ON UserLogin.username = UserProfile.username";

        let myQuery = [
            {
                fieldVal: req.query.dateCreatedFrom,
                dbCol: "dateCreated",
                op: " >= '",
                adj: req.query.dateCreatedFrom
            },
            {
                fieldVal: req.query.dateCreatedTo,
                dbCol: "dateCreated",
                op: " <= '",
                adj: req.query.dateCreatedTo
            },
            {
                fieldVal: req.query.dateModifiedFrom,
                dbCol: "dateModified",
                op: " >= '",
                adj: req.query.dateModifiedFrom
            },
            {
                fieldVal: req.query.dateModifiedTo,
                dbCol: "dateModified",
                op: " <= '",
                adj: req.query.dateModifiedTo
            },
            {
                fieldVal: req.query.userrole,
                dbCol: "userrole",
                op: " = '",
                adj: req.query.userrole
            },
            {
                fieldVal: req.query.firstName,
                dbCol: "firstName",
                op: " = '",
                adj: req.query.firstName
            },
            {
                fieldVal: req.query.lastName,
                dbCol: "lastName",
                op: " = '",
                adj: req.query.lastName
            },
            {
                fieldVal: req.query.status,
                dbCol: "Current_Status",
                op: " = '",
                adj: req.query.status
            },
            {
                fieldVal: req.query.Phone_Number,
                dbCol: "Phone_Number",
                op: " = '",
                adj: req.query.Phone_Number
            }
        ];

        QueryStat(myQuery, myStat, res);
    });

    // // Retrieve user data from user management page
    var edit_User, edit_firstName, edit_lastName, edit_userrole, edit_status, edit_city;
    app.get('/editUserQuery', isLoggedIn, function (req, res) {

         edit_User = req.query.Username;
         edit_firstName = req.query.First_Name;
         edit_city = req.query.City;
         edit_lastName = req.query.Last_Name;
         edit_userrole = req.query.User_Role;
         edit_status = req.query.Current_Status;

         res.json({"error": false, "message": "/editUser"});
     });

    app.post('/edituserform',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        // new password (User Login)
        let user = req.body.Username;
        //Converts array to string
        let editingUser = req.user.username;
        let editingUserPassword = req.user.password;


        if(user === editingUser) {
            let newEditPass = {
                currentpassword: req.body.CurrentPassword,
                Newpassword: bcrypt.hashSync(req.body.NewPassword, null, null),
                confirmPassword: bcrypt.hashSync(req.body.ConfirmNewPassword, null, null)
            };


            let passComp = bcrypt.compareSync(newEditPass.currentpassword, editingUserPassword);


            if (!!req.body.NewPassword) {
                let passAdminReset = "UPDATE UserLogin SET password = '" + newEditPass.Newpassword + "' WHERE username = '" + user + "'";

                con_CS.query(passAdminReset, function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.json({"error": true, "message": "Fail !"});
                    } else {
                        // res.json({"error": false, "message": "Success !"});
                        basicInformation();
                    }
                });
            } else {
                basicInformation();
            }
        } else {
            let newPass = {
                Newpassword: bcrypt.hashSync(req.body.NewPassword, null, null),
                confirmPassword: bcrypt.hashSync(req.body.ConfirmNewPassword, null, null)
            };


            if (!!req.body.NewPassword) {
                let passReset = "UPDATE UserLogin SET password = '" + newPass.Newpassword + "' WHERE username = '" + user + "'";

                con_CS.query(passReset, function (err, rows) {
                    if (err) {
                        console.log(err);
                        res.json({"error": true, "message": "Fail !"});
                        res.json({"error": true, "message": err});
                    } else {
                        // res.json({"error": false, "message": "Success !"});
                        basicInformation();
                    }
                });
            } else {
                basicInformation();
            }
        }

        function basicInformation() {
            let result = Object.keys(req.body).map(function (key) {
                return [String(key), req.body[key]];
            });

            // var update3 = " WHERE username = '" + req.user.username + "'";
            let statement1 = "UPDATE UserLogin SET userrole = '" + result[3][1] + "',   Current_Status = '" + result[4][1] + "' WHERE username = '" + result[0][1]+ "';";
            let statement2 = "UPDATE UserProfile SET firstName = '" + result[1][1] + "', lastName = '" + result[2][1] + "' WHERE username = '" + result[0][1] + "';";
            con_CS.query(statement1 + statement2, function (err, result) {
                if (err) throw err;
                res.json(result);
            });
        }
    });

    // Show user edit form
    app.get('/editUser', isLoggedIn, function (req, res) {
        res.render('userEdit.ejs', {
            user: req.user, // get the user out of session and pass to template
            username: req.body.username,
            // firstName: edit_firstName,
            // lastName: edit_lastName,
            // userrole: edit_userrole,
            // status: edit_status,
            message: req.flash('Data Entry Message')
        });
    });

    app.post('/editUser', isLoggedIn, function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        if (req.body.newPassword !== "") {
            let updatedUserPass = {
                firstName: req.body.First_Name,
                lastName: req.body.Last_Name,
                userrole: req.body.User_Role,
                status: req.body.Status,
                newPassword: bcrypt.hashSync(req.body.newPassword, null, null)
            };
            mylogin = "UPDATE UserProfile SET firstName = ?, lastName = ?";
            myStat = "UPDATE UserLogin SET password = ?, userrole = ?, status = ?, modifiedUser = '" + req.user.username + "', dateModified = '" + dateTime + "' WHERE username = ?";

            myVal = [updatedUserPass.firstName, updatedUserPass.lastName, updatedUserPass.newPassword, updatedUserPass.userrole, updatedUserPass.status, edit_User];
            updateDBNres(myStat + mylogin, myVal, "Update failed!", "/userManagement", res);
        } else {
            let updatedUser = {
                firstName: req.body.First_Name,
                lastName: req.body.Last_Name,
                userrole: req.body.User_Role,
                status: req.body.Status
            };
            mylogin = "UPDATE UserProfile SET firstName = ?, lastName = ?";
            myStat = "UPDATE UserLogin SET userrole = ?, status = ?, modifiedUser = '" + req.user.username + "', dateModified = '" + dateTime + "'  WHERE username = ?";

            myVal = [updatedUser.firstName, updatedUser.lastName, updatedUser.userrole, updatedUser.status, edit_User];
            updateDBNres(myStat + mylogin, myVal, "Update failed!", "/userManagement", res);
        }

    });

    app.get('/suspendUser', isLoggedIn, function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        dateNtime();

        let username = req.query.usernameStr.split(","); //they receive the username string from client side

        myStat = "UPDATE UserLogin SET modifiedUser = '" + req.user.username + "', dateModified = '" + dateTime + "',  status = 'Suspended'";

        for (let i = 0; i < username.length; i++) {
            if (i === 0) {
                myStat += " WHERE username = '" + username[i] + "'";
                if (i === username.length - 1) {
                    updateDBNres(myStat, "", "Suspension failed!", "/userManagement", res);
                }
            } else {
                myStat += " OR username = '" + username[i] + "'"; //is this assuming they don't try to suspend a faulty account more than twice?
                if (i === username.length - 1) {
                    updateDBNres(myStat, "", "Suspension failed!", "/userManagement", res);
                }
            }
        }
    });
    //approve picture in the folder and approve record in the table
    // //Delete button
    // app.get('/deleteData', function (req, res) { //is this deleteData for the records?
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     let transactionID = req.query.transactionIDStr.split(',');
    //     let pictureStr = req.query.pictureStr.split(',');
    //     let LayerName = req.query.LayerName.split(',');
    //     for (let i = 0; i < transactionID.length; i++) {
    //         let statement = "UPDATE Request_Form SET Current_Status = 'Delete' WHERE RID = '" + transactionID[i] + "';";
    //         let statement1 = "UPDATE LayerMenu SET Current_Status = 'Disapproved' WHERE ThirdLayer = '" + LayerName  + "';";
    //         fs.rename(''+ Delete_Dir + '/' + pictureStr[i] + '' , '' + upload_Dir + '/' + pictureStr[i] + '',  function (err) {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 console.log("success");
    //             }
    //         });
    //         con_CS.query(statement + statement1, function (err, results) {
    //             if (err) throw err;
    //             res.json(results[i]);
    //         });
    //     }
    // });

    app.get('/recovery', isLoggedIn, function (req, res) {
        let state2 = "SELECT firstName FROM UserProfile WHERE username = '" + req.user.username + "';";
        con_CS.query(state2, function (err, results, fields) {
            if (!results[0].firstName) {
                console.log("Error2");
            } else {
                res.render('recovery.ejs', {
                    user: req.user,
                    message: req.flash('restoreMessage'),
                    firstName: results[0].firstName,
                    lastName:results[0].lastName
                });
            }
        });
    });

    // =====================================
    // REQUEST FORM SECTION =================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.post('/upload', onUpload);

    app.post('/submit', function (req, res) {
        let result = Object.keys(req.body).map(function (key) {
            return [String(key), req.body[key]];
        });
        res.setHeader("Access-Control-Allow-Origin", "*");

        var update1 = "UPDATE UserProfile SET ";
        let update2 = "";
        var update3 = " WHERE username = '" + req.user.username + "'";
        for (let i = 0; i < result.length - 3; i++) {
            if (i === result.length - 4) {
                update2 += result[i][0] + " = '" + result[i][1] + "'";
            } else {
                update2 += result[i][0] + " = '" + result[i][1] + "', ";
            }
        }
        let statement1 = update1 + update2 + update3;

        con_CS.query(statement1, function (err, result) {
            if (err) {
                throw err;
            } else {
                res.json("Connected!")
            }
        });
    });

    app.get('/UsernameV',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*");//
        let oldname = req.user.username;
        let newname = req.query.UNS;
        let statement = "UPDATE UserLogin SET PendingUsername = '"+ newname + "' WHERE username = '" + oldname + "';";
        con_CS.query(statement, function (err,result) {
            if (err) {
                console.log(err);
                res.json({"error": true, "message": "An unexpected error occurred !"});
            } else if (result.length === 0) {
                res.json({"error": true, "message": "Please verify your email address !"});
            } else {
                var username = newname;
                var subject = "Email verify";
                var text = 'to verify the new username(email).';
                var url = "http://" + req.headers.host + "/verifyemail/";
                sendname(username, subject, text, url, res);
            }
        })

    });

    //Submit Request form//
    app.post('/submitL', function (req, res) {
        let result = Object.keys(req.body).map(function (key) {
            return [String(key), req.body[key]];
        });

        res.setHeader("Access-Control-Allow-Origin", "*");

        let name = "";
        let valueSubmit = "";

        for (let i = 0; i < result.length; i++) {
            if (i === result.length - 1) {
                name += result[i][0];
                valueSubmit += '"' + result[i][1] + '"';
            } else {
                name += result[i][0] + ", ";
                valueSubmit += '"' + result[i][1] + '"' + ", ";
            }
        }
        let newImage = {
            Layer_Uploader: upload_Dir + "/" + responseDataUuid,
            Layer_Uploader_name: responseDataUuid
        };
        name += ", Layer_Uploader, Layer_Uploader_name";
        valueSubmit += ", '" + newImage.Layer_Uploader + "','" + newImage.Layer_Uploader_name + "'";
        let filepathname = upload_Dir + "/" + responseDataUuid;

        let statement2 = "INSERT INTO Request_Form (" + name + ") VALUES (" + valueSubmit + ");";
        let statement = "UPDATE Request_Form SET ThirdLayer = '" + result[7][1] + "' WHERE RID = '" + result[1][1] + "';";

        con_CS.query(statement2 + statement, function (err, result) {
            if (err) {
                throw err;
            } else {
                res.json("Connected!")
            }
        });
    });

    app.get('/RID', isLoggedIn, function (req, res) {
    });

    //Request ID
    app.get('/newRequest', isLoggedIn, function (req, res) {
        var d = new Date();
        var utcDateTime = d.getUTCFullYear() + "-" + ('0' + (d.getUTCMonth() + 1)).slice(-2) + "-" + ('0' + d.getUTCDate()).slice(-2);
        var queryRID = "SELECT COUNT(RID) AS number FROM Special_ID WHERE RID LIKE '" + utcDateTime + "%';";

        con_CS.query(queryRID, function (err, results, fields) {
            RID = utcDateTime + "_" + ('000' + (results[0].number + 1)).slice(-4);
            if (err) {
                console.log(err);
            } else {
                var insertRID = "INSERT INTO Special_ID (RID, UID) VALUE (" + "'" + RID + "', '" + req.user + "');";

                con_CS.query(insertRID, function (err, results, fields) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('LayerRequestForm.ejs', {
                            user: req.user, // get the user out of session and pass to template
                            RID: RID
                        });
                    }
                });
            }
        });
    });

    //Request form layer category//
    app.get('/MainCategory', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT FirstLayer, SecondLayer FROM LayerCategories GROUP BY FirstLayer, SecondLayer", function (err, results) {
            if (err) throw err;
            res.json(results);
        });
    });

    //thr submit function for regular users
    app.post('/rsubmit',function (req,res) {
        let result = Object.keys(req.body).map(function (key) {
            return [String(key), req.body[key]];
        });
        res.setHeader("Access-Control-Allow-Origin", "*");
        let status = req.body.status;

        let update1 = "UPDATE Request_Form SET " ;
        let update3 = " WHERE RID = '" + result[1][1] + "';";
        let update2 = "";

        for (let i = 0; i < result.length; i++) {
            if (i === result.length - 1) {
                update2 += result[i][0] + " = '" + result[i][1]+ "'";
            } else {
                update2 += result[i][0] + " = '" + result[i][1] + "', " ;
            }
        }
        let Layer_Uploader = upload_Dir + "/" + responseDataUuid;
        let Layer_Uploader_name = responseDataUuid;
        let filepathname = upload_Dir + "/" + responseDataUuid;
        let statement1 = update1+update2+update3;
        let statement2 = "UPDATE Request_Form SET Layer_Uploader = '" + Layer_Uploader + "', Layer_Uploader_name = '" + Layer_Uploader_name + "';";
        let statement3 = "UPDATE Request_Form SET ThirdLayer = '" + result[7][1] + "' WHERE RID = '" + result[1][1] + "';";
        let statement4 = "UPDATE Request_Form SET Current_Status = 'Pending' WHERE RID = '" + result[1][1] + "'";
        if(status === "Reject"){
            con_CS.query(statement1 + statement2 + statement3 + statement4, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json("Connected!")
                }
            });
        }else{
            con_CS.query(statement1 + statement2 + statement3, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json("Connected!")
                }
            });
        }

    });

    //check if the layer name is available
    app.get('/SearchLayerName', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT LayerName FROM Request_Form", function (err, results) {
            if (err) throw err;
            res.json(results);
        });
    });

    app.get('/SearchThirdLayer',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT ThirdLayer FROM Request_Form", function (err, results) {
            if (err) throw err;
            res.json(results);

        });
    });

    app.delete("/deleteFiles/:uuid", onDeleteFile1);
    app.delete("/deleteFiles",onDeleteFile2);

    app.get('/approve', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        let approveIDStr = req.query.tID;
        let approvepictureStr = req.query.LUN.split(',');
        let format = req.query.lForm;
        let fName = req.query.fName;
        let layerName;

        let statement = "UPDATE Request_Form SET Current_Status = 'Approved' WHERE RID = '" + approveIDStr + "'";

        // mover folder
        for(let i = 0; i < approvepictureStr.length; i++) {
            fs.rename(''+ upload_Dir +'/' + approvepictureStr[i] + '' , '' + geoData_Dir + '/' + approvepictureStr[i] + '',  function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Approval success");
                }
            });
            con_CS.query(statement, function (err, results) {
                if (err) throw err;
                // console.log(results);

                if (format === "Shapefile - ESRI(tm) Shapefiles (.shp)") {
                    console.log("name of file: " + approvepictureStr[0]);
                    var type = "Content-type: application/zip";
                    var datastore = "datastore" + fName;

                    var statement = "curl -u julia:123654 -v -XPUT -H '" + type + "' --data-binary @approvedfolder/" + approvepictureStr[0] + " http://cs.aworldbridgelabs.com:8080/geoserver/rest/workspaces/Approved/datastores/" + datastore +"/file.shp";

                    child = exec(statement,
                        function (error, stdout, stderr) {
                            console.log(statement);
                            console.log('stdout: ' + stdout);
                            console.log('stderr: ' + stderr);
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            } else {
                                var statement = "curl -u julia:123654 -v -XGET http://cs.aworldbridgelabs.com:8080/geoserver/rest/workspaces/Approved/datastores/" + datastore + "/featuretypes.json";
                                var jsonF;
                                child = exec(statement,
                                    function (error, stdout, stderr) {
                                        console.log(statement);
                                        console.log('stdout: ' + stdout);
                                        console.log('stderr: ' + stderr);

                                        jsonF = JSON.parse(stdout);
                                        if (error !== null) {

                                            console.log('exec error: ' + error);
                                        } else {
                                            layerName = "Approved:" + jsonF.featureTypes.featureType[0].name;
                                            console.log(layerName);
                                        }
                                    });
                            }
                        });
                } else if (format === "GeoTIFF - Tagged Image File Format with Geographic information (.tif)") {
                    console.log("geotiff file works :D");
                }

                // res.setHeader("Access-Control-Allow-Origin", "*");
                //
                // var type = "Content-type: application/zip";
                //
                // var statement = "curl -u julia:123654 -v -XPUT -H '" + type + "' --data-binary @approvedfolder/" + approvepictureStr[0] + " http://cs.aworldbridgelabs.com:8080/geoserver/rest/workspaces/Approved/datastores/datastore/file.shp";
                //
                // child = exec(statement,
                //     function (error, stdout, stderr) {
                //     console.log(statement);
                //         console.log('stdout: ' + stdout);
                //         console.log('stderr: ' + stderr);
                //         if (error !== null) {
                //             console.log('exec error: ' + error);
                //         }
                //     });

                res.json(results[i]);
            });
        }
    });

    app.post('/testB', function (req, res) {
        let result = Object.keys(req.body).map(function (key) {
            return [String(key), req.body[key]];
        });

        console.log(result);

        var statement = "curl -u julia:123654 -v -XGET http://cs.aworldbridgelabs.com:8080/geoserver/rest/workspaces/Approved/datastores/datastoresigh/featuretypes.json";
        var jsonF;
        child = exec(statement,
            function (error, stdout, stderr) {
                console.log(statement);
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);

                jsonF = JSON.parse(stdout);
                if (error !== null) {

                    console.log('exec error: ' + error);
                } else {
                    console.log(jsonF.featureTypes.featureType[0].name);
                }
            });

    });

    app.post('/replace', function (req, res) {
        let result = Object.keys(req.body).map(function (key) {
            return [String(key), req.body[key]];
        });

        res.setHeader("Access-Control-Allow-Origin", "*");

        var update1 = "UPDATE Request_Form SET " ;
        var update3 = " WHERE RID = '" + result[1][1] + "';";
        let update2 = "";
        let layerName;
        let datastore = "datastore" + result[7][1];

        console.log(result);
        console.log(datastore);

        for (let i = 0; i < result.length; i++) {
            if (i === result.length - 1) {
                update2 += result[i][0] + " = '" + result[i][1]+ "'";
            } else {
                update2 += result[i][0] + " = '" + result[i][1] + "', " ;
            }
        }

        let Layer_Uploader = upload_Dir + "/" + responseDataUuid;
        let Layer_Uploader_name = responseDataUuid;
        let filepathname = upload_Dir + "/" + responseDataUuid;
        let statement1 = update1+update2+update3;
        let statement2 = "UPDATE Request_Form SET Layer_Uploader = '" + Layer_Uploader + "', Layer_Uploader_name = '" + Layer_Uploader_name + "' WHERE RID = '" + result[1][1] + "';";
        let statement3 = "UPDATE Request_Form SET ThirdLayer = '" + result[8][1] + "' WHERE RID = '" + result[1][1] + "';";
        if(result[3][1] === "other"){
            let statement = "REPLACE INTO LayerMenu (LayerName, LayerType, FirstLayer, SecondLayer, ThirdLayer, ContinentName, CountryName, StateName, Status, RID) VALUES ('" + result[7][1] + "', 'Wmslayer', '" + result[4][1] + "','" + result[6][1] + "','" + result[8][1] + "','" + result[10][1] + "','" + result[8][1] + "','" + result[9][1] + "', 'Approved', '" + result[1][1] + "');";
            con_CS.query(statement1 + statement + statement2 + statement3, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json("Connected!")
                }
            });
        }else{
            let statement = "REPLACE INTO LayerMenu (LayerName, LayerType, FirstLayer, SecondLayer, ThirdLayer, ContinentName, CountryName, StateName, Status, RID) VALUES ('" + result[7][1] + "', 'Wmslayer', '" + result[3][1] + "','" + result[5][1] + "','" + result[8][1] + "','" + result[10][1] + "','" + result[8][1] + "','" + result[9][1] + "', 'Approved', '" + result[1][1] + "');";
           con_CS.query(statement1 + statement + statement2 + statement3, function (err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json("Connected!")
                }
            });
        }
        // mv('/uploadfiles', 'dest/file', {mkdirp: true}, {clobber: false}, function(err) {
        //     //This is supposed to do the following:
        //     //Tries fs.rename first, then falls back to
        //     // piping the source file to the dest file (destination)  then unlinking
        //     // the source file.
        // });
    });

    app.get('/reject',function (req,res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let rejectID = req.query.reject;
        let comment = req.query.comment;
        let statement = "UPDATE Request_Form SET Current_Status = 'Reject', Comments = '" + comment + "' WHERE RID = '" + rejectID + "'";
        con_CS.query(statement,function (err,results) {
            if (err) throw err;
            res.json(results);
        })
    });

    let olduuid;
    //Put back the photo in the form
    app.get('/edit', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let editIDSr = req.query.editIDSr;
        let myStat = "SELECT Layer_Uploader, Layer_Uploader_name FROM Request_Form WHERE RID = '" + editIDSr + "'";

        let filePath0;
        con_CS.query(myStat, function (err, results) {
            if (!results[0].Layer_Uploader && !results[0].Layer_Uploader_name) {
                console.log("Error");
            } else {
                filePath0 = results[0];
                let JSONresult = JSON.stringify(results, null, "\t");
                olduuid = results;
                res.send(JSONresult);
            }
        });
    });

    //Delete button
    app.get('/deleteData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        let transactionID = req.query.transactionIDStr.split(',');
        let pictureStr = req.query.pictureStr.split(',');
        let LayerName = req.query.LayerName.split(',');
        for (let i = 0; i < transactionID.length; i++) {

            let statement = "UPDATE Request_Form SET Layer_Uploader = 'trashfolder/', Prior_Status = Current_Status, Current_Status = 'Delete'  WHERE RID = '" + transactionID[i] + "';";
            let statement1 = "UPDATE LayerMenu SET Status = 'Disapproved' WHERE ThirdLayer = '" + LayerName[i]  + "';";
            // let statement1 = "DELETE FROM LayerMenu WHERE ThirdLayer = '" + LayerName[i]  + "';"; // the [i] is converting the array back to string so it can be used
        ////transferred value from client side to server side and then be used in SQL
        //parsed during the client to server exchange
            fs.rename(''+ Delete_Dir + '/' + pictureStr[i] + '' , ''  + upload_Dir + '/' + pictureStr[i] + '',  function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Delete button working fine!");
                }
            });
            con_CS.query(statement + statement1, function (err, results) {
                if (err) throw err;
                res.json(results[i]);
            });
        }
    });

    app.get('/editdata',function (req,res){
        // var d = new Date();
        // var utcDateTime = d.getUTCFullYear() + "-" + ('0' + (d.getUTCMonth() + 1)).slice(-2) + "-" + ('0' + d.getUTCDate()).slice(-2);
        // var queryRID = "SELECT COUNT(RID) AS number FROM Special_ID WHERE RID LIKE '" + utcDateTime + "%';";
        res.render('LayerRequestForm_edit.ejs', {
            user: req.user
        });
    });

    // =====================================
    // CitySmart Menu Filter SECTION =======
    // =====================================

    //Country level
    app.get('/CountryList', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query('SELECT CountryName FROM LayerMenu GROUP BY CountryName', function (err, results, fields) {
            if (err) throw err;
            res.json(results);
        });
    });
    //Class for menu
    app.get('/ClassName', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        var recieveCitylist = req.query.citylevel;
        con_CS.query("SELECT FirstLayer, SecondLayer, ThirdLayer FROM LayerMenu WHERE CityName = '" + recieveCitylist + "'", function (err, results) {
            res.json(results);
        });
    });
    app.get('/CountryClassName', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        var recieveCountrylist = req.query.countrylevel;
        con_CS.query("SELECT FirstLayer, SecondLayer, ThirdLayer FROM LayerMenu WHERE CountryName = '" + recieveCountrylist + "'", function (err, results) {
            res.json(results);
        });
    });
    //state level
    app.get('/StateList', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        var recieveCountrylist = req.query.countrylevel;
        con_CS.query("SELECT StateName FROM LayerMenu  WHERE CountryName = '" + recieveCountrylist + "' GROUP BY StateName", function (err, results, fields) {
            res.json(results);
        });
    });
    //city level
    app.get('/CityList', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        var recieveCitylist = req.query.statelevel;
        con_CS.query("SELECT CityName FROM LayerMenu  WHERE StateName = '" + recieveCitylist + "' GROUP BY CityName", function (err, results, fields) {
            res.json(results);
        });
    });
    app.get('/layerRequestContinent',function(req,res){
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT Continent,Contitent_name  FROM Country group by Continent,Contitent_name", function (err, results) {
            console.log(results);
            if (err) throw err;
            res.json(results);
        });
    });

    app.get('/layerRequestCountry',function(req,res){
        res.setHeader("Access-Control-Allow-Origin", "*");
        console.log(req.query);
        var recieveCountryData = req.query.country;
        console.log(recieveCountryData);
        con_CS.query("SELECT Country_name FROM Country WHERE Continent = ?", recieveCountryData, function (err, results) {
            console.log(results);
            if (err) throw err;
            res.json(results);
        });
    });




//AddData in table
    app.get('/AddData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT * FROM Request_Form", function (err, results) {
            // console.log('hh');
            if (err) throw err;
            res.json(results);
        })
    });

//check if the layer name is available
    app.get('/SearchLayerName', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT ThirdLayer FROM LayerMenu", function (err, results) {
            if (err) throw err;
            res.json(results);

        });
    });


    app.get('/EditData', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT Full Name, Address Line 1, Address Line 2, City, State/Province/Region, Postal Code/ZIP, Country, Email, Phone Number, Layer Name, Layer Category, Layer Description, Layer Uploader FROM GeneralFormDatatable", function (err, results) {
            if (err) throw err;
        })
    });

    app.get('/SearchLayerName', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT ThirdLayer FROM LayerMenu", function (err, results) {
            if (err) throw err;
            res.json(results);

        });
    });

    // =====================================
    // CitySmart Dynamic Menu SECTION ======
    // =====================================
    // app.get('/firstlayer', function (req, res) {
    //
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //
    //     con_CS.query("SELECT FirstLayer From LayerMenu", function (err, result) {
    //         let JSONresult = JSON.stringify(result, null, "\t");
    //         res.send(JSONresult);
    //     });
    // });

    // app.get('/secondlayer', function (req, res) {
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     con_CS.query("SELECT SecondLayer From LayerMenu", function (err, result) {
    //         let JSONresult = JSON.stringify(result, null, "\t");
    //         res.send(JSONresult);
    //     });
    //
    // });

    // app.get('/thirdlayer', function (req, res) {
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //
    //     con_CS.query("SELECT ThirdLayer From LayerMenu", function (err, result) {
    //         let JSONresult = JSON.stringify(result, null, "\t");
    //         res.send(JSONresult);
    //     });
    //
    // });

    app.get('/layername', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT LayerName From LayerMenu", function (err, result) {
            let JSONresult = JSON.stringify(result, null, "\t");
            res.send(JSONresult);
        });
    });

    app.get('/firstLayer', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        con_CS.query("SELECT FirstLayer FROM LayerMenu WHERE Status ='Approved' GROUP BY FirstLayer ", function (err, result) {
            // let JSONresult = JSON.stringify(result, null, "\t");
            if (err) { throw err } else {
                // console.log(result);
                res.json(result);
            }
        });

    });
    app.get('/secondLayer', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        var firstlayerValue = req.query.FirstLayer;
        con_CS.query("SELECT SecondLayer,FirstLayer FROM LayerMenu WHERE Status ='Approved' and FirstLayer =? GROUP BY SecondLayer", firstlayerValue ,function (err, result) {
            // let JSONresult = JSON.stringify(result, null, "\t");
            if (err) { throw err } else {
                // console.log(result);
                res.json(result);
            }
        });

    });
    app.get('/thirdLayer', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        var secondLayerValue = req.query.SecondLayer;
        con_CS.query("SELECT LayerType,SecondLayer,ThirdLayer,CityName,StateName,CountryName, GROUP_CONCAT(LayerName) as LayerName FROM LayerMenu WHERE Status ='Approved' and SecondLayer =? GROUP BY ThirdLayer,CityName,StateName,CountryName,SecondLayer,LayerType", secondLayerValue ,function (err, result) {
            // let JSONresult = JSON.stringify(result, null, "\t");
            //All layer?
            //WHERE cityname = ''?
            if (err) { throw err } else {
                // console.log(result.length);
                for(var i =0; i<result.length; i++){
                    // console.log(result[i].LayerName);
                }
                res.json(result);
            }
        });
    });
    app.get('/createlayer', function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");

        con_CS.query("SELECT * From LayerMenu WHERE Status = 'Approved'", function (err, result) {
            let JSONresult = JSON.stringify(result, null, "\t");
            res.send(JSONresult);
        });

    });


    // =====================================
    // Others  =============================
    // =====================================
    app.get('Cancel', function (req, res) {
        res.redirect('/userHome');
        res.render('userHome', {
            user: req.user // get the user out of session and pass to template
        });
    });


// Customized Functions Below
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the bak page
        res.redirect('/');
    }

    function dateNtime() {
        today = new Date();
        date2 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        time2 = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        dateTime = date2 + ' ' + time2;
    }

    function tokenExpTime() {
        today = new Date();
        date3 = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate() + 1);
        time3 = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        tokenExpire = date3 + ' ' + time3;
    }

    // function del_recov(StatusUpd, ErrMsg, targetURL, req, res) {
    //
    //     transactionID = req.query.transactionIDStr.split(",");
    //     // console.log(transactionID);
    //     let statementGeneral = "UPDATE Request_Form SET Status = '" + StatusUpd + "'"; //this is where the problem is
    //
    //     for (let i = 0; i < transactionID.length; i++) {
    //         if (i === 0) {
    //             statementGeneral += " WHERE RID = '" + transactionID[i] + "'";
    //             // statementDetailedS += " WHERE transactionID = '" + transactionID[i] + "'";
    //             // statementDetailedT += " WHERE transactionID = '" + transactionID[i] + "'";
    //
    //             if (i === transactionID.length - 1) {
    //                 statementGeneral += ";";
    //                 // statementDetailedS += ";";
    //                 // statementDetailedT += ";";
    //                 myStat = statementGeneral;
    //                 updateDBNres(myStat, "", ErrMsg, targetURL, res);
    //             }
    //         } else {
    //             statementGeneral += " OR RID = '" + transactionID[i] + "'";
    //             // statementDetailedS += " OR transactionID = '" + transactionID[i] + "'";
    //             // statementDetailedT += " OR transactionID = '" + transactionID[i] + "'";
    //
    //             if (i === transactionID.length - 1) {
    //                 statementGeneral += ";";
    //                 // statementDetailedS += ";";
    //                 // statementDetailedT += ";";
    //                 myStat = statementGeneral;
    //                 updateDBNres(myStat, "", ErrMsg, targetURL, res);
    //             }
    //         }
    //     }
    // }

    // function updateDBNres(SQLstatement, Value, ErrMsg, targetURL, res) {
    //     res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
    //     con_CS.query(SQLstatement, Value, function (err, rows) {
    //         if (err) {
    //             console.log(err);
    //             res.json({"error": true, "message": ErrMsg});
    //         } else {
    //             res.json({"error": false, "message": targetURL});
    //         }
    //     })
    // }

    function updateDBNredir(SQLstatement, Value, ErrMsg, failURL, redirURL, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        con_CS.query(SQLstatement, Value, function (err, rows) {
            if (err) {
                console.log(err);
                res.render(failURL, {message: req.flash(ErrMsg)});
            } else {
                res.redirect(redirURL);
                // render the page and pass in any flash data if it exists
            }
        })
    }

function QueryStat(myObj, sqlStat, res) {
    let j = 0;
    let NewsqlStat = sqlStat;
    let aw;
    for (let i = 0; i < myObj.length; i++) {
        if (!!myObj[i].adj){

                if (j === 0) {
                    aw = " WHERE ";
                    j = 1;
                } else {
                    aw = " AND ";
                }

                sqlStat = editStat(sqlStat, aw, myObj[i].dbCol, myObj[i].op, myObj[i].fieldVal); //scoutingStat is initial statement and the rest says if the column equals the value

                if (i === myObj.length - 1) {
                    NewsqlStat = sqlStat + "; ";
                    console.log(NewsqlStat);
                    dataList(NewsqlStat, res);
                }
            } else {
            // console.log(aw);
                if (i === myObj.length - 1) {
                    NewsqlStat = sqlStat + "; ";
                    console.log(NewsqlStat);
                    dataList(NewsqlStat, res);
                }
            }
        }

        function editStat(stat, aw, dbCol, op, fieldVal) {
            stat += aw + dbCol + op + fieldVal + "'";
            return stat;
        }
    }

    function dataList(sqlStatement, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        // console.log("SQL:");
        console.log("SQL:" + sqlStatement);
        con_CS.query(sqlStatement, function (err, results) {

            if (err) {
                console.log(err);
                res.json({"errMsg": "fail"});
            } else if (results.length === 0) {
                res.json({"errMsg": "no data"});
            } else {
                res.json(results)
            }
        });
    }

    function changeMail(str) {
        let spliti = str.split("@");
        let letter1 = spliti[0].substring(0, 1);
        let letter2 = spliti[0].substring(spliti[0].length - 1, spliti[0].length);
        let newFirst = letter1;
        for (i = 0; i < spliti[0].length - 2; i++) {
            newFirst += "*";
        }
        newFirst += letter2;

        let letter3 = spliti[1].substring(0, 1);
        let extension = letter3;
        for (i = 0; i < spliti[1].split(".")[0].length - 1; i++) {
            extension += "*";
        }
        extension += "." + spliti[1].split(".")[1];
        let result = newFirst + "@" + extension;

        return result;
    }

    function onUpload(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        let form = new multiparty.Form();

        form.parse(req, function (err, fields, files) {
            let partIndex = fields.qqpartindex;

            // text/plain is required to ensure support for IE9 and older
            res.set("Content-Type", "text/plain");

            if (partIndex == null) {
                onSimpleUpload(fields, files[fileInputName][0], res);
            }
            else {
                onChunkedUpload(fields, files[fileInputName][0], res);
            }
        });
    }

    let responseDataUuid = "",
        responseDataName = "",
        responseDataUuid2 = "",
        responseDataName2 = "";

    function onSimpleUpload(fields, file, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        responseDataUuid = "";

        let d = new Date(),
            uuid = d.getUTCFullYear() + "-" + ('0' + (d.getUTCMonth() + 1)).slice(-2) + "-" + ('0' + d.getUTCDate()).slice(-2) + "T" + ('0' + d.getUTCHours()).slice(-2) + ":" + ('0' + d.getUTCMinutes()).slice(-2) + ":" + ('0' + d.getUTCSeconds()).slice(-2) + "Z",
            responseData = {
                success: false,
                newuuid: uuid + "_" + fields.qqfilename
                // newuuid2: uuid + "_" + fields.qqfilename
            };

        responseDataUuid = responseData.newuuid;
        // responseDataUuid2 = responseData.newuuid2;

        file.name = fields.qqfilename;
        responseDataName = file.name;
        responseDataName2 = file.name;

        if (isValid(file.size)) {
            moveUploadedFile(file, uuid, function () {
                    responseData.success = true;
                    res.send(responseData);
                },
                function () {
                    responseData.error = "Problem copying the file!";
                    res.send(responseData);
                });
        }
        else {
            failWithTooBigFile(responseData, res);
        }
    }

    function onChunkedUpload(fields, file, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        let size = parseInt(fields.qqtotalfilesize),
            uuid = fields.qquuid,
            index = fields.qqpartindex,
            totalParts = parseInt(fields.qqtotalparts),
            responseData = {
                success: false
            };

        file.name = fields.qqfilename;

        if (isValid(size)) {
            storeChunk(file, uuid, index, totalParts, function () {
                    if (index < totalParts - 1) {
                        responseData.success = true;
                        res.send(responseData);
                    }
                    else {
                        combineChunks(file, uuid, function () {
                                responseData.success = true;
                                res.send(responseData);
                            },
                            function () {
                                responseData.error = "Problem conbining the chunks!";
                                res.send(responseData);
                            });
                    }
                },
                function (reset) {
                    responseData.error = "Problem storing the chunk!";
                    res.send(responseData);
                });
        }
        else {
            failWithTooBigFile(responseData, res);
        }
    }

    function failWithTooBigFile(responseData, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header

        responseData.error = "Too big!";
        responseData.preventRetry = true;
        res.send(responseData);
    }
//delete new photo
    function onDeleteFile1(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        //console.log("result=" + req.params.uuid);
        let uuid = req.params.uuid,
            dirToDelete = "uploadfiles/" + uuid;
        rimraf(dirToDelete, function(error) {
            if (error) {
                console.error("Problem deleting file! " + error);
                res.status(500);
            }
            res.send();
        });
    }
    //delete old photo
    function onDeleteFile2(req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*"); // Allow cross domain header
        let dirToDelete = "uploadfiles/" + olduuid[0].Layer_Uploader_name;
        rimraf(dirToDelete, function(error) {
            if (error) {
                console.error("Problem deleting file! " + error);
                res.status(500);
            }
            res.send();
        });
    }

    function isValid(size) {
        return maxFileSize === 0 || size < maxFileSize;
    }

    function moveFile(destinationDir, sourceFile, destinationFile, success, failure) {
        //console.log(destinationDir);
        mkdirp(destinationDir, function (error) {
            let sourceStream, destStream;
            if (error) {
                console.error("Problem creating directory " + destinationDir + ": " + error);
                failure();
            }
            else {
                sourceStream = fs.createReadStream(sourceFile);
                destStream = fs.createWriteStream(destinationFile);

                sourceStream
                    .on("error", function (error) {
                        console.error("Problem copying file: " + error.stack);
                        destStream.end();
                        failure();
                    })
                    .on("end", function () {
                        destStream.end();
                        success();
                    })
                    .pipe(destStream);
                }
        });

        // let sourceStream = fs.createReadStream(sourceFile);
        // let destStream = fs.createWriteStream(destinationFile);
        //
        // sourceStream.on("error", function (error) {
        //         console.error("Problem copying file: " + error.stack);
        //         destStream.end();
        //         failure();
        // }).on("end", function () {
        //     destStream.end();
        //     success();
        // }).pipe(destStream);
    }

    function moveUploadedFile(file, uuid, success, failure) {
        let destinationDir = "uploadfiles/",
            fileDestination = destinationDir + uuid + "_" + file.name;

        moveFile(destinationDir, file.path, fileDestination, success, failure);
    }

    function storeChunk(file, uuid, index, numChunks, success, failure) {
        let destinationDir = uploadedFilesPath + uuid + "/" + chunkDirName + "/",
            chunkFilename = getChunkFilename(index, numChunks),
            fileDestination = destinationDir + chunkFilename;

        moveFile(destinationDir, file.path, fileDestination, success, failure);
    }

    function combineChunks(file, uuid, success, failure) {
        let chunksDir = uploadedFilesPath + uuid + "/" + chunkDirName + "/",
            destinationDir = uploadedFilesPath + uuid + "/",
            fileDestination = destinationDir + file.name;


        fs.readdir(chunksDir, function (err, fileNames) {
            let destFileStream;

            if (err) {
                console.error("Problem listing chunks! " + err);
                failure();
            }
            else {
                fileNames.sort();
                destFileStream = fs.createWriteStream(fileDestination, {flags: "a"});

                appendToStream(destFileStream, chunksDir, fileNames, 0, function () {
                        rimraf(chunksDir, function (rimrafError) {
                            if (rimrafError) {
                                console.log("Problem deleting chunks dir! " + rimrafError);
                            }
                        });
                        success();
                    },
                    failure);
            }
        });
    }

    function appendToStream(destStream, srcDir, srcFilesnames, index, success, failure) {
        if (index < srcFilesnames.length) {
            fs.createReadStream(srcDir + srcFilesnames[index])
                .on("end", function () {
                    appendToStream(destStream, srcDir, srcFilesnames, index + 1, success, failure);
                })
                .on("error", function (error) {
                    console.error("Problem appending chunk! " + error);
                    destStream.end();
                    failure();
                })
                .pipe(destStream, {end: false});
        }
        else {
            destStream.end();
            success();
        }
    }

    function getChunkFilename(index, count) {
        let digits = new String(count).length,
            zeros = new Array(digits + 1).join("0");

        return (zeros + index).slice(-digits);
    }

    function sendToken(username, subject, text, url, res) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    token = buf.toString('hex');
                    tokenExpTime();
                    done(err, token, tokenExpire);
                });
            },
            function (token, tokenExpire, done) {
                myStat = "UPDATE UserLogin SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE username = '" + username + "' ";
                myVal = [token, tokenExpire];
                con_CS.query(myStat, myVal, function (err, rows) {

                    if (err) {
                        console.log(err);
                        res.json({"error": true, "message": "Token Insert Fail !"});
                    } else {
                        done(err, token);
                    }
                });
            },
            function(token, done, err) {
                // Message object
                var message = {
                    from: 'FTAA <aaaa.zhao@g.northernacademy.org>', // sender info
                    to: username, // Comma separated list of recipients
                    subject: subject, // Subject of the message

                    // plaintext body
                    text: 'You are receiving this because you (or someone else) have requested ' + text + '\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    url + token + '\n\n' +
                    'If you did not request this, please ignore this email.\n'
                };

                smtpTrans.sendMail(message, function(error){
                    if(error){
                        console.log(error.message);
                        res.json({"error": true, "message": "An unexpected error occurred !"});
                    } else {
                        res.json({"error": false, "message": "Message sent successfully !"});
                        // alert('An e-mail has been sent to ' + req.body.username + ' with further instructions.');
                    }
                });
            }
        ], function(err) {
            if (err) return next(err);
            // res.redirect('/forgot');
            res.json({"error": true, "message": "An unexpected error occurred !"});
        });
    }

    function sendname(username, subject, text, url, res){
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    token = buf.toString('hex');
                    tokenExpTime();
                    done(err, token, tokenExpire);
                });
            },
            function (token, tokenExpire, done) {
                myStat = "UPDATE UserLogin SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE PendingUsername = '" + username + "' ";
                myVal = [token, tokenExpire];
                con_CS.query(myStat, myVal, function (err, rows) {

                    if (err) {
                        console.log(err);
                        res.json({"error": true, "message": "Token Insert Fail !"});
                    } else {
                        done(err, token);
                    }
                });
            },
            function(token, done, err) {
                // Message object
                var message = {
                    from: 'FTAA <aaaa.zhao@g.northernacademy.org>', // sender info
                    to: username, // Comma separated list of recipients
                    subject: subject, // Subject of the message
                    // plaintext body
                    text: 'You are receiving this because you (or someone else) have requested ' + text + '\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    url + token + '\n\n' +
                    'If you did not request this, please ignore this email.\n'
                };

                smtpTrans.sendMail(message, function(error){
                    if(error){
                        console.log(error.message);
                        res.json({"error": true, "message": "An unexpected error occurred !"});
                    } else {
                        res.json({"error": false, "message": "Message sent successfully !"});
                        // alert('An e-mail has been sent to ' + req.body.username + ' with further instructions.');
                    }
                });
            }
            ], function(err) {
            if (err) return next(err);
            res.json({"error": true, "message": "An unexpected error occurred !"});
        });
    }

    function successMail(username, subject, text, res) {
        var message = {
            from: 'FTAA <aaaa.zhao@g.northernacademy.org>',
            to: username,
            subject: subject,
            text: text
        };

        smtpTrans.sendMail(message, function (error) {
            if(error){
                console.log(error.message);
            } else {
                res.render('success.ejs', {});
            }
        });
    }


    function copyXML(){
        const downloadDir = path.resolve(__dirname, downloadPath, 'ows.xml'); //the path of the source file
        const today = new Date();//get the current date
        let date = today.getFullYear()+ '_' +(today.getMonth()+1)+ '_' + today.getDate();
        let time = today.getHours() + "_" + today.getMinutes()+'_' + today.getSeconds();
        let dataStr = date + "_"+ time;
        let downloadDis = 'config/geoCapacity/' + dataStr+ '.xml'; //define a file name

        fsextra.copy(downloadDir, downloadDis) //copy the file and rename
            .then(//if copy succeed, call pre-download XML function
                console.log('copy successful'),
                predownloadXml ()
            )
    }

    function predownloadXml () {
        const downloadDir = path.resolve(__dirname, downloadPath, 'ows.xml'); // the path of the destination
        const timeout = 600000;
        const requestOptions = {
            uri: 'http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities',
            // timeout: download_interval
            timeout:timeout
        };
        let resXMLRequest;
        console.log('predownloadXML was called');

        request.get(requestOptions)
            .on('error',function(err){ //called when error
                console.log(err.code);
                console.log('predownloadXML error');
                removeFile();
                // process.exit(0)
            })
            .on('response', function (res) {
                console.log('predownloadXML res');
                resXMLRequest = res;
                if (res.statusCode === 200){
                    res.pipe(fs.createWriteStream(downloadDir))
                } else {
                    console.log("Respose with Error Code: " + res.statusCode);
                    removeFile();
                    // process.exit(0)
                }
            })
            .on('end', function () {
                downloadFalse = false;
                console.log("The End: " + resXMLRequest.statusCode);
                removeFile();
                // process.exit(0)
            })
    }

    function removeFile() {
        console.log('the remove function was called');

        const dir = 'config/geoCapacity'; //the dir of the file that I am going to remove.

        fs.readdir(dir, (err, files) => {
            // let fileName = []; // create an empty array
            // fileName.push(files); //push the file name into the array
            // console.log(files);

            if(files.length > num_backups){ //if there are more than 100 file in the directory
                if(!downloadFalse){ //if download succeed, run the code below
                    fs.unlink('config/geoCapacity/'+ files[0], (err) => { //delete the first (the oldest) file in the directory
                        if (err) {throw err} else {
                            downloadFalse = true; //change the value of "downloadFalse" to true
                        }
                        console.log('download and remove copy successfully');
                    })
                } else { //if download failed, run the code below
                    fs.unlink('config/geoCapacity/'+ files[files.length-1], (err) => { //then delete the last (the latest) file in the directory
                        if (err) {throw err}
                        console.log('download file failed, removed copy successfully')
                    })
                }
            }
        });
    }


};