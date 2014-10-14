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

Default: moment()
```
{
    currDate: moment()
}
```

###endDate

Set this option to make the calendar accept two dates for a range

```
{
    endDate: moment()
}
```

###suggestions

An array of convenient suggestions for commonly chosen dates

```
{
    suggestions: [{
        text: "The next two weeks",
        currDate: moment(),
        endDate: moment.add('weeks', 2)
    }]
}
```
