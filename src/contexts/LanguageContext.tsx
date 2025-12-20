import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "th";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, any> = {
  en: {
    // Profile Page
    profile: "Profile",
    manageAccount: "Manage your account information and preferences",
    accountInformation: "Account Information",
    profileDetails: "Profile Details",
    accountOverview: "Account Overview",
    fullName: "Full Name",
    farmName: "Farm Name",
    phoneNumber: "Phone Number",
    location: "Location",
    email: "Email",
    memberSince: "Member since",
    accountStatus: "Account Status",
    accountType: "Account Type",
    plan: "Plan",
    active: "Active",
    farmer: "Farmer",
    premium: "Premium",
    yearsWithUs: "Years with us",
    verified: "Verified",
    noNameSet: "No name set",
    farmNameNotSet: "Farm name not set",
    unableToLoadProfile: "Unable to load profile information.",
    profileUpdatedSuccessfully: "Profile updated successfully!",
    edit: "Edit",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    enterYourFullName: "Enter your full name",
    enterYourFarmName: "Enter your farm name",
    enterYourPhoneNumber: "Enter your phone number",
    enterYourLocation: "Enter your location",

    // Dashboard Page
    dashboard: "Dashboard",
    welcomeToDashboard: "Welcome to your farm dashboard",
    overviewOfPerformance: "Overview of your farm's financial performance",
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netProfit: "Net Profit",
    recentTransactions: "Recent Transactions",
    viewAll: "View All",
    fromTransactions: "From {count} transactions",
    profitable: "Profitable",
    loss: "Loss",
    profitByCropAndYear: "Profit by Crop and Year",
    expensesByCategory: "Expenses by Category",
    priceAmount: "Price/Amount",
    cropProductivity: "Crop Productivity",
    fertilizerUsagePerTree: "Fertilizer Usage per Tree",
    from: 'From',
    // Navigation
    dashboardNav: "Dashboard",
    income: "Income",
    expenses: "Expenses",
    planner: "Fertilizer Planner",
    settings: "Settings",
    logout: "Logout",

    // Income Page
    trackAndManageIncome: "Track and manage your farm incomes",
    addIncome: "Add Income",
    filteredIncome: "Filtered Income:",
    incomeList: "Income List",
    description: "Description",
    noIncomeRecords: "No income records found",
    editIncome: "Edit Income",
    amount: "Amount",
    priceUnit: "Price per Unit",
    unitOptional: "Unit (Optional)",
    subTotal: "Sub-total",
    netTotal: "Net Total",
    linkedExpenses: "Linked expenses",
    optional: '(optional)',
    linkedTo: 'Linked to',
    items: 'Item(s)',
    itemSelected: 'item(s) selected',
    enterPrice: "Enter price",
    enterAmount: "Enter amount",
    enterUnit: "Enter unit (e.g., kg, tons, bags)",
    date: "Date",
    category: "Category",
    subTotalMustBePositive: "Sub-total must be a positive number",
    priceMustBePositive: "Price must be a positive number",
    amountMustBePositive: "Amount must be a positive number",

    // Expense Page
    trackAndManageExpenses: "Track and manage your farm expenses",
    summary: "Summary",
    filteredExpenses: "Filtered Expenses:",
    records: "records",
    of: "of",
    addExpense: "Add Expense",
    editExpense: "Edit Expense",
    expenseList: "Expense List",
    noExpenseRecords: "No expense records found",
    uncategorized: "Uncategorized",
    noCrop: "No Crop",
    selectCrop: "Select a crop",
    cost: "Cost",
    unit: "Unit",
    total: "Total",
    details: "Details",
    detailsOptional: "Details (Optional)",
    enterUnitCost: "Enter unit cost",
    enterTotal: "Enter total",
    enterDate: "Enter date",
    enterCategory: "Enter category (e.g., Seeds, Fertilizer, Equipment)",
    addDetails: "Add any additional details about this expense...",
    auto: "Auto",
    manualEntry: "Manual entry",
    resetToAuto: "Reset to Auto",
    areYouSureDeleteExpense: "Are you sure you want to delete this expense?",
    costMustBePositive: "Cost must be a positive number",
    totalMustBePositive: "Total must be a positive number",
    pleaseSelectCrop: "Please select a crop",
    dateRequired: "Date is required",
    categoryRequired: "Category is required",

    // Settings Page
    cropSettings: "Crop Settings",
    addCrop: "Add Crop",
    editCrop: "Edit Crop",
    deleteCrop: "Delete Crop",
    cropName: "Crop Name",
    cropLocation: "Crop Location",
    cropArea: "Area (m²)",
    cropAmount: "Quantity",
    plantedDate: "Planted Date",
    noCropsAdded: "No crops added yet",
    addFirstCrop: "Add your first crop above to get started",
    cropLocations: "Crop Locations",
    yourCrops: "Your Crops",
    confirmDeleteCrop: "Are you sure you want to delete this crop?",
    cropNamePlaceholder: "e.g., Tomatoes, Corn, Apple Trees",
    cropLocationPlaceholder: "e.g., North Field, Greenhouse 1",
    geographicLocation: "Geographic Location",
    selectedLocation: "Selected",
    units: "units",
    years: "y",
    months: "m",
    days: "d",
    invalidDate: "Invalid date",

    // Login Page
    login: "Login",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot Password?",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign Up",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close",
    confirm: "Confirm",
    delete: "Delete",
    add: "Add",
    saveChanges: "Save Changes",
    search: "Search",
    filter: "Filter",
    incomeVsAmountChart: "Income Amount vs Price per Unit Over Time",
    breakDownIncomePerYear:
      "Income Breakdown: Expenses + Profit by Crop and Year",

    // Crop Productivity Chart
    noDataAvailable: "No data available",
    noCropsFound: "No crops found",
    noIncomeDataFound: "No income data found",
    insufficientData: "Insufficient data for analysis",
    cropsNeedAreaData: "Crops need area data..",
    productivityFormula: "Total Income Amount (kg) ÷ Area (rai)",
    oneRaiEquals: "1 rai = 1,600 square meter",
    cropProductivityAnalysis:
      "Crop Productivity Analysis (kg per rai per year)",

    productivity: "producivity",
    productivityUnit: "kg/rai/year",
    totalAmount: "kg",
    area: "rai",
    rai: "rai",
    year: "year",
    crops: "Crop",

    crop: "Crop",
    trees: "Trees",
    totalFertilizer: "Total Fertilizer",
    fertilizerPerTree: "Fertilizer/Tree",
    progress: "Progress",
    fertilizerTypes: "Fertilizer Types",
    plans: "plans",
    noFertilizerPlans: "No fertilizer plans available",
    age: "Age",
    fertilizerPerTreeUnit: "kg/tree",

    fertilizerPlanner: {
      title: "Fertilizer Planner",
      description: "Plan and track your fertilizer applications",
      defaultTitle: "Fertilizer Application",
      stage: "Growth Stage",
      amount: "Amount",
      linkedTo: "Linked to",
      expenses: "expense(s)",
      editTitle: "Edit Fertilizer Plan",
      addTitle: "Add Fertilizer Plan",
      deleteConfirm: "Are you sure you want to delete this fertilizer plan?",
    },
    status: {
      plan: "Planned",
      doing: "In Progress",
      complete: "Done",
    },
    actions: {
      start: "Start",
      complete: "Complete",
    },
    form: {
      crop: "Crop",
      selectCrop: "Select a crop",
      planDate: "Plan Date",
      status: "Status",
      selectStatus: "Select status",
      stage: "Growth Stage",
      fertilizerType: "Fertilizer Type",
      amountKg: "Amount (kg)",
      details: "Details (Optional)",
      linkRelatedExpenses: "Link Related Expenses (Optional)",
    },
    common: {
      uncategorized: "Uncategorized",
      noCrop: "No Crop",
    },
    navigation: "Navigation",
    averagePricePerUnit: "price per unit",
    otherSetting: "Other Setting",
  },
  th: {
    otherSetting: "ตั้งค่าอื่น",
    fertilizerPlanner: {
      title: "แผนการให้ปุ๋ย",
      description: "วางแผนและติดตามการให้ปุ๋ยของคุณ",
      defaultTitle: "การใส่ปุ๋ย",
      stage: "ระยะการเจริญเติบโต",
      amount: "ปริมาณ",
      linkedTo: "เชื่อมโยงกับ",
      expenses: "ค่าใช้จ่าย",
      editTitle: "แก้ไขแผนการปุ๋ย",
      addTitle: "เพิ่มแผนการปุ๋ย",
      deleteConfirm: "คุณแน่ใจหรือไม่ว่าต้องการลบแผนการให้ปุ๋ยนี้?",
    },
    status: {
      plan: "วางแผน",
      doing: "กำลังดำเนินการ",
      complete: "เสร็จสิ้น",
    },
    actions: {
      start: "เริ่ม",
      complete: "เสร็จ",
    },
    form: {
      crop: "พืช",
      selectCrop: "เลือกพืช",
      planDate: "วันที่แผน",
      status: "สถานะ",
      selectStatus: "เลือกสถานะ",
      stage: "ระยะการเจริญเติบโต",
      fertilizerType: "ชนิดปุ๋ย",
      amountKg: "ปริมาณ (กก.)",
      details: "รายละเอียด (ไม่บังคับ)",
      linkRelatedExpenses: "เชื่อมค่าใช้จ่ายที่เกี่ยวข้อง (ไม่บังคับ)",
    },
    common: {
      uncategorized: "ไม่ระบุหมวดหมู่",
      noCrop: "ไม่มีพืช",
    },
    // Crop Productivity Chart
    noDataAvailable: "ไม่มีข้อมูล",
    noCropsFound: "ไม่พบแปลง",
    noIncomeDataFound: "ไม่พบข้อมูลรายได้",
    insufficientData: "ข้อมูลไม่เพียงพอสำหรับ",
    cropsNeedAreaData:
      "แปลงต้องการข้อมูลพื้นที่และรายได้ที่เกี่ยวข้องเพื่อคำนวนผลผลิต",
    productivityFormula: "ผลผลิต = จำนวนรายได้ทั้งหมด (กก.) ÷ พื้นที่ (ไร่)",
    oneRaiEquals: "1 ไร่ = 1,600 ตร.ม.",
    cropProductivityAnalysis: "การวิเคาราะผลผลิตพืช (กก. ต่อ ไร่ ต่อปี)",
    crops: "แปลง",

    crop: "แปลง",
    trees: "จำนวนต้น",
    totalFertilizer: "ปริมาณปุ๋ยรวม",
    fertilizerPerTree: "ปุ๋ย/ต้น",
    progress: "ความคืบหน้า",
    fertilizerTypes: "ชนิดปุ๋ย",
    plans: "แผน",
    noFertilizerPlans: "ยังไม่มีแผนการใช้ปุ๋ย",
    total: "รวม",
    age: "อายุ",
    fertilizerPerTreeUnit: "กก./ต้น",

    productivity: "ผลิตผล",
    productivityUnit: "กก./ไร่/ปี",
    totalAmount: "จำนวนรวม",
    area: "พื้นที่",
    rai: "ไร่",
    year: "ปี",

    // Profile Page
    profile: "โปรไฟล์",
    manageAccount: "จัดการข้อมูลบัญชีและการตั้งค่า",
    accountInformation: "ข้อมูลบัญชี",
    profileDetails: "รายละเอียดโปรไฟล์",
    accountOverview: "ภาพรวจบัญชี",
    fullName: "ชื่อ-นามสกุล",
    farmName: "ชื่อฟาร์ม",
    phoneNumber: "หมายเลขมือถืออ",
    location: "ที่อยู่",
    email: "อีเมล์",
    memberSince: "เป็นสมาชิกตั้งแต่",
    accountStatus: "สถานะบัญชี",
    accountType: "ประเภทบัญชี",
    plan: "แผนการใช้งาน",
    active: "ใช้งานอยู่",
    farmer: "ชาวสวน",
    premium: "พรีเมียม",
    yearsWithUs: "ใช้บริการมานาน",
    verified: "ยืนยัน",
    noNameSet: "ยังไม่ได้ตั้งชื่อ",
    farmNameNotSet: "ยังไม่ได้ตั้งชื่อฟาร์ม",
    unableToLoadProfile: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
    profileUpdatedSuccessfully: "อัปเดตข้อมูลโปรไฟล์สำเร็จ!",
    edit: "แก้ไข",
    cancel: "ยกเลิก",
    save: "บันทึก",
    saving: "กำลังบันทึก...",
    enterYourFullName: "กรอกชื่อ-นามสกุล",
    enterYourFarmName: "กรอกชื่อฟาร์ม",
    enterYourPhoneNumber: "กรอกหมายเลขมือถืออ",
    enterYourLocation: "กรอกที่อยู่",

    // Dashboard Page
    dashboard: "แดชบอร์ด",
    welcomeToDashboard: "ยินดีต้อนรับสู่แดชบอร์ดฟาร์มของคุณ",
    overviewOfPerformance: "ภาพรวจประสิทธิของฟาร์มของคุณ",
    totalIncome: "รายได้รวม",
    totalExpenses: "รายจ่ายรวม",
    netProfit: "กำไรทั้งหมด",
    recentTransactions: "ธุรกรรมล่าสุด",
    viewAll: "ดูทั้งหมด",
    fromTransactions: "จาก {count} รายการ",
    profitable: "กำไรได้",
    loss: "ขาดทุน",
    profitByCropAndYear: "กำไรตามแปลงและปี",
    expensesByCategory: "รายจ่ายตามหมวดหมู่",
    priceAmount: "ราคา/จำนวน",
    cropProductivity: "ประสิทธิของแปลง",
    fertilizerUsagePerTree: "การใช้ปุ๋ยต่อต้น",
    from: 'จาก',
    // Navigation
    dashboardNav: "แดชบอร์ด",
    income: "รายได้",
    expenses: "รายจ่าย",
    planner: "วางแผนปุ๋ย",
    settings: "การตั้งค่า",
    logout: "ออกจากระบบ",

    // Income Page
    trackAndManageIncome: "ติดตามและจัดการรายรับฟาร์มของคุณ",
    filteredIncome: "รายรับที่กรอง:",
    addIncome: "เพิ่มรายได้",
    incomeList: "รายการรายได้",
    description: "คำอธิบาย",
    noIncomeRecords: "ไม่พบรายการรายได้",
    editIncome: "แก้ไข รายรับ",
    amount: "จำนวน",
    priceUnit: "ราคาต่อหน่วย",
    unitOptional: 'หน่วยนับ (ไม่บังคับ)',
    subTotal: "ยอดรวมย่อย",
    netTotal: "ยอดสุทธิ",
    optional: '(ไม่บังคับ)',
    linkedExpenses: "ค่าใช้จ่ายที่เชื่อมโยง",
    linkedTo: 'เชื่อมโยง',
    items: 'รายการ',
    itemSelected: 'รายการที่เลือก',
    enterPrice: "กรอกราคา",
    enterAmount: "กรอกจำนวน",
    enterUnit: "กรอกหน่วย (เช่น กก., ตัน, ถุง)",
    date: "วันที่",
    category: "หมวดหมู่",
    subTotalMustBePositive: "ยอดรวมย่อยต้องเป็นจำนวนบวก",
    priceMustBePositive: "ราคาต่อหน่วยต้องเป็นจำนวนบวก",
    amountMustBePositive: "จำนวนต้องเป็นจำนวนบวก",


    // Expense Page
    trackAndManageExpenses: "ติดตามและจัดการรายจ่ายฟาร์มของคุณ",
    summary: "สรุป",
    filteredExpenses: "รายจ่ายที่กรอง:",
    records: "รายการ",
    of: "ของ",
    addExpense: "เพิ่มรายจ่าย",
    editExpense: "แก้ไขรายจ่าย",
    expenseList: "รายการรายจ่าย",
    noExpenseRecords: "ไม่พบรายการรายจ่าย",
    uncategorized: "ไม่มีหมวดหมู่",
    noCrop: "ไม่มีแปลง",
    selectCrop: "เลือกแปลง",
    cost: "ต้นทุน",
    unit: "หน่วย",
    details: "รายละเอียด",
    detailsOptional: "รายละเอียด (ไม่บังคับ)",
    enterUnitCost: "กรอกต้นทุนต่อหน่วย",
    enterTotal: "กรอกยอดรวม",
    enterDate: "กรอกวันที่",
    enterCategory: "กรอกหมวดหมู่ (เช่น เมล็ดพันธุ์, ปุ๋ย, อุปกรณ์)",
    addDetails: "เพิ่มรายละเอียดเพิ่มเติมเกี่ยวกับรายจ่ายนี้...",
    auto: "อัตโนมัติ",
    manualEntry: "กรอกเอง",
    resetToAuto: "รีเซ็ตเป็นอัตโนมัติ",
    areYouSureDeleteExpense: "คุณแน่ใจหรือไม่ที่จะลบรายจ่ายนี้?",
    costMustBePositive: "ต้นทุนต้องเป็นจำนวนบวก",
    totalMustBePositive: "ยอดรวมต้องเป็นจำนวนบวก",
    pleaseSelectCrop: "กรุณาเลือกแปลง",
    dateRequired: "ต้องระบุวันที่",
    categoryRequired: "ต้องระบุหมวดหมู่",

    // Settings Page
    cropSettings: "การตั้งค่าแปลง",
    addCrop: "เพิ่มแปลง",
    editCrop: "แก้ไขแปลง",
    deleteCrop: "ลบแปลง",
    cropName: "ชื่อแปลง",
    cropLocation: "สถานที่แปลง",
    cropArea: "พื้นที่ (ตร.ม.)",
    cropAmount: "จำนวน",
    plantedDate: "วันที่ปลูก",
    noCropsAdded: "ยังไม่ได้เพิ่มแปลง",
    addFirstCrop: "เพิ่มแปลงแรกเพื่อเริ่มต้น",
    cropLocations: "สถานที่แปลง",
    yourCrops: "แปลงของคุณ",
    confirmDeleteCrop: "คุณแน่ใจหรือไม่ที่จะลบแปลงนี้?",
    cropNamePlaceholder: "เช่น มะเขือเลือก ข้าว แอปเปิ้ล",
    cropLocationPlaceholder: "เช่น ทุ่งนาเหนือง เรือนปลูก 1",
    geographicLocation: "พิกัดภูมิศาสตร์",
    selectedLocation: "เลือกแล้ว",
    units: "หน่วย",
    years: "ป",
    months: "เดือน",
    days: "วัน",
    invalidDate: "วันที่ไม่ถูกต้อง",

    // Login Page
    login: "เข้าสู่ระบบ",
    emailPlaceholder: "กรอกอีเมล์",
    passwordPlaceholder: "กรอกรหัสผ่าน",
    forgotPassword: "ลืมรหัสผ่าน?",
    dontHaveAccount: "ยังไม่มีบัญชี?",
    signUp: "สมัครสมาชิก",

    // Common
    loading: "กำลังโหลด...",
    error: "ข้อผิดพลาด",
    success: "สำเร็จ",
    close: "ปิด",
    confirm: "ยืนยัน",
    delete: "ลบ",
    add: "เพิ่ม",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    search: "ค้นหา",
    filter: "กรอง",
    incomeVsAmountChart: "ราคา และ จำนวนผลผลิต / เวลา",
    breakDownIncomePerYear: "แจงรายละเอียดกำไรรายจ่ายต่อปี",
    navigation: "เมนู",
    averagePricePerUnit: "ราคาต่อหน่วย",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const getNested = (obj: any, path: string): any => {
    if (!obj) return undefined;
    return path.split(".").reduce((acc, part) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
        return acc[part];
      }
      return undefined;
    }, obj);
  };

  const t = (key: string): string => {
    const val = getNested(translations[language], key);
    if (typeof val === "string") return val;
    // fallback to english
    const fallback = getNested(translations["en"], key);
    if (typeof fallback === "string") return fallback;
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
