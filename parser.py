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
