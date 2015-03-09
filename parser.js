var fs = require('fs');
var assert = require('assert');

fs.readFile( __dirname + '/Calendars to parse/Just Paws.ics', function (err, data)
{
    if (err)
    {
        throw err;
    }

    var calendar = data.toString();
    var calendarLines = calendar.split('\n');

    var CalendarEvent = function(summary, start, end)
    {
        this.summary = summary;
        this.start = start;
        this.end = end;
        /*console.log("New Event");
        console.log("\tSummary: " + this.summary);
        console.log("\tStart: " + this.start);
        console.log("\tEnd: " + this.end);*/
    };

    // Get all of the events from one calendar and put them in an array of CalendarEvents.
    var summary;
    var start;
    var end;
    var lastLineRead = "DTEND";
    var encounteredFirstSummary = false;
    var allCalendarEvents = [];

    calendarLines.forEach(function(line)
    {
        if (line.indexOf("SUMMARY") >= 0)
        {
            encounteredFirstSummary = true;

            assert(lastLineRead == "DTEND");
            lastLineRead = "SUMMARY";

            summary = line.substring(line.indexOf(':') + 1, line.length);
        }

        if (encounteredFirstSummary == true)
        {
            if (line.indexOf("DTSTART") >= 0)
            {
                assert(lastLineRead == "SUMMARY");
                lastLineRead = "DTSTART";

                start = line.substring(line.indexOf(':') + 1, line.length);
            }

            else if (line.indexOf("DTEND") >= 0)
            {
                assert(lastLineRead == "DTSTART");
                lastLineRead = "DTEND";

                end = line.substring(line.indexOf(':') + 1, line.length);

                var newCalendarEvent = new CalendarEvent(summary, start, end);
                allCalendarEvents[allCalendarEvents.length] = newCalendarEvent;
            }
        }
    });

    // Print out all calendar events.
    for (var i = 0; i < allCalendarEvents.length; i++)
    {
        console.log("New Event");
        console.log("\tSummary: " + allCalendarEvents[i].summary);
        console.log("\tStart: " + allCalendarEvents[i].start);
        console.log("\tEnd: " + allCalendarEvents[i].end);
    }
});




/*
from os import listdir
from os.path import isfile, join

class Event:
	def __init__(self, title, date, time, length):
		self.title = title
		self.date = date
		self.time = time
		self.length = length

# Open the calendar files
def loadAllIcals(path = ''):
	return listdir("Calendars to parse")

# Read a calendar's contents into a list of event data structures (mm-dd-yyyy, time, length, title)
def parseCalendar(calendarPath):
	f = open("Calendars to parse/" + calendarPath, 'r')
	for line in f:
		if "SUMMARY" in line:
			print line

if __name__ == "__main__":
	calendars = loadAllIcals()
	#for calendar in calendars:
	#	parseCalendar(calendar)
	parseCalendar(calendars[2])
*/
