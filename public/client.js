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