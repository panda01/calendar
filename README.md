#Calendar
A beautiful Date Picker with Range and suggestion options

##Dependancies
- jQuery >= 1.7.1
- moment >= 2.8.3
- boostrap >= 3.2.0 working on removing this dependency

##Usage
```js
    $("#date0").calendar()
```

##Options
you can use the date Object anywhere moment is used

###currDate
The date for the start calendar

Default:
```js
currDate: moment()
```

###suggestions

An array of convenient suggestions for commonly chosen dates

Default:
```js
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
}]
```

###format
A map of the formats for different displays of the date

Default:
```js
{
    dow: 'dd',
    input: 'MMMM D, YYYY',
}
```
###endDate
Set this option to make the calendar accept two dates for a range

###appendToBody
append the popup to the body instead of the parent of the selected input

Default: false

###minDate
The earliest date the calendars can have

Default: -Infinity

###maxDate
The latest possible date the calendars can have

Default: Infinity


