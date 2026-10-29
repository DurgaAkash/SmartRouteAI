"""
SmartRoute AI - FastAPI Backend API Server
-----------------------------------------
Module: app.py
Run command: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from agent_planner import TransportationPlanningAgent
from ml_model import predict_demand, evaluate_models

app = FastAPI(
    title="SmartRoute AI API",
    description="Rural Transportation Planning, AI Demand Prediction & Schedule Optimization API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CheckInRequest(BaseModel):
    user_id: str
    user_name: str
    origin: str
    destination: str
    route_id: Optional[str] = None
    travel_date: str
    travel_time: str
    passenger_count: int
    selected_bus: Optional[str] = None

class PredictionRequest(BaseModel):
    hour: int
    day_of_week: int
    is_market_day: bool
    route_base_volume: Optional[int] = 50

class PlanAgentRequest(BaseModel):
    request_text: str
    villages: List[str]
    num_buses: int = 4
    time_window: str = "7:00 AM - 10:00 AM"

@app.get("/")
def read_root():
    return {"project": "SmartRoute AI", "status": "active", "version": "1.0.0"}

@app.post("/api/predict-demand")
def api_predict_demand(req: PredictionRequest):
    return predict_demand(req.hour, req.day_of_week, req.is_market_day, req.route_base_volume)

@app.get("/api/model-evaluation")
def api_model_eval():
    return evaluate_models()

@app.post("/api/agent/plan")
def api_agent_plan(req: PlanAgentRequest):
    agent = TransportationPlanningAgent()
    plan = agent.run_planning_agent(req.request_text, req.villages, req.num_buses, req.time_window)
    return plan
