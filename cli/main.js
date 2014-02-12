(function () {
    'use strict';
  
    var context = null,
        chart = null,

        /**
        * Function called once DOM is loaded.
        */
        loaded = function () {
            var title = document.getElementById("chart-heading");
            title.innerText = chartData.title;
            context = document.getElementById("DOMChart").getContext("2d");
            chart = new Chart(context).Line(chartData);
        };

    window.addEventListener('load', loaded, false);
  
}());