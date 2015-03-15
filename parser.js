////////////////////////////////////////////////////
// Example calendar entry:

/*
 BEGIN:VEVENT
 CREATED:20130107T032631Z
 UID:84F105B6-80BA-4D81-92E7-34F94AF6C93D
 DTEND;VALUE=DATE:20130120
 TRANSP:TRANSPARENT
 SUMMARY:Slade coming?
 DTSTART;VALUE=DATE:20130119
 DTSTAMP:20130107T032655Z
 SEQUENCE:3
 BEGIN:VALARM
 X-WR-ALARMUID:BBCC6899-07AD-472A-9BB1-70875CA478B2
 UID:BBCC6899-07AD-472A-9BB1-70875CA478B2
 TRIGGER:-PT15H
 X-APPLE-DEFAULT-ALARM:TRUE
 ATTACH;VALUE=URI:Basso
 ACTION:AUDIO
 END:VALARM
 END:VEVENT
 */
////////////////////////////////////////////////////

////////////////////////////////////////////////////
// Class definitions.
var CalendarEvent = function (summary, start, end) {
    this.summary = summary;
    this.start = start;
    this.end = end;
};

function DateTime(year, month, day, hour, minute) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
};
DateTime.prototype.print = function() {
    return this.month + "/" +
        this.day + "/" +
        this.year + " at " +
        this.hour + ":" +
        this.minute;
}

////////////////////////////////////////////////////
// Core program logic.
var fs = require('fs');
var assert = require('assert');
var q = require('q');


var listOfCalendars = [
    "/Calendars to parse/Add On.ics",
    "/Calendars to parse/Home.ics",
    "/Calendars to parse/Just Paws.ics",
    "/Calendars to parse/Miss Ashley Art.ics",
    "/Calendars to parse/Work.ics"];
var calendarCount = listOfCalendars.length;

var allCalendarEvents = [];

var promise = q.Promise(function(resolve, reject, notify) {
    listOfCalendars.forEach(function (calendar) {
        fs.readFile(__dirname + calendar, function (err, data) {
            if (err) {
                throw err;
            }

            var calendar = data.toString();
            var calendarLines = calendar.split('\n');

            // Get all of the events from one calendar and put them in an array of CalendarEvents.
            var summary;
            var start;
            var end;
            var lastLineRead = "DTSTART";
            var encounteredFirstEnd = false;

            calendarLines.forEach(function (line) {
                // Look first for a DTEND. This should be the first of the three important fields that we encounter.
                if (line.indexOf("DTEND") >= 0) {
                    assert(lastLineRead == "DTSTART");
                    lastLineRead = "DTEND";

                    encounteredFirstEnd = true;
                    end = getDateTime(line);
                }

                if (encounteredFirstEnd == true) {
                    // Once we encounter our first DTEND, look for a SUMMARY.
                    if (line.indexOf("SUMMARY") >= 0) {
                        assert(lastLineRead == "DTEND");
                        lastLineRead = "SUMMARY";

                        summary = line.substring(line.indexOf(':') + 1, line.length);
                    }

                    // Once we've encountered a SUMMARY, look for a DTSTART.
                    // This is the last piece of an event we care about.
                    else if (line.indexOf("DTSTART") >= 0) {
                        assert(lastLineRead == "SUMMARY");
                        lastLineRead = "DTSTART";

                        start = getDateTime(line);

                        var newCalendarEvent = new CalendarEvent(summary, start, end);
                        allCalendarEvents[allCalendarEvents.length] = newCalendarEvent;
                    }
                }
            });

            // Decrement how many calendars we're waiting on. If this was the last one, resolve the promise.
            calendarCount--;
            if (calendarCount == 0) {
                resolve();
            }
        });
    });
});

promise.then(
    function onFulfilled() {
        // Promise kept. :)
        console.log("\nFor Dear.");
        console.log("Love, Handsome.\n");

        sortCalendars();
        removeOutsideDateRange(new DateTime(2014, 01, 01, 00, 00), new DateTime(2015, 01, 01, 00, 00));
        printCalendars();
    },
    function onRejected(error) {
        // Promise broken. :(
        console.log("error");
    }
);

////////////////////////////////////////////////////
// Functions
function getDateTime(lineIn)
{
    var sub = lineIn.substring(lineIn.indexOf(':') + 1, lineIn.length);
    var endYear = Number(sub.substring(0, 4));
    var endMonth = Number(sub.substring(4, 6));
    var endDay = Number(sub.substring(6, 8));
    var endHour = 0;
    var endMinute = 0;
    if (sub.length >= 13) {
        endHour = Number(sub.substring(9, 11));
        endMinute = Number(sub.substring(11, 13));
    }
    return new DateTime(endYear, endMonth, endDay, endHour, endMinute);
}

// This functions assumes allCalendarEvents is sorted in ascending order by start dateTime.
function removeOutsideDateRange(rangeStart, rangeEnd) {
    var startIndex = 0;
    var endIndex = allCalendarEvents.length - 1;

    for (var i = 0; i < allCalendarEvents.length - 1; i++) {
        // If an event ends after the rangeStart cutoff, it's included.
        var startCompare = compareDateTimes(allCalendarEvents[i].end, rangeStart);
        if (startCompare >= 0) {
            startIndex = i;
            break;
        }
    }

    for (var i = startIndex; i < allCalendarEvents.length - 1; i++) {
        // If an event starts before the rangeEnd cutoff, it's included.
        var endCompare = compareDateTimes(allCalendarEvents[i].start, rangeEnd);
        if (endCompare < 0) {
            endIndex = i;
        }
    }

    // I'm not sure if slice is safe to assign directly back to the array being sliced, so I'm using a temp.
    var temp = allCalendarEvents.slice(startIndex, endIndex + 1);
    allCalendarEvents = temp;
}

function sortCalendars() {
    allCalendarEvents.sort(function (x, y) {
        return compareDateTimes(x.start, y.start);
    });
};

// Returns positive if date1 is after date2, negative if date2 is after date1, and 0 otherwise.
function compareDateTimes(date1, date2) {
    if (date1.year == date2.year) {
        if (date1.month == date2.month) {
            if (date1.day == date2.day) {
                if (date1.hour == date2.hour) {
                    if (date1.minute == date2.minute) {
                        return 0;
                    }
                    return date1.minute - date2.minute;
                }
                return date1.hour - date2.hour;
            }
            return date1.day - date2.day;
        }
        return date1.month - date2.month;
    }
    return date1.year - date2.year;
}

function printCalendars() {
    for (var i = 0; i < allCalendarEvents.length; i++) {
        console.log("Event " + i);
        console.log("\tSummary: " + allCalendarEvents[i].summary);
        console.log("\tStart: " + allCalendarEvents[i].start.print());
        console.log("\tEnd: " + allCalendarEvents[i].end.print());
    }
};
