import React, { useState } from 'react';
import * as htmlToImage from 'html-to-image';
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
      value={value}
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
      <span className="text-blue-600 font-bold">{value.toLocaleString()}{unit ? ` ${unit}` : ''}</span>
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
      {value}
      {unit && <span className="text-xs text-slate-400 ml-1 font-medium">{unit}</span>}
    </div>
  </div>
);

export default function App() {
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
  const totalInvestment = monitors * price;
  const totalAnnualPatients = Math.floor((workDays / turnover) * beds);
  const totalAnnualExams = totalAnnualPatients * examsPerPatient;
  const estimatedAnnualRevenue = totalAnnualExams * feePerExam;
  
  const paybackPeriodMonths = estimatedAnnualRevenue > 0 
    ? ((totalInvestment / estimatedAnnualRevenue) * 12).toFixed(1) 
    : "∞";
    
  const netProfit5Years = (estimatedAnnualRevenue * 5) - totalInvestment;
  const roi5Years = totalInvestment > 0 
    ? ((netProfit5Years / totalInvestment) * 100).toFixed(0) 
    : 0;
    
  const revenuePerBed = beds > 0 ? (estimatedAnnualRevenue / beds) : 0;

  // Chart Data Generation (5 Years Cash Flow)
  const chartData = Array.from({ length: 6 }).map((_, i) => ({
    name: i === 0 ? "投资起点" : `第${i}年`,
    cashFlow: (i * estimatedAnnualRevenue) - totalInvestment
  }));

  // Image Export Logic
  const handleGenerateImage = () => {
    const element = document.getElementById("report-content");
    if (!element) return;
    
    // Temporarily add a background color for the snapshot to prevent transparent areas
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#f8fafc'; // slate-50 matches the background

    htmlToImage.toPng(element, { 
      quality: 1, 
      pixelRatio: 2,
      style: {
        transform: 'scale(1)', // Ensure no transforms affect rendering
        transformOrigin: 'top left'
      }
    })
      .then((dataUrl) => {
        element.style.backgroundColor = originalBg;
        const link = document.createElement('a');
        const filenamePrefix = hospitalName ? hospitalName : '目标医院';
        link.download = `${filenamePrefix} - ROI评估报告.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        element.style.backgroundColor = originalBg;
        console.error('oops, something went wrong!', error);
      });
  };

  const formatCurrency = (val: number, isShort = false) => {
    const num = Number(val);
    if (isShort && Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(num);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('zh-CN').format(val);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 h-[60px] flex items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.1)] shrink-0 z-10">
        <h1 className="text-[16px] md:text-[18px] font-semibold tracking-[0.5px] truncate mr-4">可穿戴监护仪投入产出比(ROI)评估系统</h1>
        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-[4px] text-[11px] font-bold tracking-wider hidden sm:block">
            OFFLINE READY
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-4 overflow-y-auto lg:overflow-hidden bg-slate-50 relative">
        <div id="report-content" className="flex flex-col lg:flex-row gap-4 w-full lg:h-full lg:min-h-0 max-w-7xl mx-auto">
          {/* Sidebar */}
          <aside className="w-full lg:w-[320px] bg-white rounded-xl p-5 shadow-sm flex flex-col gap-4 shrink-0 lg:overflow-y-auto border border-slate-100">
            <div className="text-[14px] font-bold text-slate-500 uppercase tracking-[1px] mb-[-4px]">医院信息</div>
            <div className="flex flex-col gap-3 pb-1">
              <TextInput label="医院名称" value={hospitalName} placeholder="请输入医院名称 (选填)" onChange={setHospitalName} />
              <TextInput label="科室名称" value={departmentName} placeholder="请输入科室名称 (选填)" onChange={setDepartmentName} />
            </div>
            <div className="text-[14px] font-bold text-slate-500 uppercase tracking-[1px] mt-2 mb-[-4px]">参数设置</div>
            <div className="flex flex-col gap-3">
              <SliderInput label="设备采购数量" value={monitors} min={1} max={100} step={1} unit="台" onChange={setMonitors} />
              <SliderInput label="单台价格(元)" value={price} min={25000} max={50000} step={1000} onChange={setPrice} />
              <SliderInput label="科室床位数" value={beds} min={10} max={200} step={5} unit="张" onChange={setBeds} />
              <SliderInput label="平均周转天数" value={turnover} min={3} max={30} step={1} unit="天" onChange={setTurnover} />
              <SliderInput label="人均检查次数" value={examsPerPatient} min={1} max={10} step={1} unit="次" onChange={setExamsPerPatient} />
              <SliderInput label="检查单次收费" value={feePerExam} min={20} max={80} step={1} unit="元" onChange={setFeePerExam} />
              <SliderInput label="年工作日" value={workDays} min={250} max={365} step={1} unit="天" onChange={setWorkDays} />
              <SliderInput label="折旧年限" value={depreciation} min={1} max={10} step={1} unit="年" onChange={setDepreciation} />
            </div>
          </aside>

          {/* Display Area */}
          <section className="flex-1 flex flex-col gap-4 lg:overflow-y-auto min-h-0">
            {/* Title for Report */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight text-center">
                {hospitalName ? hospitalName : '目标医院'}
                {departmentName ? ` - ${departmentName}` : ''}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">可穿戴监护仪投入产出比(ROI)评估报告</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="总投资额 (CAPEX)" value={formatCurrency(totalInvestment)} unit="元" />
              <KpiCard label="预计回收期 (PBP)" value={paybackPeriodMonths} unit="个月" highlight />
              <KpiCard label="年预计收入" value={formatCurrency(estimatedAnnualRevenue)} unit="元" />
              <KpiCard label="5年净回报率 (ROI)" value={formatNumber(Number(roi5Years))} unit="%" highlight />
              <KpiCard label="年收治病患总数" value={formatNumber(totalAnnualPatients)} unit="人" />
              <KpiCard label="年检查总人次" value={formatNumber(totalAnnualExams)} unit="次" />
              <KpiCard label="5年总净收益" value={formatCurrency(netProfit5Years, true)} unit={Math.abs(netProfit5Years) >= 1000000 ? "" : "元"} highlight />
              <KpiCard label="单床位年创收" value={formatCurrency(revenuePerBed)} unit="元" />
            </div>

            <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center mb-5">
                <div className="text-[15px] font-semibold text-slate-800">5年现金流预测 (Cumulative Cash Flow)</div>
                <div className="text-xs text-slate-500">单位：万元 (RMB 10k)</div>
              </div>
              
              <div className="flex-1 w-full min-h-[250px]" style={{ touchAction: 'pan-y' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `${(val / 10000).toFixed(0)}万`} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      width={50}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [formatCurrency(value), '累计现金流']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Area 
                      type="step" 
                      dataKey="cashFlow" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCashFlow)" 
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Action Bar (Footer) */}
      <footer className="bg-white h-[60px] px-6 flex items-center justify-between border-t border-slate-200 shrink-0 z-10 w-full shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <div className="text-xs text-slate-500 hidden sm:block">数据实时同步更新 • 依据行业平均水平估算</div>
        <button 
          onClick={handleGenerateImage} 
          className="bg-blue-600 text-white border-none px-6 py-2.5 rounded-lg font-semibold text-[14px] cursor-pointer flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all w-full sm:w-auto ml-auto"
        >
          <FileDown className="w-4 h-4" />
          导出为图片
        </button>
      </footer>
    </div>
  );
}
