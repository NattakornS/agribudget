import { Component } from "react";

export default class NewDesignPage extends Component {
  render() {
    return (
      <div className="bg-background-light dark:bg-background-dark font-display antialiased selection:bg-primary selection:text-black">
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl">
          {/* <!-- Header --> */}
          <header className="sticky top-0 z-50 glass border-b border-white/5 px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary"
                    data-alt="Farmer profile portrait"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDJbxdaGxXXLMY4xRFjtwTgvmND3Vhy44r8zasStpxKiW8C4TatzNJBcPjwv9pZ0WFkxEiOXXesMfjWsmRmpubARHHtokSckS5A_jnVJFRrHZZf29EAI6_a8MIZGYKVPzSCzAJMXHrxdyl7XKLEGbjjDmQWc008ZwnFKOvVJPTT02l7qAKkQSWBugRNKawTPMzljzDotfrqMk8As_LzqK3Tjs68_Tsh4N6GDSJudJubYDwhDM8499HUuPGCqw6voDpWIb_SoilI7L6g")' }}
                  ></div>
                  <div className="absolute bottom-0 right-0 size-3 bg-primary rounded-full border-2 border-background-dark"></div>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-400">
                    Good Morning,
                  </p>
                  <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                    Farmer Joe
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[16px]">
                      partly_cloudy_day
                    </span>
                    <span>72°F</span>
                  </div>
                </div>
                <button className="flex items-center justify-center size-10 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-primary/20 transition-colors relative">
                  <span className="material-symbols-outlined text-slate-700 dark:text-white text-[24px]">
                    notifications
                  </span>
                  <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </header>
          {/* <!-- Main Content --> */}
          <main className="flex-1 pb-24 px-4 pt-6 space-y-6">
            {/* <!-- Financial Summary Card --> */}
            <div className="relative overflow-hidden rounded-2xl bg-card-light dark:bg-card-dark shadow-lg dark:shadow-none border border-slate-100 dark:border-white/5 p-5">
              {/* <!-- Background decoration --> */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                      Total Net Profit
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      $8,250.00
                    </h1>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      trending_up
                    </span>
                    +12.5%
                  </div>
                </div>
                <div className="h-px w-full bg-slate-200 dark:bg-white/10"></div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-2 rounded-full bg-primary"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Income
                      </p>
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      $12,450
                    </p>
                  </div>
                  <div className="w-px bg-slate-200 dark:bg-white/10"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-2 rounded-full bg-red-400"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Expenses
                      </p>
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      $4,200
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Quick Actions Grid --> */}
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="group relative flex flex-col justify-end p-4 h-32 rounded-xl overflow-hidden bg-card-light dark:bg-card-dark border border-slate-100 dark:border-white/5 active:scale-95 transition-transform">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity"
                    data-alt="Green field detail close up"
                    style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDg0Uz2B1bKL4pRxHahNJ6KrZug5cufQY2_d2rZQOmL5eDZcCUiHS7m--8gKyLXaro8-KRwfh_utrobaTld7XTc8v2yMv5REBr1cGJQmi_GmedC1HAwqnQsIuHTMqie8Px5pw7QL5EeO6N8kKAMFa406KSXl99OIC4NQIVhnqWyqzHOEQ3hzJQIO_HKp_XK_KHSelhkzxnJTEYVinGSP05ZwFlzWsTmGmTl3T_8RRG_U08f1rubQ78rQ3ZV9Bh4ux4Lu5y2NqqDl2IM")' }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white">
                    <span className="material-symbols-outlined text-[20px]">
                      add
                    </span>
                  </div>
                  <span className="relative z-10 text-white font-bold text-left">
                    Add Expense
                  </span>
                </button>
                <button className="group relative flex flex-col justify-end p-4 h-32 rounded-xl overflow-hidden bg-card-light dark:bg-card-dark border border-slate-100 dark:border-white/5 active:scale-95 transition-transform">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity"
                    data-alt="Wheat harvesting combine"
                    style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuC6Mh_rRRWGanne23-LHsL1J3KiCtYrhuHBlAau9abK3sq8FXj6tYYCZKQjGJEc6lQmSC5SioQaetUC3zEeM4B4O9LrIZT6f0q5vXRpX6pSD-8921_2DuZ5tCcuj7OcC4li23nC6RR84VcxnIynWSCMinEEHVPYDcbPXSdm9H2DDlYJrWkHd3yCfO7ObetLhE34cf2JpPd4VUPpB4c5QbzT9HBahRgWc7LgD0DcZFpLwPCiU-1fObD22MPncau-bDro6TYgrbgJA8wL")' }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white">
                    <span className="material-symbols-outlined text-[20px]">
                      agriculture
                    </span>
                  </div>
                  <span className="relative z-10 text-white font-bold text-left">
                    Log Harvest
                  </span>
                </button>
                <button className="group relative flex flex-col justify-end p-4 h-32 rounded-xl overflow-hidden bg-card-light dark:bg-card-dark border border-slate-100 dark:border-white/5 active:scale-95 transition-transform">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity"
                    data-alt="Tablet computer on farm background"
                    style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuADkg85LoJhogXLtv3clcZa2Kqw_V21aAt2OAidESYyIxyFDzL88OamuUBIF1GRzRLvu9hG8UvIcSvo2HhiWyTeI1cIHCcAmlnJCwp4WSECelgTLJaqNTmjsI-kL59fjuaiWkm9-Tq3k6zNEPZ8D36UKhFOkw-vBbyRotWM33iL7j16-nZSM4KlGKHGoXXKJkFG1q5hJAj5x0HWk5qn12-YhkpgqKSxDRRQdrD-W0zOG98HUIDMw4-jVOSVttlym7OK1_smkI9X9ALC")' }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white">
                    <span className="material-symbols-outlined text-[20px]">
                      settings
                    </span>
                  </div>
                  <span className="relative z-10 text-white font-bold text-left">
                    Farm Settings
                  </span>
                </button>
                <button className="group relative flex flex-col justify-end p-4 h-32 rounded-xl overflow-hidden bg-card-light dark:bg-card-dark border border-slate-100 dark:border-white/5 active:scale-95 transition-transform">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity"
                    data-alt="Data chart paper texture"
                    style={{ backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDfdWPpTdKGqv-z0q3xm9lPlZnMdfjGNWSJi57rbKtU6mRo58oZeMkhgb-j5o58fyyWJMWRaKPlHdxd4R1SQVZVv9JMRfzIk19Ya9O45_en7jfGx5En9UnP4NkEXvaiIX258hox4BRJl2tascVmYyVk0LZGF8VJTPTX2H6CjJ3wsP54Ae1KHcQ3_Z5oHirI-iajtJpN-PNUsFghnfZH2bRSJiF5HU9uaQqlxOwXg6D21_Suf64rfTm09Y9ncmmELBIZX7We7S_gC2bj")' }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg text-white">
                    <span className="material-symbols-outlined text-[20px]">
                      download
                    </span>
                  </div>
                  <span className="relative z-10 text-white font-bold text-left">
                    Export Report
                  </span>
                </button>
              </div>
            </div>
            {/* <!-- Charts Section --> */}
            <div className="space-y-4">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">
                Analytics
              </h3>
              {/* <!-- Cash Flow Chart --> */}
              <div className="rounded-xl bg-card-light dark:bg-card-dark p-5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Cash Flow Analysis
                  </h4>
                  <select className="bg-transparent text-xs text-gray-500 dark:text-gray-400 font-medium border-none focus:ring-0 cursor-pointer">
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-end gap-3 h-40">
                  {/* <!-- Jan --> */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-primary/20 rounded-t-sm relative h-[60%] group-hover:bg-primary/30 transition-colors">
                      <div
                        className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm"
                        style={{ height: '70%' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      Jan
                    </span>
                  </div>
                  {/* <!-- Feb --> */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-primary/20 rounded-t-sm relative h-[45%] group-hover:bg-primary/30 transition-colors">
                      <div
                        className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm"
                        style={{ height: '40%' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      Feb
                    </span>
                  </div>
                  {/* <!-- Mar --> */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-primary/20 rounded-t-sm relative h-[80%] group-hover:bg-primary/30 transition-colors">
                      <div
                        className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm"
                        style={{ height: '65%' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      Mar
                    </span>
                  </div>
                  {/* <!-- Apr --> */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-primary/20 rounded-t-sm relative h-[55%] group-hover:bg-primary/30 transition-colors">
                      <div
                        className="absolute bottom-0 left-0 w-full bg-primary rounded-t-sm"
                        style={{ height: '50%' }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      Apr
                    </span>
                  </div>
                </div>
              </div>
              {/* <!-- Category Breakdown --> */}
              <div className="rounded-xl bg-card-light dark:bg-card-dark p-5 border border-slate-100 dark:border-white/5">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Expense Breakdown
                </h4>
                <div className="flex items-center gap-6">
                  <div className="relative size-32 shrink-0">
                    {/* <!-- Simple SVG Donut representation --> */}
                    <svg
                      className="transform -rotate-90 w-full h-full"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="40"
                        stroke="#2c3e33"
                        strokeWidth="12"
                      ></circle>
                      {/* <!-- Segment 1: Seeds (Green) --> */}
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="40"
                        stroke="#2bee6c"
                        strokeDasharray="100 251.2"
                        strokeDashoffset="0"
                        strokeWidth="12"
                      ></circle>
                      {/* <!-- Segment 2: Labor (Darker Green) --> */}
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        r="40"
                        stroke="#1d8f44"
                        strokeDasharray="70 251.2"
                        strokeDashoffset="-100"
                        strokeWidth="12"
                      ></circle>
                      {/* <!-- Segment 3: Tools (Gray/White) --> */}
                      <circle
                        cx="50"
                        cy="50"
                        fill="none"
                        opacity="0.5"
                        r="40"
                        stroke="#ffffff"
                        strokeDasharray="50 251.2"
                        strokeDashoffset="-170"
                        strokeWidth="12"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xs text-gray-500 font-medium">
                        Total
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        $4.2k
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-primary"></span>
                        <span className="text-slate-700 dark:text-gray-300">
                          Seeds
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        40%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-[#1d8f44]"></span>
                        <span className="text-slate-700 dark:text-gray-300">
                          Labor
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        28%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-white/50"></span>
                        <span className="text-slate-700 dark:text-gray-300">
                          Tools
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        20%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full bg-card-dark border border-gray-600"></span>
                        <span className="text-slate-700 dark:text-gray-300">
                          Other
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        12%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <!-- Farm Metrics List --> */}
            <div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3">
                Farm Status
              </h3>
              <div className="flex flex-col gap-3">
                {/* <!-- Item 1 --> */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-card-light dark:bg-card-dark border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined text-[20px]">
                        water_drop
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Soil Moisture
                      </p>
                      <p className="text-xs text-gray-500">Sector 4</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">
                    <span className="material-symbols-outlined text-[14px]">
                      warning
                    </span>
                    <span>Low (12%)</span>
                  </div>
                </div>
                {/* <!-- Item 2 --> */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-card-light dark:bg-card-dark border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        grass
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Crop Health
                      </p>
                      <p className="text-xs text-gray-500">All Sectors</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded text-xs font-bold">
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    <span>Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
          {/* <!-- Bottom Navigation --> */}
          <nav className="fixed bottom-0 w-full max-w-md glass border-t border-white/5 pb-5 pt-3 px-6 z-50">
            <ul className="flex justify-between items-center">
              <li>
                <a className="flex flex-col items-center gap-1 group" href="#">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    dashboard
                  </span>
                  <span className="text-[10px] font-medium text-primary">
                    Home
                  </span>
                </a>
              </li>
              <li>
                <a className="flex flex-col items-center gap-1 group" href="#">
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors text-[24px]">
                    receipt_long
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 group-hover:text-primary transition-colors">
                    Transact
                  </span>
                </a>
              </li>
              <li>
                <div className="relative -top-6">
                  <button className="bg-primary text-black size-14 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(43,238,108,0.4)] border-4 border-background-dark transform transition-transform active:scale-95">
                    <span className="material-symbols-outlined text-[28px]">
                      add
                    </span>
                  </button>
                </div>
              </li>
              <li>
                <a className="flex flex-col items-center gap-1 group" href="#">
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors text-[24px]">
                    map
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 group-hover:text-primary transition-colors">
                    Map
                  </span>
                </a>
              </li>
              <li>
                <a className="flex flex-col items-center gap-1 group" href="#">
                  <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors text-[24px]">
                    settings
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 group-hover:text-primary transition-colors">
                    Settings
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    );
  }
}
