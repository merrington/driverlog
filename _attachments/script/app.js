$(function() {   
    var path = unescape(document.location.pathname).split('/'),
        design = path[3],
        db = $.couch.db(path[1]);

    function showRides() {
        db.view(design + "/date", {reduce: false, descending: true, include_docs: true, 
            success: function(data) {
                var rides = Mustache.render($("#trip-details").html(), {
                    items: data.rows.map(function(r) {return r.doc;}),
                    dateString: function() {
                        return function(val, render) {
                            var date = new Date(parseInt(render(val)));
                            return moment(date).format("ddd., MMM. Do, YYYY, h:mm a");
                        }
                    }
                });
                $("#history").html(rides);
            }
        });
    }
    showRides();

    function showTotals() {
        db.view(design + "/totals", {reduce: true, group: true,
            success: function(data) {
                var round = Number.MAX_SAFE_INTEGER; //set the "round" (number of times score has been reset)
                data.rows.forEach(function(i) {     //loop over every user
                    var userRound = Math.floor(i.value/3);  //calculate what "round" they are on
                    if (userRound < round)   //if the users round is lower then the existing round, use it instead
                        //e.g. - if userA has a score of 5 their round = 1  (5/3 = 1.something), but userB has a score of 6 their round is 2, the overall round is 1
                        round = userRound;
                });
                data.rows.forEach(function(i) {
                    i.value = i.value-(3*round);    //set the users value to the result of their total points - (3*round)
                });
                data.rows.sort(function(a,b) {
                    return a.value - b.value;
                });
                var totals = Mustache.render($("#current-totals").html(), {
                    items: data.rows
                });
                $("#totals-body").html(totals);
            }
        });
    }
    showTotals();

    $("#add-trip").submit(function(e) {
        e.preventDefault();
        $("#submit").attr("disabled", true);
        var form = this, 
        doc = {
            "driver": $("#driver-input option:selected").text(),
            "points": parseInt($("#points-input").val()),
            "location": $("#location-input").val()
        };
        doc.date = new Date().getTime();
        getWeather(function(data) {
            doc.weather = {
                summary: data.currently.summary,
                precipProbability: parseInt(data.currently.precipProbability)*100,
                intensity: data.currently.precipIntensity
            }
            db.saveDoc(doc, {success : function() {
                form.reset();
                document.location.reload(true);
            }});
            return false;
        });
    });


    // Weather
    function getWeather(callback) {
        $.ajax({
            url: "https://api.forecast.io/forecast/3d4cce657744a0f0869db406028dc418/43.8487914,-79.3382946",
            data: {
                units: "ca"
            },
            dataType: "jsonp",
            jsonp: "callback",
            success: callback
        });
    }

    getWeather(function(data) {
        var weather = Mustache.render($("#weather-details").html(), data);
        $("#weather-body").html(weather);
        var skycons = new Skycons({resizeClear: true});
        skycons.add("wicon", data.currently.icon);
        skycons.play();
    });

    // 5PM forecast
    var d = new Date();
    d.setHours(17); d.setMinutes(0); d.setSeconds(0); d.setMilliseconds(0);
    d = d/1000;
    console.log(d);
    $.ajax({
        url: "https://api.forecast.io/forecast/3d4cce657744a0f0869db406028dc418/43.8487914,-79.3382946,"+d,
        data: {
            units: "ca"
        },
        dataType: "jsonp",
        jsonp: "callback",
        success: function(data) {
            data.currently.precipProbability = data.currently.precipProbability*100;
            var weather = Mustache.render($("#5pm-weather-details").html(), data);
            $("#5pm-display").html(weather);
        }
    });

});