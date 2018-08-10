const
    secret = "afc7efd0-e71b-41c7-9107-05e0f32e06db",
    cookieParser = require('cookie-parser'),
    csrf = require('csurf'),
    csrfProtection = csrf({
        ignoreMethods: [ 'GET', 'HEAD', 'OPTIONS' ], //Keep in mind, crsf protection only exists on posts then.  Get is exposed.  Use it for login and joinus
        cookie: { path: '/', key: '_csrf', signed: true, sameSite: true, httpOnly: true }
    }),
    express = require("express"),
    app = express();

app.use(cookieParser(secret));
app.use(csrfProtection);
app.use(function(err, req, res, next) {
    //For csrf specific errors
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403).json({"error": `session has expired or tampered with ${err.code} ${err.message}`});
});

app.use(express.static("public")); 
app.post('/api/someDataRoute', function (req, res) { 
    const 
        data = {"role":"admin"},
        crsf = req.csrfToken(); 
    console.log("in /api/someDataRoute and crsf is", crsf);
    
    res.json({crsf, data});
});
app.get('/api/comeonin', function (req, res) {
    /*
      Hit the web api, with the body.info
    */
    const
        uid = req.query["uid"],
        password = req.query["password"],
        user = {uid, otherData:"data that comes with successful login"};
    res.json({"csrf":req.csrfToken(),  user});
  });   
  
  app.listen(3500, () => {
    console.log("Node server listening on port 3500");
  });