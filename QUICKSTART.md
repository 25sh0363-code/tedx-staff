# Quick Start - TEDx QR Check-in

## What This Does
✅ Auto-sends QR codes to new registrations every 5 minutes  
✅ Sends to all existing people immediately on startup  
✅ Professional emails with QR codes  
✅ Simple staff scanning portal  

## Setup (5 minutes)

### 1. Install
```bash
npm install
```

### 2. Google Sheets Setup
1. Go to https://console.cloud.google.com/
2. New Project → Enable "Google Sheets API"
3. Create Service Account → Download JSON
4. Save as `credentials.json` in this folder
5. Share your Google Sheet with service account email (Editor access)

### 3. Gmail App Password
1. Google Account → Security → Enable 2-Step Verification
2. Security → App passwords → Create for "Mail"
3. Copy the 16-character password

### 4. Configure
Create `.env` file:
```env
PORT=3000
GOOGLE_SHEET_ID=your_sheet_id_from_url
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

### 5. Run
```bash
npm start
```

## What Happens Next
- Immediately sends QR codes to all current registrations
- Checks every 5 minutes for new people
- Only sends to those who haven't received yet
- Staff portal: http://localhost:3000/staff.html

## Google Sheet Format
```
| Timestamp | Name | School | Email | Phone |
```

Done! Everything is automatic now.
   - Click "Share"

6. **Get Sheet ID**
   - Look at your Google Sheet URL
   - Copy the part between `/d/` and `/edit`
   - Example: `https://docs.google.com/spreadsheets/d/1abc123xyz456/edit`
   - Sheet ID = `1abc123xyz456`

### Part 2: Gmail App Password Setup (5 min)

1. **Enable 2-Step Verification** (if not already)
   - Go to https://myaccount.google.com/security
   - Find "2-Step Verification"
   - Click and follow steps to enable

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Type: "TEDx Check-in"
   - Click "Generate"
   - **SAVE THE 16-CHARACTER PASSWORD** (you can't see it again)
   - Format: `abcd efgh ijkl mnop`

### Part 3: Install & Configure (10 min)

1. **Install Node.js**
   - Download from https://nodejs.org/ (if not installed)
   - Install with default settings

2. **Open Terminal/Command Prompt**
   - Windows: Press Win+R, type `cmd`, press Enter
   - Navigate to backend folder:
   ```bash
   cd C:\Users\zoneg\OneDrive\Documents\tedx\backend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   Wait for installation to complete (1-2 minutes)

4. **Create .env File**
   - Copy the example file:
   ```bash
   copy .env.example .env
   ```
   
5. **Edit .env File**
   - Open `.env` in Notepad
   - Fill in your details:
   ```
   PORT=3000
   GOOGLE_SHEET_ID=your_sheet_id_here
   GOOGLE_CREDENTIALS_FILE=credentials.json
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your 16 char password here
   ```
   - Save and close

6. **Verify Your Sheet Structure**
   - Make sure your Google Sheet columns are in this order:
   
   | A (Timestamp) | B (Name) | C (School) | D (Email) | E (Phone) |
   |---------------|----------|------------|-----------|-----------|
   
   - If different, you'll need to update `server.js` (see main README)

---

## Running the System

### Start the Server

```bash
npm start
```

You should see:
```
Server running on port 3000
Staff portal: http://localhost:3000/staff
```

### Send QR Codes to All Attendees

**Option 1: Using PowerShell**
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/send-qr-codes -Method POST
```

**Option 2: Using Command Prompt with curl**
```bash
curl -X POST http://localhost:3000/api/send-qr-codes
```

**Option 3: Using Browser/Postman**
- Open Postman or similar tool
- Create new POST request
- URL: `http://localhost:3000/api/send-qr-codes`
- Click "Send"

The system will:
1. Read all registrations from Google Sheets
2. Generate unique QR codes (takes ~1 second per person)
3. Send personalized emails with QR codes
4. Display progress and results

### Open Staff Portal

1. Open browser (Chrome recommended)
2. Go to: `http://localhost:3000/staff.html`
3. Click "Start Scanner"
4. Allow camera access when prompted
5. Ready to scan QR codes!

---

## On Event Day

### For Gate Staff

1. **Before Event**
   - Charge tablets/laptops fully
   - Test camera access
   - Open staff portal: `http://localhost:3000/staff.html`
   - Keep server running on a laptop

2. **During Check-in**
   - Click "Start Scanner"
   - Ask attendee to show QR code (from email)
   - Point camera at QR code
   - System will automatically scan and show details
   - Verify attendee details match
   - Click "Confirm Check-in"
   - Attendee is checked in! ✅

3. **Manual Check (if QR fails)**
   - Use search box on right side
   - Type attendee name/email/phone
   - Find them in the list
   - Verify details manually

### For Organizers

Monitor the dashboard:
- **Total Registered**: All people who registered
- **Checked In**: People who arrived
- **Pending**: Not yet checked in
- **Check-in Rate**: Percentage completed

---

## Common Issues & Solutions

### "Cannot connect to Google Sheets"
- ✅ Check service account has access to sheet
- ✅ Verify Sheet ID is correct in `.env`
- ✅ Ensure `credentials.json` is in backend folder

### "Email sending failed"
- ✅ Check Gmail App Password is correct (no spaces)
- ✅ Verify email address in `.env`
- ✅ Ensure 2-Step Verification is ON

### "Camera not working on staff portal"
- ✅ Grant camera permission in browser
- ✅ Use Chrome or Edge browser
- ✅ Try on mobile device if laptop camera fails

### "QR code shows invalid"
- ✅ Make sure QR was generated by your system
- ✅ Check server is running
- ✅ Attendee might not be in database

---

## Test Before Event Day

### Test Email Sending

Send to yourself first:
```powershell
$body = @{
    name = "Test User"
    email = "your-email@gmail.com"
    phone = "+91 9876543210"
    school = "Test School"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/send-single-qr -Method POST -Body $body -ContentType "application/json"
```

Check your email for the QR code!

### Test QR Scanning

1. Open staff portal
2. Send test QR to your phone
3. Start scanner
4. Show phone screen to camera
5. Verify check-in works

---

## Event Day Checklist

**1 Week Before:**
- [ ] Complete setup and test
- [ ] Send QR codes to all registrants
- [ ] Verify emails are delivered

**1 Day Before:**
- [ ] Test staff portal on actual devices
- [ ] Charge all tablets/laptops
- [ ] Print backup attendee list (from Google Sheets)
- [ ] Brief gate staff on using the system

**Event Morning:**
- [ ] Start server on stable laptop
- [ ] Connect devices to same WiFi
- [ ] Open staff portal on all devices
- [ ] Test one QR scan before attendees arrive

**During Event:**
- [ ] Keep laptop with server powered on
- [ ] Monitor check-in statistics
- [ ] Have manual backup list ready

---

## Getting Help

If you encounter issues:

1. Check the detailed README.md
2. Contact technical support:
   - Email: tedx@hyd.silveroaks.co.in
   - Phone: +91 73372 13122

---

## Quick Reference Commands

```bash
# Start server
npm start

# Send QR codes (PowerShell)
Invoke-RestMethod -Uri http://localhost:3000/api/send-qr-codes -Method POST

# Open staff portal
# Go to: http://localhost:3000/staff.html

# View all attendees API
# Go to: http://localhost:3000/api/attendees

# View statistics
# Go to: http://localhost:3000/api/stats
```

---

**Ready to go! 🎉**

Good luck with your TEDx event!
