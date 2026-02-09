# Big Pic Solutions Invoicing System

Professional invoicing and client management system for IT consulting services.

## Features

- **Client Management**: Add and manage clients with hourly rates
- **Job Tracking**: Record completed work with hours, descriptions, and notes
- **Automatic Calculations**: Hours × Rate = Total (automatic calculation)
- **Invoice Generation**: Professional invoice view with PDF export capability
- **Dashboard**: Overview of total revenue, hours, clients, and jobs
- **Professional Design**: Modern UI matching Big Pic Solutions branding (cyan/magenta theme)

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Navigate to the Invoicing directory:
   ```bash
   cd Invoicing
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

**Option 1: Quick Start (Windows)**
- **Double-click** `start-invoicing.bat` - Starts the server
- **Double-click** `start-and-open.bat` - Starts server AND opens browser automatically

**Option 2: Command Line**

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

3. The application is now running! You can:
   - Add clients with their hourly rates
   - Log jobs with hours and descriptions
   - View invoices for each job
   - Export invoices to PDF

## How to Use

### Adding a Client

1. Click the **Clients** tab
2. Click **+ Add New Client**
3. Fill in:
   - **Client Name** (required)
   - **Email** (optional)
   - **Phone** (optional)
   - **Hourly Rate** (required, defaults to $150.00)
   - **Notes** (optional)
4. Click **Save Client**

### Recording a Job

1. Click the **Jobs & Invoices** tab
2. Click **+ Add New Job**
3. Fill in:
   - **Client** - Select from your clients list
   - **Job Date** - When the work was completed
   - **Description** - What work was done (required)
   - **Hours** - How many hours worked
   - **Hourly Rate** - Auto-fills from client's rate, can override
   - **Job Notes** - Any additional details
4. The total is calculated automatically (Hours × Rate)
5. Click **Save Job**

### Viewing & Exporting Invoices

1. In the **Jobs & Invoices** tab, click the **📄 Invoice** button on any job
2. The invoice will display with:
   - Invoice number (JOB-#####)
   - Client details
   - Service description
   - Hours, rate, and total amount
3. Click **📥 Download PDF** to generate and download the invoice as a PDF file

### Dashboard

The **Dashboard** tab shows:
- **Total Revenue** - Sum of all job totals
- **Total Hours** - Sum of all hours worked
- **Total Clients** - Number of clients in the system
- **Total Jobs** - Number of jobs recorded
- **Recent Jobs** - Last 5 jobs for quick reference

## Data Storage

- All data is stored locally in `database.db` (SQLite database)
- The database file is automatically created on first run
- Data is **not** synced across devices
- **Backup your database.db file regularly!**

## Project Structure

```
Invoicing/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── database.db            # SQLite database (created automatically)
├── static/
│   ├── css/
│   │   └── styles.css     # Styling with BPS theme
│   └── js/
│       └── app.js         # Frontend application logic
├── templates/
│   └── index.html         # Main UI template
└── invoices/              # Generated PDF invoices (optional)
```

## API Endpoints

The backend provides REST API endpoints:

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/<id>` - Get specific client
- `PUT /api/clients/<id>` - Update client
- `DELETE /api/clients/<id>` - Delete client

### Jobs/Invoices
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs?client_id=<id>` - Get jobs for specific client
- `POST /api/jobs` - Create new job
- `GET /api/jobs/<id>` - Get specific job
- `PUT /api/jobs/<id>` - Update job
- `DELETE /api/jobs/<id>` - Delete job
- `GET /api/jobs/<id>/pdf` - Generate PDF invoice

### Statistics
- `GET /api/stats` - Get dashboard statistics

## Customization

### Changing the Hourly Rate

Each client has a default hourly rate that auto-fills when creating jobs. You can:
- Set different rates per client
- Override the rate for specific jobs
- Edit client rates anytime

### Branding

The invoices include "Big Pic Solutions" branding. To customize:
1. Edit `app.py`
2. Search for `"Big Pic Solutions"` in the `generate_pdf()` function
3. Replace with your company name
4. Restart the application

### Color Theme

The application uses Big Pic Solutions' colors:
- Primary: Cyan (`#00d4ff`)
- Secondary: Magenta (`#ff00ff`)
- Accent: Neon Green (`#00ff88`)
- Dark Background: Near-black (`#0a0a0a`)

To change the colors, edit `static/css/styles.css` and modify the CSS variables in the `:root` selector.

## Notes

- **No internet required** - Everything runs locally
- **Single user** - Designed for individual use
- **Simple but powerful** - Start simple, expand features later
- **Professional invoices** - PDF export for client delivery

## Future Enhancements

Potential features to add later:
- Client filtering/search
- Date range filtering for jobs
- Recurring invoices
- Tax/GST/VAT support
- Payment tracking
- Expense tracking
- Multi-user support
- Cloud sync (optional)
- Invoice templates
- Email invoices directly

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, modify `app.py`:
```python
app.run(debug=True, port=5001)  # Change to a different port
```

### Database Issues
If you get database errors, try deleting `database.db` to reset:
```bash
rm database.db  # macOS/Linux
del database.db  # Windows
```
A fresh database will be created on next run.

### Form Not Submitting
- Ensure all required fields are filled
- Check the browser console (F12) for errors
- Make sure the Flask server is running

## Support

For issues or questions:
1. Check the console (F12) for error messages
2. Verify Flask server is running (`python app.py`)
3. Ensure Python dependencies are installed (`pip install -r requirements.txt`)

---

**Big Pic Solutions** - Where 25 Years of Expertise Meets AI Innovation
