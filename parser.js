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

var CalendarEvent = function (summary, start, end) {
    this.summary = summary;
    this.start = start;
    this.end = end;
};

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
                    end = line.substring(line.indexOf(':') + 1, line.length);
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

                        start = line.substring(line.indexOf(':') + 1, line.length);

                        var newCalendarEvent = new CalendarEvent(summary, start, end);
                        allCalendarEvents[allCalendarEvents.length] = newCalendarEvent;
                    }
                }
            });
        });

        calendarCount--;
        if (calendarCount == 0) {
            resolve();
        }
    });
});

promise.then(
    function onFulfilled() {
        // Promise kept. :)
        var sortedEvents = {};
        for (var i = 0; i < allCalendarEvents.length; i++) {
            sortedEvents[allCalendarEvents[i].start] = allCalendarEvents[i];
        }

        var count = 1;
        for (var event in sortedEvents) {
            console.log("Event " + count);
            console.log("\tSummary: " + event.summary);
            console.log("\tStart: " + event.start);
            console.log("\tEnd: " + event.end);
            count++;
        }
    },
    function onRejected(error) {
        // Promise broken. :(
        console.log("error");
    }
);
