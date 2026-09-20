import { calendar_v3 } from 'googleapis';
import { RawCaptureEvent } from '@recall/core';

/**
 * Convert Google Calendar event to RawCaptureEvent
 * Per spec section 7: Universal Capture principle
 */
export const convertCalendarEventToCapture = (
  userId: string,
  event: calendar_v3.Schema$Event
): RawCaptureEvent | null => {
  if (!event.id) {
    return null;
  }

  const title = event.summary || '(untitled event)';
  const description = event.description || '';
  const attendeeList =
    event.attendees
      ?.map((a) => ({
        name: a.displayName || a.email || '(unknown)',
        email: a.email,
      }))
      .filter((a) => a.email) || [];

  const fullText = `Event: ${title}\n${description ? `\nDescription:\n${description}` : ''}`;

  // Use start time of the event
  const eventDate = event.start?.dateTime
    ? new Date(event.start.dateTime)
    : event.start?.date
      ? new Date(event.start.date)
      : new Date();

  return {
    userId,
    sourceType: 'CALENDAR',
    externalId: event.id,
    occurredAt: eventDate,
    text: fullText,
    language: 'en',
    participants: attendeeList,
    rawMetadata: {
      eventId: event.id,
      calendarId: event.organizer?.email,
      location: event.location,
      startTime: event.start?.dateTime,
      endTime: event.end?.dateTime,
      isAllDay: !!event.start?.date && !event.start?.dateTime,
    },
  };
};

export interface CalendarIngestOptions {
  maxResults?: number;
  afterDate?: Date;
  beforeDate?: Date;
}

/**
 * Build time range for calendar queries
 * Only fetch events that haven't already been processed
 */
export const buildCalendarTimeRange = (options: CalendarIngestOptions) => {
  const timeMin = options.afterDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
  const timeMax = options.beforeDate || new Date();

  return {
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  };
};
