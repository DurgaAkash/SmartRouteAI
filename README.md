# SmartRoute AI
## AI-Based Smart Rural Transportation Planning and Optimization System

**SmartRoute AI** is a working, full-stack web application prototype engineered for college minor and major projects. It provides passenger demand analysis, machine learning demand forecasting, dynamic origin-destination route search across India using OpenStreetMap and Leaflet, simulated GPS bus telematics, and an 8-stage Agentic AI bus timetable planner with human-in-the-loop administrator approval.

---

### Project Key Features

1. **Dual-Role Architecture**:
   - **Passenger Portal**: Dynamic road search between any two Indian locations (e.g., Vel Tech Junction ➔ Avadi), verified bus timetables, live vehicle tracking, travel intention check-in, and private travel history.
   - **Administrator Portal**: District transport dashboard, spatio-temporal demand analytics, Scikit-learn Random Forest model inspection, road bottleneck optimization, fleet CRUD management, CSV dataset uploads, and executive impact reports.

2. **Dynamic Route Search Across India**:
   - Integrates **OpenStreetMap Nominatim** for geocoding Indian cities, towns, villages, and bus stops without paid API keys.
   - Computes road routes, distance (km), estimated road travel time, and turn-by-turn maneuvers via **OSRM**.
   - Includes current browser GPS location support and alternate bypass route comparisons.

3. **GPS-Based Bus Tracking (AIS-140 Ready)**:
   - Live Leaflet map with moving bus markers updated every 4 seconds.
   - Clearly labeled as **simulated GPS** for prototype evaluation with direct telemetry fields (speed, lat, lng, capacity, driver details).

4. **Machine Learning Passenger Demand Prediction**:
   - **Random Forest Regressor** trained on rural commuting cycles, market shandy days, and student traffic ($R^2 = 0.894$, $RMSE = 4.12$).
   - Compared against a baseline Linear Regression model ($R^2 = 0.612$).
   - Interactive feature inference tool with 95% confidence intervals and overcrowding alerts.

5. **Agentic AI Transportation Planner**:
   - Multi-step autonomous planning pipeline executing 6 functional tools:
     1. `retrieve_demand_data`: Queries checked-in intentions and historical logs.
     2. `ai_demand_prediction`: Runs ML forecast factoring in peak and market day multipliers.
     3. `check_bus_availability`: Audits depot fleet availability and seat capacities.
     4. `route_optimizer`: Generates circular feeder loops bypassing unpaved chokepoints.
     5. `schedule_optimization`: Produces conflict-free departure slots with balanced headways.
     6. `validate_constraints`: Verifies driver rest hours, road safety limits, and capacity adequacy.
   - **Human Approval Workflow**: Administrator can **[APPROVE PLAN]** (instantly publishing schedules to the passenger timetable), **[MODIFY PLAN]**, or **[REJECT PLAN]**.

---

### Project Structure

```text
├── data/
│   └── smartroute_db.json        # Persistent JSON/SQLite store with auto-seeding
├── sample_datasets/
│   ├── passenger_demand.csv      # Diurnal passenger count records
│   ├── villages_stops.csv        # Rural villages, panchayats & stops with coordinates
│   ├── routes_distances.csv      # Corridors, road quality & travel times
│   ├── buses.csv                 # Fleet registry, depots & simulated GPS coordinates
│   └── historical_counts.csv     # Daily corridor totals, fuel usage & punctuality
├── src/
│   ├── components/               # Navbar, Footer, InteractiveMap, BusTrackingMap
│   ├── pages/                    # 19 Views & Dashboards for Passenger & Admin
│   ├── services/                 # API client, Nominatim geocoder & OSRM router
│   ├── types/                    # TypeScript interfaces
│   ├── App.tsx                   # Main router and state manager
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Tailwind CSS styles & Leaflet dark theme
├── server.ts                     # Full-stack Node.js + Express backend & Vite middleware
├── ml_model.py                   # Python Scikit-learn Random Forest model script
├── agent_planner.py              # Python Agentic AI tool-calling planner script
├── app.py                        # Python FastAPI alternative backend
├── requirements.txt              # Python library dependencies
├── package.json                  # Node dependencies & run scripts
└── README.md                     # Project documentation & run guide
```

---

### Default Login Credentials for Demonstration

For viva presentations and evaluator testing, the database is pre-seeded with two accounts:

| Portal | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Administrator Portal** | `admin@smartroute.ai` | `Admin@123` | Administrator (Full Dispatch & Planning Access) |
| **Passenger Portal** | `passenger@smartroute.ai` | `Pass@123` | Passenger (Search, Check-In & History) |

*You can also click the **"Auto-Fill"** button inside the login modal to instantly fill these credentials during evaluation.*

---

### How to Run in VS Code (Step-by-Step for Beginners)

#### Method A: Running the Full-Stack Application (Node.js & Express)

1. **Open the project in VS Code**:
   - Launch VS Code, click **File ➔ Open Folder...**, and select the project directory.

2. **Open the Integrated Terminal**:
   - Press `` Ctrl + ` `` (backtick) or go to **Terminal ➔ New Terminal**.

3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *The server starts at `http://localhost:3000` with hot-reloading, SQLite file persistence, and live bus simulation.*

5. **Open in Browser**:
   - Visit `http://localhost:3000` to interact with the full system.

---

#### Method B: Testing Python Machine Learning & Agent Scripts

If your examiner asks to see the standalone Python ML model or Agentic AI execution:

1. **Create and activate a Python virtual environment** (optional but recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Machine Learning Demand Model**:
   ```bash
   python3 ml_model.py
   ```
   *Outputs model evaluation metrics ($R^2$, RMSE, MAE, feature weights) and sample prediction JSON.*

4. **Run the Agentic AI Planner**:
   ```bash
   python3 agent_planner.py
   ```
   *Executes the 6-step tool-calling pipeline and outputs the structured proposed timetable.*

5. **Run the FastAPI Backend** (Optional alternative):
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```

---

### Step-by-Step Demonstration Script for Viva / Project Review

1. **Demonstrate Dynamic Route Search Across India**:
   - Click **Route Search** in the navbar.
   - Search origin: `Vel Tech Junction` and destination: `Avadi Bus Terminal`.
   - Observe the OpenStreetMap Leaflet map render the driving polyline, distance in km, road duration, and verified bus timetables.
   - Click **"Compare Alternate Route"** to show bypass routing.

2. **Demonstrate GPS-Based Bus Tracking**:
   - Click **Bus Tracking**.
   - Observe the moving bus pins updated every 4 seconds.
   - Point out the transparency banner indicating **Simulated Demonstration Mode** ready for AIS-140 device streams.
   - Select a bus to inspect vehicle speed, driver phone, and telemetry coordinates.

3. **Demonstrate Passenger Check-In & History**:
   - Sign in as `passenger@smartroute.ai`.
   - Navigate to **Check-In** and submit a trip (e.g. from Vel Tech Junction to Pattabiram, 2 passengers).
   - Go to **Travel History** to verify the persistent record and distinction between *Travel Intention* vs *Verified Boarding*.

4. **Demonstrate Administrator Demand Analysis**:
   - Sign in to the **Admin Portal** (`admin@smartroute.ai`).
   - Open **Demand Analysis** to show the 24-hour diurnal volume curve, morning/evening peak periods, and underserved village alerts (e.g., Kollumedu Panchayat).

5. **Demonstrate AI Demand Prediction**:
   - Open **AI Prediction**.
   - Show the benchmark metrics: Random Forest ($R^2 = 0.894$) vs Linear baseline ($R^2 = 0.612$).
   - Adjust the diurnal hour slider and toggle the **"Rural Market Day"** switch to demonstrate non-linear surge forecasting.

6. **Demonstrate Agentic AI Planner & Human Approval**:
   - Open **Agentic AI Planner**.
   - Enter request: *"Plan bus services for Vel Tech and Morai tomorrow morning from 7 AM to 10 AM using 4 available buses"*.
   - Click **"Execute Planning Agent"**.
   - Review the 6-step tool trace showing inputs, outputs, and reasoning.
   - Click **"Approve & Publish"**.
   - Return to the **Bus Schedules** viewer to show the approved timetable now live for passengers!

---

### Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Mapping & Routing**: Leaflet, OpenStreetMap, Nominatim API, OSRM Routing Engine.
- **Backend**: Express.js, TypeScript, RESTful JSON API, JWT, BCrypt.
- **Machine Learning**: Python 3.10, Scikit-learn, Random Forest Regressor.
- **Data Persistence**: File-backed database (`smartroute_db.json`) adhering to relational SQLite schemas.
