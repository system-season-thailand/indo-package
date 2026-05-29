/* Hotel benefits / important messages — fetched from Supabase indo_hotel_benefits table.
   hotelMessageInfoArray is used by create-new-package-setup.js when a hotel name
   is selected from the dropdown to display any important notes. */

let hotelMessageInfoArray = [];

async function fetchAndStoreHotelBenefits() {
    // Wait for the Supabase client to be ready
    while (!window.supabase || typeof window.supabase.from !== 'function') {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const { data, error } = await window.supabase
        .from('indo_hotel_benefits')
        .select('hotel_name, benefits')
        .eq('is_hidden', false)
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching hotel benefits:', error);
        return;
    }

    hotelMessageInfoArray = data.map(row => ({
        hotelName: row.hotel_name,
        messages: row.benefits || []
    }));
}

fetchAndStoreHotelBenefits();
