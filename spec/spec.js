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
        var $in, calendarInstance;

        beforeEach(function() {
            $in = $(document.createElement('input'));
            $in.attr('type', 'text');
            $in.calendar();
            calendarInstance = $in.data('calendar');
        });
        it('should populate the data object on element you pass it', function() {
            expect(calendarInstance).toBeDefined();
        });
        it('should hide the original input', function() {
            expect($in.is(':visible')).toBe(false);
        });
        it('should have only one calendar', function() {
            expect(calendarInstance.$ins.length).toEqual(1);
            expect(calendarInstance.cals.length).toEqual(1);
        });
        it('should create a psuedo input with an actual input and suggestion box', function() {
            var $ins = calendarInstance.$ins,
                $children = $ins.children();
            expect($ins).toBeDefined();
            expect($children.length).toBe(2);
        });
        it('should draw the popover, and its content; suggestions, and table for choosing date', function() {
            var $popover = calendarInstance.$el,
                $children = calendarInstance.$el.children();
            expect($popover).toBeDefined();
            expect($children.length).toEqual(3);
            expect($children.is('.suggestions')).toBeTruthy();
            expect($children.is('.calendar')).toBeTruthy();
        });
    });
});
