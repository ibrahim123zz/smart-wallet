// بيانات الربط مع Supabase
const SUPABASE_URL = "https://bxpdgepxvhjhdjmvvcmh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_IrmUTjpamHHPCD1XSmkzVw_J_Hnk4dF";

// تشغيل مكتبة Supabase (قمنا بتغيير الاسم هنا إلى supabaseClient لمنع التعارض)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// عناصر الواجهة
const balanceEl = document.getElementById("balance");
const amountInput = document.getElementById("amount-input");
const btnIncome = document.getElementById("btn-income");
const btnExpense = document.getElementById("btn-expense");
const historyList = document.getElementById("history-list");

// دالة لجلب البيانات من قاعدة البيانات عند فتح الموقع
async function loadData() {
  // 1. جلب الرصيد الحالي
  let { data: wallet, error } = await supabaseClient
    .from("wallet")
    .select("balance")
    .single();

  if (wallet) {
    balanceEl.innerText = wallet.balance;
  }

  // 2. جلب سجل العمليات
  let { data: history, error2 } = await supabaseClient
    .from("history")
    .select("*")
    .order("id", { ascending: false });

  if (history) {
    historyList.innerHTML = ""; // تنظيف القائمة أولاً
    history.forEach((item) => {
      const li = document.createElement("li");
      li.innerText = `${item.type}: ${item.amount} ج.م`;
      li.classList.add(item.type === "دخل" ? "income-item" : "expense-item");
      historyList.appendChild(li);
    });
  }
}

// دالة لتحديث الرصيد وإضافة عملية جديدة
async function updateTransaction(type, amount) {
  if (!amount || amount <= 0) {
    alert("الرجاء إدخال مبلغ صحيح!");
    return;
  }

  let currentBalance = parseInt(balanceEl.innerText);
  let newBalance =
    type === "دخل" ? currentBalance + amount : currentBalance - amount;

  // تحديث الرصيد في جدول wallet
  await supabaseClient
    .from("wallet")
    .update({ balance: newBalance })
    .eq("id", 1);

  // إضافة العملية في جدول history
  await supabaseClient.from("history").insert([{ type: type, amount: amount }]);

  // إعادة تحميل البيانات على الشاشة لتحديث الواجهة
  amountInput.value = "";
  loadData();
}

// ربط الأزرار بالوظائف البرمجية
btnIncome.addEventListener("click", () => {
  updateTransaction("دخل", parseInt(amountInput.value));
});

btnExpense.addEventListener("click", () => {
  updateTransaction("مصروف", parseInt(amountInput.value));
});

// تشغيل جلب البيانات تلقائياً عند فتح الصفحة
loadData();
