

const hotelMessageInfoArray = [

    {
        hotelName: "Mamaka By Ovolo",
        messageInfo_p1: "حجز ليلتين او اكثر تحصل مساج لمرة واحدة لمدة 30 دقيقة",
        messageInfo_p2: "حجز ثلاث ليالي او أكثر في سواجر سويت تحصل مساج مجاني لشخصين لمدة 30 دقيقة لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 31 ديسمبر 2025",
    },

    {
        hotelName: "Indigo Bali",
        messageInfo_p1: "حجز ثلاث ليالي او اكثر:",
        messageInfo_p2: "مساج لشخصين لمدة 60 دقيقة",
        messageInfo_p3: "صالح للإستخدام الى 28 فبراير (حجوزات في تواريخ 5 يناير - 31 مايو)",
        messageInfo_p4: "حجز ثلاث ليالي او اكثر في غرفة ستاندرد = فري ابجريد الى ستاندر جاردن:",
        messageInfo_p5: "الفري ابجريد صالح للإستخدام الى 28 فبراير فقط - لفترة الحجز من 5 يناير الى 17 مارس",
    },

    {
        hotelName: "Maharaja Villas Seminyak",
        messageInfo_p1: "حجز ليلين او اكثر:",
        messageInfo_p2: "إفطار عائم لشخصين لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 30 يونيو 2026",
    },

    {
        hotelName: "E Sanctuary Resort",
        messageInfo_p1: "حجز ليلين او اكثر:",
        messageInfo_p2: "إفطار عائم مجاني لشخصين لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 03 يناير 2026",
    },

    {
        hotelName: "Komaneka Tanggayuda",
        messageInfo_p1: "حجز ليلين او اكثر",
        messageInfo_p2: "إفطار عائم مجاني لشخصين لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 23 ديسمبر 2025",
    },

    {
        hotelName: "Komaneka Keramas",
        messageInfo_p1: "حجز ليلين او اكثر",
        messageInfo_p2: "إفطار عائم مجاني لشخصين لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 23 ديسمبر 2025",
    },

    {
        hotelName: "Tejaprana Resort & Spa",
        messageInfo_p1: "حجز ليلين او اكثر",
        messageInfo_p2: "إفطار عائم مجاني لشخصين لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 31 مارس 2027",
    },

    {
        hotelName: "Bali Beach Hotel Sanur",
        messageInfo_p1: "حجز ليلتين او أكثر:",
        messageInfo_p2: "عصير كوكتيل بعد الظهر مع مقبلات لشخصين لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 30 نوفمبر 2026",
    },

    {
        hotelName: "The Meru Sanur",
        messageInfo_p1: "حجز ليلتين او أكثر:",
        messageInfo_p2: "طبقين غداء او عشاء لشخصين لمره واحدة",
        messageInfo_p3: "صالح للإستخدام الى 30 نوفمبر 2026",
    },

    {
        hotelName: "Adiwana Suweta",
        messageInfo_p1: "اديوانا عندهم شاي بعد الظهر يومياً",
    },

    {
        hotelName: "Aksari Suweta",
        messageInfo_p1: "حجز 3 ليالي او أكثر",
        messageInfo_p2: "إفطار عائم لمرة واحدة + ديكور رومنسي على السرير لمرة واحدة",
        messageInfo_p3: "الإفطار العائم متوفرة في الفلل فقط",
    },

    {
        hotelName: "Amarea Ubud",
        messageInfo_p1: "حجز 3 ليالي او أكثر",
        messageInfo_p2: "إفطار عائم لمرة واحدة + ديكور رومنسي على السرير لمرة واحدة",
        messageInfo_p3: "الإفطار العائم متوفرة في الفلل فقط",
    },

    {
        hotelName: "Samsara Ubud",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "إفطار عائم لمرة واحدة لشخصين",
        messageInfo_p3: "عشاء رومانسي لشخصين في الفيلا لمرة واحدة",
        messageInfo_p4: "مساج لشخصين لمدة 60 دقيقة لمرة واحدة",
        messageInfo_p5: "صالح للإستخدام الى 31 مارس 2027",
    },

    {
        hotelName: "The Claremont Villa",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "إفطار عائم لمرة واحدة لشخصين",
        messageInfo_p3: "ابو تميم ماحدد مدة صلاحية الاستخدام",
    },

    {
        hotelName: "Impiana Private Villas Ubud",
        messageInfo_p1: "حجز ليلتين او أكثر في أي فيلا",
        messageInfo_p2: "إفطار عائم لمرة واحدة لشخصين",
        messageInfo_p3: "ابو تميم ماحدد مدة صلاحية الاستخدام",
    },

    {
        hotelName: "Ulu Segara",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "جلسة سبأ لشخصين لمرة واحدة",
        messageInfo_p3: "صالح للإستخدام الى 30 يونيو 2026",
    },

    {
        hotelName: "Holiday Inn Nusa Dua",
        messageInfo_p1: "حجز 3 ليالي او أكثر",
        messageInfo_p2: "مساج لشخصين لمدة 60 دقيقة لمرة واحدة",
        messageInfo_p3: "صالح للإستخدام في حجوزات بتواريخ من 1 فبراير الى 20 ديسمبر 2026",
    },

    {
        hotelName: "Komaneka Keramas",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "صالح للإستخدام الى 31 مارس 2026",
    },


    {
        hotelName: "Komaneka Keramas",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "غداء او عشاء لشخصين لمرة واحدة",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2027",
    },


    {
        hotelName: "Natya Resort",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "صالح للإستخدام الى 30 يونيو 2026",
    },

    {
        hotelName: "Sanctoo Suites And Villas",
        messageInfo_p1: "حجز ليلتين او أكثر في أي فيلا",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "شاي بعد الظهر يومياً",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2026",
    },

    {
        hotelName: "Umana Bali",
        messageInfo_p1: "حجز ليلتين او أكثر في أي فيلا",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "صالح للإستخدام الى 31 مارس 2026 (حجوزات بتواريخ من الان الى 31 مارس 2026)",
    },

    {
        hotelName: "Aksari Seminyak",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "تزيين رومنسي على السرير",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2026",
    },

    {
        hotelName: "Aleva Villa",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "تزيين رومنسي على السرير",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2026",
    },

    {
        hotelName: "Cyrus Villa",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "تزيين رومنسي على السرير",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2026",
    },

    {
        hotelName: "Astera Villa",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "تزيين رومنسي على السرير",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2026",
    },

    {
        hotelName: "Ayona Villa",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "تزيين رومنسي على السرير",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2026",
    },

    {
        hotelName: "Courtyard Seminyak",
        messageInfo_p1: "غير مشترط بعدد ليالي",
        messageInfo_p2: "فري ابجريد الى ديلوكس بول فيو",
        messageInfo_p3: "صالح للإستخدام الى 28 فبراير 2026 (حجوزات بتواريخ الى 31 مارس 2026)",
    },

    {
        hotelName: "The Samaya Seminyak",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "وجبة غداء خفيفة مرة واحدة لشخصين غير شامل المشروبات",
        messageInfo_p3: "صالح للإستخدام الى 31 مارس 2026",
    },

    {
        hotelName: "ًW Bali",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "فري ابجريد من سوبريور جاردن الى بريمير مواجهة للمحيط",
        messageInfo_p3: "الابجريد غير متوفر في حجوزات 1-5 ابريل",
        messageInfo_p4: "الابجريد متوفرة في حال غرفة البريمير متوفرة",
        messageInfo_p5: "صالح للإستخدام الى 31 مارس 2026 (حجوزات بتواريخ من 20 مارس الى 30 ابريل 2026)",
    },

    {
        hotelName: "ًAyuterra Resort",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "مساج لشخصين لمدة 60 دقيقة لمرة واحدة",
        messageInfo_p3: "تزيين رومنسي على السرير",
        messageInfo_p4: "تزيين رومنسي في حوض الاستحمام",
        messageInfo_p5: "صالح للإستخدام الى 31 مارس 2026 (حجوزات بتواريخ من 20 مارس الى 30 ابريل 2026)",
    },

    {
        hotelName: "Four Seasons Sayan",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "ثلاث أطباق غداء (طعام فقط) لشخصين لمرة واحدة",
        messageInfo_p3: "صالح للإستخدام الى 30 يونيو 2026",
    },

    {
        hotelName: "Four Seasons Jimbaran",
        messageInfo_p1: "حجز ثلاث ليالي او أكثر",
        messageInfo_p2: "ثلاث أطباق غداء (طعام فقط) لشخصين لمرة واحدة",
        messageInfo_p3: "صالح للإستخدام الى 30 يونيو 2026",
    },

    {
        hotelName: "Hanging Garden of Bali",
        messageInfo_p1: "حجز ليلتين او أكثر",
        messageInfo_p2: "افطار عائم لشخصين لمرة واحدة",
        messageInfo_p3: "الافطار العائم غير متوفر في حال استخدمت ميزة (حجز 3 ليالي بسعر ليلتين)",
        messageInfo_p4: "صالح للإستخدام الى 31 مارس 2026",
    },
];
