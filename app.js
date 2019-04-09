var SERVER_PORT = 8080;
var fs = require('fs');

/* Sass auto renderer*/
(function(){
    var sass = require('node-sass');

    var basePath = './scss';
    var saveBasePath = './public/css';

    var recompile = function(eventType, fname){
        if (eventType == 'change'){
            var path = basePath + '/' +  fname;
            console.log('Sass compiler: recompile '+ path);
            sass.render({
                file: path,
                //outputStyle: compressed;
            }, function(err, result){
                if (err) {
                    console.error('Sass compiler error in '
                        + path
                        + ': ' +err);
                } else {
                    fs.writeFileSync(saveBasePath
                        +'/'+fname.replace('.scss', '.css'),
                        result.css, 'utf8');
                }
            });
        }
    };


    var files = fs.readdirSync('./scss', 'utf8');
    for(var i in files){
        if (fs.lstatSync(basePath+'/'+files[i]).isFile()){
            recompile('change', files[i]);
            fs.watch(basePath+'/'+files[i], 'utf8', recompile);
        }
    }
    fs.watch(basePath, 'utf8', function(eventType, fname){
        if (eventType == 'rename' && fname
            && fs.lstatSync(basePath+'/'+fname).isFile()){

            console.log('New file in '+basePath);
            recompile('change', fname);
            fs.watch(basePath+'/'+fname, 'utf8', recompile);
        }
    });
})();


/* express server */
var express = require("express");
var app = express();

app.use(express.static("css"));
app.use(express.static("public"));

app.get("/", function(req, res){
    res.redirect("/index.html");
});

app.get("*", function(req, res, next){
    if (!req.path.match(/\..*$/)) {
        res.redirect(req.path + "index.html");
    }
    next();
});

app.listen(SERVER_PORT, function(){console.log("Server is listening on "+SERVER_PORT+" port");})
