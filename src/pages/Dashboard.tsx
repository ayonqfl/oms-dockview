// custom styles imports
import "../styles/dashboard.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import adminServer from "../utilities/server/serverAdmin";
import { ALL_SYMBOL } from "../utilities/apiRequest/watchlist";
import { setSymbols } from "../slices/symbolsSlicer";
import errorHandler from "../utilities/errorHandler/errorHandler";

function Dashboard(): JSX.Element {

  interface AccountSnapshot { totalValue: string; dailyChange: string; monthlyChange: string; annualReturn: string; } 
  interface PortfolioHealth { riskLevel: string; diversification: string; performance: string; stability: string; } 
  interface Sector { name: string; allocation: string; performance: string; } 
  interface Investor { name: string; allocation: string; performance: string; }

  const accountSnapshot: AccountSnapshot = {
    totalValue: "$125,430.50",
    dailyChange: "+$1,250.30",
    monthlyChange: "+$8,420.75",
    annualReturn: "12.5%",
  };
  const portfolioHealth: PortfolioHealth = {
    riskLevel: "Moderate",
    diversification: "Good",
    performance: "Outperforming",
    stability: "Stable",
  };
  const topSectors: Sector[] = [
    { name: "Technology", allocation: "35%", performance: "+18%" },
    { name: "Healthcare", allocation: "22%", performance: "+12%" },
    { name: "Consumer Goods", allocation: "18%", performance: "+9%" },
    { name: "Energy", allocation: "15%", performance: "+5%" },
    { name: "Financials", allocation: "10%", performance: "+3%" },
  ];
  const topInvestors: Investor[] = [
    { name: "ARK Invest", allocation: "25%", performance: "+22%" },
    { name: "Vanguard", allocation: "20%", performance: "+15%" },
    { name: "BlackRock", allocation: "18%", performance: "+14%" },
    { name: "Fidelity", allocation: "15%", performance: "+12%" },
    { name: "State Street", allocation: "12%", performance: "+10%" },
  ];
  return (
    <div className="dashboard-container">
    {" "}
    <div className="dashboard-grid">
      {" "}
      {/* Account Snapshot Section */}{" "}
      <div className="dashboard-card account-snapshot">
        {" "}
        <h2>Account Snapshot</h2>{" "}
        <div className="card-content">
          {" "}
          <div className="metric">
            {" "}
            <span className="metric-label">Total Portfolio Value</span>{" "}
            <span className="metric-value large">
              {accountSnapshot.totalValue}
            </span>{" "}
          </div>{" "}
          <div className="metrics-grid">
            {" "}
            <div className="metric">
              {" "}
              <span className="metric-label">Daily Change</span>{" "}
              <span className="metric-value positive">
                {accountSnapshot.dailyChange}
              </span>{" "}
            </div>{" "}
            <div className="metric">
              {" "}
              <span className="metric-label">Monthly Change</span>{" "}
              <span className="metric-value positive">
                {accountSnapshot.monthlyChange}
              </span>{" "}
            </div>{" "}
            <div className="metric">
              {" "}
              <span className="metric-label">Annual Return</span>{" "}
              <span className="metric-value positive">
                {accountSnapshot.annualReturn}
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Portfolio Health Section */}{" "}
      <div className="dashboard-card portfolio-health">
        {" "}
        <h2>Portfolio Health</h2>{" "}
        <div className="health-indicators">
          {" "}
          <div className="health-indicator">
            {" "}
            <span className="indicator-label">Risk Level</span>{" "}
            <div className="indicator-value">{portfolioHealth.riskLevel}</div>{" "}
            <div className="health-bar moderate"></div>{" "}
          </div>{" "}
          <div className="health-indicator">
            {" "}
            <span className="indicator-label">Diversification</span>{" "}
            <div className="indicator-value">
              {portfolioHealth.diversification}
            </div>{" "}
            <div className="health-bar good"></div>{" "}
          </div>{" "}
          <div className="health-indicator">
            {" "}
            <span className="indicator-label">Performance</span>{" "}
            <div className="indicator-value">{portfolioHealth.performance}</div>{" "}
            <div className="health-bar excellent"></div>{" "}
          </div>{" "}
          <div className="health-indicator">
            {" "}
            <span className="indicator-label">Stability</span>{" "}
            <div className="indicator-value">{portfolioHealth.stability}</div>{" "}
            <div className="health-bar good"></div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Top Sectors Section */}{" "}
      <div className="dashboard-card top-sectors">
        {" "}
        <h2>Top Sectors</h2>{" "}
        <div className="list-container">
          {" "}
          {topSectors.map((sector, index) => (
            <div key={index} className="list-item">
              {" "}
              <span className="item-name">{sector.name}</span>{" "}
              <div className="item-details">
                {" "}
                <span className="item-allocation">
                  {sector.allocation}
                </span>{" "}
                <span className="item-performance positive">
                  {sector.performance}
                </span>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {/* Top Investors Section */}{" "}
      <div className="dashboard-card top-investors">
        {" "}
        <h2>Top Investors</h2>{" "}
        <div className="list-container">
          {" "}
          {topInvestors.map((investor, index) => (
            <div key={index} className="list-item">
              {" "}
              <span className="item-name">{investor.name}</span>{" "}
              <div className="item-details">
                {" "}
                <span className="item-allocation">
                  {investor.allocation}
                </span>{" "}
                <span className="item-performance positive">
                  {investor.performance}
                </span>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </div>{" "}
  </div>
  );
}

export default Dashboard;
