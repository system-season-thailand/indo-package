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

// Function to populate hotel names dropdown.
// Pass a names array (strings) to use DB data; omit to fall back to the static hotelNames array.
function populateHotelNamesDropdown(names) {
    const container = document.querySelector('#all_hotel_names_dropdown .company_names_options_dropdown_class');

    if (!container) {
        console.error('Hotel names dropdown container not found');
        return;
    }

    const source = names || (typeof hotelNames !== 'undefined' ? hotelNames : []);

    container.innerHTML = '';

    source.forEach(hotel => {
        const h3 = document.createElement('h3');
        h3.textContent = hotel;
        container.appendChild(h3);
    });
}

// Populate both dropdowns when the DOM is ready
function populateDropdowns() {
    populateCompanyNamesDropdown();
    populateHotelNamesDropdown();
}
