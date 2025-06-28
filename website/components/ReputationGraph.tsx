'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mock data - in real app, fetch historical scores from IPFS/blockchain
const mockData = [
  { date: '2024-01', overall: 420, developer: 380, contributor: 250, social: 200 },
  { date: '2024-02', overall: 485, developer: 450, contributor: 320, social: 280 },
  { date: '2024-03', overall: 532, developer: 520, contributor: 380, social: 340 },
  { date: '2024-04', overall: 598, developer: 580, contributor: 420, social: 390 },
  { date: '2024-05', overall: 642, developer: 630, contributor: 485, social: 450 },
  { date: '2024-06', overall: 715, developer: 720, contributor: 540, social: 520 },
  { date: '2024-07', overall: 756, developer: 780, contributor: 580, social: 560 },
  { date: '2024-08', overall: 798, developer: 820, contributor: 620, social: 590 },
  { date: '2024-09', overall: 845, developer: 920, contributor: 690, social: 650 },
];

export function ReputationGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reputation Over Time</CardTitle>
        <CardDescription>
          Track your reputation growth across different categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="overallGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="developerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="contributorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#overallGradient)"
                name="Overall"
              />
              <Area
                type="monotone"
                dataKey="developer"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#developerGradient)"
                name="Developer"
              />
              <Area
                type="monotone"
                dataKey="contributor"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#contributorGradient)"
                name="Contributor"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Overall</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Developer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Contributor</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}