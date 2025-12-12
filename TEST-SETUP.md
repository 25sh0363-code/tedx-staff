# Testing with a Fake Google Sheet

## Quick Test Setup (5 minutes)

### 1. Create Test Google Sheet

1. Go to https://sheets.google.com
2. Create a new blank spreadsheet
3. Name it "TEDx Test Registrations"

### 2. Add Test Data

Copy this into your sheet (starting from cell A1):

| Timestamp | Name | School | Email | Phone |
|-----------|------|--------|-------|-------|
| 2025-12-12 10:30:00 | Test User 1 | ABC High School | your-test-email@gmail.com | +91 9876543210 |
| 2025-12-12 11:15:00 | Test User 2 | XYZ College | another-test@gmail.com | +91 9876543211 |
| 2025-12-12 12:00:00 | Test User 3 | Test Academy | test3@gmail.com | +91 9876543212 |

**Important:** Use YOUR real email address for testing so you can receive the QR codes!

### 3. Get Sheet ID

From your sheet URL:
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
                                        ^^^^^^^^^^^^^^^^^^^^
                                        This is your Sheet ID
```

### 4. Share with Service Account

1. Click "Share" button in your test sheet
2. Paste your service account email (from credentials.json)
   - Look for: `"client_email": "something@project-id.iam.gserviceaccount.com"`
3. Give "Editor" access
4. Uncheck "Notify people"
5. Click "Share"

### 5. Update .env

```env
PORT=3000
GOOGLE_SHEET_ID=your_test_sheet_id_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_password
```

### 6. Test Run

```bash
npm start
```

**What should happen:**
- Within 3 seconds: Server sends QR codes to all 3 test emails
- You receive 3 emails with QR codes
- Server logs: "✅ Sent QR to: your-test-email@gmail.com"

### 7. Test Auto-Send for New Registrations

1. Keep server running
2. Add a new row to your Google Sheet:
   ```
   2025-12-12 13:00:00 | Test User 4 | Another School | your-email@gmail.com | +91 9876543213
   ```
3. Wait up to 5 minutes
4. You should receive another email automatically!

### 8. Test Staff Portal

1. Open http://localhost:3000/staff.html
2. Open one of the QR code emails on your phone
3. Click "Start Scanner"
4. Point camera at the QR code from your email
5. You should see the person's details
6. Click "Confirm Check-in"

## Sample Data Template

Want more test data? Add these rows:

```
2025-12-12 09:00:00 | Rahul Sharma | Delhi Public School | test1@gmail.com | +91 9876543210
2025-12-12 09:30:00 | Priya Patel | Ryan International | test2@gmail.com | +91 9876543211
2025-12-12 10:00:00 | Amit Kumar | St. Xavier's | test3@gmail.com | +91 9876543212
2025-12-12 10:30:00 | Sneha Reddy | Oakridge School | test4@gmail.com | +91 9876543213
2025-12-12 11:00:00 | Rohan Gupta | The Heritage School | test5@gmail.com | +91 9876543214
```

**Pro tip:** Use your own email for all test rows so you can see all the QR codes!

## Troubleshooting

### Not receiving emails?
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASS in .env
- Check terminal for error messages

### Server not finding registrations?
- Check GOOGLE_SHEET_ID is correct
- Verify service account has Editor access
- Check sheet name is "Sheet1" (or update in server.js)

### Want to test again?
1. Stop server (Ctrl+C)
2. Clear test data from sheet
3. Add new test rows
4. Restart server

The system tracks emails it already sent, so it won't send duplicates unless you restart the server.
