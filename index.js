const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;  // Use Render's dynamic port

// 🌐 Use Render URL
const BASE_URL = "https://qr-invoice-app.onrender.com";

app.use(express.urlencoded({ extended: true }));

const invoices = {};

// Home Route
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; padding: 10px; text-align: center; }
                a { text-decoration: none; color: #4CAF50; font-size: 18px; }
            </style>
        </head>
        <body>
            <h1>QR Invoice App is Running!</h1>
            <p><a href="/create-invoice">Create a New Invoice</a></p>
        </body>
        </html>
    `);
});

// Display Invoice Creation Form
app.get('/create-invoice', (req, res) => {
    res.send(`
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; padding: 10px; }
                .container { max-width: 90%; margin: auto; }
                input, textarea {
                    width: 100%; padding: 10px; margin: 5px 0 15px 0;
                    border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box;
                }
                button {
                    width: 100%; background-color: #4CAF50; color: white;
                    padding: 12px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;
                }
                button:hover { background-color: #45a049; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Create Invoice</h2>
                <form action="/submit-invoice" method="POST">
                    <label>Client Name:</label>
                    <input type="text" name="clientName" required>

                    <label>Service Description:</label>
                    <input type="text" name="service" required>

                    <label>Amount Due (R):</label>
                    <input type="text" name="price" pattern="^\\d+(\\.\\d{1,2})?$" placeholder="e.g. 150 or 199.99" required>

                    <label>Valid Until (YYYY-MM-DD):</label>
                    <input type="date" name="validUntil" required>

                    <label>Notes (optional):</label>
                    <textarea name="notes"></textarea>

                    <button type="submit">Generate Invoice</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Handle Form Submission & Generate QR Code
app.post('/submit-invoice', async (req, res) => {
    const { clientName, service, price, validUntil, notes } = req.body;
    const invoiceId = uuidv4();

    invoices[invoiceId] = {
        clientName,
        service,
        price: `R${price}`,
        provider: "Craige's Services",
        validUntil,
        notes
    };

    const qrData = `${BASE_URL}/invoice/${invoiceId}`;
    const qrImage = await QRCode.toDataURL(qrData);

    res.send(`
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; padding: 10px; text-align: center; }
                img { width: 80%; max-width: 300px; }
                a { word-break: break-word; }
            </style>
        </head>
        <body>
            <h2>Invoice Created!</h2>
            <p>Ask your client to scan this QR code:</p>
            <img src="${qrImage}" alt="Invoice QR Code"/>
            <p><a href="${qrData}">${qrData}</a></p>
        </body>
        </html>
    `);
});

// Display Client Invoice Page
app.get('/invoice/:id', (req, res) => {
    const invoice = invoices[req.params.id];

    if (invoice) {
        res.send(`
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; padding: 10px; }
                    .invoice-box {
                        max-width: 90%; margin: auto; padding: 20px;
                        border: 1px solid #ddd; border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    button {
                        width: 100%; background-color: #4CAF50; color: white;
                        padding: 12px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <h2 style="text-align:center;">Invoice for ${invoice.clientName}</h2>
                    <p><strong>Service:</strong> ${invoice.service}</p>
                    <p><strong>Amount Due:</strong> ${invoice.price}</p>
                    <p><strong>Provider:</strong> ${invoice.provider}</p>
                    <p><strong>Valid Until:</strong> ${invoice.validUntil}</p>
                    ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
                    <button onclick="alert('Payment gateway coming soon!')">Pay Now</button>
                </div>
            </body>
            </html>
        `);
    } else {
        res.status(404).send('<h2 style="font-family: Arial, sans-serif; color: red; text-align:center;">Invoice not found.</h2>');
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send('<h2 style="font-family: Arial, sans-serif; color: gray; text-align:center;">404 - Page Not Found</h2>');
});

// Start Server
app.listen(port, () => {
    console.log(`✅ QR Invoice App listening on port ${port}`);
});
