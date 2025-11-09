// Function to populate company names dropdown from all-company-and-hotel-names.js
function populateCompanyNamesDropdown() {
    // Get the container div
    const container = document.querySelector('#company_names_dropdown .company_names_options_dropdown_class');
    
    if (!container) {
        console.error('Company names dropdown container not found');
        return;
    }

    // Clear any existing content
    container.innerHTML = '';

    // Check if companyNames array exists
    if (typeof companyNames === 'undefined') {
        console.error('companyNames array not found. Make sure all-company-and-hotel-names.js is loaded.');
        return;
    }

    // Loop through companyNames and create h3 elements
    companyNames.forEach(company => {
        const h3 = document.createElement('h3');
        h3.textContent = company.name;

        // Add company_by_value attribute if it exists
        if (company.company_by_value) {
            h3.setAttribute('company_by_value', company.company_by_value);
        }

        // Add red color style for "حذف" (delete)
        if (company.name === 'حذف') {
            h3.style.color = 'red';
        }

        container.appendChild(h3);
    });
}

// Function to populate hotel names dropdown from all-company-and-hotel-names.js
function populateHotelNamesDropdown() {
    // Get the container div
    const container = document.querySelector('#all_hotel_names_dropdown .company_names_options_dropdown_class');
    
    if (!container) {
        console.error('Hotel names dropdown container not found');
        return;
    }

    // Clear any existing content
    container.innerHTML = '';

    // Check if hotelNames array exists
    if (typeof hotelNames === 'undefined') {
        console.error('hotelNames array not found. Make sure all-company-and-hotel-names.js is loaded.');
        return;
    }

    // Loop through hotelNames and create h3 elements
    hotelNames.forEach(hotel => {
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