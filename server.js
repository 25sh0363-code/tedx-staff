const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const sgMail = require('@sendgrid/mail');
const { google } = require('googleapis');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_FILE || 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets('v4');

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In-memory storage for check-ins (use database in production)
const checkIns = new Map();
const processedEmails = new Set(); // Track who already received QR codes

// Auto-check for new registrations every 5 minutes
setInterval(async () => {
    console.log('Checking for new registrations...');
    await sendQRToNewRegistrations();
}, 5 * 60 * 1000);

// Send QR codes to new registrations only
async function sendQRToNewRegistrations() {
    try {
        const authClient = await auth.getClient();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A2:F',
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return;

        let newCount = 0;
        for (const row of rows) {
            const email = row[3];
            if (!email || processedEmails.has(email)) continue;

            const attendeeData = {
                name: row[1],
                school: row[2],
                email: row[3],
                phone: row[4]
            };

            const { uniqueId, qrCodeImage, qrData } = await generateQRCode(attendeeData);
            checkIns.set(uniqueId, {
                ...qrData,
                checkedIn: false,
                checkInTime: null
            });

            try {
                await sendQRCodeEmail(attendeeData, qrCodeImage);
                processedEmails.add(email);
                newCount++;
                console.log(`✅ Sent QR to: ${email}`);
            } catch (error) {
                console.error(`❌ Failed to send to ${email}:`, error.message);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (newCount > 0) {
            console.log(`📧 Sent QR codes to ${newCount} new registrant(s)`);
        }
    } catch (error) {
        console.error('Error checking new registrations:', error);
    }
}

// Generate unique QR code for attendee
async function generateQRCode(attendeeData) {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const qrData = {
        id: uniqueId,
        name: attendeeData.name,
        email: attendeeData.email,
        phone: attendeeData.phone,
        school: attendeeData.school,
        timestamp: new Date().toISOString()
    };

    const qrString = JSON.stringify(qrData);
    const qrCodeImage = await QRCode.toDataURL(qrString, {
        width: 400,
        margin: 2,
        color: {
            dark: '#E62B1E',
            light: '#FFFFFF'
        }
    });

    return { uniqueId, qrCodeImage, qrData };
}

// Send email with QR code
async function sendQRCodeEmail(attendeeData, qrCodeImage) {
    const msg = {
        to: attendeeData.email,
        from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: 'TEDx Silver Oaks'
        },
        subject: 'Your TEDx Silver Oaks 2025 Entry Pass',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: #E62B1E; padding: 30px 20px; text-align: center; color: white; }
                    .logo { font-size: 32px; font-weight: bold; }
                    .content { padding: 30px; color: #333; line-height: 1.6; }
                    .qr-section { background: #f9f9f9; border: 2px solid #E62B1E; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; }
                    .qr-code { max-width: 250px; margin: 15px auto; background: white; padding: 10px; border-radius: 4px; }
                    .details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #E62B1E; }
                    .details p { margin: 8px 0; }
                    .footer { background: #f4f4f4; padding: 20px; text-align: center; color: #666; font-size: 13px; border-top: 1px solid #ddd; }
                    h2 { color: #E62B1E; font-size: 20px; margin-top: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">TEDx Silver Oaks</div>
                        <div style="font-size: 14px; margin-top: 5px;">International School, Bachupally</div>
                    </div>
                    
                    <div class="content">
                        <h2>Registration Confirmed</h2>
                        <p>Dear <strong>${attendeeData.name}</strong>,</p>
                        <p>Thank you for registering for TEDx Silver Oaks 2025. Your entry pass is attached below.</p>
                        
                        <div class="qr-section">
                            <h2>Your Entry Pass</h2>
                            <p>Present this QR code at the entrance</p>
                            <div style="text-align: center;">
                                <img src="${qrCodeImage}" alt="Entry QR Code" style="max-width: 250px; margin: 15px auto; background: white; padding: 10px; border-radius: 4px; display: inline-block;">
                            </div>
                            <p style="font-size: 12px; color: #666; margin-top: 10px;">Save this email or screenshot the QR code</p>
                        </div>
                        
                        <div class="details">
                            <h2>Event Information</h2>
                            <p><strong>Date:</strong> 20th December 2025</p>
                            <p><strong>Time:</strong> 9:30 AM - 4:30 PM</p>
                            <p><strong>Venue:</strong> Silver Oaks International School, Bachupally, Hyderabad</p>
                            <p><strong>Name:</strong> ${attendeeData.name}</p>
                            <p><strong>School:</strong> ${attendeeData.school}</p>
                            <p><strong>Phone:</strong> ${attendeeData.phone}</p>
                        </div>
                        
                        <p style="margin-top: 20px; font-size: 14px;"><strong>Important:</strong> Please arrive by 9:00 AM. This QR code is non-transferable.</p>
                        
                        <p style="margin-top: 20px; font-size: 14px;">For questions, contact:<br>
                        Email: tedx@hyd.silveroaks.co.in | Phone: +91 73372 13122</p>
                    </div>
                    
                    <div class="footer">
                        <p>&copy; 2025 TEDxSilverOaksIntSchoolBachupally | This independent TEDx event is operated under license from TED</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    await sgMail.send(msg);
}

// API: Send QR codes to ALL registrations (for initial setup)
app.post('/api/send-qr-codes', async (req, res) => {
    try {
        await sendQRToNewRegistrations();
        const stats = Array.from(checkIns.values());
        res.json({ 
            message: 'QR codes sent to all new registrations',
            total: stats.length,
            sent: processedEmails.size
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Send QR code to a single attendee
app.post('/api/send-single-qr', async (req, res) => {
    try {
        const attendeeData = req.body;

        // Validate required fields
        if (!attendeeData.name || !attendeeData.email || !attendeeData.phone || !attendeeData.school) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate QR code
        const { uniqueId, qrCodeImage, qrData } = await generateQRCode(attendeeData);

        // Store QR data
        checkIns.set(uniqueId, {
            ...qrData,
            checkedIn: false,
            checkInTime: null
        });

        // Send email
        await sendQRCodeEmail(attendeeData, qrCodeImage);

        res.json({ 
            message: 'QR code sent successfully',
            uniqueId: uniqueId
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Verify QR code and get attendee details
app.post('/api/verify-qr', async (req, res) => {
    try {
        const { qrData } = req.body;
        const parsedData = JSON.parse(qrData);
        const attendee = checkIns.get(parsedData.id);

        if (!attendee) {
            return res.status(404).json({ 
                valid: false, 
                error: 'Invalid QR code' 
            });
        }

        res.json({
            valid: true,
            attendee: attendee,
            alreadyCheckedIn: attendee.checkedIn
        });

    } catch (error) {
        res.status(400).json({ 
            valid: false, 
            error: 'Invalid QR code format' 
        });
    }
});

// API: Check-in attendee
app.post('/api/check-in', async (req, res) => {
    try {
        const { qrData } = req.body;
        const parsedData = JSON.parse(qrData);
        const attendee = checkIns.get(parsedData.id);

        if (!attendee) {
            return res.status(404).json({ 
                success: false, 
                error: 'Invalid QR code' 
            });
        }

        if (attendee.checkedIn) {
            return res.status(400).json({ 
                success: false, 
                error: 'Already checked in',
                checkInTime: attendee.checkInTime
            });
        }

        // Mark as checked in
        attendee.checkedIn = true;
        attendee.checkInTime = new Date().toISOString();
        checkIns.set(parsedData.id, attendee);

        res.json({
            success: true,
            message: 'Check-in successful',
            attendee: attendee
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: 'Invalid request' 
        });
    }
});

// API: Get all attendees (for staff portal)
app.get('/api/attendees', async (req, res) => {
    try {
        // Get from Google Sheets instead of memory
        const authClient = await auth.getClient();
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A2:F',
        });

        const rows = response.data.values || [];
        const attendeesList = rows.map(row => ({
            name: row[1] || 'N/A',
            school: row[2] || 'N/A',
            email: row[3] || 'N/A',
            phone: row[4] || 'N/A',
            checkedIn: false, // Would need a separate tracking column
        }));

        res.json({
            total: attendeesList.length,
            checkedIn: attendeesList.filter(a => a.checkedIn).length,
            pending: attendeesList.filter(a => !a.checkedIn).length,
            attendees: attendeesList
        });
    } catch (error) {
        console.error('Error fetching attendees:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get check-in statistics
app.get('/api/stats', async (req, res) => {
    try {
        const attendeesList = Array.from(checkIns.values());
        const checkedInList = attendeesList.filter(a => a.checkedIn);
        
        res.json({
            total: attendeesList.length,
            checkedIn: checkedInList.length,
            pending: attendeesList.filter(a => !a.checkedIn).length,
            checkInPercentage: ((checkedInList.length / attendeesList.length) * 100).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📱 Staff portal: http://localhost:${PORT}/staff.html`);
    console.log(`🔄 Auto-checking for new registrations every 5 minutes`);
    
    // Send QR codes to any existing registrations on startup
    setTimeout(() => {
        console.log('🚀 Initial check for registrations...');
        sendQRToNewRegistrations();
    }, 3000);
});
