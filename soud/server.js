const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// 1. الربط بالسحابة (تم استبدال localhost بالرابط الذي استخرجناه من الصور)
// ملاحظة: الرابط مأخوذ من بياناتك التي أرسلتها في الصور الأخيرة [cite: 2026-02-25]
const DB_URI = "mongodb+srv://soud_admin:mipkjHmh78OE2Izy@cluster0.pv8eec7.mongodb.net/soud_market?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(DB_URI)
    .then(() => console.log("✅ تم الاتصال بسحابة MongoDB بنجاح!"))
    .catch(err => console.error("❌ فشل الاتصال بالسحابة:", err));

// 2. هياكل البيانات (Schemas)
const productSchema = new mongoose.Schema({
    name: String, price: Number, img: String, seller: String, cat: String
});

const orderSchema = new mongoose.Schema({
    orderID: String, customer: String, items: Array, total: Number,
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    pass: String,
    role: { type: String, default: 'vendor' } // يمكن أن يكون vendor أو manager
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

// 3. المسارات البرمجية (API Routes)

// أ- تسجيل مستخدم جديد مع تشفير كلمة المرور
app.post('/api/auth/register', async (req, res) => {
    try {
        const hashedPass = await bcrypt.hash(req.body.pass, 10);
        const user = new User({ email: req.body.email, pass: hashedPass, role: req.body.role });
        await user.save();
        res.status(201).send({ message: "تم تسجيل الحساب بنجاح" });
    } catch (err) {
        res.status(400).send({ message: "البريد الإلكتروني مسجل مسبقاً" });
    }
});

// ب- تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send({ message: "المستخدم غير موجود" });

    const validPass = await bcrypt.compare(req.body.pass, user.pass);
    if (!validPass) return res.status(401).send({ message: "كلمة المرور غير صحيحة" });

    res.send({ email: user.email, role: user.role });
});

// ج- تنفيذ طلب شراء وحفظه
app.post('/api/orders', async (req, res) => {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
});

// د- جلب إحصائيات المدير (العمولات والتقارير المالية)
// ملاحظة: كلمة سر التقارير المالية هي 1988 كما طلبت [cite: 2026-02-06]
app.post('/api/admin/stats', async (req, res) => {
    const { financePassword } = req.body;
    if (financePassword !== "1988") return res.status(403).send({ message: "كلمة سر التقارير خاطئة" });

    const allOrders = await Order.find({ status: 'completed' });
    const totalComm = allOrders.reduce((sum, o) => sum + (o.total * 0.05), 0);
    res.send({ totalComm, ordersCount: allOrders.length });
});

// هـ- تعديل المنتجات (متاح للمدير) [cite: 2026-02-09]
app.put('/api/products/:id', async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(updatedProduct);
});

// 4. تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 SOUD Server active on port ${PORT}`));

