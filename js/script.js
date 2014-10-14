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
            suggestions: null
        });

        $('#date1').click();
    });
}(window.jQuery));
