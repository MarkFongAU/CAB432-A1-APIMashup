const express = require('express');
const https = require('https');
const async = require('async');
const request = require('request');
const viewsPath = __dirname + '/views/';
var router = express.Router();

// Router
router.use(function (req, res, next) {
    console.log("Index page: /" + req.method);
    next();
});

// GET home page
router.get('/', function (req, res) {
    res.render('index', {
        location: 'Brisbane',
        categories: null,
        cuisines: null,
        establishments: null
    });
});

// GET city parameters dynamically
router.get('/searchCity', function (clientReq, clientRes) {
    console.log("Input:" + clientReq.query.city);

    var cities = [];

    var zomato = {
        apikey: "41545c45de7c80b47f11e144fb5f64cf"
    };

    var defaultOptions = {
        hostname: 'developers.zomato.com',
        port: 443,
        path: '/api/v2.1/',
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-key': zomato.apikey // Zomato API Key
        }
    };

    function createZomatoCityOptions(defaultOptions, clientReq, apiType) {
        var str = apiType + '?' +
            'q=' + clientReq.query.city;
        defaultOptions.path += str;
        return defaultOptions;
    }

    var options = createZomatoCityOptions(defaultOptions, clientReq, "cities");

    var zomatoReq = https.request(options, function (zomatoRes) {
        var body = [];
        zomatoRes.on('data', function (chunk) {
            body.push(chunk);
        });
        zomatoRes.on('end', function () {
            var bodyString = body.join('');
            var rsp = JSON.parse(bodyString);

            // Process the response of cities into a city array
            for (var eachIndex in rsp.location_suggestions) {
                var jObject = {
                    id: rsp.location_suggestions[eachIndex].id,
                    name: rsp.location_suggestions[eachIndex].name
                };
                cities.push(jObject);
            }
            // console.log(cities);
            clientRes.send(cities);
        });
    });

    zomatoReq.on('error', (e) => {
        console.error(e);
    });

    zomatoReq.end();
});

// GET parameters to be displayed in the form
router.get('/getCity', function (clientReq, clientRes) {
    var zomato = {
        apikey: "41545c45de7c80b47f11e144fb5f64cf"
    };

    function createZomatoCityLatLon(clientReq, apiType, count) {
        var defaultOptions = {
            url: 'https://developers.zomato.com/api/v2.1/',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-key': zomato.apikey // Zomato API Key
            },
            json: true
        };

        var str = apiType + '?' +
            'query=' + clientReq.query.city +
            '&count=' + count;
        defaultOptions.url += str;
        return defaultOptions;
    }

    function createZomatoCityCategories(clientReq, apiType) {
        var defaultOptions = {
            url: 'https://developers.zomato.com/api/v2.1/',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-key': zomato.apikey // Zomato API Key
            },
            json: true
        };

        var str = apiType;
        defaultOptions.url += str;
        return defaultOptions;
    }
    function createZomatoCityCuisines(clientReq, apiType) {
        var defaultOptions = {
            url: 'https://developers.zomato.com/api/v2.1/',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-key': zomato.apikey // Zomato API Key
            },
            json: true
        };

        var str = apiType + '?' +
            'city_id=' + clientReq.query.cityID;
        defaultOptions.url += str;
        return defaultOptions;
    }
    function createZomatoCityEstablishments(clientReq, apiType) {
        var defaultOptions = {
            url: 'https://developers.zomato.com/api/v2.1/',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'user-key': zomato.apikey // Zomato API Key
            },
            json: true
        };

        var str = apiType + '?' +
            'city_id=' + clientReq.query.cityID;
        defaultOptions.url += str;
        return defaultOptions;
    }

    var cityLatLon = createZomatoCityLatLon(clientReq, "locations", "1");
    var optionsCategories = createZomatoCityCategories(clientReq, "categories");
    var optionsCuisines = createZomatoCityCuisines(clientReq, "cuisines");
    var optionsEstablishments = createZomatoCityEstablishments(clientReq, "establishments");

    const options= [
        cityLatLon,
        optionsCategories,
        optionsCuisines,
        optionsEstablishments
    ];

    function multipleGet(options, callback) {
        request(options,
            function(err, res, body) {
                callback(err, body);
            }
        );
    }

    async.map(options, multipleGet, function (err, res){
        if (err) return console.log(err);

        var responseArray = {};
        var jObject;

        var latLon = [];
        for (var locationIndex in res[0].location_suggestions){
            jObject = {
                cityName: res[0].location_suggestions[locationIndex].city_name,
                cityID: res[0].location_suggestions[locationIndex].city_id,
                lat: res[0].location_suggestions[locationIndex].latitude,
                lon: res[0].location_suggestions[locationIndex].longitude
            };
            latLon.push(jObject);
        }
        // console.log(latLon);

        var categories = [];
        for (var categoryIndex in res[1].categories){
            jObject = {
                id: res[1].categories[categoryIndex].categories.id,
                name: res[1].categories[categoryIndex].categories.name
            };
            categories.push(jObject);
        }
        // console.log(categories);

        var cuisines = [];
        for (var cuisineIndex in res[2].cuisines){
            jObject = {
                id: res[2].cuisines[cuisineIndex].cuisine.cuisine_id,
                name: res[2].cuisines[cuisineIndex].cuisine.cuisine_name
            };
            cuisines.push(jObject);
        }
        // console.log(cuisines);

        var establishments = [];
        for (var establishmentIndex in res[3].establishments){
            jObject = {
                id: res[3].establishments[establishmentIndex].establishment.id,
                name: res[3].establishments[establishmentIndex].establishment.name
            };
            establishments.push(jObject);
        }
        // console.log(establishments);

        responseArray = {
            latLon: latLon,
            categories: categories,
            cuisines: cuisines,
            establishments: establishments
        };
        // console.log(responseArray);

        clientRes.send(responseArray);
    });
});

module.exports = router;
