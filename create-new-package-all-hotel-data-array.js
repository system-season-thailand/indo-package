/* Array to store the hotel room types description for later use */



let allHotelDataArray = [
    /* Keramas */
    {
        hotelName: 'Komaneka Keramas',
        hotelLocation: 'بالي',
        hotelArea: 'كيراماس',
        hotelRoomTypes: ['فيلا اوشن من غرفة نوم واحدة', 'فيلا هيلتوب من غرفتين نوم'],
    },





    /* Ubud */
    {
        hotelName: 'Four Seasons Sayan',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سويت دوبلكس', 'سويت من غرفة نوم واحدة', 'فاميلي سويت', 'فيلا من غرفة نوم واحدة', 'فيلا سايان', 'فيلا من غرفتين نوم', 'رويال فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Komaneka Tanggayuda',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا فالي', 'فيلا بريمير فالي'],
    },
    {
        hotelName: 'Samsara Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا ديلوكس من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Tejaprana Resort & Spa',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا تراس', 'فيلا فالي', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'K Club',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا لوكسري من غرفة نوم واحدة', 'خيمة سانشوال هانجين من غرفة نوم واحدة', 'فيلا لوكسري من غرفتين نوم', 'فيلا لوكسري من ثلاث غرف نوم', 'فيلا لوكسري من اربع غرف نوم', 'فيلا رويال من اربع غرف نوم', 'فيلا رويال من خمس غرف نوم'],
    },
    {
        hotelName: 'Ulaman Eco Luxury',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'ديلوكس سويت', 'فيلا ليك', 'سكاي فيلا', 'Cocoon upper deluxe', 'جراند روم'],
    },
    {
        hotelName: 'Aksari Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا جراند رويال من غرفة نوم واحدة', 'فيلا جراند رويال على النهر من غرفة نوم واحدة', 'فيلا جراند رويال من غرفتين نوم', 'جراند اكساري سويت', 'اكساري سويت', 'سويت دبل', 'سويت توين'],
    },
    {
        hotelName: 'Amarea Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['اوبود روم', 'سويت اوبود مع حوض إستحمام', 'كوخ اوبود مع حوض إستحمام', 'كوخ جراند مع حوض إستحمام', 'فيلا ذكية من غرفة نوم واحدة مع حوض إستحمام', 'فيلا جراند لوفت من غرفتين نوم'],
    },
    {
        hotelName: 'Asvara Villa',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا رويال من غرفة نوم واحدة مع جاكوزي', 'فيلا جراند من غرفة نوم واحدة مع جاكوزي', 'فيلا رويال من غرفتين نوم مع جاكوزي'],
    },
    {
        hotelName: 'Kaamala Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا جراند رويال من غرفة نوم واحدة', 'فيلا جراند رويال من غرفتين نوم', 'جراند سويت', 'سويت'],
    },
    {
        hotelName: 'Natya Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا فاميلي', 'فيلا رويال', 'فيلا لوكسري'],
    },
    {
        hotelName: 'Padma Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['بريمير روم', 'بريمير ديلوكس روم', 'برمير اوفرسايز توين', 'بريمير كلوب روم', 'سويت من غرفة نوم واحدة', 'سويت من غرتين نوم', 'فاميلي سويت'],
    },
    {
        hotelName: 'Seres Spring',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس بول اكسس', 'بريميوم روم', 'بريميوم بول اكسس', 'فيلا اناندا من غرفة نوم واحدة العلوية', 'فيلا اناندا من غرفة نوم واحدة المنخفضة', 'فيلا سوتيرا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'The Westin Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس بول اكسس', 'جونيور سويت', 'سويت تنفيذي'],
    },
    {
        hotelName: 'Black Penny',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا ديلوكس من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Dedary Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة مع حوض سباحة', 'فيلا جاردن من غرفة نوم واحدة مع حوض سباحة', 'فيلا من غرفتين نوم مع حوض سباحة'],
    },
    {
        hotelName: 'Komaneka Rasa Sayang',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['ديلوكس روم', 'فيلا روفتوب جاردن', 'فيلا روفتوب جاردن من غرفتين نوم'],
    },
    {
        hotelName: 'Nau Villa',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'لوكسري من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Tanadewa Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سكاي سويت', 'فيلا كورتيارد', 'سويت جراند تانداوا من غرفتين نوم'],
    },
    {
        hotelName: 'Bubble Bali',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سويت مع حوض إستحمام سبا'],
    },
    {
        hotelName: 'Padma Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['بريمير روم', 'بريمير دلوكس روم', 'بريمير اوفرسايز توين', 'بريمير كلوب روم', 'سويت من غرفة نوم واحدة', 'سويت من غرفتين نوم', 'فاميلي سويت'],
    },
    {
        hotelName: 'Kappa Senses Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'E Sanctuary Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا لوكسري من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Element by Westin Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['ديلوكس روم'],
    },
    {
        hotelName: 'Abisena Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['ريفر سويت', 'فالي سويت', 'تيراس فيلا', 'فيلا الغابة', 'ابيسينا رويال سويت'],
    },

    {
        hotelName: 'Nandini Jungle',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'سويت من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Inara Alas Harum',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['إنارا روم', 'سويت', 'سويت كورنر', 'سويت دوبلكس', 'فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Hanging Garden of Bali',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا ريفرسايد من غرفة نوم واحدة', 'سويت سبا', 'فيلا بانوراميك', 'فيلا هانجنج جاردن', 'فيلا فاميلي'],
    },

    {
        hotelName: 'AnandaDara Ubud Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سويت روم', 'بريمير سويت', 'فاميلي سويت', 'فيلا رايسفيلد مع اونسن', 'فيلا روفتوب', 'فيلا بانوراميك بينتهاوس'],
    },
    {
        hotelName: 'Como Uma Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['اوبود روم'],
    },
    {
        hotelName: 'Sanctoo Suites And Villas',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سانتاكو سويت', 'سويت بول اكسس', 'بانوراميك سويت', 'ريسيدنتيال سويت', 'فاميلي سويت', 'جاردن فيلا من غرفة نوم واحدة', 'ريفرسايد فيلا من غرفة نوم واحدة', '', '', '', ''],
    },
    {
        hotelName: 'Anantara Ubud Bali Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['بريمير روم', 'فوريست فيو روم', 'بايانغان سويت', 'فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'Visesa Ubud Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['جنغل سويت', 'ريفر فالي سويت', 'فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا لاجون انفينيتي من غرفتين نوم', 'فيلا سكاي من غرفتين نوم'],
    },
    {
        hotelName: 'The Royal Pita Maha',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['ديلوكس فيلا', 'رويال فيلا', 'ايونق هيلنج فيلا'],
    },
    {
        hotelName: 'Maar Resort Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة مع جاكوزي', 'جراند فيلا من غرفة نوم واحدة', 'فاميلي سويت روم', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'Adiwana Suweta',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['اديوانا روم', 'سويت روم', 'فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Equipoise Resort Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Impiana Private Villas Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سويت', 'ديلوكس سويت', 'جاردن فيلا', 'ريفرسايد فيلا'],
    },
    {
        hotelName: 'Bambootel Sawah View',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سويت بول اكسس', 'ديلوكس سويت جاكوزي', 'سكاي فيلا من غرفة نوم واحدة', 'فيلا من غرفة نوم واحدة', 'ساواه فيو فيلا', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'The Sebali Resort Ubud',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم مع صالة'],
    },
    {
        hotelName: 'The Lumbung Jaya Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اوبود',
        hotelRoomTypes: ['سويت من غرفة نوم واحدة', 'فيلا من غرفة نوم واحدة', 'فيلا روفتوب من غرفة نوم واحدة'],
    },










    /* Nusa Dua */
    {
        hotelName: 'The Apurva Kempinski',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['جراند ديلوكس روم', 'جراند ديلوكس اوشن كورت', 'جراند ديلوكس لاجون روم', 'جناح كليف جونيور', 'فيلا سنجاساري من غرفة نوم واحدة', 'فيلا سريواجايا من غرفتين نوم', 'اوشن فرونت جونيور سويت'],
    },
    {
        hotelName: 'Ulu Segara',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['اوشن سويت روم', 'سويت بريس', 'فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Merusaka Nusa Dua',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس بول اكسس', 'سويت روم', 'سويت اوشن روم', 'سويت من غرفتين نوم', 'فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'The Nest Nusa Dua',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['ديلوكس روم', 'سويت روم', 'جناح تنفيذي'],
    },
    {
        hotelName: 'Agranusa Villa',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Renaissance Nusa Dua',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['ديلوكس روم'],
    },
    {
        hotelName: 'Sofitel Nusa Dua',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['لوكسري روم', 'لوكسري روم بول اكسس', 'سويت بيستينج', 'فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Courtyard Nusa Dua',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['ديلوكس بلكوني', 'بريميوم ديلوكس بلكوني', 'ديلوكس روم بول اكسس', 'فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Tanadewa Nusa Dua',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'Conrad Bali',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس لاجون اكسس', 'كونراد سويت', 'سويت ماجهة للمحيط'],
    },
    {
        hotelName: 'Hilton Bali',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['ديلوكس جاردن روم', 'ديلوكس اوشن روم', 'ديلوكس كليف اوشن روم'],
    },
    {
        hotelName: 'Holiday Inn Nusa Dua',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['ستاندرد روم', 'بريميوم روم', 'بريميوم روم مقابل المحيط', 'ستاندرد روم بول اكسس', 'كيدس ادفانتشور سويت', 'فاميلي ادفانتشور سويت'],
    },
    {
        hotelName: 'Grand Mirage Resort Bali',
        hotelLocation: 'بالي',
        hotelArea: 'نوسا دوا',
        hotelRoomTypes: ['بريمير جاردن', 'بريميوم اوشن', 'سويت روم'],
    },





    /* Seminyak */
    {
        hotelName: 'The Trans Bali',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['بريمير روم', 'بريمير اولتومنت', 'بريمير كلوب روم', 'فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Indigo Bali',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['ستاندرد روم', 'ستاندرد كورتيارد اكسس', 'سويت روم', 'فيلا وانجسا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Sini Vie Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا ذكية من غرفة نوم واحدة مع جاكوزي', 'فيلا جراند ذكية مع جاكوزي'],
    },
    {
        hotelName: 'Impiana Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم', 'فيلا من خمس غرف نوم'],
    },
    {
        hotelName: 'W Bali',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['سوبريور روم', 'بريمير روم مواجهة للمحيط', 'فيلا اويسس من غرفة نوم واحدة', 'فيلا اويسس من غرفتين نوم'],
    },
    {
        hotelName: 'Aleva Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا رويال من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Monolocale Resort',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا رويال من غرفة نوم واحدة', 'فيلا جراند من غرفة نوم واحدة', 'سويت سمنياك دبل', 'سويت سمنياك توين'],
    },
    {
        hotelName: 'Ize Seminyak',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس جاكوزي', 'كلوب روم', 'جونيور سويت'],
    },
    {
        hotelName: 'Aksari Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا رويال ذكية من غرفة نوم واحدة مع حوض إستحمام'],
    },
    {
        hotelName: 'Astera Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة مع حوض إستحمام'],
    },
    {
        hotelName: 'Ayona Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة وحوض إستحمام', 'فيلا جراند من غرفة نوم واحدة وحوض إستحمام'],
    },
    {
        hotelName: 'Cyrus Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة وحوض إستحمام', 'فيلا جراند من غرفة نوم واحدة وحوض إستحمام'],
    },
    {
        hotelName: 'Double Six Luxury',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['سويت ليجور', 'سويت ديلوكس', 'سويت بريمير بول اكسس', 'سويت ليجور من غرفتين نوم', 'سويت ديلوكس من غرفتين نوم'],
    },
    {
        hotelName: 'Potato Head Suites',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['ستوديو شروق الشمس', 'بامبو ستوديو', 'ديسا ستوديو', 'ريسيدينت ستوديو', 'ستوديو مواجهة للمحيط', 'سويت ذا ايلاند', 'سويت روفتوب'],
    },
    {
        hotelName: 'Sana Vie Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا ذكية من غرفة نوم واحدة مع حوض إستحمام', 'فيلا رويال ذكية من غرفة نوم واحدة مع حوض إستحمام', 'فيلا من غرفتين نوم مع حوض إستحمام'],
    },
    {
        hotelName: 'The Claremont Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Elysian Boutique Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'The Samaya Seminyak',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا رويال كورتيارد من غرفة نوم واحدة', 'فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Aloft Seminyak',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['الوفت روم', 'الوفت بلكوني روم'],
    },
    {
        hotelName: 'La Mira Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا رويال من غرفة نوم واحدة مع زحليقة مائية', 'فيلا رويال من غرفتين نوم مع زحليقة مائية', 'فيلا رويال من ثلاث غرف نوم مع زحليقة مائية وحوض إستحمام'],
    },
    {
        hotelName: 'Seminyak Sanctuary',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا جراند من غرفة نوم واحدة وحوض إستحمام'],
    },
    {
        hotelName: 'Kolila Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Courtyard Seminyak',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['ديلوكس روم'],
    },
    {
        hotelName: 'Eight Palms Villa',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفتين نوم وحوض إستحمام', 'فيلا من ثلاث غرف نوم وحوض إستحمام', 'فيلا رويال من ثلاث غرف نوم وجاكوزي', 'فيلا رويال من ثلاث غرف نوم مع زحليقة مائية وجاكوزي'],
    },
    {
        hotelName: 'Maharaja Villas Seminyak',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا سوبريور من غرفة نوم واحدة', 'فيلا ديلوكس من غرفة نوم واحدة', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'Je Ne Sais Quoi Seminyak',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Grand Mercure Seminyak',
        hotelLocation: 'بالي',
        hotelArea: 'سيمنياك',
        hotelRoomTypes: ['ديلوكس روم'],
    },









    /* Kuta */
    {
        hotelName: 'Sheraton Kuta',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['جيست روم', 'جونيور سويت', 'سويت مواجهة للمحيط', 'لارجر سويت مواجهة للمحيط'],
    },
    {
        hotelName: 'Aryaduta Kuta',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['سوبريور روم', 'ديلوكس روم', 'جراند ديلوكس روم', 'بريمير روم'],
    },
    {
        hotelName: 'Tribe Kuta',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['ترايب كومفورت بلكوني', 'ترايب كومفورت XL بلكوني', 'ترايب كومفورت بدون بلكوني'],
    },
    {
        hotelName: 'Aloft Kuta',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['الوفت'],
    },
    {
        hotelName: 'Paasha Atelier',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['سوبريور روم', 'دوبلكس روم', 'جونيور سويت', 'سويت دوبلكس'],
    },
    {
        hotelName: 'Mamaka By Ovolo',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['بالي هاي روم', 'كوكومو روم', 'سمر جاردين تراس', 'سواجر سويت'],
    },
    {
        hotelName: 'Beachwalk Residence',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['ريسيدينس من غرفتين نوم', 'سويت من غرفتين نوم', 'ريسيدينس من ثلاث غرف نوم', 'سويت من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Discovery Kartika Plaza',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس جاردن اكسس', 'جاردن ديلوكس مواجهة للمحيط', 'جونيور سويت', 'فاميلي سويت', 'ديسكوفيري سويت'],
    },
    {
        hotelName: 'Ramayana Suites',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['جاردن ديلوكس روم', 'بريمير روم', 'جونيور سويت روم', 'ريسورت روم', 'فاميلي روم', 'سويت لومبونغ', 'سويت من غرفة نوم واحدة', 'فاميلي سويت متصل ببعض', 'سويت من غرفتين نوم', 'سيتا سويت'],
    },
    {
        hotelName: 'The Anvaya Beach',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['ديلوكس روم', 'بريمير روم'],
    },
    {
        hotelName: 'Fairfield Marriott',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['سوبريور روم', 'سوبريور بلكوني', 'ديلوكس روم', 'جونيور سويت'],
    },
    {
        hotelName: 'Holiday Inn Express Baruna',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['غرفة ستاندرد'],
    },
    {
        hotelName: 'Holiday Inn Resort Baruna',
        hotelLocation: 'بالي',
        hotelArea: 'كوتا',
        hotelRoomTypes: ['غرفة ستاندرد', 'غرفة ستاندرد جاردن', 'بريمير بول جاردن', 'غرفة بريمير اوشن', 'سويت روم'],
    },








    /* Jimbaran */
    {
        hotelName: 'Four Seasons Jimbaran',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['فيلا جاردن', 'فيلا جيمبران باي', 'فيلا ديلوكس', 'فيلا بريمير اوشن', 'فيلا فاميلي بريمير', 'فيلا جاردن من غرفتين نوم', 'فيلا جيماران باي من غرفتين نوم', 'فيلا بريمير اوشن بغرفتين نوم', 'فيلا رويال بغرفتين نوم', 'فيلا امبراطورية من ثلاث غرف نوم', 'فيلا جاردن ريسيدنس من غرفتين نوم', 'فيلا ريسيدنس من ثلاث غرف نوم', 'فيلا ريسيدنس من اربع غرف نوم'],
    },
    {
        hotelName: 'Movenpick Jimbaran',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['كلاسيك روم', 'جونيور سويت', 'فاميلي دوبلاكس روم', 'بريميوم سويت', 'جيمباران سويت'],
    },
    {
        hotelName: 'Platinum Jimbaran',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['بزنس روم', 'ديلوكس روم', 'جيمباران روم', 'اوشن روم', 'ديلوكس فاميلي', 'سويت تنفيذي', 'بنتهاوس'],
    },
    {
        hotelName: 'Le Meridien Jimbaran',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['كلاسيك روم', 'ديلوكس لاجون اكسس', 'اكوا سويت ستوديو لاجون فيو', 'اكوا سويت استوديو لاجون اكسس', 'اكوا بول سكاي بنتهاوس', 'فيلا سكاي'],
    },
    {
        hotelName: 'Intercontinental Bali',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['كلاسيك بلكوني', 'Classic Singaraja Space Access', 'Premium Mezzanine Singaraja Space Access', 'Premium Club Lounge Access Balcony', 'Premium Mezzanine Area Club Lounge Access Balcony', 'Suite Club Lounge Access'],
    },
    {
        hotelName: 'Ayana Segara Bali',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['ريسورت فيو روم', 'جيمباران باي روم', 'اوشن فيو روم', 'ريسورت فيو سويت', 'اوشن فيو من غرفتين نوم', 'اوشن فيو ريسيدينس من غرفة نوم واحدة', 'اوشن فيو ريسيدينس من غرفتين نوم'],
    },
    {
        hotelName: 'Ayana Resort Bali',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['ريسورت فيو روم', 'جيمباران باي روم', 'اوشن فيو روم', 'اوشن فيو سويت', 'ريسورت فيو من غرفتين نوم', 'اوشن فيو من غرفتين نوم', 'اوشن فيو سويت من غرفتين نوم'],
    },
    {
        hotelName: 'Ayana Villas Bali',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['فيلا اوشن فيو من غرفة نوم واحدة', 'فيلا اوشن فرونت من غرفة نوم واحدة', 'فيلا اوشن فيو من غرفتين نوم', 'فيلا اوشن فرونت من غرفتين نوم'],
    },
    {
        hotelName: 'Rimba Ayana Bali',
        hotelLocation: 'بالي',
        hotelArea: 'جيمباران',
        hotelRoomTypes: ['ريسورت فيو روم', 'جيمباران باي روم', 'بوول اكسس روم', 'ريسورت فيو سويت', 'بوول اكسس سويت', 'ريسورت فيو من غرفتين نوم', 'ريسورت فيو سويت من غرفتين نوم', 'وآنا ريسورت فيو يوم', 'وآنا جاردن فيو روم', 'وآنا اوشن فيو روم', 'وآنا بوول اكسس روم', 'وآنا ريسورت فيو من غرفتين نوم', 'وآنا اوشن فيو من غرفتين نوم'],
    },







    /* Uluwatu */
    {
        hotelName: 'Umana Bali',
        hotelLocation: 'بالي',
        hotelArea: 'اولواتو',
        hotelRoomTypes: ['فيلا تروبيكال جاردن من غرفة نوم واحدة', 'فيلا من غرفة نوم واحدة', 'فيلا اوشن من غرفة نوم واحدة', 'فيلا بانوراميك اوشن من غرفة نوم واحدة', 'فيلا تروبيكال جاردن من غرفتين نوم', 'فيلا من غرفتين نوم', 'فيلا اوشن من غرفتين نوم', 'فيلا بانوراميك اوشن من غرفتين نوم'],
    },
    {
        hotelName: 'Jumeirah Bali',
        hotelLocation: 'بالي',
        hotelArea: 'اولواتو',
        hotelRoomTypes: ['فيلا جاردن', 'فيلا غروب الشمس', 'فيلا بريمير جاردن', 'فيلا اوشن من غرفة نوم واحدة', 'فيلا جاردن من غرفتين نوم', 'فيلا اوشن من غرفتين نوم'],
    },
    {
        hotelName: 'Renaissance Uluwatu',
        hotelLocation: 'بالي',
        hotelArea: 'اولواتو',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس اوشن بلكوني', 'ديلوكس اوشن تراس', 'جونيور سويت', 'سويت تنفيذي'],
    },
    {
        hotelName: 'Six Senses Uluwatu',
        hotelLocation: 'بالي',
        hotelArea: 'اولواتو',
        hotelRoomTypes: ['سكاي سويت', 'فيلا كليف من غرفة نوم واحدة', 'سكاي بينتهاوس سويت من غرفتين نوم', 'فيلا كليف من غرفين نوم', 'فيلا كليف من ثلاث غرف نوم', 'بريزيدنتيال فيلا', 'ذا ريتريت'],
    },
    {
        hotelName: 'Anantara Uluwatu Bali Resort',
        hotelLocation: 'بالي',
        hotelArea: 'اولواتو',
        hotelRoomTypes: ['سويت', 'انانتارا سويت', 'سويت مقابل للمحيط', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'ديداري بنتهاوس من غرفة نوم واحدة', 'ديواتا بنتهاوس من غرفتين نوم'],
    },












    /* Legian */
    {
        hotelName: 'La Vie Villa',
        hotelLocation: 'بالي',
        hotelArea: 'ليجين',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة وحوض إستحمام', 'فيلا رويال من غرفة نوم واحدة وحوض إستحمام'],
    },
    {
        hotelName: 'Padma Legian',
        hotelLocation: 'بالي',
        hotelArea: 'ليجين',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس شاليه', 'جاردن كلوب شاليه', 'بريمير دبل دبل'],
    },
    {
        hotelName: 'Ini Vie Villa',
        hotelLocation: 'بالي',
        hotelArea: 'ليجين',
        hotelRoomTypes: ['فيلا رويال من غرفة نوم واحدة وجاكوزي', 'فيلا من غرفتين نوم وجاكوزي'],
    },













    /* Jakarta */
    {
        hotelName: 'Raffles Jakarta',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['رافيلز روم', 'سيجنتشور روم', 'سويت ارتيست', 'سويت جالوري'],
    },
    {
        hotelName: 'Ascott Jakarta',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ستوديو بريمير', 'بريمير روم من غرفة نوم واحدة', 'تنفيذي روم من غرفتين نوم', 'بريمير روم من غرفتين نوم', 'بريمير روم من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Citadines Sudirman',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ستوديو تنفيذي', 'ديلوكس روم من غرفة نوم واحدة', 'تنفيذي روم من غرفة نوم واحدة', 'فاميلي سويت', 'ديلوكس روم من غرفتين نوم', 'تنفيذي روم من غرفتين نوم', 'بريمير سويت من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Citadines Gatot Jakarta',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ستوديو سويت', 'سويت تنفيذي من غرفة نوم واحدة', 'ديلوكس روم من غرفتين نوم', 'تنفيذي روم من غرفتين نوم', 'تنفيذي روم من ثلاث غرف نوم'],
    },
    {
        hotelName: 'DoubleTree Hilton',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['جيست روم', 'ديلوكس روم', 'جناح كينغ تنفيذي'],
    },
    {
        hotelName: 'Parkroyal Serviced Suites',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['سويت ستوديو', 'سويت من غرفة نوم واحدة', 'سويت ديلوكس من غرفة نوم واحدة', 'سويت بريمير من غرفة نوم واحدة', 'سويت تنفيذي من غرفة نوم واحدة', 'سويت ديلوكس من غرفتين نوم'],
    },
    {
        hotelName: 'Somerset Sudirman',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['تنفيذي روم', 'ستوديو تنفيذي', 'ستوديو بريمير', 'سويت تنفيذي', 'تنفيذي من غرفة نوم واحدة', 'بريمير من غرفة نوم واحدة', 'كلوب من غرفتين نوم', 'كلاسيك من غرفتين نوم'],
    },
    {
        hotelName: 'Aloft Wahied Hasiem',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['الوفت روم'],
    },
    {
        hotelName: 'Ascott Sudirman',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ستوديو بريمير', 'بريمير من غرفة نوم واحدة', 'بريمير من غرفتين نوم', 'بريمير من ثلاث غرف نوم', 'ديلوكس روم', 'سويت روم'],
    },
    {
        hotelName: 'Kempinski Jakarta',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['جراند ديلوكس', 'ديلوكس', 'جراند ديلوكس تنفيذي', 'سويت صالون'],
    },
    {
        hotelName: 'Pullman Park',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ديلوكس روم', 'ديلوكس تنفيذي مع امكانية الوصول الى الصالة التنفيذية', 'سويت تنفيذي روم', 'سويت تنفيذي مع امكانية الوصول الى الصالة التنفيذية'],
    },
    {
        hotelName: 'Vertu Harmoni',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ڤي روم', 'فيرتو روم', 'فيرتو تنفيذي روم', 'فيرتو سويت'],
    },
    {
        hotelName: 'Pan Pacific',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ديلوكس من غرفة نوم واحدة', 'بريمير من غرفة نوم واحدة', 'تنفيذي روم', 'باسيفيك كلوب ديلوكس', 'باسيفيك كلوب بريمير', 'باسيفيك كلوب تنفيذي', 'جونيور سويت', 'بريمير سويت', 'بان باسيفيك سويت'],
    },
    {
        hotelName: 'Ascott Kuningan',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['التنفيذي من غرفة نوم واحدة', 'بريمير من غرفة نوم واحدة', 'بريمير من غرفتين نوم', 'بريمير من ثلاث غرف نوم', 'ديلوكس روم', 'سويت روم'],
    },
    {
        hotelName: 'Grand Mercure',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['سوبريور روم', 'ديلوكس روم', 'ديلوكس كورنر روم', 'سويت بزنس روم', 'سويت تنفيذي', 'بنتهاوس'],
    },
    {
        hotelName: 'Sheraton Soekarno',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ديلوكس جاردن'],
    },
    {
        hotelName: 'Grove Suites',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['سويت من غرفة نوم واحدة', 'سويت من غرفتين نوم'],
    },
    {
        hotelName: 'FM7 Tangerang',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['سوبريور روم', 'ديلوكس روم', 'ديلوكس بلس', 'بريمير روم', 'بريمير فاميلي', 'جونيور سويت'],
    },
    {
        hotelName: 'Harris Hotel',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['هاريس يونيكيو من غرفة نوم واحدة', 'ديلوكس روم'],
    },
    {
        hotelName: 'Le Meridien Jakarta',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ديلوكس روم'],
    },
    {
        hotelName: 'Mulia Senayan',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['جرانديور روم', 'جرانديور ديلوكس روم', 'سيجناشور روم', 'تنفيذي روم', 'جونيور سويت'],
    },
    {
        hotelName: 'Hotel Indonesia Kempinski',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['ديلوكس روم', 'جرانديور ديلوكس روم', 'سيجناشور روم', 'تنفيذي روم', 'جونيور سويت'],
    },
    {
        hotelName: 'Merlynn Park',
        hotelLocation: 'جاكرتا',
        hotelRoomTypes: ['تنفيذي روم', 'تيفاني سويت', 'فاميلي سويت', 'برادا سويت', 'بولجاري سويت', 'ارماني سويت', 'مرليان سويت', 'ذا ريسيدينس', 'امباير مينشن'],
    },









    /* Puncak */
    {
        hotelName: 'Grand Aston',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['ديلوكس روم', 'جراند روم', 'ديلوكس بريمير', 'جراند بول أكسس', 'ديلوكس بانوراميك', 'جونيور سويت', 'جونيور سويت بول أكسس', 'سويت تنفيذي'],
    },
    {
        hotelName: 'Le Eminence',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['جونيور سويت', 'سويت تنفيذي', 'رويال سويت', 'ايميننس سويت'],
    },
    {
        hotelName: 'Botanica Sanctuary',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['سوبريور روم', 'ديلوكس روم', 'برمير روم', 'ذا فالي سويت'],
    },
    {
        hotelName: 'Pesona Alam',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['ديلوكس روم', 'فيلا من غرفة نوم واحدة', 'فيلا سوبريور من غرفتين نوم', 'فيلا من ثلاث غرف نوم'],
    },
    {
        hotelName: 'Villa Marina',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم', 'فيلا من خمس غرف نوم'],
    },
    {
        hotelName: 'Villa Neom',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من ثلاث غرف نوم', 'فيلا من غرفتين نوم'],
    },
    {
        hotelName: 'Alandalus Puncak',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم', 'فيلا من خمس غرف نوم', 'فيلا ديلوكس من اربع غرف نوم'],
    },
    {
        hotelName: 'Alandalus Royal',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من ثلاث غرف نوم', 'فيلا ديلوكس من اربع غرف نوم', 'فيلا سوبريور من خمس غرف نوم'],
    },
    {
        hotelName: 'Aljumeirah Puncak',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم', 'فيلا من خمس غرف نوم'],
    },
    {
        hotelName: 'Marseillia Puncak',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم', 'فيلا من خمس غرف نوم'],
    },
    {
        hotelName: 'Villa London',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم', 'فيلا من خمس غرف نوم', 'فيلا من تسع غرف نوم'],
    },
    {
        hotelName: 'Villa Alwaha',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم', 'فيلا من خمس غرف نوم'],
    },
    {
        hotelName: 'Armada Puncak',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا سوبريور من خمس غرف نوم'],
    },
    {
        hotelName: 'Mahha Dii Meru Resort',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['كيف ادج', 'فوريست فيلا'],
    },
    {
        hotelName: 'Divan Hills Resort',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم'],
    },
    {
        hotelName: 'Villa Aura Puncak',
        hotelLocation: 'بونشاك',
        hotelRoomTypes: ['فيلا من غرفتين نوم', 'فيلا من ثلاث غرف نوم', 'فيلا من اربع غرف نوم'],
    },










    /* Bandung */
    {
        hotelName: 'Courtyard Bandung',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['ديلوكس روم', 'بريمير روم', 'سويت تنفيذي', 'بريمير سويت', 'كوربورات سويت', 'كورتيارد سويت', 'رويال سويت'],
    },
    {
        hotelName: 'Sheraton Bandung',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['ديلوكس روم', 'تنفيذي روم', 'تاور روم', 'جونيور سويت', 'سويت تنفيذي', 'سويت تاور'],
    },
    {
        hotelName: 'The Trans Luxury',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['بريمير روم'],
    },
    {
        hotelName: 'Four Points Sheraton',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['كلاسيك روم', 'بريميوم روم', 'ديلوكس روم', 'سويت تنفيذي', 'بريمير سويت'],
    },
    {
        hotelName: 'Oakwood Merdeka Bandung',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['سوبريور روم', 'ديلوكس روم', 'بريمير روم'],
    },
    {
        hotelName: 'The Papandayan',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['كلاسيك روم', 'بريمير روم', 'امباستور روم', 'سويت روم'],
    },
    {
        hotelName: 'Hotel Indigo Bandung',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['ستاندرد روم', 'بريميوم روم', 'سويت كينج'],
    },
    {
        hotelName: 'InterContinental Bandung',
        hotelLocation: 'باندونق',
        hotelRoomTypes: ['كلاسيك روم', 'بريميوم روم', 'كيمبانق فيلا'],
    },









    /* Lombok */
    {
        hotelName: 'Kalandara',
        hotelLocation: 'لومبوك',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'The Kayana Lombok',
        hotelLocation: 'لومبوك',
        hotelRoomTypes: ['فيلا ديلوكس', 'فيلا دوبلكس', 'فيلا من غرفة نوم واحدة', 'فيلا هيل سايد من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Royal Avila Boutique Resort',
        hotelLocation: 'لومبوك',
        hotelRoomTypes: ['اوشن ديلوكس', 'اوشن بريمير', 'اوشن روفتوب', 'اوشن سويت', 'روفتوب سويت', 'ذا بينتهاوس'],
    },
    {
        hotelName: 'Katamaran Resort Lombok',
        hotelLocation: 'لومبوك',
        hotelRoomTypes: ['بريمير', 'بريمير سويت', 'اوشن فيو سويت', 'فيلا تروبيكال من غرفة نوم واحدة', 'بريمير كلوب', 'فاميلي سويت من غرفتين نوم', 'سويت اوشن فرونت', 'فيلا تروبيكال من غرفتين نوم', 'Presidential Penthouse', 'رويال بينتهاوس'],
    },









    /* Sanora */
    {
        hotelName: 'Seascape Luxury Resort & Spa',
        hotelLocation: 'بالي',
        hotelArea: 'سانور',
        hotelRoomTypes: ['سويت روم', 'سويت اوشن فيو', 'فيلا من غرفة نوم واحدة', 'فيلا جراند من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Bali Beach Hotel Sanur',
        hotelLocation: 'بالي',
        hotelArea: 'سانور',
        hotelRoomTypes: ['ديلوكس اوشن', 'تنفيذي اوشن', 'سويت تنفيذي اوشن'],
    },
    {
        hotelName: 'The Meru Sanur',
        hotelLocation: 'بالي',
        hotelArea: 'سانور',
        hotelRoomTypes: ['تروبيكال سويت', 'تروبيكال جاردن سويت', 'كورنر تروبيكال سويت', 'بريمير تروبيكال سويت'],
    },









    /* Canggu */
    {
        hotelName: 'Ayona Villa Canggu',
        hotelLocation: 'بالي',
        hotelArea: 'تشانغو',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'جراند فيلا من غرفة نوم واحدة', 'سكاي فيلا من غرفة نوم واحدة'],
    },
    {
        hotelName: 'Regent Resort Canggu',
        hotelLocation: 'بالي',
        hotelArea: 'تشانغو',
        hotelRoomTypes: ['ستوديو سويت', 'ستوديو سويت لاجون اكسس', 'سويت من غرفة نوم واحدة', 'سويت لاجون اكسس من غرفة نوم واحدة', 'كورنر سويت من غرفة نوم واحدة', 'كورنر سويت لاجون اكسس من غرفة نوم واحدة', 'سويت من غرفتين نوم', 'سويت لاجون اكسس من غرفتين نوم', 'فيلا من غرفة نوم واحدة', 'فيلا من غرفة نوم واحدة مقابلة للشاطئ', 'بنتهاوس من غرفتين نوم مقابلة للمحيط'],
    },
    {
        hotelName: 'Holiday Inn Resort Canggu',
        hotelLocation: 'بالي',
        hotelArea: 'تشانغو',
        hotelRoomTypes: ['بريميوم بلكوني'],
    },








    /* Tabanan */
    {
        hotelName: 'Nandini Jungle',
        hotelLocation: 'بالي',
        hotelArea: 'تابانان',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'ديلوكس سويت', 'فيلا ليك', 'سكاي فيلا', 'Cocoon Upper Deluxe', 'جراند لاجون'],
    },










    /* Tampaksiring */
    {
        hotelName: 'Eco Six Bali',
        hotelLocation: 'بالي',
        hotelArea: 'Tampaksiring',
        hotelRoomTypes: ['فيلا من غرفة نوم واحدة', 'فيلا من غرفتين نوم'],
    },
];
