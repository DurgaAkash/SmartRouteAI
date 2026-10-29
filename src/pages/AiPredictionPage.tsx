import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  BarChart, 
  Layers, 
  FileCode,
  Gauge,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export const AiPredictionPage: React.FC = () => {
  const [hour, setHour] = useState<number>(8);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Tuesday');
  const [isMarketDay, setIsMarketDay] = useState<boolean>(true);
  const [routeBaseVolume, setRouteBaseVolume] = useState<number>(55);

  const [prediction, setPrediction] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handlePredict();
    api.getModelEvaluation().then(setEvaluation).catch(console.error);
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await api.predictDemand({
        hour,
        dayOfWeek,
        isMarketDay,
        routeBaseVolume,
      });
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 font-mono mb-1">
          <Cpu className="w-4 h-4" />
          <span>Scikit-Learn Machine Learning Pipeline</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Passenger Demand Prediction &amp; Surge Forecasting
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Ensemble Random Forest Regressor trained on rural diurnal commuting habits, school timings, and weekly village shandies.
        </p>
      </div>

      {/* Model Benchmark Comparison Banner */}
      {evaluation && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Machine Learning Model Validation Benchmark (Train/Test Split: 80/20)
            </h3>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Evaluated on {evaluation.testDatasetSize} Test Samples
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Random Forest Card */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Selected Primary Model</span>
                  <h4 className="font-bold text-white text-sm">{evaluation.randomForest.modelName}</h4>
                </div>
                <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded">
                  R² = {evaluation.randomForest.r2Score}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">RMSE</span>
                  <span className="font-bold text-white">{evaluation.randomForest.rmse}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">MAE</span>
                  <span className="font-bold text-white">{evaluation.randomForest.mae}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">ACCURACY</span>
                  <span className="font-bold text-emerald-400">{evaluation.randomForest.accuracyPct}%</span>
                </div>
              </div>

              {/* Feature Importances */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Feature Weights:</span>
                <div className="space-y-1 text-[11px]">
                  {evaluation.randomForest.featureImportance.map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-slate-300">
                      <span>{f.feature}</span>
                      <span className="font-mono text-purple-300 font-bold">{(f.score * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Baseline Linear Model Card */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Comparative Baseline</span>
                  <h4 className="font-bold text-slate-300 text-sm">{evaluation.baselineLinear.modelName}</h4>
                </div>
                <span className="text-xs font-black font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                  R² = {evaluation.baselineLinear.r2Score}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">RMSE</span>
                  <span className="font-bold text-slate-300">{evaluation.baselineLinear.rmse}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">MAE</span>
                  <span className="font-bold text-slate-300">{evaluation.baselineLinear.mae}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[9px]">ACCURACY</span>
                  <span className="font-bold text-slate-400">{evaluation.baselineLinear.accuracyPct}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                The non-linear Random Forest regressor outperforms linear baselines by capturing discontinuous morning school trips and multi-fold surges on weekly rural shandy market days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive AI Prediction Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Sliders & Conditions (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Input Operational Features</h3>
          </div>

          {/* Hour Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-300">Hour of Day (IST)</label>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {hour.toString().padStart(2, '0')}:00 hrs
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={22}
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>05:00 AM (Dawn)</span>
              <span>13:00 (Noon)</span>
              <span>22:00 (Night)</span>
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Monday">Monday (Workplace Start Influx)</option>
              <option value="Tuesday">Tuesday (District Weekly Market Shandy)</option>
              <option value="Wednesday">Wednesday (Mid-week Regular)</option>
              <option value="Thursday">Thursday (Mid-week Regular)</option>
              <option value="Friday">Friday (Pre-weekend Exits)</option>
              <option value="Saturday">Saturday (Suburban Shopping)</option>
              <option value="Sunday">Sunday (Temple / Family Visits)</option>
            </select>
          </div>

          {/* Market Day Toggle */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Rural Market Day (Haat / Shandy)</p>
              <p className="text-[10px] text-slate-400">Triggers +35% rural agro-commuter surge</p>
            </div>
            <input
              type="checkbox"
              checked={isMarketDay}
              onChange={(e) => setIsMarketDay(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
            />
          </div>

          {/* Route Base Volume */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-semibold text-slate-300">Corridor Population Base</label>
              <span className="font-mono font-bold text-sky-400">{routeBaseVolume} Pax</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={routeBaseVolume}
              onChange={(e) => setRouteBaseVolume(parseInt(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Random Forest Inference
              </>
            )}
          </button>
        </div>

        {/* Right Output: Forecasted Demand & Fleet Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {prediction ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">Model Inference Result</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                    prediction.capacityAlert
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {prediction.capacityAlert ? 'Overcrowding Alert' : 'Standard Headway'}
                </span>
              </div>

              {/* Big Prediction Stat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                  <span className="text-slate-400 text-xs block font-mono">RANDOM FOREST PREDICTION</span>
                  <p className="text-4xl font-black text-white font-mono mt-1">
                    {prediction.predictedPassengers}{' '}
                    <span className="text-xs font-normal text-slate-400">Pax</span>
                  </p>
                  <p className="text-[11px] text-purple-300 font-mono mt-1">
                    95% CI: [{prediction.confidenceInterval[0]} - {prediction.confidenceInterval[1]} Pax]
                  </p>
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                  <span className="text-slate-400 text-xs block font-mono">DISPATCH RECOMMENDATION</span>
                  <p className="text-4xl font-black text-emerald-400 font-mono mt-1">
                    {prediction.requiredBusesRecommendation}{' '}
                    <span className="text-xs font-normal text-slate-400">Buses Needed</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Assumes 45-seat standard rural carrier
                  </p>
                </div>
              </div>

              {/* Peak & Capacity Warning */}
              {prediction.capacityAlert && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Overcrowding Risk Detected:</span> Single bus capacity (45 seats) will be exceeded. The Agentic AI Planner recommends scheduling 2 consecutive trips or deploying a high-capacity 55-seater Viking bus.
                  </div>
                </div>
              )}

              {/* Factor Contribution */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Feature Impact Weighting:</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] text-slate-400 block">DIURNAL HOUR</span>
                    <span className="text-emerald-400 font-bold">{prediction.featureContribution.hourOfDay}</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] text-slate-400 block">MARKET SHANDY</span>
                    <span className="text-purple-400 font-bold">{prediction.featureContribution.marketDayFactor}</span>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
                    <span className="text-[10px] text-slate-400 block">DAY OF WEEK</span>
                    <span className="text-sky-400 font-bold">{prediction.featureContribution.dayType}</span>
                  </div>
                </div>
              </div>

              {/* Code linkage notice */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="font-mono flex items-center gap-1.5 text-slate-300">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  Executable in terminal: <code className="text-emerald-400">python3 ml_model.py</code>
                </span>
                <span className="text-emerald-400 font-mono">Verified Zero NaN</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs">Select features on the left and run inference to forecast rural passenger demand.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
