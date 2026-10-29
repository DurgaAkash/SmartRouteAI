import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Database,
  Table,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export const DatasetManagementPage: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [uploadText, setUploadText] = useState('');
  const [uploadFilename, setUploadFilename] = useState('new_rural_survey.csv');
  const [uploadType, setUploadType] = useState('Survey Passenger Logs');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0) {
        handleInspectSample(data[0].filename);
      }
    } catch (err) {
      console.error('Error fetching datasets:', err);
    }
  };

  const handleInspectSample = async (filename: string) => {
    // In node environment, sample CSVs are stored in /sample_datasets/
    try {
      let csvContent = '';
      if (filename === 'passenger_demand.csv') {
        csvContent = `record_id,travel_date,hour,day_of_week,origin,destination,route_id,passenger_count,is_market_day
REC-1001,2026-10-20,07,Tuesday,Thiruvallur Village,Avadi Terminal,R-101,48,1
REC-1002,2026-10-20,08,Tuesday,Vel Tech Junction,Pattabiram,R-102,62,1
REC-1003,2026-10-20,09,Tuesday,Morai Rural Colony,Ambattur Estate,R-103,55,1
REC-1004,2026-10-20,10,Tuesday,Kollumedu Panchayat,Avadi Market,R-101,31,0
REC-1005,2026-10-20,11,Tuesday,Thandurai Village,Poonamallee,R-104,24,0
REC-1006,2026-10-20,12,Tuesday,Vellanur Village,Red Hills Junction,R-105,19,0`;
      } else if (filename === 'villages_stops.csv') {
        csvContent = `stop_id,stop_name,locality,district,state,latitude,longitude,is_rural
STP-01,Vel Tech Junction,Avadi Outer,Thiruvallur,Tamil Nadu,13.1834,80.1037,1
STP-02,Morai Village Center,Ambattur Taluk,Thiruvallur,Tamil Nadu,13.1972,80.1245,1
STP-03,Kollumedu Rural Colony,Poonamallee,Thiruvallur,Tamil Nadu,13.1612,80.0891,1
STP-04,Thandurai Gramam,Pattabiram,Thiruvallur,Tamil Nadu,13.1328,80.0634,1
STP-05,Pattabiram Railway Stop,Pattabiram,Thiruvallur,Tamil Nadu,13.1215,80.0621,0`;
      } else if (filename === 'routes_distances.csv') {
        csvContent = `route_id,route_name,origin,destination,distance_km,avg_travel_time_mins,frequency_mins
R-101,Thiruvallur - Avadi Express,Thiruvallur Village,Avadi Terminal,24.5,52,30
R-102,Vel Tech - Pattabiram Connector,Vel Tech Junction,Pattabiram,11.2,28,20
R-103,Morai - Ambattur Industrial Link,Morai Rural Colony,Ambattur Estate,14.8,36,25
R-104,Thandurai - Poonamallee Shuttle,Thandurai Village,Poonamallee,16.4,42,45
R-105,Vellanur - Red Hills Line,Vellanur Village,Red Hills Junction,8.9,22,40`;
      } else if (filename === 'buses.csv') {
        csvContent = `bus_id,registration_no,model,capacity,assigned_route_id,depot,status
TN-01-SR-101,TN-20-CZ-4401,Tata Starbus 40-Seater,42,R-101,Avadi Regional Depot,Active
TN-01-SR-102,TN-20-CZ-4402,Ashok Leyland Falcon,52,R-102,Pattabiram Depot,Active
TN-01-SR-103,TN-20-CZ-4403,Eicher Skyline Pro,36,R-103,Ambattur Depot,Active
TN-01-SR-104,TN-20-CZ-4404,Tata Marcopolo EV,32,R-104,Poonamallee Depot,Active
TN-01-SR-105,TN-20-CZ-4405,Ashok Leyland Viking,55,R-105,Red Hills Depot,Active`;
      } else {
        csvContent = `date,route_id,route_name,morning_peak_passengers,afternoon_passengers,evening_peak_passengers,daily_total
2026-10-15,R-101,Thiruvallur - Avadi Express,240,110,265,615
2026-10-15,R-102,Vel Tech - Pattabiram Connector,380,180,410,970
2026-10-15,R-103,Morai - Ambattur Industrial Link,210,95,220,525
2026-10-16,R-101,Thiruvallur - Avadi Express,255,120,280,655
2026-10-16,R-102,Vel Tech - Pattabiram Connector,405,195,430,1030`;
      }

      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = lines.slice(1).map((l) => l.split(',').map((c) => c.trim()));
      setSelectedDataset(filename);
      setPreviewHeaders(headers);
      setPreviewRows(rows);
    } catch (err) {
      console.error('Error previewing file:', err);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const res = await api.uploadDataset({
        filename: uploadFilename,
        csvData: uploadText,
        type: uploadType,
      });
      setUploadStatus(`Successfully ingested ${res.dataset.recordCount} rows from ${res.dataset.filename}`);
      setPreviewHeaders(res.headers);
      setPreviewRows(res.previewRows);
      setSelectedDataset(res.dataset.filename);
      setUploadText('');
      await loadDatasets();
    } catch (err: any) {
      setUploadStatus('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadCsv = (filename: string) => {
    const content = previewHeaders.join(',') + '\n' + previewRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono mb-1">
          <FolderGit2 className="w-4 h-4" />
          <span>Data Ingestion &amp; Ground Truth Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Dataset Collection &amp; Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Curated sample CSV datasets supporting machine learning training, route graph optimization, and vehicle allocation.
        </p>
      </div>

      {/* 5 Built-in Dataset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            onClick={() => handleInspectSample(ds.filename)}
            className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
              selectedDataset === ds.filename
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">
                {ds.id}
              </span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <h4 className="font-bold text-white truncate text-xs">{ds.filename}</h4>
            <p className="text-[10px] text-slate-400 mt-1">{ds.type}</p>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">{ds.recordCount} rows</span>
              <span className="text-emerald-400">&check; Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Table & Data Schema */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Active Data View</span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-sky-400" />
              Previewing: {selectedDataset || 'passenger_demand.csv'}
            </h3>
          </div>

          <button
            onClick={() => downloadCsv(selectedDataset || 'dataset.csv')}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Download CSV Export
          </button>
        </div>

        {/* Data Preview Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-800/80 text-slate-300 uppercase text-[10px]">
              <tr>
                {previewHeaders.map((h, i) => (
                  <th key={i} className="px-3 py-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {previewRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Ingestion & Validation Module */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            Upload Additional Rural Transportation CSV
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Strict Schema Verification</span>
        </div>

        {uploadStatus && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Filename</label>
              <input
                type="text"
                required
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dataset Category</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="Survey Passenger Logs">Survey Passenger Logs</option>
                <option value="GTFS Feeder Extract">GTFS Feeder Extract</option>
                <option value="Depot Telemetry Archives">Depot Telemetry Archives</option>
                <option value="Village Gram Panchayat Register">Village Gram Panchayat Register</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              CSV Content (Paste comma-separated rows with header)
            </label>
            <textarea
              rows={4}
              required
              placeholder="stop_id,stop_name,locality,district,state,latitude,longitude..."
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400">
              Validates column consistency, filters null values, and injects clean records into SQLite database.
            </p>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-colors"
            >
              {uploading ? 'Validating...' : 'Validate & Ingest CSV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
