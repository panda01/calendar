describe('Date Picker Tests', function() {
    describe('Basic setup', function() {
        it('should have moment', function() {
            expect(moment).toBeDefined();
        });
        it('should have jquery', function() {
            expect($).toBeDefined();
        });
        it('should be a jquery plugin', function() {
            expect($.fn.calendar).toBeDefined();
        });
    });
    describe('Single Date Picker', function() {
        var $wrap, calendarInstance;

        beforeEach(function() {
            var $in = $(document.createElement('input'));
            $wrap = $(document.createElement('div'));
            $in
                .attr('type', 'text')
                .appendTo($wrap);
            // start the calendar with default settings
            $in.calendar();
            calendarInstance = $in.data('calendar');
        });
        describe('basic functions', function() {
            // init
            it('should populate the data object on element you pass it', function() {
                expect(calendarInstance).toBeDefined();
            });
            // initDOM
            it('should hide the original input', function() {
                expect($wrap.children().is(':visible')).toBe(false);
            });
            // initDOM
            it('should have only one calendar, with a the proper date set', function() {
                expect(calendarInstance.$ins.length).toEqual(1);
                expect(calendarInstance.cals.length).toEqual(1);
                expect(calendarInstance.date().isSame(moment(), 'day')).toBeTruthy();
            });
            // initDOM
            it('should create a psuedo input with an actual input and suggestion box', function() {
                var $ins = calendarInstance.$ins,
                    $children = $ins.children();
                expect($ins).toBeDefined();
                expect($children.length).toBe(2);
            });
            // initSuggestions, initDOM
            it('should draw the popover, and its content; suggestions, and table for choosing date', function() {
                var $popover = calendarInstance.$el,
                    $children = calendarInstance.$el.children();
                expect($popover).toBeDefined();
                expect($children.length).toEqual(3);
                expect($children.is('.suggestions')).toBeTruthy();
                expect($children.is('.calendar')).toBeTruthy();
            });
            // place
            it('places, and removes the popover from the DOM', function() {
                calendarInstance.place();
                expect(calendarInstance.isVisible()).toBe(true);
                calendarInstance.hide();
                expect(calendarInstance.isVisible()).toBe(false);
            });
            // getSuggestion
            it('gets the named suggestion, or get the suggestion by date currently selected', function() {
                expect(calendarInstance.getSuggestion('yesterday')).not.toBe(false);
                calendarInstance.setDate(moment().subtract(1, 'day'));
                expect(calendarInstance.getSuggestion().text.toLowerCase()).toBe('yesterday');
            });
        });
        describe('interactions', function() {
            // setDate
            it('changes the date when a new date is set', function() {
                var nextWeek = moment().add(1, 'week');
                calendarInstance.setDate(nextWeek);
                expect(calendarInstance.date().isSame(nextWeek, 'day')).toBeTruthy();
            });
            // suggestion setDate
            it('changes the date and show the suggestion when setting the suggestion for the date', function() {
                var sugg = calendarInstance.settings.suggestions[1],
                    $sugg = calendarInstance.$ins.children('.suggestion');
                calendarInstance.setDate(sugg);
                expect(calendarInstance.date().isSame(sugg.currDate, 'day')).toBeTruthy();
                expect($sugg.html()).toBe(sugg.text);
                // expect($sugg.is(':visible')).toBe(true);
            });
            xit('parses a written date to the correct date, or uses the last good date', function() {
                var $input = calendarInstance.$ins.children('input'),
                    dateStr = ['January 5, 2014', '01.12.2014', '01-24-2014', 'today'];
                dateStr.forEach(function(str) {
                    console.log(str);
                    $input.val(str);
                    calendarInstance.cals[0].parse();
                    console.log(calendarInstance.date());
                    expect(calendarInstance.date().isSame(moment(new Date(str)), 'day')).toBeTruthy();
                });
            });
        });
    });
    describe('range Date Picker with min and max date set', function() {
        var calendarInstance, $wrap, endDate;
        beforeEach(function() {
            var $in = $(document.createElement('input'));
            $wrap = $(document.createElement('div'));
            endDate = moment().add(1, 'week');
            $in
                .attr('type', 'text')
                .appendTo($wrap);
            // start the calendar with default settings
            $in.calendar({
                endDate: moment().add(1, 'week'),
                maxDate: moment().add(3, 'years'),
                minDate: moment().subtract(1, 'days')
            });
            calendarInstance = $in.data('calendar');
        });
        // init
        it('has two calendars, and the date is correct in both of them', function() {
            var date = calendarInstance.date();
            expect(calendarInstance.cals.length).toBe(2);
            expect(calendarInstance.$ins.children('input').length).toBe(2);
            expect(date.currDate.isSame(moment(), 'day')).toBeTruthy();
            expect(date.endDate.isSame(endDate, 'day')).toBeTruthy();
        });
        // dateChanged
        it('doesn\'t let you set a date after the max date or before the min date', function() {
            var maxTest = moment().add(4, 'years'),
                minTest = moment().subtract(2, 'days');
            calendarInstance.setDate({
                currDate: minTest,
                endDate: maxTest
            });
            var date = calendarInstance.date();
            expect(date.currDate.isSame(moment().subtract(1, 'days'), 'day')).toBeTruthy();
            expect(date.endDate.isSame(moment().add(3, 'years'), 'day'), 'day').toBeTruthy();
        });
    });
});
