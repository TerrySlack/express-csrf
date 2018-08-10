#  Steps to setup csrf protection, using Node and a jQuery Client

###### 1   install `crsf, cookie-parser, express` with `yarn` or `npm`
###### 2   On the node server:
```
    Require:
        ######Create a secret.  Better to get from an env file.
        - secret = "afc7efd0-e71b-41c7-9107-05e0f32e06db", 
        - cookieParser = require('cookie-parser'),
        - csrf = require('csurf')
```
```    
    Create: Note the ignore methods tell the crsf lib to ignore Get, Head and 
    Options requests.  
    Only use Get with Login and JoinUs
    csrfProtection = csrf({
        ignoreMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
        cookie: { 
            path: '/', 
            key: '_csrf', 
            signed: true, 
            sameSite: true, 
            httpOnly: true 
            }
    });
```
    Create App and:
    app = express();

    //cookieparser needs to be setup BEFORE csrfProtection is used by the app.
    app.use(cookieParser(secret));
    app.use(csrfProtection);
    app.use(function(err, req, res, next) {
        //For csrf specific errors
        if (err.code !== 'EBADCSRFTOKEN') return next(err);
        res.status(403).json({"error": `session has expired or tampered with ${err.code} ${err.message}`});
    });

###### 3   The Kicker:
    For crsf to work properly, an initial request needs to be made to the server.  
    In this case, kick things off with either a joinus request or a login request.
    YOU MUST ALWAYS RETURN THE CSRF WITH EACH REQUEST, ALONG WITH WHATEVER DATA NEEDS TO
    BE RETURNED, OR IT WILL FAIL.

###### 4   Client side
    In your client script, in the then statement, or the respones from an await statement,
    part of the data will contain a key, with the crsf value.
    In this example, I call if csrf.  But you can call it whatever you want.

    After the initial get, any other request Ie Post, Delete, Put, you must set the header
    'XSRF-TOKEN', with the value of the returned csrf property in
    your data.  IF YOU DON'T YOU WILL GET A FORBIDDEN ERROR MESSAGE SENT TO WHATEVER
    MECHANISM USED TO TRAP ERRORS ON AJAX REQUESTS.    




