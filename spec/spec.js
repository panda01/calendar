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
        var $in, $wrap, calendarInstance;

        beforeEach(function() {
            $wrap = $(document.createElement('div'));
            $in = $(document.createElement('input'));
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
                expect($in.is(':visible')).toBe(false);
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
            // setDate
            it('should change the date when a new date is set', function() {
                var nextWeek = moment().add(1, 'week');
                calendarInstance.setDate(nextWeek);
                expect(calendarInstance.date().isSame(nextWeek, 'day')).toBeTruthy();
            });
            // suggestion setDate
            it('setting the suggestion for the date should change the date and show the suggestion', function() {
                var sugg = calendarInstance.settings.suggestions[1],
                    $sugg = calendarInstance.$ins.children('.suggestion');
                calendarInstance.setDate(sugg);
                expect(calendarInstance.date().isSame(sugg.currDate, 'day')).toBeTruthy();
                expect($sugg.html()).toBe(sugg.text);
                // expect($sugg.is(':visible')).toBe(true);
            });
            // place
            it('should place, and remove the popover from the DOM', function() {
                calendarInstance.place();
                expect(calendarInstance.isVisible()).toBe(true);
                calendarInstance.hide();
                expect(calendarInstance.isVisible()).toBe(false);
            });
            // getSuggestion
            it('should get the named suggestion, or get the suggestion by date currently selected', function() {
                expect(calendarInstance.getSuggestion('yesterday')).not.toBe(false);
                calendarInstance.setDate(moment().subtract(1, 'day'));
                expect(calendarInstance.getSuggestion().text.toLowerCase()).toBe('yesterday');
            });
        });
    });
});
