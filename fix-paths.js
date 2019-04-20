var fs = require('fs');
var basePath = "./public";

var walkSync = function(dir, filelist) {
            var path = path || require('path');
            var fs = fs || require('fs'),
                files = fs.readdirSync(dir);
            filelist = filelist || [];
            files.forEach(function(file) {
                if (fs.statSync(path.join(dir, file)).isDirectory()) {
                    filelist = walkSync(path.join(dir, file), filelist);
                }
                else {
                    filelist.push(path.join(dir, file));
                }
            });
            return filelist;
        };

var files = walkSync(basePath);

for(var i = 0; i < files.length; i++){
	var f = files[i];
	if (f.match(/\.(css|js|html)/g) !== null) {
		console.log('change ', f);
		var data = fs.readFileSync(f, 'utf8');
		data = data
			.replace(/(["'])\/fonts/g, '$1fonts')
			.replace(/(["'])\/js/g, '$1js')
			.replace(/(["'])\/css/g, '$1css')
			.replace(/(["'])\/img/g, '$1img');
		fs.writeFileSync(f, data, 'utf8');
	}
}
