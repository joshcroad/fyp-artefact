(function () {
    'use strict';

    var context = null,
        chart = null,

        /**
        * Function called once DOM is loaded.
        */
        loaded = function () {
            var title = document.getElementById("chart-heading"),
                canvas = document.getElementById("DOMChart"),
                context = canvas.getContext('2d');

            canvas.width = window.innerWidth - 50;
            canvas.height = window.innerHeight - 200;

            if (typeof chartData !== 'undefined') {
                title.innerText = chartData.title;
                chart = new Chart(context).Line(chartData);
            } else {
              title.innerText = 'Please run a test first.';
            }
        };

    window.addEventListener('load', loaded, false);

}());
