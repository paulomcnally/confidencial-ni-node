confidencial-ni-node
====================

Web scraping http://www.confidencial.com.ni/


Instalar:

    npm install confidencial-ni-node

Ejemplo - Obtener artículo:

    var confidencial = require('confidencial-ni-node');
    confidencial.getArticle('http://www.confidencial.com.ni/articulo/13169/turismo-al-pie-del-mombacho', function(resultData) {
        console.log(resultData);
    });


Ejemplo - Obtener enlaces de categorías

    var confidencial = require('confidencial-ni-node');
     confidencial.getAllLinks(function(data){
        console.log(data);
     });

