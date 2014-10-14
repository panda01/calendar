/*
 *  JsCalendar
 *
 *  Depends on the awesome momentjs
 */
(function($) {
    'use strict';

    function Calendar($el, sett) {
        // selected input
        this.$selIn = $el;

        this.settings = {};
        $.extend(this.settings, Calendar.prototype.options, sett);
        if(sett.format) {
            // also extend the format, to be sure that we don't overwrite them in a silly way
            this.settings.format = $.extend(Calendar.prototype.options.format, sett.format);
        }


        // initialize the calendar
        this.initDOM();
    }

    $.extend(Calendar.prototype, {
        // instansiation methods
        initDOM: function() {
            this.cals = [];

            // Draw one calendar
            // draw the suggestions if this isn't a range calendar
            this.cals.push(new $Cal(_cleanDate(this._('currDate')), this));

            // if this is a range calendar
            if(this._hasEnd()) {
                // draw the second calendar, and definitely draw the suggestions
                this.cals.push(new $Cal(_cleanDate(this._('endDate')), this));
            }

            // The container for the inputs
            this.$ins = _C('div.js-calendar.js-calendar-inputs')
                .insertAfter(this.$selIn);

            // the container for the calendars
            this.$el = _C('div.popover js-calendar bottom')
                        .append(_C('div').addClass('arrow'));

            // for every calendar add them to our wrapping elements
            this.cals.forEach(function(cal) {
                this.$ins.append(cal.$in);
                this.$el.append(cal.$el);
            }.bind(this));

            // Add a dash in between range dates
            if(this._hasEnd()) {
                this.$ins.children().first().after('<span class="dash">&nbsp;-&nbsp;</span>');
            }

            // add a class for the number of calendars
            this.$ins.addClass('cals-count-' + this.cals.length);

            // only if their are suggestions draw them
            if(this._hasSuggestions()) {
                this.$el.prepend(this.initSuggestions());
                this.$ins.append(this.$suggestion = _C('div.suggestion'));
            }

            this.initEvents();

            // hide the input give to us
            this.$selIn.hide();
        },
        initEvents: function() {
            var showFn = function() {
                if(!this.isVisible()) {
                    this.show();
                }
            }.bind(this);
            // Attach some events
            this.$ins.on({
                'click.calendar': showFn,
                'focus.calendar': showFn
            });

            this.$selIn.on('click', showFn);

            // handle clicking of suggestions
            this.$el.on('click.calendar', '.suggestion', function(e) {
                this.setDate($(e.target).data('value'));
                this.hide();
            }.bind(this));

        },
        listenForDocumentClick: function() {
            var func = function(e) {
                // if the click is out of out calendar and our input
                if($(e.target).closest(this.$ins.add(this.$el)).length === 0){
                    this.hide();
                    // unbind this event
                    $('body').off('mousedown.calendar', func);
                    this.parseOnBlur = false;
                }
            }.bind(this);
            $('body').on('mousedown.calendar', func);
        },
        isVisible: function() { return this.$el.parent().length > 0; },
        // do everything to update the calendars
        render: function() {
            this.cals.forEach(function(cal) {
                cal._draw();
                cal.update();
            });
        },
        // draw both of the calendars or one if there is only one
        draw: function() { this.cals.forEach(function(cal){ cal._draw(); }); },
        // show the Calendar plugin
        show: function() {
            this.draw();
            this.place();
            this.$el.show();
            this.listenForDocumentClick();
            this.$ins.addClass('visible');
            this.parseOnBlur = true;
        },
        // hide the calendar dropdown
        hide: function() {
            this.$el
                .hide()
                .detach();
            this.$ins.removeClass('visible');
        },
        place: function() {
            var loc = this.$ins.offset(),
                // go through and find the parent with the absolute position, to assure the calendar is placed properly
                absoluteParentLoc = $([].reduce.call(this.$ins.parents(), function(prev, el) {
                    var $el = $(el);
                    return prev || ($el.css('position').indexOf('absolute') > -1 ? el : false);
                }, false)).offset() || {left: 0, top: 0},
                subtractAbsoluteParent = this._('appendToBody') && absoluteParentLoc;

            // if it's already placed don't place it again
            if(!this.isVisible()) {
                // otherwise based on options, add it to where it belongs in the dom
                this.$el.appendTo(this._('appendToBody') ? $('body') : this.$ins.parent());
            }
            
            // finally place the calendar popup
            this.$el.css({
                left: loc.left - (subtractAbsoluteParent ? 0 : absoluteParentLoc.left),
                top: loc.top + this.$ins.outerHeight() - (subtractAbsoluteParent ? 0 : absoluteParentLoc.top)
            });
        },
        initSuggestions: function() {
            var $ul = _C('ul.suggestions-list'),
                suggs = this._('suggestions'),
                sugg = null,
                $s = null;
                // range = this._range;

            for(var l = suggs.length, i = 0; i < l; i++) {
                sugg = suggs[i];
                _cleanDate(sugg.currDate);
                $ul.append($s = _C('li.suggestion'));
                $s
                    .html(sugg.text)
                    .data('value', {
                        currDate: sugg.currDate, 
                        endDate: sugg.endDate, 
                        text: sugg.text
                    });
//                    .toggleClass('highlight', sugg.currDate.isSame(this._range, 'day')))
            }
            return _C('div.suggestions').append(_C('div.title').html('Suggestions')).append($ul);
        },
        options: {
            currDate: moment(),
            endDate: null,
            // if it's a date range
            // endDate: moment().add('weeks', 2),
            minDate: -Infinity,
            maxDate: Infinity,
            suggestions: [{
                text: 'today',
                currDate: moment()
            }, {
                text: 'Yesterday',
                currDate: moment().subtract('day', 1)
            }, {
                text: '1 week ago',
                currDate: moment().subtract('week', 1)
            }, {
                text: '1 month ago',
                currDate: moment().subtract('month', 1)
            }],
            appendToBody: false,
            format: {
                dow: 'dd',
                input: 'MMMM D, YYYY',
            },
        },
        dateChanged: function(cal) {
            // only move the dates if this has two calendars
            // causes the pushing effect when you try and put the start
            // date after the end date, or the endDate before the start date
            if(this._hasEnd()) {
                // if this is the start calendar
                if(cal === this.cals[0]) {
                    // if the start date is after the end date
                    if(cal._isAfter(cal._date, this.date(1))) {
                        // set the end date to the start date
                        this.cals[1]._setDate(cal._date.clone());
                        this.cals[1].update();
                        this.cals[1]._draw();
                    }
                } else {
                    // if the end calendar is before the start date
                    if(cal._isBefore(cal._date, this.date(0))) {
                        // set the end date to the start date
                        this.cals[0]._setDate(cal._date.clone());
                        this.cals[0].update();
                        this.cals[0]._draw();
                    }
                }
            }
            // clear out the suggestion text
            this.setSuggestion();
            // just trigger a change event and broadcast
            this.$selIn.trigger('change.calendar', [this.date()]);
        },
        date: function(which) {
            // they didn't specify so return everything we have!!!
            if(typeof which === 'undefined') {
                if(this._hasEnd()) {
                    return {
                        'currDate': this.cals[0]._date.clone(),
                        'endDate': this.cals[1]._date.clone()
                    };
                }
                which = 0;
            }
            return this.cals[which]._date.clone();
        },
        niceDate: function(format) {
            var dates = this.date();
            if(dates.currDate && dates.endDate) {
                return {
                    currDate: dates.currDate.format(format || this._('format').input),
                    endDate: dates.endDate.format(format || this._('format').input),
                    suggestion: this.getSuggestion().text
                };
            } else {
                return dates.format(format || this._('format').input);
            }
        },
        // Either return false, or the suggestion that is currently being used
        // if name is specified, return the suggestion with that name regardless of which one we're using
        getSuggestion: function(name) {
            return this._('suggestions').reduce(function(old, curr) {
                return old || ((name && curr.text === name) || (!name && curr.currDate === this.cals[0]._date && (!this._hasEnd() || (this._hasEnd() && curr.endDate === this.cals[1]._date))) ? curr : old);
            }.bind(this), false);
        },
        // set a marker for which suggestion was clicked
        setSuggestion: function(name) {
            if(typeof name !== 'undefined') {
                this.currentSuggestion = name;
            }
            this.$suggestion.html(this.currentSuggestion || '');
            this.$ins.toggleClass('show-suggestion', !!this.currentSuggestion);
        },
        // takes an object with both dates for range calendars, or just the single date for regular ones
        setDate: function(obj) {
            var set = function(start, end) {
                this.cals[0]._setDate(start);
                if(end) {
                    this.cals[1]._setDate(end);
                }
            }.bind(this);
            if(obj.text) {
                obj = this.getSuggestion(obj.text) || obj;
                this.setSuggestion(obj.text);
                set(obj.currDate, obj.endDate);
            } else if(this._hasEnd()) {     // A range calendar without suggestions
                set(obj.currDate, obj.endDate);
                this.setSuggestion(obj.text);
            } else {    // otherwise expect to be passed a moment object to be set on the calendar
                set(obj);
            }
            this.render();
        },
        // Private functional methods
        //
        // Getter and setter for the settings
        _: function(attr, val) {
            var old = this.settings[attr];
            if(!u.isUndef(val)) {
                this.settings[attr] = val;
            }
            return old;
        },

        _isSame: function(date, tolerance, otherDate) {
            otherDate = otherDate || this._date;
            tolerance = tolerance || 'day';
            return _cleanDate(date).isSame(otherDate, tolerance);
        },
        _isBefore: function(date, min) {
            min = min || this._('minDate');
            return (min === -Infinity ? false : _cleanDate(date) < _cleanDate(min));
        },
        _isAfter: function(date, max) {
            max = max || this._('maxDate');
            return (max === Infinity ? false : _cleanDate(date) > _cleanDate(max));
        },
        // is this a range calendar or does it just have one date to return
        _hasEnd: function() { return !!this._('endDate'); },
        // does it have suggestions?
        _hasSuggestions: function() { return this._('suggestions').length > 0; }
    });
    
    function $Cal(date, par) {
        this.settings = {};
        this._date = date;
        this._parent = par;

        this.initDOM();
        this.initEvents();

        return this;
    }

    $.extend($Cal.prototype, {
        initDOM: function() {
            // draw a frame for the calendar to be added to
            var drawFrame = function() {
                // append all of the calendar parts
                return _C('div.calendar')
                    .append(this.initYears().hide())
                    .append(this.initMonths().hide())
                    .append(this.initDays());
            }.bind(this),
            drawInput = function(rangeIn) {
                return _C('input')
                    .attr('type', 'text')
                    .attr('size', '')
                    .addClass('js-input')
                    .toggleClass('range', rangeIn);
            }.bind(this);
            this.$el = drawFrame();
            this.$in = drawInput(true);
            this._draw('days', this._date);
            this.update();
        },
        initEvents: function() {
            // var shouldParse = false;
            // the events for the input
            //
            // handles blur and focus behavior
            // handles typing in
            //      including arrow key navigation and parsing after blur
            this.$in.on({
                blur: function() {
                    if(this._parent.parseOnBlur) {
                        this.parse();
                    }
                }.bind(this),
                keydown: function(evt) {
                    switch(evt.which) {
                        // hide on escape
                        case 27:
                            this.parse();
                            this._parent.hide();
                            break;
                        // parse and set on enter
                        case 13:
                            this.parse();
                            this._showView();
                            break;
                        // Change the dates with the arrow keys
                        // TODO make this work no matter which calendar view(days, months, years) you're in.
                        case 37:            // left
                        case 38: 		    // up
                        case 39: 		    // right
                        case 40: 		    // down
                            this._setDate(this._date.clone()[evt.which < 39 ? 'subtract' : 'add']((evt.which % 2 === 0 ? 'weeks' : 'days'), 1));
                            this._parent.setSuggestion(false);
                            this.update();
                            this._showView();
                            evt.preventDefault();
                            break;
                        default:
                            window.console.info('Which: ' + evt.which);
                            break;
                    }
                }.bind(this)
            });



            // the events for inside of the calendar.
            this.$el.on({
                click: function(evt) {
                    var sel = new Sel(evt.target);

                    if(!sel.isDisabled()) {
                        // weird you can change the date of something without it getting focus...
                        if(!this.hasFocus()) {
                            this.$in.focus();
                        }
                        if(sel.isTitle()) {
                            if(sel.parent()) {
                                this._showView(sel.parent(), sel.date);
                            }
                        } else if (sel.isDir()) {
                            // do a add and subtract for next and previous clicks respectively
                            // if they clicked the pagination on year add 10, for per decade
                            this._draw(sel.which(), sel.date);
                        } else {
                            // if we're click on the years or months
                            // draw and show the child
                            if(sel.child()) {
                                this._showView(sel.child(), sel.date);
                            } else if(sel.date) {    // otherwise we must be clicking on days or suggestions, set the date and keep it going
                                this._setDate(sel.date);
                                this._parent.setSuggestion(false);
                                this.update();
                                this._draw();
                            } else {
                                // stops the calendar from closing when you don't click on anything but the background
                                evt.stopPropagation();
                            }
                        }
                    }
                }.bind(this),
                mousedown: function(e) {
                    e.preventDefault();
                }
            });
        },

        // updates the input with the current date
        update: function() {
            var d = this._date.format(this._('format').input),
                // calculate the dynamic width of the input
                dWidth = (function($in) {
                    // create a span to dynamically change the width of the inputs
                    var $span = _C('span')
                            .html(d)
                            .css({
                                'font-size': $in.css('font-size'),
                                'letter-spacing': $in.css('letter-spacing'),
                                left: '-9999px',
                                position: 'absolute',
                                width: 'auto'
                            })
                            .appendTo('body'),
                        width = $span.width();
                    // remove the span
                    $span.remove();
                    return width;
                }(this.$in));
            // change the input value and width 
            this.$in
                .val(d)
                .width(dWidth + 8);         // Add 8 pixels just in case
        },
        // tries to parse the inputs value
        // and calls update with either the new date,
        // or the old date if the new one isn't valid
        parse: function() {
            var s = moment($.trim(this.$in.val()));
            // if they gave us something valid, set the current date
            if(s.isValid()) {
                s = this._setDate(s);
            }
            // either way update the input
            this.update();
        },
        initDays: function() {
            var count = 7,
                day = moment().day(0), //monday
                // create the table
                el = _C('table.days').append(this._CHead(7));

            // add the dow tr
            el.children('thead').append(_C('tr.dow'));

            // TODO use variables for class names
            var $hand = el.find('tr.dow');

            while( --count >= 0 ){
                // create the th and append the month markup
                $hand.append(_C('th').append(day.format(this._('format').dow)));
                day.add('days', 1); // for every day
            }

            // append the body for the days
            el.append(_C('tbody'));

            return el;
        },
        // append the months table to draw the months in
        initMonths: function() {
            return _C('table.months').append(this._CHead(2)).append(_C('tbody'));
        },
        // append the years table to draw the years in
        initYears: function() {
            return _C('table.years').append(this._CHead(2)).append(_C('tbody'));
        },
        _: function(attr, val) {
            var old = this._parent._(attr, val);
            if(!u.isUndef(val)) {
                this.settings[attr] = val;
            }
            return old;
        },
        // sets the dates, checks to make sure it's in the min max range,
        // and that the end date doesn't end up before the start date and vice versa
        _setDate: function(val) {
            if(typeof val === 'string') {
                val = _cleanDate(moment(val));
            }
            // Check and make sure the date isn't outside of the range
            if(this._isBefore(val)) {
                val = this._('minDate');
            } else if(this._isAfter(val)) {
                val = this._('maxDate');
            }

            var changed = (!this._date.isSame(val, 'day'));

            this._date = val;

            if(changed) {
                if(this._parent.isVisible()) {
                    this._draw();
                }
                this.update();
            }
            this._parent.dateChanged(this);
        },
        // create a table head
        _CHead: function(span) {
            return _C('thead').append(_C('tr').append(_C('th').attr('colspan', span)
                    .append(_C('span.title'))
                    .append(_C('div.dir.prev').html('&lsaquo;'))
                    .append(_C('div.dir.next').html('&rsaquo;'))));
        },
        _isBefore: function(date, min) {
            min = min || this._('minDate');
            return (min === -Infinity ? false : _cleanDate(date) < _cleanDate(min));
        },
        _isAfter: function(date, max) {
            max = max || this._('maxDate');
            return (max === Infinity ? false : _cleanDate(date) > _cleanDate(max));
        },
        hasFocus: function() { return this.$in.is(':focus'); },
         // draw the view,
        // then show it to the user
        //
        // by default show the days with the current date
        _showView: function(w, d) {
            w = w || 'days';
            this._draw(w, (d || this._date.clone()));
            this.$el.children().hide().filter('.' + w).show();
        },
        // handles the rendering of all of the different views
        _draw: function(which, date) {
            date = date || this._date;
            which = which || 'days';

            var $t = this.$el.find('table.' + which),
                $hand = $t.find('tbody'),
                copy = date.clone(),        // don't change the date passed in, need it for reference
                $rowCache = null,
                bindPagination = function(prevMoment, nextMoment) {
                    $t.find('.dir.prev')
                        .data('date', prevMoment)
                        .toggleClass('disable', this._isBefore(prevMoment));
                    $t.find('.dir.next')
                        .data('date', nextMoment)
                        .toggleClass('disable', this._isAfter(nextMoment));

                }.bind(this),
                // create the td representing a date month or year
                makeTd = function(m, format) {
                    // singular form for class names and convenience
                    var sing = which.slice(0, which.length - 1);
                    return _C('td')
                        .html(m.format(format))
                        .data('date', m.clone())             // could be really heavy, that's a lot of cloning
                        // just adding the classes for each td, highlighting,
                        // disabling things of that nature
						// FIXME obfuscate the $cal object to handle this ugly check of classes here
                        .addClass( sing + (m.isSame(this._date, sing)  ? ' highlight' : '') + (this._isBefore(m) || this._isAfter(m) ? ' disable' : ''));
                }.bind(this),
                // a map of the functions used to render each view of the calendar
                opt = {
                    days: {
                        // roll the copy date back to the preceding closest sunday
                        init: function(m, $table) {
                            // set The title
                            $table.find('.title')
                                .html(m.format('MMMM YYYY'))
                                .data('date', m.clone());

                            bindPagination(m.clone().date(0), m.clone().add('month', 1).date(1));
                            // set to the first day of the month then the first day of that week
                            m.date(1).day(0);
                        },
                        stop: function(m, orig) { return (m.day() === 0 && !m.isSame(date, 'month') && m.isAfter(orig) ); },
                        loop: function(m, $r) {
                            // make the td and append it
                            $r.append( makeTd(m, 'D'));

                            // increment and continue
                            m.add('days', 1);

                            // if it's the last day of the week
                            if(m.day() === 0) {
                                return _C('tr').appendTo($hand);
                            }
                            return $r;
                        }.bind(this)
                    },
                    months: {
                        // roll the copy date back to the preceding closest sunday
                        init: function(m, $table) {
                            m.month(0);
                            // set the year for the title
                            $table.find('.title').html(m.format('YYYY'));
                            bindPagination(m.clone().subtract('year', 1).dayOfYear(366), m.clone().add('year', 1).dayOfYear(1));
                        },
                        stop: function(m) { return m.month() === 0 && !m.isSame(date, 'month'); },
                        loop: function(m, $r) {
                            // make the td and append it
                            $r.append(makeTd(m, 'MMM'));

                            // increment and continue
                            m.add('months', 1);
                            if(m.month() % 2 === 0 ) {
                                return _C('tr').appendTo($hand);
                            }
                            return $r;
                        }.bind(this)
                    },
                    years: {
                        init: function(m, $table) {
                            var y = m.year();
                            // set it to the beginning of the decade
                            m.year(y = (y - y % 10));
                            // set the decade range to the title
                            $table.find('.title').html(y + ' - ' + (y+9));
                            bindPagination(m.clone().subtract('year', 10).dayOfYear(366), m.clone().add('years', 10).dayOfYear(1));
                        },
                        stop: function(m) { return m.isAfter(date) && (m.year() % 10 === 0); },
                        loop: function(m, $r) {
                            // make the td and append it
                            $r.append(makeTd(m, 'YYYY'));

                            // increment and continue
                            m.add('years', 1);
                            if(m.year() % 2 === 0 ) {
                                return _C('tr').appendTo($hand);
                            }
                            return $r;
                        }.bind(this)
                    }
                }[which];

            // TODO make it so you append everything outside of the dom first then add the rows
            // append the first tr
            $hand
                .html('')
                .append($rowCache = _C('tr'));

            opt.init(copy, $t);
            do {
                $rowCache = opt.loop(copy, $rowCache);
            }
            while(!opt.stop(copy, date));


        },
    });


    $.fn.calendar = function(opts) {
        // maintain chainability
        return this.each(function() {
            var $this = $(this),
            calendar = $this.data('Calendar'); // try and get the Calendar
            if (opts === undefined || typeof opts === 'object') {
                // Create a new Calendar
                $this.data('calendar', (calendar = new Calendar($this, (opts || {}))));
            } else if(typeof opts === 'string') {
                // call it on the object if it exists
                Calendar.prototype['public_' + opts].apply(calendar, Array.prototype.slice.call(arguments, 1));
            } else {
                $.error('Method "' + opts + '" doesn\'t exist for Calendar plugin');
            }
            return this;
        });

    };

    // way faster way of typing create element or fragment
    var _C = function(which) {
            var c = function(w) {
              if(w === 'frag') {
                  return $(document.createDocumentFragment());
              }
              return $(document.createElement(w));
            };
            var split = which.split('.'),
                $e = c(split.shift());
            $e.addClass(split.join(' '));
            return $e;
        },
        _cleanDate = function(date) {
            return (date ? moment(date).hour(0).minute(0).second(0).millisecond(1) : undefined);
        },
        // a simple function to obfuscate the $el the person selected.
        // like the .next and .prev buttons, the dates, the years, the months and years
        // pretty much all of the interactions inside of the calendar popdown
        //
        // provides helper methods to make processing events easier
        Sel = (function () {
            function $el(el) {
                this.$el = $(el);
                // the wrapping view table or ul
                this.$t = this.$el.closest('table, ul');

                this.date = this.$el.data('date');
            }

            // the different names for the different views of the calendar
            // TODO move me higher up the scope, everything in calendar uses this.
            var v = [
                'days',
                'months',
                'years',
                undefined,
                'suggestions'
            ];
            // nice helpers
            v.d = v[0];
            v.m = v[1];
            v.y = v[2];
            v.s = v[4];

            var has = function($s, str) {
                return $s.length ? $s[0].className.split(' ').indexOf(str.toLowerCase()) > -1 : false;
            };


            $el.prototype.isDisabled = function() { return has(this.$el, 'disable'); };

            // TODO why are all of theses functions?
            //
            // is this something inside of the Days of the Month picker,
            // the months of the year, of the years of the decade?
            $el.prototype.isDom = function() { return has(this.$t, v.d); };
            $el.prototype.isMoy = function() { return has(this.$t, v.m); };
            $el.prototype.isYod = function() { return has(this.$t, v.y); };


            // $el th helpers
            $el.prototype.isDir = function() { return has(this.$el, 'next') || has(this.$el, 'prev'); };
            $el.prototype.isNext = function() { return has(this.$el, 'next'); };
            $el.prototype.isTitle = function() { return has(this.$el, 'title'); };

            // tenary operators FTW
            // return the string representing which one this is
            $el.prototype.which = function() { return this.isDom() ? v.d : (this.isMoy() ? v.m : ( this.isYod() ? v.y : v.s)); };
            $el.prototype.singular = function(w) {
                return w.substr(0, w.length - 1);
            };
            // return the containing timespan, ie return months for days,
            // years for months, and undefined for years.
            $el.prototype.parent = function() { return v[v.indexOf(this.which()) + 1]; };
            // the turn the contained timespan, ie return months for years,
            // days for months, and undefined for days.
            $el.prototype.child = function() { return v[v.indexOf(this.which()) - 1]; };


            return $el;
        }());
    var u = (function() {
        function isTypeOf(type, val) {
            return typeof val === type;
        }

        function isUndefined(val) {
            return isTypeOf('undefined', val);
        }
        function isObject(val) {
            return isTypeOf('object', val);
        }
        function isNumber(val) {
            return isTypeOf('number', val);
        }
        function isString(val) {
            return isTypeOf('string', val);
        }
        
        return {
            isUndef: isUndefined,
            isObj: isObject,
            isNum: isNumber,
            isStr: isString
        };
    }());
}(window.jQuery));
