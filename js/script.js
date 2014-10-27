(function($) {
    'use strict';
    $(document).ready(function() {
        // Regular date picker
        $('#date0').calendar({
            currDate: new Date()
        });

        // date picker with range
        $('#date1').calendar({
            endDate: moment().add('weeks', 2),
            suggestions: [{
                text: 'The rest of the week',
                currDate: moment(),
                endDate: moment().day(6)
            }, {
                text: 'Next month',
                currDate: moment().add(1, 'months').date(0),
                endDate: moment().add(2, 'months').date(0)
            }, {
                text: 'The rest of the month',
                currDate: moment(),
                endDate: moment().add(1, 'months').date(0)
            }, {
                text: 'The rest of the year',
                currDate: moment(),
                endDate: moment().add(1, 'years').dayOfYear(0)
            }]
        });

        $('#date1').click();

        window.calendarInstance = $('#date1').data('calendar');
    });
}(window.jQuery));
