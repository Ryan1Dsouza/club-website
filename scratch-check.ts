import { WORKSHOP_STATIONS } from './src/events/stations.ts';
import { createEventStations } from './src/lib/event-stations.ts';
import { populateWorkshopStation } from './src/events/workshop-content.ts';

const events = [
    {
        "id": "inaugural-2026",
        "title": "The first connection",
        "description": "...",
        "startsAt": "2026-03-12T05:30:00.000Z",
        "endsAt": "2026-03-12T06:15:00.000Z",
        "location": "St. Joseph Engineering College, Mangaluru",
        "category": "Inauguration",
        "registrationUrl": "",
        "published": true
    },
    {
        "id": "ai-workshop-2026",
        "title": "Beyond the baseline",
        "description": "...",
        "startsAt": "2026-03-12T06:15:00.000Z",
        "endsAt": "",
        "location": "St. Joseph Engineering College, Mangaluru",
        "category": "AI workshop",
        "registrationUrl": "",
        "published": true
    },
    {
        "id": "recruitment-2026",
        "title": "Find your people",
        "description": "...",
        "startsAt": "2026-03-12T03:30:00.000Z",
        "endsAt": "2026-03-15T18:29:00.000Z",
        "location": "Nucleus  SJEC",
        "category": "Community",
        "registrationUrl": "",
        "published": true
    }
];

const stations = createEventStations(events).map(populateWorkshopStation);
console.log(stations.length);
console.log(stations.map(s => s.name));
