# How The System Works

## Simple Flow

### For Already Registered People
1. When you run `npm start`, the server immediately checks Google Sheets
2. Sends QR codes to everyone who hasn't received one yet
3. Tracks who got emails (no duplicates)

### For Future Registrations
1. Server automatically checks Google Sheets **every 5 minutes**
2. Finds new people who registered
3. Sends them QR codes automatically
4. You don't have to do anything!

### Email Content
- Clean, professional design (no fancy stuff)
- QR code embedded in email
- Event details (date, time, venue)
- Person's info (name, school, phone)
- Instructions for event day

### Staff Portal (Event Day)
1. Open: http://localhost:3000/staff.html
2. Click "Start Scanner"
3. Point camera at QR code
4. See person's details instantly
5. Click "Confirm Check-in"
6. Done!

## Technical Details

**Server checks:** Every 5 minutes  
**Email tracking:** By email address (prevents duplicates)  
**QR code:** Unique ID + person's data  
**Storage:** In-memory (works for events under 1000 people)  

## GitHub Ready

Already initialized! To push to GitHub:
```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin master
```

## File Structure
```
backend/
├── server.js           # Main server with auto-send logic
├── public/
│   └── staff.html     # Scanning portal
├── package.json       # Dependencies
├── .env              # Your config (create this)
├── .env.example      # Template
├── credentials.json  # Google API (create this)
├── .gitignore        # Protects sensitive files
├── README.md         # Full documentation
├── QUICKSTART.md     # Quick setup guide
└── HOW-IT-WORKS.md   # This file
```

## What's Protected (Not on GitHub)
- `.env` - Your passwords
- `credentials.json` - Google API keys
- `node_modules/` - Dependencies

These are in `.gitignore` so they won't be committed.
