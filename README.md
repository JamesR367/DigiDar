# DigiDar - The Digital Home Calendar

## What is Digidar:

Digidar is a physical calendar that has the ability to sync multiple personal calendars onto one board that everyone in a household can see at a glance. Our goal is to bring back the appeal and utility of physical calendars while still having the convenience of electronic calendars.

## Features:

- Add notes to calendar with stylus
- Sync electronic calendars (i.e. Google, Outlook, Apple) to the device
- Have customizable widgets such as weather, daily summary, notes, etc.
- Locally hosted for privacy and full control over data

## Tech Stack:

- **Frontend:** React
- **Backend:** FastAPI (Python)
- **Database:** MySQL
- **Calendar Sync:** ical feed
- **Parsing Hand Writing:**
  - **NLP:** Local OCR+NLP service (FastAPI)
  - **OCR:** Tesseract (in Docker)

## Local OCR+NLP (handwritten event input)

The Day view “Add Event” modal supports a handwriting canvas that can be sent to a local OCR+NLP service to prefill the event title and times.

- **Frontend config**: `VITE_OCR_NLP_URL` (default `http://localhost:8010`)
- **API**: `POST /parse-event` (multipart `image`) → `{ rawText, title, startTime, endTime }`

### Run with Docker Compose

Bring up the full stack (frontend, backend, db, OCR):

```bash
docker compose up --build
```

Then in the UI: Day view → Add Event → “Write it instead” → draw “Dentist 3-4pm” → Recognize.

## Contributors:

- [Alex Murray](https://github.com/alexsmurray)
- [James Ramsey](https://github.com/JamesR367)
- [Christopher Ortega](https://github.com/c-ortega)
