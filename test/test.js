var confidencial = require('../lib/confidencial');

confidencial.getArticle('http://www.confidencial.com.ni/articulo/13219/portazo-parlamentario-a-jarquin', function(resultData) {
    console.log(resultData);
});

//confidencial.getAllLinks(function(data){
//   console.log(data);
//});