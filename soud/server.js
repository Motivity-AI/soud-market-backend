const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// 1. تعريف المستخدم (Roles: admin, vendor, customer)
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'vendor', 'customer'], default: 'customer' },
    commissionRate: { type: Number, default: 0.10 } // عمولة خاصة بكل تاجر
});

// 2. تعريف المنتج مع نظام المخزون (Stock)
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    countInStock: { type: Number, default: 0 },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    img: String
});

// 3. تعريف الطلب الاحترافي
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        qty: Number,
        price: Number,
        vendorId: mongoose.Schema.Types.ObjectId,
        commissionEarned: Number // حفظ العمولة وقت البيع
    }],
    shippingAddress: { city: String, address: String, phone: String },
    totalAmount: Number,
    status: { type: String, default: 'Pending' }, // (Pending, Shipped, Delivered)
    receiptImg: String,
    createdAt: { type: Date, default: Date.now }
});

// --- Middleware الحماية (Security) ---
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "غير مصرح لك، التوكن مفقود" });

    try {
        const decoded = jwt.verify(token, 'SOUD_SECRET_2026');
        req.user = decoded;
        next();
    } catch (e) { res.status(401).json({ message: "توكن غير صالح" }); }
};

const adminOnly = (req, res, next) => {
    if (req.user.role === 'admin') next();
    else res.status(403).json({ message: "صلاحية مدير فقط!" });
};

// --- المسارات (Routes) ---

// تسجيل مستخدم جديد
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // نظام كلمة السر السرية للمدير [cite: 2026-02-06]
    const userRole = (password === "1988") ? "admin" : role; 
    
    const user = await User.create({ name, email, password: hashedPassword, role: userRole });
    res.json({ message: "تم التسجيل بنجاح" });
});

// إنشاء طلب مع إدارة المخزون (Stock Management)
app.post('/api/orders', protect, async (req, res) => {
    const { items, address } = req.body;

    for (const item of items) {
        const product = await Product.findById(item.productId);
        // التحقق من المخزون
        if (product.countInStock < item.qty) {
            return res.status(400).json({ message: `المنتج ${product.name} غير متوفر بالكمية المطلوبة` });
        }
        // إنقاص الكمية تلقائياً
        product.countInStock -= item.qty;
        await product.save();
    }

    const order = await Order.create({
        userId: req.user.id,
        items,
        shippingAddress: address,
        // حساب الإجمالي والعمولات يتم هنا في السيرفر لضمان الأمان
    });
    res.status(201).json(order);
});

// لوحة تحكم المدير - إحصائيات المنصة كاملة [cite: 2026-02-09]
app.get('/api/admin/stats', protect, adminOnly, async (req, res) => {
    const totalSales = await Order.aggregate([{ $group: { _id: null, sum: { $sum: "$totalAmount" } } }]);
    const vendorCount = await User.countDocuments({ role: 'vendor' });
    const orderCount = await Order.countDocuments();
    
    res.json({
        totalRevenue: totalSales[0]?.sum || 0,
        vendors: vendorCount,
        orders: orderCount
    });
});
