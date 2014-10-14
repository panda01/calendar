(function($) {
    'use strict';
    $(document).ready(function() {
        // Regular date picker
        $('#date0').calendar();

        // date picker with range
        $('#date1').calendar({
            endDate: moment().add('weeks', 2)
        });
    });
}(window.jQuery));
