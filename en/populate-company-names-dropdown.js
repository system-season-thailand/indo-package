/* ── Company names dropdown ── */
async function populateCompanyNamesDropdown() {
    const container = document.querySelector('#company_names_dropdown .company_names_options_dropdown_class');

    if (!container) {
        console.error('Company names dropdown container not found');
        return;
    }

    container.innerHTML = '';

    // Wait for the Supabase client to be ready
    while (!window.supabase || typeof window.supabase.from !== 'function') {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const { data, error } = await window.supabase
        .from('all_company_names')
        .select('name, company_by_value')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching company names:', error);
        return;
    }

    data.forEach(company => {
        const h3 = document.createElement('h3');
        h3.textContent = company.name;

        if (company.company_by_value) {
            h3.setAttribute('company_by_value', company.company_by_value);
        }

        if (company.name === 'حذف') {
            h3.style.color = 'red';
        }

        container.appendChild(h3);
    });
}


/* ── Hotel names dropdown ── */
async function populateHotelNamesDropdown() {
    const container = document.querySelector('#all_hotel_names_dropdown .company_names_options_dropdown_class');

    if (!container) {
        console.error('Hotel names dropdown container not found');
        return;
    }

    container.innerHTML = '';

    // Wait for the Supabase client to be ready
    while (!window.supabase || typeof window.supabase.from !== 'function') {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    const { data, error } = await window.supabase
        .from('indo_hotel_room_types')
        .select('hotel_name')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching hotel names:', error);
        return;
    }

    data.forEach(row => {
        const h3 = document.createElement('h3');
        h3.textContent = row.hotel_name;
        container.appendChild(h3);
    });
}


/* ── Populate both dropdowns on load ── */
function populateDropdowns() {
    populateCompanyNamesDropdown();
    populateHotelNamesDropdown();
}
