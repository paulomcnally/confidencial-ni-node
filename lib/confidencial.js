// Load modules
var jsdom = require('jsdom');
var fs = require('fs');
var S = require('string');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var jquery = fs.readFileSync(require('path').resolve(__dirname, 'jquery.min.js')).toString();

// confidencial categories
var categories = new Array();
categories.push('http://www.confidencial.com.ni/politica/1');
categories.push('http://www.confidencial.com.ni/blogs/40');
categories.push('http://www.confidencial.com.ni/economia/2');
categories.push('http://www.confidencial.com.ni/economia/2/20');
categories.push('http://www.confidencial.com.ni/nacion/4/3');
categories.push('http://www.confidencial.com.ni/mundo/4');
categories.push('http://www.confidencial.com.ni/centroamerica/4/1');
categories.push('http://www.confidencial.com.ni/vida-y-ocio/30');
categories.push('http://www.confidencial.com.ni/turismo/30/35');
categories.push('http://www.confidencial.com.ni/tecnologia/30/32');
categories.push('http://www.confidencial.com.ni/gastronomia/30/34');
categories.push('http://www.confidencial.com.ni/espectaculo/30/33');
categories.push('http://www.confidencial.com.ni/deportes/30/36');
categories.push('http://www.confidencial.com.ni/cultura/30/71');
categories.push('http://www.confidencial.com.ni/reporte-ciudadano/60');
categories.push('http://www.confidencial.com.ni/denuncias/60/62');
categories.push('http://www.confidencial.com.ni/yo-opino/60/61');


// article scraping data
var parseArticleOptions = {
    domain: "http://www.confidencial.com.ni/",
    elements: [
        {
            name: 'title',
            sel: function ($) {
                var result = $('#articleheader h2').text().trim();
                return ( !S(result).isEmpty() ) ? result : '';
            }
        },
        {
            name: 'title_sub',
            sel: function($) {
                var result = $('#articleheader h3').text().trim();
                return ( !S(result).isEmpty() ) ? result : '';
            }
        },
        {
            name: 'title_paragraph',
            sel: function($) {
                var result = $('#articleheader p.bold').text().trim();
                return ( !S(result).isEmpty() ) ? result : '';
            }
        },
        {
            name: 'author',
            sel: function($) {
                var result = $('#articleheader p.authorname').text().trim().split("|")[0].trim();
                return ( !S(result).isEmpty() ) ? result : '';
            }
        },
        {
            name: 'date',
            sel: function($) {
                var result = $('#articleheader p.authorname').text();
                if( !S(result).isEmpty() ){
                    result = result.match( /(\d{1,2}\/\d{1,2}\/\d{4})/g );
                }

                return ( !S(result).isEmpty() ) ? S(result).left(9).s : '';
            }
        },
        {
            name: 'images',
            sel: function($) {
                var result = [];
                var array = $("article img").map(function() {
                    return $(this).attr("src");
                }).get();
                array.forEach(function(item){
                    result.push( parseArticleOptions.domain + item );
                });
                return ( !S(result).isEmpty() ) ? result : [];
            }
        },
        {
            name: 'category',
            sel: function($) {
                var result = $("#quicknav").text();
                if( !S(result).isEmpty() ){
                    result = S(result).trim().s;
                    result = S(result).replaceAll('Confidencial', '').s;
                    result = S(result).replaceAll('Leer artículo', '').s;
                    result = S(result).replaceAll('»', '').s;
                    result = S(result).trim().s;

                }
                return ( !S(result).isEmpty() ) ? S(result).trim().s : '';
            }
        },
        {
            name: 'content',
            sel: function($) {
                var new_result = "";
                var result = $("article div.content_article div.text_article").html().trim();
                if( !S(result).isEmpty() ){
                    new_result = S( result ).stripTags('p,br,strong').s;

                    new_result = S( new_result ).collapseWhitespace().s;
                    new_result = S( new_result ).replaceAll('<br />', '\n').s;
                    new_result = S( new_result ).replaceAll('<p>', '').s;
                    new_result = S( new_result ).replaceAll('</p>', '\n').s;
                    new_result = S( new_result ).replaceAll('&nbsp;', '').s;

                    new_result = S( new_result.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, "$2 $1") ).trim().s;

                    new_result = new_result.replace(/<(?:.|\n)*?>/gm, '');

                    if( S( new_result).endsWith('\n') ){

                    }
                }
                return ( !S(result).isEmpty() ) ? S(new_result).trim().s : '';
            }
        }
    ]
};


// simple function to compare if exist item in array
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}


// function to parse data
function parse(site, callback) {
    jsdom.env({
        url: site,
        scripts: ["http://code.jquery.com/jquery.js"],
        done: function (err, window) {
            callback(window.$, err);
        }
    });
};


// Global function to get all links from all categories
module.exports.getAllLinks = function(callback){
    function out(){
        var result = [];

        var fetch = function(url,cb){
            request(url, function(err,response,body){
                if ( err ){
                    cb( err );
                } else {
                    cb( null, body ); // First param indicates error, null=> no error
                }
            });
        }

        async.map(categories, fetch, function(err, results){
            if ( err){
                console.log(err);
                // either file1, file2 or file3 has raised an error, so you should not use results and handle the error
            } else {
                results.forEach(function(category){
                    $ = cheerio.load(category);
                    var links = $('.article h3 a,article h2 a'); //use your CSS selector here
                    $(links).each(function(i, link){

                        var article_url = 'http://confidencial.com.ni/' + $(link).attr('href');

                        if( !inArray( article_url, result ) ){

                            result.push( article_url );
                        }
                    });

                });

                callback(result);
            }
        });
    }

    out();
}


// global function to get data from article url
module.exports.getArticle = function(site, cb){

    function getId(url){
        var id = url.split('/');
        return id[4];
    }

    function out(url) {
        parse(url, function ($, err) {
            var result = {};
            result.id = getId(url);
            result.url = url;
            parseArticleOptions.elements.forEach(function (elem) {
                result[elem.name] = elem.sel($);
            });

            cb(result, err);
        });
    }

    out(site);

}
