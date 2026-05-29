/* Hotel room-type data — fetched from Supabase indo_hotel_room_types table.
   allHotelDataArray is used by create-new-package-setup.js and
   create-new-package-insert-data.js exactly as the old static array was. */

let allHotelDataArray = [];

async function fetchAndStoreHotelData() {
    // Wait for the Supabase client to be ready
    while (!window.supabase || typeof window.supabase.from !== 'function') {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const { data, error } = await window.supabase
        .from('indo_hotel_room_types')
        .select('hotel_name, hotel_location, room_types')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching hotel data:', error);
        return;
    }

    allHotelDataArray = data.map(row => ({
        hotelName: row.hotel_name,
        hotelLocation: row.hotel_location,
        hotelRoomTypes: Array.isArray(row.room_types)
            ? row.room_types.map(rt => (rt && typeof rt === 'object' ? rt.en : rt) || '')
            : []
    }));
}

fetchAndStoreHotelData();
