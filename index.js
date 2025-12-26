const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// إعداد عميل الواتساب مع خيارات التشغيل السحابي
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // ضروري جداً للعمل على السيرفرات بدون شاشة
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote'
        ]
    }
});

// رقمك الخاص الذي سيستقبل الروابط
const MY_PERSONAL_NUMBER = '966590841275@c.us';

// توليد رمز QR في شاشة السجلات (Logs)
client.on('qr', (qr) => {
    console.log('امسح الرمز التالي باستخدام واتساب (الرقم المخصص للبوت):');
    qrcode.generate(qr, { small: true });
});

// رسالة تأكيد عند نجاح الاتصال
client.on('ready', () => {
    console.log('✅ البوت جاهز ويعمل الآن من السحابة!');
    console.log('يتم الآن مراقبة المجموعات وإرسال الروابط إلى رقمك الخاص.');
});

// الاستماع للرسائل في المجموعات والخاص
client.on('message_create', async (msg) => {
    
    // منع البوت من إرسال التنبيهات لنفسه لتجنب التكرار اللانهائي
    if (msg.from === MY_PERSONAL_NUMBER && msg.to === MY_PERSONAL_NUMBER) return;

    // التحقق مما إذا كانت الرسالة تحتوي على رابط مجموعة واتساب
    if (msg.body.includes('chat.whatsapp.com')) {
        
        try {
            const chat = await msg.getChat();
            const isGroup = chat.isGroup;
            
            // تجهيز نص التقرير
            const reportMessage = `
🔍 *تم العثور على رابط جديد!*

📂 *المصدر:* ${chat.name || 'محادثة'}
📌 *النوع:* ${isGroup ? 'مجموعة 👥' : 'دردشة خاصة 👤'}
👤 *المرسل:* ${msg.author || msg.from}

🔗 *الرابط:*
${msg.body}
            `;

            // إرسال الرابط إلى رقمك الخاص
            await client.sendMessage(MY_PERSONAL_NUMBER, reportMessage);
            console.log(`✅ تم توجيه رابط من "${chat.name}" إلى رقمك الخاص.`);
            
        } catch (error) {
            console.error('❌ حدث خطأ أثناء معالجة الرسالة:', error);
        }
    }
});

// بدء تشغيل البوت
client.initialize();
