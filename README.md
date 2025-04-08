# QR Scanner Project

## Setup Instructions

### Starting the Server

1. Make sure MySQL is installed and running.
2. Create a database named `majistic2k25` (or update the database name in server.js).
3. Create a `registrations` table with the correct schema.
4. Start the server:

```bash
cd server
node server.js
```

The server should show: `Server running at http://localhost:3000`

### Using Mock Data

If you don't have the database set up, the app will use mock data by default.

### Troubleshooting

If you see errors connecting to the API:
1. Make sure the server is running on port 3000
2. Check MySQL connection settings in server.js
3. Ensure your database and tables exist

## Database Schema

The registrations table should have the following columns:

- id
- student_name
- gender
- jis_id
- mobile
- email
- department
- inhouse_competition
- competition_name
- registration_date
- payment_status
- receipt_number
- payment_updated_by
- payment_update_timestamp
- paid_amount
- ticket_generated
- checkin_1
- checkin_1_timestamp
- checkin_2
- checkin_2_timestamp
- edited_by
- edited_timestamp
