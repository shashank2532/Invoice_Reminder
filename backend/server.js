const express = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const port = 3001;

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));

// Session Configuration
app.use(session({
  secret: secretKey,
  resave: true,
  saveUninitialized: true,
}));

// Passport Configuration
const GOOGLE_CLIENT_ID = '29209658552-as58ekl8urf82rf5r46rpslddtffoh4e.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    // You can customize user creation and storage logic here
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    // Successful authentication
    res.redirect('http://localhost:3000/invoices');
  }
);

app.get('/check-auth', async (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

app.get('/api/invoices', async (req, res) => {
  // Dummy data for testing
  const invoices = [{ id: 1, amount: 100, dueDate: '2023-12-31', recipient: 'John Doe' },{ id: 2, amount: 100, dueDate: '2023-12-31', recipient: 'Jsfd' }];
  res.json(invoices);
});

// app.post('/api/trigger-zapier', async (req, res) => {
//   // Logic to trigger Zapier workflow
//   // You might want to send an HTTP request to Zapier's webhook URL
//   res.json({ message: 'Zapier workflow triggered' });
// });

const { google } = require('googleapis');

// ... (existing imports and code)

// Function to update Google Spreadsheet
const updateGoogleSpreadsheet = async (invoices) => {
  const sheets = google.sheets('v4');
  const auth = new google.auth.GoogleAuth({
    keyFile: 'C:\Users\Lenovo\Desktop\Firstproject\backend\package.json', // Path to the downloaded JSON file
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const sheetsApi = await sheets.spreadsheets.values.append({
    auth,
    spreadsheetId: '117pKO0EWoxJRWuA5A2k-B1sS4UQs45hTZ3PbSWwBU-c',
    range: 'Sheet1', // Modify the sheet name as needed
    valueInputOption: 'RAW',
    resource: {
      values: invoices.map((invoice) => [invoice.amount, invoice.dueDate, invoice.recipient]),
    },
  });

  console.log('Google Spreadsheet updated:', sheetsApi.data);
};

// Update the '/api/trigger-zapier' endpoint
app.post('/api/trigger-zapier', async (req, res) => {
    try {
      // Get due invoices (modify this logic based on your requirements)
      const dueInvoices = [{ amount: 100, dueDate: '2023-12-31', recipient: 'John Doe' }];
  
      // Update Google Spreadsheet
      await updateGoogleSpreadsheet(dueInvoices);
  
      res.json({ message: 'Zapier workflow triggered' });
    } catch (error) {
      console.error('Error triggering Zapier workflow:', error);
      res.status(500).json({ message: 'Error triggering Zapier workflow', error: error.message });
    }
  });
  

// ... (remaining code)


app.get('/user', async (req, res) => {
  if (req.isAuthenticated()) {
    // If the user is authenticated, send the user data
    res.json(req.user);
  } else {
    // If the user is not authenticated, send an empty object or an error message
    res.json({});
  }
});

app.get('/logout', async (req, res) => {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ message: 'Logout error', error: err });
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(500).json({ message: 'Session destroy error', error: destroyErr });
        }
        res.clearCookie('connect.sid', { domain: 'localhost', path: '/' });  // Update domain and path if needed
        res.json({ message: 'Logout successful' });
      });
    });
  });
  
  

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});