import React from 'react';
import { SymbolItem } from '../../types/marketwatch';

interface SymbolDetailsContentProps {
  symbolData: SymbolItem;
  onUpdate?: (data: Partial<SymbolItem>) => void;
}

export const SymbolDetailsContent: React.FC<SymbolDetailsContentProps> = ({ 
  symbolData, 
  onUpdate 
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Symbol Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Symbol:</strong> {symbolData.symbol}</p>
          <p><strong>Company:</strong> {symbolData.company_name}</p>
          <p><strong>Sector:</strong> {symbolData.sector || 'N/A'}</p>
          <p><strong>Category:</strong> {symbolData.category || 'N/A'}</p>
        </div>
        <div>
          <p><strong>LTP:</strong> {symbolData.ltp}</p>
          <p><strong>Change:</strong> 
            <span className={symbolData.change >= 0 ? "text-success" : "text-danger"}>
              {symbolData.change} ({symbolData.change_per}%)
            </span>
          </p>
          <p><strong>Volume:</strong> {symbolData.volume?.toLocaleString()}</p>
          <p><strong>Bid/Ask:</strong> {symbolData.bid} / {symbolData.ask}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Trading Details</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <p><strong>Open:</strong> {symbolData.open || 'N/A'}</p>
          <p><strong>High:</strong> {symbolData.high || 'N/A'}</p>
          <p><strong>Low:</strong> {symbolData.low || 'N/A'}</p>
          <p><strong>Close:</strong> {symbolData.close || 'N/A'}</p>
          <p><strong>Trades:</strong> {symbolData.trades?.toLocaleString() || 'N/A'}</p>
          <p><strong>Turnover:</strong> {symbolData.turnover?.toLocaleString() || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold mb-2">Real-time Updates</h4>
        <p className="text-sm text-gray-600">
          This window will update automatically when market data changes.
        </p>
      </div>
    </div>
  );
};