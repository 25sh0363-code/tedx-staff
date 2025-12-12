# TEDx Silver Oaks QR Check-in System

Simple QR code check-in system with automatic email distribution for new registrations.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Google Sheets
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google Sheets API
3. Create Service Account → Download credentials JSON
4. Save as `credentials.json` in this folder
5. Share your Google Sheet with the service account email (Editor access)

### 3. Setup Gmail

1. Go to your Google Account settings
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **Security** > **App passwords**
4. Create a new app password
   - App: Mail
   - Device: Other (custom name) - e.g., "TEDx Check-in System"
5. Copy the 16-character password (remove spaces)

### Step 4: Create Environment File

1. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

2. Edit `.env` and fill in your details:
```env
PORT=3000

# Your Google Sheet ID (from URL)
GOOGLE_SHEET_ID=1abc123xyz456...

# Path to your credentials file
GOOGLE_CREDENTIALS_FILE=credentials.json

# Your Gmail address
EMAIL_USER=your-email@gmail.com

# Your Gmail App Password (16 characters, no spaces)
EMAIL_PASS=abcd efgh ijkl mnop
```

### Step 5: Update Google Sheets Column Mapping

Your registration data columns should match this order (adjust in `server.js` line 113-117 if different):

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Name | School | Email | Phone |

If your columns are different, update these lines in `server.js`:
```javascript
const attendeeData = {
    name: row[1],     // Column B
    school: row[2],   // Column C
    email: row[3],    // Column D
    phone: row[4]     // Column E
};
```

### Step 6: Start the Server

```bash
npm start
```

Server will run on `http://localhost:3000`

## Usage

### Sending QR Codes to All Registrants

**Option 1: Using API**
```bash
curl -X POST http://localhost:3000/api/send-qr-codes
```

**Option 2: Using Browser**
Open Postman or similar tool and send POST request to:
```
http://localhost:3000/api/send-qr-codes
```

This will:
1. Fetch all registrations from Google Sheets
2. Generate unique QR codes for each person
3. Send personalized emails with QR codes
4. Store check-in data for verification

### Sending QR Code to Single Attendee

POST to `http://localhost:3000/api/send-single-qr` with body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "school": "ABC School"
}
```

### Accessing Staff Portal

1. Open browser and go to: `http://localhost:3000/staff.html`
2. Click "Start Scanner" to begin scanning QR codes
3. Point camera at attendee's QR code (from email)
4. System will show attendee details
5. Click "Confirm Check-in" to complete check-in

### Staff Portal Features

- **Live Stats**: Total registered, checked in, pending, percentage
- **QR Scanner**: Camera-based scanner with instant verification
- **Attendee List**: Real-time list with search functionality
- **Check-in Status**: Visual indicators for checked-in vs pending
- **Search**: Filter by name, email, phone, or school

## Email Template

Attendees will receive a professional email containing:
- TEDx branding
- Unique QR code (400x400px)
- Event details (date, time, venue)
- Important instructions
- Contact information

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send-qr-codes` | Send QR codes to all registrants |
| POST | `/api/send-single-qr` | Send QR code to one person |
| POST | `/api/verify-qr` | Verify QR code validity |
| POST | `/api/check-in` | Check in an attendee |

## GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit - TEDx QR Check-in System"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

## Troubleshooting

### Email not sending
- Check Gmail App Password (16 characters, no spaces)
- Verify 2-Step Verification is enabled
- Check email address is correct

### Google Sheets not connecting
- Verify service account has Editor access to sheet
- Check Sheet ID is correct (from URL)
- Ensure Google Sheets API is enabled

### QR Scanner not working
- Grant camera permissions in browser
- Use Chrome or Safari for best results
- Ensure HTTPS in production

## Support
- Email: tedx@hyd.silveroaks.co.in
- Phone: +91 73372 13122

