var confidencial = require('../lib/confidencial');

var url = 'http://confidencial.com.ni/articulo/19306/cosep-cambio-electoral-en-2015';

confidencial.getArticle(url, function(resultData) {
  console.log(resultData);
});
