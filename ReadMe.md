#  Steps to setup csrf protection, using Node and a jQuery Client

###### 1   install `crsf, cookie-parser, express` with `yarn` or `npm`

```
npm install --save crsf cookie-parser express
```
###### 2   On the node server:
```javascript
const 
    //Better to get from an env file.>
    secret = "afc7efd0-e71b-41c7-9107-05e0f32e06db", 
    cookieParser = require('cookie-parser'),
    csrf = require('csurf'),
   
    // Note the ignore methods tell the crsf lib to ignore Get, 
    // Head and Options requests. 
    csrfProtection = csrf({
        ignoreMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
        cookie: { 
            path: '/', 
            key: '_csrf', 
            signed: true, 
            sameSite: true, 
            httpOnly: true 
            }
    }),
    app = express();

    // cookieparser needs to be setup BEFORE csrfProtection is used
    // by the app.
    app.use(cookieParser(secret));
    app.use(csrfProtection);
    app.use(function(err, req, res, next) {
        //For csrf specific errors
        if (err.code !== 'EBADCSRFTOKEN') return next(err);
        res.status(403).json({"error": `session has expired or tampered with ${err.code} ${err.message}`});
    });
```
###### 4   Node and Client side
    For csrf to work properly, an initial requests needs to be made
    to the server and the csrf token returned.  This needs to be done
    with each subsequent request.
```javascript
    //Node express, inside a route
    app.get('/someroute', function (req, res) {
    //Process and do whatever then
    
    res.json({"csrf":req.csrfToken(),  data:"Some other data"});
  }); 
```
###### After the initial request comes down, you need to then set the header `XSRF-TOKEN`, with the value of the csrf property in the returned data.

    Using a jQuery client, this process is illustrated
```javascript
    (function(){
        var
            app = $("#app");
        //Hit the curl to test the passport cookie strategy out.
        $("#btnTest").on( "click", function() {              
            $.ajax({
                url: "/api/comeonin",
                method: "GET",
                data: { uid: "Terry", password: "blarg" }
            })
            .done(function( data ) {
                var 
                    oldCrsf = data.csrf;
                    
                
                app.html(`data is ${JSON.stringify(data)}`);
                $.ajax({
                    url: "/api/someDataRoute",
                    method: "POST",
                    data: { request: "Data on Jackie", user: data.user },
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('XSRF-TOKEN', oldCrsf);
                    }
                })
                .done(function( response ) {
                    var 
                        crsfStrings = `old crsf: ${oldCrsf} ::: new crsf:  ${response.crsf} and user role(s) are: ${response.data}`;
                    app.append(crsfStrings);
                })
                .fail(function( jqXHR, textStatus, errorThrown ) {
                    app.html(`Error occured: ${errorThrown}`);
                });
                
            })
            .fail(function( jqXHR, textStatus, errorThrown ) {
                app.html(`Error occured: ${errorThrown}`);
            });
        });
        
    })();
```
   If you don't, you will get a forbidden error message
   returned.