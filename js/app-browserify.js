// es5 and 6 polyfills, powered by babel
require("babel/polyfill")

let fetch = require('./fetcher')

var $ = require('jquery'),
    Backbone = require('backbone')

console.log('loaded dist file')

// other stuff that we don't really use in our own code
// var Pace = require("../bower_components/pace/pace.js")

// require your own libraries, too!
// var Router = require('./app.js')

// window.addEventListener('load', app)

// function app() {
// start app
// new Router()
// }
var lat = "29.7353",
    long = "-95.3904"

var place = "Houston, TX, USA"

function getLatLong() {
    var data = navigator.geolocation.getCurrentPosition(function(data){
    lat = data.coords.latitude
    long = data.coords.longitude
    place = "Houston, TX, USA"
    wm.fetch({
            url: wm.url + `${lat},${long}`,
            dataType: 'jsonp'
        })
    location.hash = ''  
    })
}

function geoAjax(query){
    var geoUrl = "https://maps.googleapis.com/maps/api/geocode/json?address="
    
    return $.ajax({url: geoUrl + query})

}


function userQuery(event) {
    if (event.keyCode === 13) {
        var inputEl = event.target,
            query = inputEl.value

        location.hash = `search/${query}`
        event.target.value = ''
    }
}
$('#searchBar')[0].addEventListener('keypress', userQuery)
$('#currentLoc')[0].addEventListener('click', getLatLong)

var WeatherModel = Backbone.Model.extend({

    url: "https://api.forecast.io/forecast/b79c4066ee5c0ab13cf70ab690dff82f/",
    parse: function(responseData) {
        return responseData
    }
})

var wm = new WeatherModel

var WeatherView = Backbone.View.extend({

    el: '#container',

    getCurrently: function() {
        var currentWeatherObj = this.model.attributes.currently
        var currentTemp = currentWeatherObj.apparentTemperature,
            humidity = currentWeatherObj.humidity,
            rain = currentWeatherObj.precipProbability,
            summary = currentWeatherObj.summary



        currentTemp = currentTemp.toString().slice(0, 2) + '&deg' + 'F'
        humidity = humidity.toString().slice(2, 4) + '%'

        rain = rain.toString().slice(2, 4).replace('0', '') + '%'

        if (rain[0] === '%') rain = '0%'



        var weatherString = `<li>${summary}</li>
						<li>Current Temperature is ${currentTemp}</li>
						<li>Humidity is ${humidity}</li>
						<li>Chance of rain is ${rain}</li>`
        window.weatherString = weatherString
        return weatherString

    },

    getDaily: function() {
        var dailyWeatherArr = this.model.attributes.daily.data,
            dailyWeatherStr = ''


        dailyWeatherArr.forEach(function(dayObj) {
            var tempMax = dayObj.apparentTemperatureMax,
                tempMin = dayObj.apparentTemperatureMin,
                humidity = dayObj.humidity,
                rain = dayObj.precipProbability,
                summary = dayObj.summary,
                dayOfWeek = dayObj.time

            tempMax = tempMax.toString().slice(0, 2) + '&deg' + 'F'
            tempMin = tempMin.toString().slice(0, 2) + '&deg' + 'F'

            humidity = humidity.toString().slice(2, 4) + '%'
            rain = rain.toString().slice(2, 4).replace('0', '') + '%'
            if (rain[0] === '%') rain = '0%'


            dayOfWeek = new Date(dayOfWeek * 1000).getDay()
            var weekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            for (var i = 0; i < 7; i++) {
                if (i === dayOfWeek) dayOfWeek = weekArray[i]
            }


            dailyWeatherStr += `<ul id="dailyWeather">
									<li id="weekDay">${dayOfWeek}</li>
									<li class="weekSummary">${summary}</li>
									<li class="weekSummary">${tempMax}/${tempMin}</li>
									<li class="weekSummary">Humidity is ${humidity}</li>
									<li class="weekSummary">Chance of Rain is ${rain}</li>
								</ul>`

        })
        window.dailyWeatherStr = dailyWeatherStr
        return dailyWeatherStr
    },

    getHourly: function() {

    },

    render: function() {
        this.$el.html(
            `<div id="weatherContainer">
				<div id="currentContainer">
					<h1> Current Weather in ${place} </h1>
					<ul id="currently">${this.getCurrently()}</ul>
				</div>
				<div id="dailyContainer">
					<h1> Weather for the Week </h1>
					<div id="daily">${this.getDaily()}</div>
				</div>
			</div>`
        )
    },

    initialize: function() {

        this.listenTo(this.model, 'change', this.render)
    }

})

var wv = new WeatherView({model: wm})

var WeatherRouter = Backbone.Router.extend({

    routes: {
        'search/:query': 'showResults',
        '*anyroute': 'showDefault'
    },



    initialize: function() {
        Backbone.history.start()
    },

    showDefault: function() {
        console.log('running show default')
        wm.fetch({
            url: wm.url + `${lat},${long}`,
            dataType: 'jsonp'
        })           
    },

    showResults: function(query){
        console.log('responding to hash change')

        geoAjax(query).done(function(data){

            var loc = data.results[0]
            lat = loc.geometry.location.lat
            long = loc.geometry.location.lng
            place = loc.formatted_address

            wm.fetch({
                url: wm.url + `${lat},${long}`,
                dataType: 'jsonp',
            })
        })  
    }
})

var thisRouter = new WeatherRouter()