(function () {
    'use strict';
  
    var context = null,
        chart = null,

        /**
        * Function called once DOM is loaded.
        */
        loaded = function () {
            var title = document.getElementById("chart-heading");
            context = document.getElementById("DOMChart").getContext("2d");
            if (chartData) {
                title.innerText = chartData.title;
                chart = new Chart(context).Line(chartData);
            } else {
              title.innerText = 'Please run a test first.';
            }
        };

    window.addEventListener('load', loaded, false);
  
}());