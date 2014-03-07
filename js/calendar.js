(function($) {

    function Calendar($el, sett) {
        // selected input
        this.$selIn = $el;

        this.settings = {};
        $.extend(this.settings, Calendar.prototype.options, sett);

        // initialize the calendar
        this.initDOM();
        //this.initEvents();

        // for tests only
        this.show();
    }

    $.extend(Calendar.prototype, {
        // instansiation methods
        initDOM: function() {
            this.cals = [];
            
            // Draw one calendar
            // draw the suggestions if this isn't a range calendar
            this.cals.push(new $Cal(_cleanDate(this._("currDate")), this));
            
            // if this is a range calendar
            if(this._("endDate")) {
                // draw the second calendar, and definitely draw the suggestions
                this.cals.push(new $Cal(_cleanDate(this._("endDate")), this));
            }
            
            // The container for the inputs
            this.$ins = _C("div")
                .addClass("js-calendar inputs")
                .appendTo(this.$selIn.parent());
            
            // the container for the calendars
            this.$el = _C("div")
                .addClass("popover js-calendar bottom")
				.append(_C("div").addClass("arrow"));
                
                
            // for every calendar add them to our wrapping elements
            this.cals.forEach(function(cal) {
                this.$ins.append(cal.$in);
                this.$el.append(cal.$el);
            }.bind(this));
            
            this.$el.append(this.initSuggestions());
        },
        isVisible: function() { return this.$el.parent().length > 0; },
        // draw both of the calendars or one if there is only one
        draw: function() { this.cals.forEach(function(cal){ cal._draw()}); },
        // show the Calendar plugin
        show: function() {
            this.draw();
            this.place();
            this.$el.show();
        },
        // hide the calendar plugin
        hide: function() {
            this.$el
                .hide()
                .detach();
        },
        place: function() {
            var loc = this.$selIn.offset();
            // if it's already placed don't place it again
            if(!this.isVisible()) {
                // otherwise based on options, add it to where it belongs in the dom
                this.$el.appendTo(this._("appendToBody") ? $("body") : this.$selIn.parent());
            }

            // finally place the calendar popup
            this.$el.css({
                left: loc.left,
                top: loc.top + this.$ins.outerHeight() + 20
            });
        },
        initSuggestions: function() {
            var $ul = _C("ul").addClass("suggestions"),
                suggs = this._("suggestions"),
                sugg = null,
                range = this._range;

            for(var l = suggs.length, i = 0; i < l; i++) {
                sugg = suggs[i];
                _cleanDate(sugg.moment);
                $ul.append(_C("li")
                            .html(sugg.text)
                            .data("date", sugg.moment)
                            .addClass("suggestion" + ((sugg.moment).isSame(this._range, "day") ? " higlight" : "")));
            }
            return $ul;
        },
        options: {
            currDate: moment(),
            endDate: null,
            // if it's a date range
            //endDate: moment().add("weeks", 2),
            //minDate: -Infinity,
            //maxDate: Infinity,
            // for testing
            maxDate: moment().add("years", 1),
            // for testing
            minDate: moment().subtract("years", 1),
            suggestions: [{
                text: "today",
                moment: moment()
            }, {
                text: "Yesterday",
                moment: moment().subtract("day", 1)
            }, {
                text: "1 week ago",
                moment: moment().subtract("week", 1)
            }, {
                text: "1 month ago",
                moment: moment().subtract("month", 1)
            }],
            appendToBody: false,
            format: {
                dow: "dd",
                input: "M/D/YYYY",
            }
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
            tolerance = tolerance || "day";
            return _cleanDate(date).isSame(otherDate, tolerance);
        },
        _isBefore: function(date, min) {
            min = min || this._("minDate");
            return (min === -Infinity ? false : _cleanDate(date) < _cleanDate(min));
        },
        _isAfter: function(date, max) {
            max = max || this._("maxDate");
            return (max === Infinity ? false : _cleanDate(date) > _cleanDate(max));
        }
    });
    
    function $Cal(date, par, sett) {
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
                return _C("div").addClass("calendar")
                    .append(this.initYears().hide())
                    .append(this.initMonths().hide())
                    .append(this.initDays());
            }.bind(this),
            drawInput = function(rangeIn) {
                return _C("input")
                    .attr("type", "text")
                    .addClass("js-input")
                    .toggleClass("range", rangeIn);
            }.bind(this);
            this.$el = drawFrame(true);
            this.$in = drawInput(true);
            this._draw("days", this._date);
            this.update();
        },
        initEvents: function() {
            var shouldParse = false;
            // the events for the input
            //
            // handles blur and focus behavior
            // handles typing in
            //      including arrow key navigation and parsing after blur
            this.$in.on({
                focus: function(evt) {
                    if(!this.isVisible()) {
                        this.show();
                    }
                }.bind(this),
                blur: function(evt) {
                    this.parse();
                    this.update();
                }.bind(this),
                click: function() {
                    if(!this.isVisible()) {
                        this.show();
                    }
                }.bind(this),
                keydown: function(evt) {
                    switch(evt.which) {
                        case 27:        // hide on escape
                            this.hide();
                            break;
                        case 13:        // parse and set on enter
                            this.parse();
                            this._showView();
                            break;
						case 37: 		// left
						case 38: 		// up
						case 39: 		// right
						case 40: 		// down
                            this._date.clone()[evt.which < 39 ? "subtract" : "add"]((evt.which % 2 === 0 ? "weeks" : "days"), 1);
                            this.update();
                            this._showView();
						
                        default:
                            console.info("Which: " + evt.which);
                            break;
                    }
                }.bind(this)
            });

            // a simple function to obfuscate the $el the person selected.
            // like the .next and .prev buttons, the dates, the years, the months and years
            // pretty much all of the interactions inside of the calendar popdown
            //
            // provides helper methods to make processing events easier
            var Sel = (function () {
                function $el(el) {
                    this.$el = $(el);
                    // the wrapping view table or ul
                    this.$t = this.$el.closest("table, ul");

                    this.date = this.$el.data("date");
                }

                // the different names for the different views of the calendar
                // TODO move me higher up the scope, everything in calendar uses this.
                var v = [
                    "days",
                    "months",
                    "years",
                    undefined,
                    "suggestions"
                ];
                // nice helpers
                v.d = v[0];
                v.m = v[1];
                v.y = v[2];
                v.s = v[4];

                var has = function($s, str) {
                    return $s.length ? $s[0].className.split(" ").indexOf(str.toLowerCase()) > -1 : false;
                };


                $el.prototype.isDisabled = function() { return has(this.$el, "disable"); };

                // TODO why are all of theses functions?
                //
                // is this something inside of the Days of the Month picker,
                // the months of the year, of the years of the decade?
                $el.prototype.isDom = function() { return has(this.$t, v.d); };
                $el.prototype.isMoy = function() { return has(this.$t, v.m); };
                $el.prototype.isYod = function() { return has(this.$t, v.y); };


                // $el th helpers
                $el.prototype.isDir = function() { return has(this.$el, "next") || has(this.$el, "prev"); };
                $el.prototype.isNext = function() { return has(this.$el, "next"); };
                $el.prototype.isTitle = function() { return has(this.$el, "title"); };

                // tenary operators FTW
                // return the string representing which one this is
                $el.prototype.which = function() { return this.isDom() ? v.d : (this.isMoy() ? v.m : ( this.isYod() ? v.y : v.s)); };
				$el.prototype.singular = function(w) {
					return w.substr(0, w.length - 1);
				}
                // return the containing timespan, ie return months for days,
                // years for months, and undefined for years.
                $el.prototype.parent = function() { return v[v.indexOf(this.which()) + 1]; };
                // the turn the contained timespan, ie return months for years,
                // days for months, and undefined for days.
                $el.prototype.child = function() { return v[v.indexOf(this.which()) - 1]; };


                return $el;
            }());


            // the events for inside of the calendar.
            this.$el.on({
                click: function(evt) {
                    var sel = new Sel(evt.target);

                    if(!sel.isDisabled()) {
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
                                this.update();
                            }
                        }
                    }
                }.bind(this),
                mousedown: function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        },

        // updates the input with the current date
        update: function(which) {
            var f = this._("format").input;
            this.$in.val(this._date.format(f));
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
                el = _C("table")
                    .addClass("days")
                    .append(this._CHead(7));

            // add the dow tr
            el.children("thead").append(_C("tr").addClass("dow"));

            // TODO use variables for class names
            $hand = el.find("tr.dow");

            while( --count >= 0 ){
                // create the th and append the month markup
                $hand.append(_C("th").append(day.format(this._("format").dow)));
                day.add("days", 1); // for every day
            }

            // append the body for the days
            el.append(_C("tbody"));

            return el;
        },
        initMonths: function(date) {
            return _C("table").addClass("months").append(this._CHead(2)).append(_C("tbody"));
        },
        initYears: function() {
            return _C("table").addClass("years").append(this._CHead(2)).append(_C("tbody"));
        },
        _: function(attr, val) {
            var old = this.settings[attr];
            // return the parent if this doesn't have the option;
            if(u.isUndef(old)) {
                return this._parent._(attr, val); 
            }
            if(!u.isUndef(val)) {
                this.settings[attr] = val;
            }
            return old;
        },
        // sets the dates, checks to make sure it's in the min max range, 
        // and that the end date doesn't end up before the start date and vice versa
        _setDate: function(val) {
            // Check and make sure the date isn't outside of the range
            if(this._isBefore(val)) {
                val = this._("minDate");
            } else if(this._isAfter(val)) {
                val = this._("maxDate");
            }
            
            this._date = val;
        },
        // create a table head
        _CHead: function(span) {
            return _C("thead").append(_C("tr").append(_C("th").attr("colspan", span)
                    .append(_C("div").addClass("glyphicon glyphicon-chevron-left prev"))
                    .append(_C("span").addClass("title"))
                    .append(_C("div").addClass("glyphicon glyphicon-chevron-right next"))));
        },
        _isBefore: function(date, min) {
            min = min || this._("minDate");
            return (min === -Infinity ? false : _cleanDate(date) < _cleanDate(min));
        },
        _isAfter: function(date, max) {
            max = max || this._("maxDate");
            return (max === Infinity ? false : _cleanDate(date) > _cleanDate(max));
        },
         // draw the view,
        // then show it to the user
        //
        // by default show the days with the current date
        _showView: function(w, d) {
            w = w || "days";
            this._draw(w, (d || this._date.clone()));
            this.$el.children().hide().filter("." + w).show();
        },
        // handles the rendering of all of the different views
        _draw: function(which, date) {
            date = date || this._date;
            which = which || "days";

            var $t = this.$el.find("table." + which),
                $hand = $t.find("tbody"),
                copy = date.clone(),        // don't change the date passed in, need it for reference
                $rowCache = null,
                bindPagination = function(prevMoment, nextMoment) {
                    $t.find(".glyphicon.prev")
                        .data("date", prevMoment)
                        .toggleClass("disable", this._isBefore(prevMoment));
                    $t.find(".glyphicon.next")
                        .data("date", nextMoment)
                        .toggleClass("disable", this._isAfter(nextMoment));

                }.bind(this),
                // create the td representing a date month or year
                makeTd = function(m, format) {
                    // singular form for class names and convenience
                    var sing = which.slice(0, which.length - 1);
                    return _C("td")
                        .html(m.format(format))
                        .data("date", m.clone())             // could be really heavy, that's a lot of cloning
                        // just adding the classes for each td, highlighting,
                        // disabling things of that nature
						// FIXME obfuscate the $cal object to handle this ugly check of classes here
                        .addClass( sing + (m.isSame(this._date, sing)  ? " highlight" : "") + (this._isBefore(m) || this._isAfter(m) ? " disable" : ""));
                }.bind(this),
                // a map of the functions used to render each view of the calendar
                opt = {
                    days: {
                        // roll the copy date back to the preceding closest sunday
                        init: function(m, $table) {
                            // set The title
                            $table.find(".title")
                                .html(m.format("MMMM YYYY"))
                                .data("date", m.clone());

                            bindPagination(m.clone().date(0), m.clone().add("month", 1).date(1));
                            // set to the first day of the month then the first day of that week
                            m.date(1).day(0);
                        },
                        stop: function(m, orig) { return (m.day() === 0 && !m.isSame(date, "month") && m.isAfter(orig) ); },
                        loop: function(m, $r) {
                            // make the td and append it
                            $r.append( makeTd(m, "D"));

                            // increment and continue
                            m.add("days", 1);

                            // if it's the last day of the week
                            if(m.day() === 0) {
                                return _C("tr").appendTo($hand);
                            }
                            return $r;
                        }.bind(this)
                    },
                    months: {
                        // roll the copy date back to the preceding closest sunday
                        init: function(m, $table) {
                            m.month(0);
                            // set the year for the title
                            $table.find(".title").html(m.format("YYYY"));
                            bindPagination(m.clone().subtract("year", 1).dayOfYear(366), m.clone().add("year", 1).dayOfYear(1));
                        },
                        stop: function(m) { return m.month() === 0 && !m.isSame(date, "month"); },
                        loop: function(m, $r) {
                            // make the td and append it
                            $r.append(makeTd(m, "MMM"));

                            // increment and continue
                            m.add("months", 1);
                            if(m.month() % 2 === 0 ) {
                                return _C("tr").appendTo($hand);
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
                            $table.find(".title").html(y + " - " + (y+9));
                            bindPagination(m.clone().subtract("year", 10).dayOfYear(366), m.clone().add("years", 10).dayOfYear(1));
                        },
                        stop: function(m) { return m.isAfter(date) && (m.year() % 10 === 0); },
                        loop: function(m, $r) {
                            // make the td and append it
                            $r.append(makeTd(m, "YYYY"));

                            // increment and continue
                            m.add("years", 1);
                            if(m.year() % 2 === 0 ) {
                                return _C("tr").appendTo($hand);
                            }
                            return $r;
                        }.bind(this)
                    }
                }[which];

            // TODO make it so you append everything outside of the dom first then add the rows
            // append the first tr
            $hand
                .html("")
                .append($rowCache = _C("tr"));

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
            calendar = $this.data("Calendar"); // try and get the Calendar
            if (opts === undefined || typeof opts === "object") {
                // Create a new Calendar
                $this.data("calendar", (calendar = new Calendar($this, opts)));
            } else if(typeof opts === "string") {
                // call it on the object if it exists
                Calendar.prototype["public_" + opts].apply(calendar, Array.prototype.slice.call(arguments, 1));
            } else {
                $.error("Method '" + opts + "' doesn't exist for Calendar plugin");
            }
            return this;
        });

    };
    
    // way faster way of typing create element or fragment
    var _C = function(which) {
        if(which === "frag") {
            return $(document.createDocumentFragment());
        }
        return $(document.createElement(which));
    };
    var _cleanDate = function(date) {
        return (date ? date.hour(0).minute(0).second(0).millisecond(1) : undefined);
    };
}(jQuery))
