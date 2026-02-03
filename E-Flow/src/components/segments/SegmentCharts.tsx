import { useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Segment, EnrichedContact } from "@/types";
import { PieChart as PieIcon, BarChart3, TrendingUp, Download, Zap } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface SegmentChartsProps {
  segments: Segment[];
  enrichedContacts: EnrichedContact[];
}

const COLORS = [
  '#3B82F6', // Blue - Fintech
  '#22C55E', // Green - Agric
  '#F59E0B', // Orange - E-commerce
  '#8B5CF6', // Purple - SaaS
  '#EC4899', // Pink - Healthcare
];

const INDUSTRY_COLORS: Record<string, string> = {
  'Fintech': '#3B82F6',
  'Agriculture': '#22C55E',
  'AgriTech': '#22C55E',
  'E-commerce': '#F59E0B',
  'SaaS': '#8B5CF6',
  'Healthcare': '#EC4899',
  'EdTech': '#14B8A6',
  'Logistics': '#F97316',
};

export function SegmentCharts({ segments, enrichedContacts }: SegmentChartsProps) {
  const industryChartRef = useRef<HTMLDivElement>(null);
  const segmentChartRef = useRef<HTMLDivElement>(null);
  const conversionChartRef = useRef<HTMLDivElement>(null);

  // Prepare industry data
  const industryCount: Record<string, number> = {};
  enrichedContacts.forEach(contact => {
    const industry = contact.company?.industry || 'Unknown';
    industryCount[industry] = (industryCount[industry] || 0) + 1;
  });
  
  const industryData = Object.entries(industryCount)
    .map(([name, value]) => ({ 
      name, 
      value,
      color: INDUSTRY_COLORS[name] || COLORS[Object.keys(industryCount).indexOf(name) % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Prepare segment size data
  const segmentSizeData = segments.map((segment, index) => ({
    name: segment.name.length > 15 ? segment.name.substring(0, 15) + '...' : segment.name,
    size: segment.size,
    fullName: segment.name,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare conversion rate data
  const conversionData = segments
    .filter(s => s.conversionRate)
    .map((segment, index) => ({
      name: segment.name.length > 12 ? segment.name.substring(0, 12) + '...' : segment.name,
      rate: segment.conversionRate || 0,
      fullName: segment.name,
      color: COLORS[index % COLORS.length]
    }));

  // Calculate metrics
  const totalContacts = enrichedContacts.length;
  const avgConversion = conversionData.length > 0 
    ? (conversionData.reduce((sum, d) => sum + d.rate, 0) / conversionData.length).toFixed(1)
    : '0';
  const topSegment = segments[0];
  const targetingEfficiency = topSegment 
    ? Math.round((topSegment.size / totalContacts) * 100) 
    : 0;

  const downloadChart = useCallback(async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success(`${filename} downloaded`);
    } catch (error) {
      console.error("Chart download failed:", error);
      toast.error("Failed to download chart");
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Metrics Summary */}
      <Card className="bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Avg Conversion</span>
              </div>
              <p className="text-xl font-bold">{avgConversion}%</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Targeting Efficiency</span>
              </div>
              <p className="text-xl font-bold">{targetingEfficiency}%</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Est. Boost</span>
              </div>
              <p className="text-xl font-bold text-green-600">3x</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Pie Chart */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieIcon className="w-4 h-4" />
            Industry Distribution
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => downloadChart(industryChartRef, "industry-distribution")}
          >
            <Download className="w-3 h-3 mr-1" />
            PNG
          </Button>
        </CardHeader>
        <CardContent className="pb-4" ref={industryChartRef}>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Segment Size Bar Chart */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Segment Sizes
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => downloadChart(segmentChartRef, "segment-sizes")}
          >
            <Download className="w-3 h-3 mr-1" />
            PNG
          </Button>
        </CardHeader>
        <CardContent className="pb-4" ref={segmentChartRef}>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentSizeData} layout="vertical">
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                />
                <Bar 
                  dataKey="size" 
                  radius={[0, 4, 4, 0]}
                >
                  {segmentSizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Line Chart */}
      {conversionData.length > 0 && (
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Conversion Rates by Segment
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => downloadChart(conversionChartRef, "conversion-rates")}
            >
              <Download className="w-3 h-3 mr-1" />
              PNG
            </Button>
          </CardHeader>
          <CardContent className="pb-4" ref={conversionChartRef}>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, "Conversion Rate"]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
