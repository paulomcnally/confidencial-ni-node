var confidencial = require('../lib/confidencial');

confidencial.getArticle('http://www.confidencial.com.ni/articulo/13169/turismo-al-pie-del-mombacho', function(resultData) {
    console.log(resultData);
});

confidencial.getAllLinks(function(data){
   console.log(data);
});