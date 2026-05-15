import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { FileDown, Activity } from 'lucide-react';

const TextInput = ({ label, value, placeholder, onChange }: any) => (
  <div className="flex flex-col gap-1.5 focus-within:opacity-100 hover:opacity-100 opacity-90 transition-opacity pb-1">
    <div className="flex justify-between text-xs font-medium">
      <span className="text-slate-700">{label}</span>
    </div>
    <input
      type="text"
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-400"
    />
  </div>
);

// Slider Component for Mobile-Friendly Inputs
const SliderInput = ({ label, value, min, max, step, onChange, unit = "" }: any) => (
  <div className="flex flex-col gap-1.5 focus-within:opacity-100 hover:opacity-100 opacity-90 transition-opacity pb-1">
    <div className="flex justify-between text-xs font-medium">
      <span className="text-slate-700">{label}</span>
      <span className="text-blue-600 font-bold">{(Number(value) || 0).toLocaleString()}{unit ? ` ${unit}` : ''}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-200 rounded-full appearance-none outline-none cursor-pointer"
    />
  </div>
);

const KpiCard = ({ label, value, unit, highlight }: any) => (
  <div className={`p-4 rounded-xl shadow-sm border-t-4 ${highlight ? 'border-t-green-600 bg-green-50' : 'border-t-blue-600 bg-white'}`}>
    <div className="text-[11px] text-slate-500 font-semibold mb-2 leading-tight tracking-wider uppercase">{label}</div>
    <div className="text-[22px] font-bold text-slate-900 tracking-tight">
      {value || "0"}
      {unit && <span className="text-xs text-slate-400 ml-1 font-medium">{unit}</span>}
    </div>
  </div>
);

export default function App() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Application State
  const [hospitalName, setHospitalName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [monitors, setMonitors] = useState(8);
  const [price, setPrice] = useState(45000);
  const [beds, setBeds] = useState(40);
  const [turnover, setTurnover] = useState(8);
  const [examsPerPatient, setExamsPerPatient] = useState(4);
  const [feePerExam, setFeePerExam] = useState(46);
  const [workDays, setWorkDays] = useState(260);
  const [depreciation, setDepreciation] = useState(5);

  // Core Calculations
  const totalInvestment = (monitors || 0) * (price || 0);
  const totalAnnualPatients = Math.floor(((workDays || 0) / (turnover || 8)) * (beds || 0));
  const totalAnnualExams = totalAnnualPatients * (examsPerPatient || 0);
  const estimatedAnnualRevenue = totalAnnualExams * (feePerExam || 0);
  
  const paybackPeriodMonths = estimatedAnnualRevenue > 0 
    ? ((totalInvestment / estimatedAnnualRevenue) * 12).toFixed(1) 
    : "∞";
    
  const netProfit5Years = (estimatedAnnualRevenue * 5) - totalInvestment;
  const roi5Years = totalInvestment > 0 
    ? ((netProfit5Years / totalInvestment) * 100).toFixed(0) 
    : 0;
    
  const revenuePerBed = (beds || 0) > 0 ? (estimatedAnnualRevenue / beds) : 0;

  // Chart Data Generation
  const chartData = Array.from({ length: 6 }).map((_, i) => ({
    name: i === 0 ? "投资起点" : `第${i}年`,
    cashFlow: (i * estimatedAnnualRevenue) - totalInvestment
  }));

  const handleGenerateImage = () => {
    window.print();
  };

  const formatCurrency = (val: number, isShort = false) => {
    const num = Number(val) || 0;
    if (isShort && Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    try {
      return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(num);
    } catch (e) {
      return num.toString();
    }
  };

  const formatNumber = (val: number) => {
    const num = Number(val) || 0;
    try {
      return new Intl.NumberFormat('zh-CN').format(num);
    } catch (e) {
      return num.toString();
    }
  };

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-400">系统初始化中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <header className="bg-blue-600 text-white px-6 h-[60px] flex items-center justify-between shadow-sm shrink-0 z-10">
        <h1 className="text-[16px] md:text-[18px] font-semibold truncate mr-4">可穿戴监护仪收益分析报告</h1>
        <div className="flex items-center gap-3">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">V1.3</span>
          <Activity className="w-5 h-5" />
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto lg:overflow-hidden relative">
        <div id="report-content" className="flex flex-col lg:flex-row gap-4 w-full lg:h-full max-w-7xl mx-auto">
          <aside className="w-full lg:w-[320px] bg-white rounded-xl p-5 shadow-sm flex flex-col gap-4 shrink-0 lg:overflow-y-auto border border-slate-100">
            <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">基础信息</div>
            <TextInput label="医院名称" value={hospitalName} placeholder="请输入医院名称" onChange={setHospitalName} />
            <TextInput label="科室名称" value={departmentName} placeholder="请输入科室名称" onChange={setDepartmentName} />
            
            <div className="h-px bg-slate-100 my-1" />
            
            <div className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">测算参数</div>
            <SliderInput label="设备采购数量" value={monitors} min={1} max={100} step={1} unit="台" onChange={setMonitors} />
            <SliderInput label="单台价格(元)" value={price} min={25000} max={50000} step={1000} onChange={setPrice} />
            <SliderInput label="科室床位数" value={beds} min={10} max={200} step={5} unit="张" onChange={setBeds} />
            <SliderInput label="平均周转天数" value={turnover} min={3} max={30} step={1} unit="天" onChange={setTurnover} />
            <SliderInput label="人均检查次数" value={examsPerPatient} min={1} max={10} step={1} unit="次" onChange={setExamsPerPatient} />
            <SliderInput label="检查单次收费" value={feePerExam} min={20} max={80} step={1} unit="元" onChange={setFeePerExam} />
            <SliderInput label="年工作日" value={workDays} min={250} max={365} step={1} unit="天" onChange={setWorkDays} />
          </aside>

          <section className="flex-1 flex flex-col gap-4 lg:overflow-y-auto">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {hospitalName || '评估医院'}{departmentName ? ` - ${departmentName}` : ''} ROI分析报告
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="总投资额" value={formatCurrency(totalInvestment)} unit="元" />
              <KpiCard label="预计回收期" value={paybackPeriodMonths} unit="个月" highlight />
              <KpiCard label="年预计收入" value={formatCurrency(estimatedAnnualRevenue)} unit="元" />
              <KpiCard label="5年回报率" value={formatNumber(Number(roi5Years))} unit="%" highlight />
            </div>

            <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col min-h-[350px]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold">5年现金流预测 (万元)</span>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `${(v/10000).toFixed(0)}`} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(v: any) => [formatCurrency(v), '累计现金流']} />
                    <ReferenceLine y={0} stroke="#cbd5e1" />
                    <Area type="monotone" dataKey="cashFlow" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCF)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white h-[60px] px-6 flex items-center justify-between border-t border-slate-200 shrink-0 shadow-sm">
        <div className="text-[10px] text-slate-400">数据仅供参考，请以实际运营为准</div>
        <button 
          onClick={handleGenerateImage} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          生成分析报告
        </button>
      </footer>
    </div>
  );
}
