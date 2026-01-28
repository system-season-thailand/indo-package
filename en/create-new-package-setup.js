/* Function to prevent the page refresh by mistake */
window.addEventListener('beforeunload', function (event) {
    event.preventDefault(); // Prevent the default action
    event.returnValue = ''; // Set the return value to trigger the default browser confirmation dialog
});











/* Function to show the hotels names based on the check out date */
function handleHotelNameInputClick() {
    const checkOutInputValue = document.getElementById('hotel_check_out_input_id').value;
    const checkOutInput = document.getElementById('hotel_check_out_input_id');

    if (checkOutInputValue) {

        // If the check-out input has a value, execute the functions
        showOverlay('all_hotel_names_dropdown');

    } else {

        // Play a sound effect
        playSoundEffect('error');

        // Add the shaking effect and red borders
        checkOutInput.classList.add('shake-border');

        // Set the red border to appear
        checkOutInput.style.border = "2px solid red";

        // Remove the shaking effect and red border after 1 second
        setTimeout(() => {
            checkOutInput.classList.remove('shake-border');
            checkOutInput.style.transition = "border-color 0.3s ease"; // Smooth border color reset
            checkOutInput.style.border = ""; // Reset border
        }, 1000); // Time to shake (1 second)

    }
}



// Function to display the modal
const showCloseSellModal = (messageText) => {
    const modal = document.getElementById("closeSellModal");
    const message = document.getElementById("closeSellMessage");

    // Update the modal text
    message.innerText = messageText;

    // Check if overlay already exists
    let overlay = document.getElementById("closeSellOverlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.classList.add("black_overlay");
        overlay.id = "closeSellOverlay";
        document.body.appendChild(overlay);

        // Force a reflow to trigger transition
        void overlay.offsetWidth;
    }

    // Fade in overlay
    overlay.style.opacity = "1";

    // Show the modal
    modal.style.display = "flex";
    modal.classList.add("show");
    modal.classList.remove("hide");
};



// Function to hide the modal
const closeModal = () => {
    const modal = document.getElementById("closeSellModal");
    const overlay = document.getElementById("closeSellOverlay");


    // Add fade-out class to modal
    modal.classList.add("hide");


    // Fade out the overlay
    if (overlay) overlay.style.opacity = "0";

    setTimeout(() => {
        modal.style.display = "none";
        modal.classList.remove("show");

        // Remove the overlay from the DOM
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 300); // Match the modal's transition duration
};












// Correct password value - update this whenever you want to change the password
let correctPassword = "00season00";

// Array of messages for empty password input attempts
let randomMessages_1 = [
    "تعجبني لمن تتحمس",
    "السيطرة تحت الأمور",
    "حبة حبة الأمور تمشي",
    "لا بس بس كذا كثير",
    "الوضع بدأ يصير خطير",
    "كيف اقدر اخدمك اليوم",
    "يعني اجي اكتب بدالك؟"
];

// Array of messages for empty password input attempts
let randomMessages_2 = [
    "حاول مره ثانية",
    "شكلو مافي فايدة",
    "انا واثق فيك تقدر",
    "اليوم مو يومك",
    "لسى في أمل"
];

window.addEventListener('load', () => {
    let storedUserName = localStorage.getItem('user_name_code');
    if (storedUserName) {
        document.getElementById('website_users_name_input_id').value = storedUserName;
    }


    /* Get the user package unique number */
    if (document.getElementById('website_users_name_input_id').value !== '') {
        handleUserPackageUniqueNumber(document.getElementById('website_users_name_input_id').value, 'fetch');
    }


    updateDataBaseSavedDataNames();

    let storedPassword = localStorage.getItem("websitePass");

    if (storedPassword !== correctPassword) {
        document.getElementById("passwordPrompt").style.display = "flex";
    }



    setTimeout(() => {
        // Make the submit client data button visible and clickable
        let submitIcon = document.getElementById('clint_inputs_submit_icon');
        submitIcon.style.opacity = '1';
        submitIcon.style.pointerEvents = 'auto';
        submitIcon.disabled = false;
    }, 7000);



    /* Run a funtion to apply the company and hotels names h3 elements */
    populateDropdowns();



    /* Code to check the localstorage value to turn on/off the website sounds */
    const checkbox = document.getElementById("mute_website_checkbox"), key = "websiteSound";
    localStorage.getItem(key) ?? localStorage.setItem(key, "on");
    checkbox.checked = localStorage.getItem(key) === "off";
    checkbox.addEventListener("change", () => localStorage.setItem(key, checkbox.checked ? "off" : "on"));
});

function checkPassword() {
    let passwordInput = document.getElementById("passwordInput").value.toLowerCase();
    if (passwordInput === correctPassword) {

        // Play a sound effect
        playSoundEffect('success');

        localStorage.setItem("websitePass", passwordInput);
        document.getElementById("passwordPrompt").style.display = "none";

    } else {

        // Play a sound effect
        playSoundEffect('error');

        localStorage.removeItem("websitePass");

        // Select a random message from the array
        let randomMessage_1 = randomMessages_1[Math.floor(Math.random() * randomMessages_1.length)];
        document.getElementById("i_see_you_pass_box_p_id").innerText = randomMessage_1;

        // Select a random message from the array
        let randomMessage_2 = randomMessages_2[Math.floor(Math.random() * randomMessages_2.length)];
        document.getElementById("who_are_you_pass_box_p_id").innerText = randomMessage_2;
    }
}







(function () {
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function (event) {
            let messages = [
                "يالحبيب هدي شوية وانتبه",
                "من جدك انت؟",
                "لا معليش كذا زوتها",
                "الموقع سهل وبسيط بس لازم تهدي",
                "خلي بالك ترا اشوفك",
                "حبه حبه الامور كلها سهالات",
                "يعني كم مرة لازم اقولك",
                "شغلك نظيف بس ركز شوية",
                "شكلو ماعبجك النظام",
                "لا لا كذا كثير لازم نسوي اجتماع",
                "تعجبني لمن تجيب العيد",
                "توقعتك احسن من كذا",
                "نفسي اعرف ليش مستعجل",
                "بصراحة انا تعبت"
            ];
            // Select a random message
            let randomMessage = messages[Math.floor(Math.random() * messages.length)];
            alert(randomMessage);
        };
    }
})();





/* Code to reload the sounds to make sure there is no latency */
let clickSoundEffect = new Audio('../click.ogg');
clickSoundEffect.preload = 'auto';

let successSoundEffect = new Audio('../success.ogg');
successSoundEffect.preload = 'auto';

let errorSoundEffect = new Audio('../error.ogg');
errorSoundEffect.preload = 'auto';

let isSoundEffectCooldown = false; // Flag to manage cooldown

function playSoundEffect(soundName) {

    if (isSoundEffectCooldown) return; // If in cooldown, do nothing

    isSoundEffectCooldown = true; // Set cooldown
    setTimeout(() => {
        isSoundEffectCooldown = false; // Reset cooldown after 150 milliseconds
    }, 150);

    // Play a sound effect only if the website is not muted
    if (!document.getElementById('mute_website_checkbox').checked) {
        let soundEffect;

        if (soundName === 'click') {
            soundEffect = clickSoundEffect;
        } else if (soundName === 'success') {
            soundEffect = successSoundEffect;
        } else if (soundName === 'error') {
            soundEffect = errorSoundEffect;
        }

        if (soundEffect) {
            soundEffect.currentTime = 0; // Ensure the audio plays from the start
            soundEffect.play();
        }
    }
}




/* Page Load Header Fade Animation */
setTimeout(function () {
    document.getElementById('body').style.opacity = "1";
}, 100);













/* Function to trach the first inserted letter in the inputs with the class name of "dynamic_direction_input_class" to set their direction value */
document.querySelectorAll('.dynamic_direction_input_class').forEach(input => {
    input.addEventListener('input', function () {
        let firstChar = this.value.trim().charAt(0);

        if (firstChar) {
            // Check if the first character is Arabic
            if (firstChar.match(/[\u0600-\u06FF]/)) {
                this.style.direction = 'rtl';
            } else {
                this.style.direction = 'ltr';
            }
        }
    });
});






/* Function to show and hide different pachage details sections */
showPackageTypeSection = function (packageType, clickedElement) {


    window.scrollTo(0, 0);


    if (packageType === 'clint') {
        create_new_clint_data_section.style.display = 'block';
        create_new_hotel_package_section.style.display = 'none';
        create_new_flight_package_section.style.display = 'none';
        create_new_package_including_and_not_including_data_section.style.display = 'none';
        create_new_clint_movements_plan_section.style.display = 'none';

    } else if (packageType === 'hotel') {
        create_new_clint_data_section.style.display = 'none';
        create_new_hotel_package_section.style.display = 'flex';
        create_new_flight_package_section.style.display = 'none';
        create_new_package_including_and_not_including_data_section.style.display = 'none';
        create_new_clint_movements_plan_section.style.display = 'none';

    } else if (packageType === 'flight') {
        create_new_clint_data_section.style.display = 'none';
        create_new_hotel_package_section.style.display = 'none';
        create_new_flight_package_section.style.display = 'flex';
        create_new_package_including_and_not_including_data_section.style.display = 'none';
        create_new_clint_movements_plan_section.style.display = 'none';

    } else if (packageType === 'package_including') {
        create_new_clint_data_section.style.display = 'none';
        create_new_hotel_package_section.style.display = 'none';
        create_new_flight_package_section.style.display = 'none';
        create_new_package_including_and_not_including_data_section.style.display = 'block';
        create_new_clint_movements_plan_section.style.display = 'none';

    } else if (packageType === 'transportation') {
        create_new_clint_data_section.style.display = 'none';
        create_new_hotel_package_section.style.display = 'none';
        create_new_flight_package_section.style.display = 'none';
        create_new_package_including_and_not_including_data_section.style.display = 'none';
        create_new_clint_movements_plan_section.style.display = 'block';
    }


    // Change the color of the clicked element to red and reset others to black
    var links = document.querySelectorAll('.header_navbar_links a');
    links.forEach(function (link) {
        link.style.backgroundColor = (link === clickedElement) ? 'rgb(0, 46, 57)' : 'rgb(85, 127, 137)';
    });
}



































/* Dropdown airport line names functionality */
let adultPackagePersonAmountInput = document.getElementById('adult_package_person_amount_input_id');

// Get the options within the dropdown
let adultPackagePersonAmountInputOptions = document.querySelectorAll('#adult_whole_package_people_amount_dropdown h3');

// Helper function to get the number value from the text (e.g., "3 بالغين" -> 3)
function extractNumberFromText(text) {
    return parseInt(text.match(/\d+/)) || 0; // Extracts the first number or defaults to 0
}

// Event listener for adult dropdown options
adultPackagePersonAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {
        playSoundEffect('click');

        if (option.textContent === 'حذف') {
            adultPackagePersonAmountInput.value = '';
            document.getElementById('store_google_sheet_package_adult_amount_value').innerText = '';
            document.getElementById('sms_card_with_internet_amount_input_id').value = '';
            document.getElementById('inner_flight_tickets_amount_input_id').value = '';
        } else {
            adultPackagePersonAmountInput.value = option.textContent;

            const adultCount = extractNumberFromText(adultPackagePersonAmountInput.value);
            const kidsInput = document.getElementById('kids_package_person_amount_input_id');
            const kidsCount = kidsInput ? extractNumberFromText(kidsInput.value) : 0;

            const totalPeople = adultCount + kidsCount;

            // Update SMS card value with adult count only
            document.getElementById('sms_card_with_internet_amount_input_id').value = `Internet Cards For ${adultCount} Pax`;

            // Update flight tickets with total people count
            document.getElementById('inner_flight_tickets_amount_input_id').value = `Domestic Tickets For ${totalPeople} Pax`;
            document.getElementById('store_google_sheet_package_adult_amount_value').innerText = option.textContent;
        }

        hideOverlay();
    });
});


/* Count the amount of kids included */
let kidsPackagePersonAmountInput = document.getElementById('kids_package_person_amount_input_id');

// Get the options within the dropdown
let kidsPackagePersonAmountInputOptions = document.querySelectorAll('#kids_whole_package_people_amount_dropdown h3');

// Event listener for kids dropdown options
kidsPackagePersonAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {
        playSoundEffect('click');

        if (option.textContent === 'حذف') {
            kidsPackagePersonAmountInput.value = '';
            document.getElementById('store_google_sheet_package_kids_amount_value').innerText = '';
        } else {
            kidsPackagePersonAmountInput.value = option.textContent;
            document.getElementById('store_google_sheet_package_kids_amount_value').innerText = option.textContent;
        }

        // Recalculate total people count
        const adultCount = extractNumberFromText(adultPackagePersonAmountInput.value || '');
        const kidsCount = extractNumberFromText(kidsPackagePersonAmountInput.value || '');
        const totalPeople = adultCount + kidsCount;

        // Update SMS card value with adult count only
        document.getElementById('sms_card_with_internet_amount_input_id').value = `Internet Cards For ${adultCount} Pax`;

        // Update flight tickets with total people count
        document.getElementById('inner_flight_tickets_amount_input_id').value = `Domestic Tickets For ${totalPeople} Pax`;

        hideOverlay();
    });
});



















/* Dropdown company names functionality */
function setupCompanyNamesDropdown() {
    let companyNamesInput = document.getElementById('clint_company_name_input_id');

    // Use event delegation on the container to work with dynamically added elements
    const companyNamesContainer = document.querySelector('#company_names_dropdown .company_names_options_dropdown_class');

    if (!companyNamesContainer || !companyNamesInput) {
        // Elements not ready yet, retry after a short delay
        setTimeout(setupCompanyNamesDropdown, 100);
        return;
    }

    companyNamesContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'H3') {
            const option = e.target;

            // Play a sound effect
            playSoundEffect('click');

            /* if the clicked h3 element was delete then reset the 'clint_company_name_input_id' value */
            if (option.textContent === 'حذف') {
                companyNamesInput.value = '';

                /* Reset the company by value from the "company_by_value_p_id" p element */
                document.getElementById('company_by_value_p_id').style.display = 'none';

                /* Delete the innerText (in case if exist) */
                document.getElementById('store_google_sheet_clint_company_name_value').innerText = '';

            } else {
                companyNamesInput.value = option.textContent; // Set input value to selected option





                /* Place the company by value in the "company_by_value_p_id" p element */
                document.getElementById('company_by_value_p_id').innerText = option.getAttribute('company_by_value');
                document.getElementById('company_by_value_p_id').style.display = '';

                /* Set the color of the "company_by_value_p_id" based on the company value */
                if (option.getAttribute('company_by_value') === 'awa') {
                    document.getElementById('company_by_value_p_id').style.setProperty('background', 'rgb(10, 83, 168)', 'important');
                    document.getElementById('company_by_value_p_id').style.setProperty('color', 'white', 'important');

                } else if (option.getAttribute('company_by_value') === 'mst') {
                    document.getElementById('company_by_value_p_id').style.setProperty('background', 'rgb(255, 229, 160)', 'important');
                    document.getElementById('company_by_value_p_id').style.setProperty('color', 'black', 'important');

                } else {
                    document.getElementById('company_by_value_p_id').style.setProperty('background', 'rgb(232, 234, 237)', 'important');
                    document.getElementById('company_by_value_p_id').style.setProperty('color', 'black', 'important');
                }







                /* Store the inserted values in the stored p elements for later use (when importing) */
                document.getElementById('store_google_sheet_clint_company_name_value').innerText = option.textContent;
            }

            /* Reset the value of 'company_names_search_bar_input_id' after picking a hotek name */
            document.getElementById('company_names_search_bar_input_id').value = '';

            // Get the dropdown div associated with the input
            let dropdownDivOptions = document.getElementById('company_names_search_bar_input_id').closest('.searchable_names_dropdown_class').querySelectorAll('h3');

            // Reset the display of all <h3> elements
            dropdownDivOptions.forEach(option => {
                option.style.display = 'block'; // Show all options
            });

            hideOverlay(); // Hide overlay after selection
        }
    });
}

// Set up company names dropdown listeners
setupCompanyNamesDropdown();





let clintPackagePriceTypeDiv = document.querySelectorAll('#clint_package_price_type_div input[type="checkbox"]');

clintPackagePriceTypeDiv.forEach(checkbox => {
    checkbox.addEventListener('change', () => {

        // Play a sound effect
        playSoundEffect('click');


        if (checkbox.checked) {
            clintPackagePriceTypeDiv.forEach(otherCheckbox => {
                if (otherCheckbox !== checkbox) {
                    otherCheckbox.checked = false;
                }
            });
        }
    });
});


let clintPackageTypeDiv = document.querySelectorAll('#clint_package_type_div input[type="checkbox"]');

clintPackageTypeDiv.forEach(checkbox => {
    checkbox.addEventListener('change', () => {

        // Play a sound effect
        playSoundEffect('click');


        if (checkbox.checked) {
            clintPackageTypeDiv.forEach(otherCheckbox => {
                if (otherCheckbox !== checkbox) {
                    otherCheckbox.checked = false;
                }
            });
        }
    });
});
















// Dropdown website users names functionality
let websiteUsersNameInput = document.getElementById('website_users_name_input_id');
let previousValue = websiteUsersNameInput.value; // Store the initial value

// Get the options within the dropdown
let websiteUsersNameInputOptions = document.querySelectorAll('#website_users_names_dropdown h3');

websiteUsersNameInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        let newValue;

        if (option.textContent === 'سامي' || option.textContent === 'ابو سما') {
            newValue = `بكج مستر ${option.textContent}`; // Set input value to selected option
        } else {
            newValue = `بكج ${option.textContent}`; // Set input value to selected option
        }

        // Check if the new value is different from the current value
        if (websiteUsersNameInput.value !== newValue) {
            websiteUsersNameInput.value = newValue; // Update the input value


            /* Call two functions, one for getting the most top row number and one for show the owner package names */
            handleUserPackageUniqueNumber(newValue, 'fetch');
            showWebsiteUsernamePackageNames();


            // Make the icon unclickable and visually disabled
            let submitIcon = document.getElementById('clint_inputs_submit_icon');
            submitIcon.style.opacity = '0';
            submitIcon.style.pointerEvents = 'none';
            submitIcon.disabled = true;


            // Store the selected value in localStorage
            localStorage.setItem('user_name_code', websiteUsersNameInput.value);

            // Update the previous value
            previousValue = newValue;
        }

        hideOverlay(); // Hide overlay after selection

    });
});














/* Function to hide and show all the package dates */
hideAllPackageDates = function () {

    /* in case if hide all package dates */
    if (document.getElementById('hide_all_package_dates_icon').style.backgroundColor === 'rgb(0, 87, 116)') {

        /* Store the value in the google sheet for later use (when importing) */
        document.getElementById('store_google_sheet_all_package_dates_hidden_or_no').innerText = 'hide all package dates';


        /* Change the icon background color */
        document.getElementById('hide_all_package_dates_icon').style.backgroundColor = 'rgb(0, 255, 0)';
        document.getElementById('hide_all_package_dates_icon').style.color = 'black';




        /* Get the h6 element to set the package type text */
        let clintPackageTypeH6 = document.getElementById('clint_package_type_h6');

        // Get the input element by its ID
        let startDateInput = document.getElementById('whole_package_start_date_input_id');

        // Check if the input has text
        if (startDateInput && startDateInput.value.trim() !== '') {
            // Get the value of the input
            let inputText = startDateInput.value.trim();

            // Split the text by spaces and get the second word (if it exists)
            let words = inputText.split(' ');

            if (words.length > 1) {
                clintPackageTypeH6.innerText = `${clintPackageTypeH6.innerText} - ${words[1]}`;
            }
        }




        // Check if there is any div with the class name "clint_data_row_class_for_editing"
        let allClintDataRows = document.querySelectorAll('.clint_data_row_class_for_editing');

        if (allClintDataRows.length > 0) {
            // Target the p elements with the IDs "whole_package_first_date_p_id" and "whole_package_last_date_p_id"
            let firstDateElement = document.getElementById('whole_package_first_date_p_id');
            let lastDateElement = document.getElementById('whole_package_last_date_p_id');

            if (firstDateElement) {
                firstDateElement.style.opacity = '0';
            }

            if (lastDateElement) {
                lastDateElement.style.opacity = '0';
            }
        }




        // Check if there are any divs with the class name "hotel_row_class_for_editing"
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

        if (allHotelRows.length > 0) {
            allHotelRows.forEach(hotelRow => {
                // Target the h2 and h3 elements inside each found div
                let h2Element = hotelRow.querySelector('h2');
                let h3Element = hotelRow.querySelector('h3');

                if (h2Element) {
                    h2Element.style.opacity = '0';
                }

                if (h3Element) {
                    h3Element.style.opacity = '0';
                }
            });
        }



        // Check if there are any divs with the class name "flight_row_class_for_editing"
        let allFlightRows = document.querySelectorAll('.flight_row_class_for_editing');

        if (allFlightRows.length > 0) {
            allFlightRows.forEach(flightRow => {
                // Target the h1 element inside each found div
                let h1Element = flightRow.querySelector('h1');

                if (h1Element) {
                    h1Element.style.opacity = '0';
                }
            });
        }



        // Check if there are any divs with the class name "clint_movements_row_class_for_editing"
        let allClintMovementsRows = document.querySelectorAll('.clint_movements_row_class_for_editing');

        if (allClintMovementsRows.length > 0) {
            // Loop through each found div
            allClintMovementsRows.forEach((flightRow, index) => {
                // Target the h1 element inside each found div
                let h1Element = flightRow.querySelector('h1');

                if (h1Element) {
                    h1Element.style.display = 'none';

                    // Create a new h4 element
                    let h4Element = document.createElement('h4');

                    // Set the innerText of the h4 element to a serial number starting from 1
                    h4Element.innerText = (index + 1).toString();

                    // Insert the h4 element after the h1 element
                    h1Element.insertAdjacentElement('afterend', h4Element);
                }
            });
        }










        /* in case if show all package dates */
    } else {

        /* Store the value in the google sheet for later use (when importing) */
        document.getElementById('store_google_sheet_all_package_dates_hidden_or_no').innerText = 'show all package dates';


        /* Change the icon background color */
        document.getElementById('hide_all_package_dates_icon').style.backgroundColor = 'rgb(0, 87, 116)';
        document.getElementById('hide_all_package_dates_icon').style.color = 'white';



        /* Get the h6 element to set the package type text */
        let clintPackageTypeH6 = document.getElementById('clint_package_type_h6');

        /* Check which checkbox is checked then include the text in the content */
        if (document.getElementById('honeymoon_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Honeymooners Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Honeymooners Package';

        } else if (document.getElementById('guys_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Guys Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Family Package';

        } else if (document.getElementById('family_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Family Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Family Package';

        } else if (document.getElementById('two_people_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Two People Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Two People Package';

        } else if (document.getElementById('group_of_people_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Group Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Group Package';

        } else {
            clintPackageTypeH6.innerHTML = 'New Package';

        }




        // Check if there is any div with the class name "clint_data_row_class_for_editing"
        let allClintDataRows = document.querySelectorAll('.clint_data_row_class_for_editing');

        if (allClintDataRows.length > 0) {
            // Target the p elements with the IDs "whole_package_first_date_p_id" and "whole_package_last_date_p_id"
            let firstDateElement = document.getElementById('whole_package_first_date_p_id');
            let lastDateElement = document.getElementById('whole_package_last_date_p_id');

            if (firstDateElement) {
                firstDateElement.style.opacity = '1';
            }

            if (lastDateElement) {
                lastDateElement.style.opacity = '1';
            }
        }



        // Check if there are any divs with the class name "hotel_row_class_for_editing"
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

        if (allHotelRows.length > 0) {
            allHotelRows.forEach(hotelRow => {
                // Target the h2 and h3 elements inside each found div
                let h2Element = hotelRow.querySelector('h2');
                let h3Element = hotelRow.querySelector('h3');

                if (h2Element) {
                    h2Element.style.opacity = '1';
                }

                if (h3Element) {
                    h3Element.style.opacity = '1';
                }
            });
        }



        // Check if there are any divs with the class name "flight_row_class_for_editing"
        let allFlightRows = document.querySelectorAll('.flight_row_class_for_editing');

        if (allFlightRows.length > 0) {
            allFlightRows.forEach(flightRow => {
                // Target the h1 element inside each found div
                let h1Element = flightRow.querySelector('h1');

                if (h1Element) {
                    h1Element.style.opacity = '1';
                }
            });
        }



        // Check if there are any divs with the class name "clint_movements_row_class_for_editing"
        let allClintMovementsRows = document.querySelectorAll('.clint_movements_row_class_for_editing');

        if (allClintMovementsRows.length > 0) {
            // Loop through each found div
            allClintMovementsRows.forEach(flightRow => {

                // Target the h1 element inside each found div
                let h1Element = flightRow.querySelector('h1');

                // Target the h1 element inside each found div
                let h4Element = flightRow.querySelector('h4');

                if (h1Element) {
                    h1Element.style.display = 'block';
                }

                if (h4Element) {
                    h4Element.style.display = 'none';
                }


            });
        }

    }

}









/* Function to ensure if all package dates should be hidden or no */
ensureAllPackageDatesHiddenOrNo = function () {

    if (document.getElementById('hide_all_package_dates_icon').style.backgroundColor === 'rgb(0, 255, 0)') {

        /* Get the h6 element to set the package type text */
        let clintPackageTypeH6 = document.getElementById('clint_package_type_h6');

        // Get the input element by its ID
        let startDateInput = document.getElementById('whole_package_start_date_input_id');

        // Check if the input has text
        if (startDateInput && startDateInput.value.trim() !== '') {
            // Get the value of the input
            let inputText = startDateInput.value.trim();

            // Split the text by spaces and get the second word (if it exists)
            let words = inputText.split(' ');

            if (words.length > 1) {
                clintPackageTypeH6.innerText = `Package ${words[1]}`;
            }
        }




        // Check if there is any div with the class name "clint_data_row_class_for_editing"
        let allClintDataRows = document.querySelectorAll('.clint_data_row_class_for_editing');

        if (allClintDataRows.length > 0) {
            // Target the p elements with the IDs "whole_package_first_date_p_id" and "whole_package_last_date_p_id"
            let firstDateElement = document.getElementById('whole_package_first_date_p_id');
            let lastDateElement = document.getElementById('whole_package_last_date_p_id');

            if (firstDateElement) {
                firstDateElement.style.opacity = '0';
            }

            if (lastDateElement) {
                lastDateElement.style.opacity = '0';
            }
        }




        // Check if there are any divs with the class name "hotel_row_class_for_editing"
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

        if (allHotelRows.length > 0) {
            allHotelRows.forEach(hotelRow => {
                // Target the h2 and h3 elements inside each found div
                let h2Element = hotelRow.querySelector('h2');
                let h3Element = hotelRow.querySelector('h3');

                if (h2Element) {
                    h2Element.style.opacity = '0';
                }

                if (h3Element) {
                    h3Element.style.opacity = '0';
                }
            });
        }



        // Check if there are any divs with the class name "flight_row_class_for_editing"
        let allFlightRows = document.querySelectorAll('.flight_row_class_for_editing');

        if (allFlightRows.length > 0) {
            allFlightRows.forEach(flightRow => {
                // Target the h1 element inside each found div
                let h1Element = flightRow.querySelector('h1');

                if (h1Element) {
                    h1Element.style.opacity = '0';
                }
            });
        }



        // Check if there are any divs with the class name "clint_movements_row_class_for_editing"
        let allClintMovementsRows = document.querySelectorAll('.clint_movements_row_class_for_editing');

        if (allClintMovementsRows.length > 0) {
            // Loop through each found div
            allClintMovementsRows.forEach((flightRow, index) => {
                // Target the h1 element inside each found div
                let h1Element = flightRow.querySelector('h1');

                if (h1Element && h1Element.style.display !== 'none') {
                    h1Element.style.display = 'none';

                    // Create a new h4 element
                    let h4Element = document.createElement('h4');

                    // Set the innerText of the h4 element to a serial number starting from 1
                    h4Element.innerText = (index + 1).toString();

                    // Insert the h4 element after the h1 element
                    h1Element.insertAdjacentElement('afterend', h4Element);
                }
            });
        }
    }
}








/* Function for selecting and di-selecting checkbox packge including data */
// Define colors in the correct order
let colors = [
    'rgb(255, 255, 255)', // White
    'rgb(0, 255, 0)',      // Green
    'rgb(255, 0, 0)'     // Red
];

// Define initial colors for specific checkboxes
let initialColors = {
    'privet_car_with_driver_to_welcome_and_etc_checkbox': 'rgb(0, 255, 0)', // Green
    'hotel_booking_with_breakfast_for_2_people_checkbox': 'rgb(0, 255, 0)', // Green
    'welcome_goodbye_hotel_delivery_checkbox': 'rgb(0, 255, 0)', // Green
    'inner_flight_tickets_checkbox': 'rgb(0, 255, 0)', // Green
    'customer_service_24_hour_checkbox': 'rgb(0, 255, 0)', // Green
    'sms_card_with_internet_checkbox': 'rgb(0, 255, 0)', // Green
    'welcome_with_flowers_checkbox': 'rgb(0, 255, 0)', // Green
    'special_oud_checkbox': 'rgb(0, 255, 0)', // Green
    'outer_flight_tickets_checkbox': 'rgb(255, 0, 0)', // Red
    'placese_visiting_cost_checkbox': 'rgb(255, 0, 0)', // Red
};

// Function to cycle through colors
function cycleColor(event) {
    let checkbox = event.target;
    let label = checkbox.nextElementSibling; // Get the label element

    // Get the current background color of the pseudo-element
    let currentColor = window.getComputedStyle(label, '::before').backgroundColor;

    // Find the index of the current color
    let currentIndex = colors.indexOf(currentColor);
    // Determine the next color index
    let nextIndex = (currentIndex + 1) % colors.length;
    // Get the next color
    let nextColor = colors[nextIndex];

    // Apply the next color
    label.style.setProperty('--checkbox-color', nextColor);
}

// Add event listeners to all checkboxes
document.querySelectorAll('#package_including_details_div input[type="checkbox"]').forEach(checkbox => {
    // Set initial color based on the checkbox ID
    let label = checkbox.nextElementSibling; // Get the label element
    let checkboxId = checkbox.id;
    let initialColor = initialColors[checkboxId] || 'rgb(255, 255, 255)'; // Default to white if not specified
    label.style.setProperty('--checkbox-color', initialColor);

    // Add click event listener
    checkbox.addEventListener('click', cycleColor);
});














/* Chnage the insert hotel data system between picking system and writing system */
changeInsertHotelDataSystem = function () {

    // Check if the hotel location input is hidden
    if (document.getElementById('hotel_location_input_id').style.display === 'none') {

        // Show the hotel location input
        document.getElementById('hotel_location_input_id').style.display = 'block';
        document.getElementById('hotel_stars_rate_input_id').style.display = 'block';



        /* Reset the value of teh following inputs */
        document.getElementById('hotel_name_input_id').value = '';
        document.getElementById('hotel_room_type_description_input_id').value = '';
        document.getElementById('hotel_room_type_description_input_id_2').value = '';

        document.getElementById('hotel_room_contain_pool_input_id').value = '';
        document.getElementById('hotel_room_contain_pool_input_id_2').value = '';


        document.getElementById('hotel_room_view_input_id').value = '';
        document.getElementById('hotel_room_view_input_id_2').value = '';


        document.getElementById('hotel_special_room_request_input_id').value = '';
        document.getElementById('hotel_special_room_request_input_id_2').value = '';


        document.getElementById('hotel_room_extra_info_textarea_id').value = '';
        document.getElementById('hotel_room_extra_info_textarea_id_2').value = '';



        // Make the following inputs editable and remove the readonly attribute
        document.getElementById('hotel_name_input_id').readOnly = false;
        document.getElementById('hotel_room_type_description_input_id').readOnly = false;
        document.getElementById('hotel_room_type_description_input_id_2').readOnly = false;



        // Change the cursor to text and remove the onclick event
        document.getElementById('hotel_name_input_id').style.cursor = 'text';
        document.getElementById('hotel_name_input_id').onclick = null;

        document.getElementById('hotel_room_type_description_input_id').style.cursor = 'text';
        document.getElementById('hotel_room_type_description_input_id').onclick = null;

        document.getElementById('hotel_room_type_description_input_id_2').style.cursor = 'text';
        document.getElementById('hotel_room_type_description_input_id_2').onclick = null;



        // Set autocomplete to on
        document.getElementById('hotel_name_input_id').setAttribute('autocomplete', 'on');
        document.getElementById('hotel_room_type_description_input_id').setAttribute('autocomplete', 'on');
        document.getElementById('hotel_room_type_description_input_id_2').setAttribute('autocomplete', 'on');



        /* Chnage the color of the icon as a refernce you're in hotel writing system */
        document.getElementById('change_insert_hotel_data_system_icon').style.background = 'rgb(0, 255, 0)';
        document.getElementById('change_insert_hotel_data_system_icon').style.color = 'black';

        document.getElementById('change_insert_hotel_data_system_icon_2').style.background = 'rgb(0, 255, 0)';
        document.getElementById('change_insert_hotel_data_system_icon_2').style.color = 'black';


    } else {
        // Hide the hotel location input
        document.getElementById('hotel_location_input_id').style.display = 'none';
        document.getElementById('hotel_location_input_id').value = '';
        document.getElementById('hotel_bali_area_input_id').style.display = 'none';
        document.getElementById('hotel_bali_area_input_id').value = '';
        document.getElementById('hotel_stars_rate_input_id').style.display = 'none';
        document.getElementById('hotel_stars_rate_input_id').value = '';



        /* Reset the value of teh following inputs */
        document.getElementById('hotel_name_input_id').value = '';
        document.getElementById('hotel_room_type_description_input_id').value = '';
        document.getElementById('hotel_room_type_description_input_id_2').value = '';

        document.getElementById('hotel_room_contain_pool_input_id').value = '';
        document.getElementById('hotel_room_contain_pool_input_id_2').value = '';


        document.getElementById('hotel_room_view_input_id').value = '';
        document.getElementById('hotel_room_view_input_id_2').value = '';


        document.getElementById('hotel_special_room_request_input_id').value = '';
        document.getElementById('hotel_special_room_request_input_id_2').value = '';


        document.getElementById('hotel_room_extra_info_textarea_id').value = '';
        document.getElementById('hotel_room_extra_info_textarea_id_2').value = '';



        // Make the following inputs readonly again
        document.getElementById('hotel_name_input_id').readOnly = true;
        document.getElementById('hotel_room_type_description_input_id').readOnly = true;
        document.getElementById('hotel_room_type_description_input_id_2').readOnly = true;



        // Set autocomplete to on
        document.getElementById('hotel_name_input_id').setAttribute('autocomplete', 'off');
        document.getElementById('hotel_room_type_description_input_id').setAttribute('autocomplete', 'off');
        document.getElementById('hotel_room_type_description_input_id_2').setAttribute('autocomplete', 'off');



        // Change the cursor to pointer and properly set the onclick event
        document.getElementById('hotel_name_input_id').style.cursor = 'pointer';
        document.getElementById('hotel_name_input_id').onclick = function () {
            handleHotelNameInputClick();
        };

        document.getElementById('hotel_room_type_description_input_id').style.cursor = 'pointer';
        document.getElementById('hotel_room_type_description_input_id').onclick = function () {
            createRoomTypeDescripyionDropDown(); showOverlay('hotel_room_type_description_dropdown');
        };

        document.getElementById('hotel_room_type_description_input_id_2').style.cursor = 'pointer';
        document.getElementById('hotel_room_type_description_input_id_2').onclick = function () {
            createRoomTypeDescripyionDropDown(); showOverlay('hotel_room_type_description_dropdown');
        };



        /* Chnage the color of the icon as a refernce you're in hotel writing system */
        document.getElementById('change_insert_hotel_data_system_icon').style.background = 'rgb(0, 87, 116)';
        document.getElementById('change_insert_hotel_data_system_icon').style.color = 'white';

        document.getElementById('change_insert_hotel_data_system_icon_2').style.background = 'rgb(0, 87, 116)';
        document.getElementById('change_insert_hotel_data_system_icon_2').style.color = 'white';
    }
}













/* Function to store the clicked hotel unit amount */

/* Store the hotel total nights for later use (when inserting hotel row data) */
let storeHotelTotalNights;

// Variable to track the last clicked input field for dates
let lastClickedHotelDateInput = null;

// Add event listeners to track the last clicked input for dates
document.getElementById('hotel_check_in_input_id').addEventListener('click', function () {
    lastClickedHotelDateInput = this;
});

document.getElementById('hotel_check_out_input_id').addEventListener('click', function () {
    lastClickedHotelDateInput = this;
});

/* Function to handle available dates dropdown and input updates */
function createH3ElementsForAvailableDates() {
    // Get the target div
    let hotelAvailableDatesDiv = document.getElementById('hotel_available_dates_h3_elements_div_id');

    // Clear existing content in the target div
    hotelAvailableDatesDiv.innerHTML = '';

    // Check if allowedDates object is not empty
    if (Object.keys(allowedDates).length > 0) {
        // Create and append an h3 element for each date
        for (let key in allowedDates) {
            let dateStr = allowedDates[key];

            // Create a new h3 element
            let h3 = document.createElement('h3');
            h3.innerText = dateStr;

            // Add click event listener to the h3 element
            h3.addEventListener('click', function () {

                // Play a sound effect
                playSoundEffect('click');


                if (lastClickedHotelDateInput) {
                    lastClickedHotelDateInput.value = this.innerText;


                    /* Run the close sell function to update based on the picked dates */
                    fetchAllCloseSellDataFunction_Supabase();



                    /* if the check out hotel date changed then reset all the following inputs values */
                    if (lastClickedHotelDateInput.id === 'hotel_check_out_input_id') {
                        document.getElementById('hotel_name_input_id').value = '';
                        document.getElementById('hotel_room_type_description_input_id').value = '';
                        document.getElementById('hotel_room_type_description_input_id_2').value = '';
                        document.getElementById('hotel_room_contain_pool_input_id').value = '';
                        document.getElementById('hotel_room_contain_pool_input_id_2').value = '';
                        document.getElementById('hotel_room_view_input_id').value = '';
                        document.getElementById('hotel_room_view_input_id_2').value = '';
                        document.getElementById('hotel_special_room_request_input_id').value = '';
                        document.getElementById('hotel_special_room_request_input_id_2').value = '';
                        document.getElementById('hotel_room_extra_info_textarea_id').value = '';
                        document.getElementById('hotel_room_extra_info_textarea_id_2').value = '';
                    }
                }





                hideOverlay(); // Hide overlay after selection

                // Check if both check-in and check-out have values
                calculateTotalNights();
            });

            // Append the h3 element to the target div
            hotelAvailableDatesDiv.appendChild(h3);
        }
    }
}

/* Update the used dates and show only the left ones */
updateLeftHotelDatesFunction = function () {
    // Get the check-in date value
    let checkInDate = document.getElementById('hotel_check_in_input_id').value;

    // Get all h3 elements inside the available dates div
    let h3Elements = document.getElementById('hotel_available_dates_h3_elements_div_id').getElementsByTagName('h3');

    // Flag to start showing elements
    let startShowingFlag = false;

    for (let i = 0; i < h3Elements.length; i++) {
        let h3 = h3Elements[i];

        if (h3.innerText === checkInDate) {
            // Set flag to true but hide this h3 element
            startShowingFlag = true;
            h3.style.display = 'none'; // Hide the h3 element matching the check-in date
        } else if (startShowingFlag) {
            // Show subsequent h3 elements
            h3.style.display = 'block';
        } else {
            // Hide h3 elements before the check-in date
            h3.style.display = 'none';
        }
    }
}



/* Function to calculate the total number of nights */
function calculateTotalNights() {
    let checkInDate = document.getElementById('hotel_check_in_input_id').value;
    let checkOutDate = document.getElementById('hotel_check_out_input_id').value;

    if (checkInDate && checkOutDate) {
        let h3Elements = document.getElementById('hotel_available_dates_h3_elements_div_id').getElementsByTagName('h3');

        let countNights = -1;
        let startCounting = false;

        for (let i = 0; i < h3Elements.length; i++) {
            let h3 = h3Elements[i];

            if (h3.innerText === checkInDate) {
                startCounting = true;
            }

            if (startCounting) {
                countNights++;
            }

            if (h3.innerText === checkOutDate) {
                break;
            }
        }

        // Add 1 to the calculated number of nights
        let totalNights = countNights;

        // Store and update the hotel total nights input
        storeHotelTotalNights = totalNights;

        document.getElementById('hotel_total_nights_input_id').value = `${totalNights} ليالي`;
    }
}
















/* Function to store the clicked hotel unit amount */

/* Dropdown hotel names functionality */
function setupHotelNamesDropdown() {
    let hotelNameInput = document.getElementById('hotel_name_input_id');

    // Use event delegation on the container to work with dynamically added elements
    const hotelNamesContainer = document.querySelector('#all_hotel_names_dropdown .company_names_options_dropdown_class');

    if (!hotelNamesContainer || !hotelNameInput) {
        // Elements not ready yet, retry after a short delay
        setTimeout(setupHotelNamesDropdown, 100);
        return;
    }

    hotelNamesContainer.addEventListener('click', (e) => {
        // Check if the clicked element is an h3
        if (e.target.tagName === 'H3') {
            const option = e.target;

            // Play a sound effect
            playSoundEffect('click');

            /* First store the current hotel name for later comparing (to reset the hotel room type or no need) */
            currentHotelName = hotelNameInput.value;

            /* Set the input value with the clicked hotel name h3 innerText */
            hotelNameInput.value = option.textContent;
            hideOverlay(); // Hide overlay after selection

            /* Reset the value of 'all_hotel_names_search_bar_input_id' after picking a hotel name */
            document.getElementById('all_hotel_names_search_bar_input_id').value = '';

            // Get the dropdown div associated with the input
            let dropdownDivOptions = document.getElementById('all_hotel_names_search_bar_input_id').closest('.searchable_names_dropdown_class').querySelectorAll('h3');

            // Reset the display of all <h3> elements
            dropdownDivOptions.forEach(option => {
                option.style.display = 'block'; // Show all options
            });






            /* Function to check if there is a matching hotel name to show important message */
            document.getElementById("hotelDetails").innerHTML = ""; // Clear previous messages

            // Find the hotel object that matches the selected hotel name
            const foundHotel = hotelMessageInfoArray.find(hotel => hotel.hotelName === option.textContent);

            if (foundHotel) {
                // Set the title message dynamically to only include the hotel name
                document.getElementById("important_hotel_info_message_title_id").innerText = `[${option.textContent}]`;

                // Loop through messageInfo_p properties and create <p> elements
                Object.keys(foundHotel).forEach(key => {
                    if (key.startsWith("messageInfo_p")) {
                        const pElement = document.createElement("p");
                        pElement.textContent = foundHotel[key];
                        document.getElementById("hotelDetails").appendChild(pElement);
                    }
                });

                // Show the modal smoothly
                document.getElementById("hotel_important_info_box_div").style.visibility = 'visible';
                document.getElementById("hotel_important_info_box_div").style.opacity = '1';
            }






            /* If the hotel name got changed then reset all the following values */
            if (option.textContent !== currentHotelName) {
                document.getElementById('hotel_room_type_description_input_id').value = '';
                document.getElementById('hotel_room_type_description_input_id_2').value = '';

                document.getElementById('hotel_room_contain_pool_input_id').value = '';
                document.getElementById('hotel_room_contain_pool_input_id_2').value = '';

                document.getElementById('hotel_room_view_input_id').value = '';
                document.getElementById('hotel_room_view_input_id_2').value = '';

                document.getElementById('hotel_special_room_request_input_id').value = '';
                document.getElementById('hotel_special_room_request_input_id_2').value = '';

                document.getElementById('hotel_room_extra_info_textarea_id').value = '';
                document.getElementById('hotel_room_extra_info_textarea_id_2').value = '';
            }
        }
    });
}

// Set up hotel names dropdown listeners
setupHotelNamesDropdown();






/* Function to close the  */
document.getElementById("hotel_important_info_box_close_icon").addEventListener("click", function () {
    document.getElementById("hotel_important_info_box_div").style.opacity = '0';
    document.getElementById("hotel_important_info_box_div").style.visibility = 'hidden';
});







/* Function to store the clicked hotel unit amount */

/* Dropdown hotel location functionality */
let hotelLocationInput = document.getElementById('hotel_location_input_id');

// Get the options within the dropdown
let hotelLocationInputOptions = document.querySelectorAll('#hotel_location_dropdown h3');

hotelLocationInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');


        /* First store the corrent hotel location for later comparing (to reset the hotel room type or no need) */
        currentHotelLocation = hotelLocationInput.value


        /* Set the input value with the clicked rooms number h3 innerText */
        hotelLocationInput.value = option.textContent;
        hideOverlay(); // Hide overlay after selection



        /* Make sure to show or hide the 'hotel_bali_area_input_id' input based on the clikced hotel location */
        if (option.textContent === 'Bali') {
            document.getElementById('hotel_bali_area_input_id').style.display = 'block';

        } else {
            document.getElementById('hotel_bali_area_input_id').style.display = 'none';
        }


        /* Delete the value of the 'hotel_bali_area_input_id' if a new clicked location h3 text */
        if (option.textContent !== currentHotelLocation) {
            document.getElementById('hotel_bali_area_input_id').value = '';
        }

    });
});








/* Function to store the clicked hotel unit amount */

/* Dropdown hotel location functionality */
let hotelBaliAreaInput = document.getElementById('hotel_bali_area_input_id');

// Get the options within the dropdown
let hotelBaliAreaInputOptions = document.querySelectorAll('#hotel_bali_area_dropdown h3');

hotelBaliAreaInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        /* Set the input value with the clicked rooms number h3 innerText */
        hotelBaliAreaInput.value = option.textContent;
        hideOverlay(); // Hide overlay after selection


    });
});







/* Function to store the clicked hotel unit amount */

/* Dropdown hotel location functionality */
let hotelStarsRateInput = document.getElementById('hotel_stars_rate_input_id');

// Get the options within the dropdown
let hotelStarsRateInputOptions = document.querySelectorAll('#hotel_stars_rate_dropdown h3');

hotelStarsRateInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        if (option.textContent === 'حذف') {

            /* Delete the value from the input */
            hotelStarsRateInput.value = '';

        } else {
            /* Set the input value with the clicked rooms number h3 innerText */
            hotelStarsRateInput.value = option.textContent;
        }

        hideOverlay(); // Hide overlay after selection

    });
});
































/* Function to insert the hotel room view and including pool text */

// Variable to track the last clicked input field
let lastClickedPoolInput = null;

// Add event listeners to track the last clicked input
document.getElementById('hotel_room_contain_pool_input_id').addEventListener('click', function () {
    lastClickedPoolInput = this;
});

document.getElementById('hotel_room_contain_pool_input_id_2').addEventListener('click', function () {
    lastClickedPoolInput = this;
});

/* Dropdown airport line names functionality */
// Get the options within the dropdown
let hotelRoomContainPoolInputOptions = document.querySelectorAll('#hotel_room_contain_pool_dropdown h3');

hotelRoomContainPoolInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        if (lastClickedPoolInput) {
            if (option.textContent === 'حذف') {
                lastClickedPoolInput.value = ''; // Clear the input value if "حذف" is selected
            } else {
                lastClickedPoolInput.value = `with ${option.textContent}`; // Set the input value to the selected option
            }
        }

        hideOverlay(); // Hide overlay after selection
    });
});






// Variable to track the last clicked input field
let lastClickedViewInput = null;

// Add event listeners to track the last clicked input
document.getElementById('hotel_room_view_input_id').addEventListener('click', function () {
    lastClickedViewInput = this;
});

document.getElementById('hotel_room_view_input_id_2').addEventListener('click', function () {
    lastClickedViewInput = this;
});

/* Dropdown airport line names functionality */
// Get the options within the dropdown
let hotelRoomViewInputOptions = document.querySelectorAll('#hotel_room_view_dropdown h3');

hotelRoomViewInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');


        if (lastClickedViewInput) {
            if (option.textContent === 'حذف') {
                lastClickedViewInput.value = ''; // Clear the input value if "حذف" is selected
            } else {
                lastClickedViewInput.value = `with ${option.textContent} View`; // Set the input value to the selected option
            }
        }

        hideOverlay(); // Hide overlay after selection
    });
});



























/* Function to store the clicked hotel breakfast amount */

// Variable to track the last clicked input field for breakfast amount
let lastClickedBreakFastAmountInput = null;

// Add event listeners to track the last clicked input
document.getElementById('hotel_breakfast_people_amount_input_id').addEventListener('click', function () {
    lastClickedBreakFastAmountInput = this;
});

document.getElementById('hotel_breakfast_people_amount_input_id_2').addEventListener('click', function () {
    lastClickedBreakFastAmountInput = this;
});

/* Dropdown airport line names functionality */
// Get the options within the dropdown
let hotelBreakFastAmountInputOptions = document.querySelectorAll('#breakfast_amount_dropdown h3');

hotelBreakFastAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');


        /* Set the input value with the clicked rooms number h3 innerText */
        if (option.textContent === 'حذف') {
            lastClickedBreakFastAmountInput.value = '';

        } else if (option.textContent === 'غير شامل') {
            lastClickedBreakFastAmountInput.value = `(No BF)`

        } else {
            lastClickedBreakFastAmountInput.value = `Incl BF For ${option.textContent}`;

        }


        hideOverlay(); // Hide overlay after selection
    });
});

























/* Function to store the clicked hotel unit amount */

// Variable to track the last clicked input field for unit amount
let lastClickedUnitAmountInput = null;

// Add event listeners to track the last clicked input
document.getElementById('hotel_unit_amount_input_id').addEventListener('click', function () {
    lastClickedUnitAmountInput = this;
});

document.getElementById('hotel_unit_amount_input_id_2').addEventListener('click', function () {
    lastClickedUnitAmountInput = this;
});

/* Store the hotel total rooms number for later use (in hotel row data) */
let storeHotelTotalUnitNumber;
let storeHotelTotalUnitNumber_2;

/* Dropdown unit amount functionality */
// Get the options within the dropdown
let hotelUnitAmountInputOptions = document.querySelectorAll('#hotel_unit_amount_dropdown h3');

hotelUnitAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');


        // Store the clicked h3 innerText in the appropriate variable based on the last clicked input
        if (lastClickedUnitAmountInput === document.getElementById('hotel_unit_amount_input_id')) {
            storeHotelTotalUnitNumber = option.textContent;


        } else if (lastClickedUnitAmountInput === document.getElementById('hotel_unit_amount_input_id_2')) {
            storeHotelTotalUnitNumber_2 = option.textContent;

        }

        if (lastClickedUnitAmountInput) {
            // Set the input value with the clicked h3 innerText
            lastClickedUnitAmountInput.value = `عدد الوحدات ${option.textContent}`;
        }

        hideOverlay(); // Hide overlay after selection
    });
});

















// Variable to track the last clicked input field
let lastClickedInput = null;

// Add event listeners to the inputs to track which one was last clicked
document.getElementById('hotel_room_type_description_input_id').addEventListener('click', function () {
    lastClickedInput = this;
});

document.getElementById('hotel_room_type_description_input_id_2').addEventListener('click', function () {
    lastClickedInput = this;
});

/* Function to create hotel room type description h3 dropdown elements */
let createRoomTypeDescripyionDropDown = function () {
    let hotelNameInput = document.getElementById('hotel_name_input_id').value;
    let hotelRoomTypeDescriptionH3ElementsDiv = document.getElementById('hotel_room_type_description_h3_elements_div_id');

    if (hotelNameInput !== '') {
        hotelRoomTypeDescriptionH3ElementsDiv.innerHTML = '';
        let hotel = allHotelDataArray.find(hotel => hotel.hotelName === hotelNameInput);

        if (hotel) {
            hotel.hotelRoomTypes.forEach(roomType => {
                let h3 = document.createElement('h3');
                h3.textContent = roomType;
                hotelRoomTypeDescriptionH3ElementsDiv.appendChild(h3);

                h3.addEventListener('click', () => {

                    // Play a sound effect
                    playSoundEffect('click');

                    // Check if an input field was clicked before the h3 was clicked
                    if (lastClickedInput) {
                        // Set the value of the last clicked input field to the text content of the clicked h3 element
                        lastClickedInput.value = h3.textContent;
                    }

                    hideOverlay();
                });
            });
        }
    } else {
        hotelRoomTypeDescriptionH3ElementsDiv.innerHTML = '';
    }
}












// Variable to track the last clicked input field
let lastClickedSpecialRoomRequestInput = null;

// Track last clicked input
document.getElementById('hotel_special_room_request_input_id')
    .addEventListener('click', function () {
        lastClickedSpecialRoomRequestInput = this;
    });

document.getElementById('hotel_special_room_request_input_id_2')
    .addEventListener('click', function () {
        lastClickedSpecialRoomRequestInput = this;
    });

// Get dropdown options
let specialRoomRequestInputOptions =
    document.querySelectorAll('#special_room_request_dropdown h3');

/* Clear selection state */
function clearSpecialRoomRequestSelection() {
    specialRoomRequestInputOptions.forEach(h =>
        h.classList.remove('special_room_request_h3_selected')
    );
}

/* Auto-select based on input value */
function applySpecialRoomRequestSelectionFromInputValue() {
    clearSpecialRoomRequestSelection();
    if (!lastClickedSpecialRoomRequestInput) return;

    const inputVal = (lastClickedSpecialRoomRequestInput.value || '').trim();
    if (!inputVal) return;

    const parts = inputVal
        .split(/\s*\+\s*/)
        .map(s => s.trim())
        .filter(Boolean);

    specialRoomRequestInputOptions.forEach(h => {
        if (parts.includes(h.textContent.trim())) {
            h.classList.add('special_room_request_h3_selected');
        }
    });
}

/* Toggle selection on click */
specialRoomRequestInputOptions.forEach(option => {
    option.addEventListener('click', () => {
        playSoundEffect('click');
        option.classList.toggle('special_room_request_h3_selected');
    });
});

/* Confirm button */
const specialRoomRequestConfirmBtn =
    document.getElementById('special_room_request_confirm_btn_id');

if (specialRoomRequestConfirmBtn) {
    specialRoomRequestConfirmBtn.addEventListener('click', () => {
        playSoundEffect('success');

        const selected = document.querySelectorAll(
            '#special_room_request_dropdown h3.special_room_request_h3_selected'
        );

        const texts = Array.from(selected).map(h =>
            `+ ${h.textContent.trim()}`
        );


        if (lastClickedSpecialRoomRequestInput) {
            lastClickedSpecialRoomRequestInput.value = texts.join(' ');
        }

        clearSpecialRoomRequestSelection();
        hideOverlay();
    });
}









// Variable to track the last clicked input field for special room requests
let lastClickedHotelExtraBedInput = null;

// Add event listeners to track the last clicked input
document.getElementById('hotel_extra_bed_input_id').addEventListener('click', function () {
    lastClickedHotelExtraBedInput = this;
});

document.getElementById('hotel_extra_bed_input_id_2').addEventListener('click', function () {
    lastClickedHotelExtraBedInput = this;
});

/* Function to run the dropdown functionality for special room request */
// Get the options within the dropdown
let lastClickedHotelExtraBedInputOptions = document.querySelectorAll('#hotel_extra_bed_dropdown h3');

lastClickedHotelExtraBedInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        if (option.textContent === 'حذف') {
            lastClickedHotelExtraBedInput.value = '';

        } else if (option.textContent === '1 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ One Extra Bed + One Extra BF`;

        } else if (option.textContent === '2 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Two Extra Bed + Two Extra BF`;

        } else if (option.textContent === '3 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Three Extra Bed + Three Extra BF`;

        } else if (option.textContent === '4 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Four Extra Bed + Four Extra BF`;

        } else if (option.textContent === '5 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Five Extra Bed + Five Extra BF`;

        } else if (option.textContent === '6 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Six Extra Bed + Six Extra BF`;

        } else if (option.textContent === '7 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Seven Extra Bed + Seven Extra BF`;

        } else if (option.textContent === '8 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Eight Extra Bed + Eight Extra BF`;

        } else if (option.textContent === '9 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Nine Extra Bed + Nine Extra BF`;

        } else if (option.textContent === '10 سرير إضافي') {
            lastClickedHotelExtraBedInput.value = `+ Ten Extra Bed + Ten Extra BF`;

        }



        hideOverlay(); // Hide overlay after selection
    });
});










/* Function to show and hide the second hotel room data input dive */
showSecondHotelRoomData = function () {

    // Get all hotel first and second room data inputs for width styling
    let inputsAndTextareas = document.querySelectorAll('#hotel_two_room_data_input_divs_container input, #hotel_two_room_data_input_divs_container textarea');

    if (document.getElementById('hotel_second_room_data_input_div').style.display === 'flex') {
        document.getElementById('hotel_second_room_data_input_div').style.display = 'none';

        // Set width back to the original saved width value
        inputsAndTextareas.forEach(element => {
            element.style.width = element.dataset.originalWidth; // Use the saved width value
        });

    } else {
        document.getElementById('hotel_second_room_data_input_div').style.display = 'flex';

        // Save the current width before changing it to 100%
        inputsAndTextareas.forEach(element => {
            if (!element.dataset.originalWidth) {
                element.dataset.originalWidth = element.style.width; // Save the original width
            }
            element.style.width = '100%'; // Set width to 100%
        });
    }
}































// Praper the overlay layer variable
let overlayLayer = null;














// Select all elements with the class 'search_bar_input_class'
let searchBarInputElements = document.querySelectorAll('.search_bar_input_class');

// Add event listeners to each search bar input element
searchBarInputElements.forEach(input => {

    // Add a click event listener to the input element
    input.addEventListener('click', () => {
        // Find the closest parent element with the class 'searchable_names_dropdown_class'
        let dropdownDiv = input.closest('.searchable_names_dropdown_class');

        // Set a smooth transition for the height property
        dropdownDiv.style.transition = 'height 0.1s ease-in-out';

        // Set the height of the dropdown div to 70vh when the search bar is clicked
        dropdownDiv.style.maxHeight = '70vh';
        dropdownDiv.style.minHeight = '70vh';
    });

    // Add an input event listener to the input element
    input.addEventListener('input', () => {
        // Get the trimmed and lowercased value of the input element
        let filter = input.value.trim().toLowerCase();

        // Split the input value into words for better matching
        let filterWords = filter.split(/\s+/); // Split by any whitespace

        // Find the closest parent element with the class 'searchable_names_dropdown_class'
        let dropdownDiv = input.closest('.searchable_names_dropdown_class');

        // Select all <h3> elements within the same dropdown div
        let options = dropdownDiv.querySelectorAll('h3');

        // Function to count occurrences of a word in a string
        let countOccurrences = (text, word) => {
            return text.split(word).length - 1;
        };

        // Initialize a counter for the number of visible options
        let visibleCount = 0;

        // Loop through each option in the dropdown
        options.forEach(option => {
            // Get the trimmed and lowercased text content of the option
            let optionText = option.textContent.trim().toLowerCase();

            // Check if all filter words are present in the option text with the same or more occurrences
            let matches = filterWords.every(word => {
                // Count occurrences of the word in the input and in the option text
                let inputWordCount = countOccurrences(filter, word);
                let optionWordCount = countOccurrences(optionText, word);

                // The word in the option text must appear at least as many times as in the input
                return optionWordCount >= inputWordCount;
            });

            // If the filter is empty and less than 6 options are visible, show the option
            if (filter === '' && visibleCount < 6) {
                option.style.display = 'block'; // Display the option
                visibleCount++; // Increment the visible options count
            }
            // If the option text includes all words from the filter with the correct occurrence count, show the option
            else if (matches) {
                option.style.display = 'block'; // Display the option
            }
            // Otherwise, hide the option
            else {
                option.style.display = 'none'; // Hide the option
            }
        });
    });
});








































/* Dropdown the package including sms cards and inner flight tickets amount */
// Set lastClickedClintMovementsCityInput when the sms card input field is clicked
document.getElementById('hotel_breakfast_people_amount_input_id').addEventListener('click', () => {
    lastClickedClintMovementsCityInput = document.getElementById('hotel_breakfast_people_amount_input_id');
});

document.getElementById('sms_card_with_internet_amount_input_id').addEventListener('click', () => {
    lastClickedClintMovementsCityInput = document.getElementById('sms_card_with_internet_amount_input_id');
});

document.getElementById('inner_flight_tickets_amount_input_id').addEventListener('click', () => {
    lastClickedClintMovementsCityInput = document.getElementById('inner_flight_tickets_amount_input_id');
});



// Get all the h3 elements within the dropdown
let smsCardWithInternetAmountInputOptions = document.querySelectorAll('#breakfast_and_sms_card_and_ticket_amount_dropdown h3');

// Add click event listener to each h3 element
smsCardWithInternetAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');


        if (lastClickedClintMovementsCityInput) { // Check if an input field was clicked before
            if (option.innerText === 'حذف') { // If the clicked h3 element's inner text is "حذف"
                lastClickedClintMovementsCityInput.value = ''; // Clear the value of the last clicked input field


            } else { // If the clicked h3 element's inner text is not "حذف"
                if (lastClickedClintMovementsCityInput.id === 'sms_card_with_internet_amount_input_id') {

                    if (option.textContent === 'غير شامل') {
                        lastClickedClintMovementsCityInput.value = '';

                    } else {
                        // Set the value of the sms card input field with the selected option
                        lastClickedClintMovementsCityInput.value = `Internet Cards For ${option.textContent} Pax`;

                    }




                } else if (lastClickedClintMovementsCityInput.id === 'inner_flight_tickets_amount_input_id') {

                    if (option.textContent === 'غير شامل') {
                        lastClickedClintMovementsCityInput.value = '';

                    } else {
                        // Set the value of the inner flight tickets input field with the selected option
                        lastClickedClintMovementsCityInput.value = `domestic tickets For ${option.textContent}`;

                    }


                } else if (lastClickedClintMovementsCityInput.id === 'hotel_breakfast_people_amount_input_id') {

                    if (option.textContent === 'غير شامل') {
                        lastClickedClintMovementsCityInput.value = '(No BF)';

                    } else {
                        lastClickedClintMovementsCityInput.value = `Incl BF For ${option.textContent} Pax`;

                    }

                }
            }
            hideOverlay(); // Hide the dropdown overlay after selection
        }
    });
});

















/* Function to store the clicked hotel unit amount */

/* Dropdown airport line names functionality */
let specificCarTypeInput = document.getElementById('specific_car_type_input_id');

// Get the options within the dropdown
let specificCarTypeInputOptions = document.querySelectorAll('#specific_car_type_dropdown h3');

specificCarTypeInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');


        if (option.textContent === 'حذف') {
            /* Delete the text of the 'specificCarTypeInput' */
            specificCarTypeInput.value = '';


        } else if (option.textContent === 'افانزا') {
            /* Set the input value with the clicked rooms number h3 innerText */
            specificCarTypeInput.value = 'Private Avanza car with a private driver for the entire duration of the trip, and there are no free days in the packages';


        } else if (option.textContent === 'اينوفا') {
            /* Set the input value with the clicked rooms number h3 innerText */
            specificCarTypeInput.value = 'Private Innova car with a private driver for the entire duration of the trip, and there are no free days in the packages';


        } else if (option.textContent === 'اينوفا ريبون') {
            /* Set the input value with the clicked rooms number h3 innerText */
            specificCarTypeInput.value = 'Private Innova Reborn car with a private driver for the entire duration of the trip, and there are no free days in the packages';


        } else if (option.textContent === 'باص هايس') {
            /* Set the input value with the clicked rooms number h3 innerText */
            specificCarTypeInput.value = 'Private Hiace Bus with a private driver for the entire duration of the trip, and there are no free days in the packages';

        } else if (option.textContent === 'باص الفارد') {
            /* Set the input value with the clicked rooms number h3 innerText */
            specificCarTypeInput.value = 'Private Alphard Bus with a private driver for the entire duration of the trip, and there are no free days in the packages';

        }


        hideOverlay(); // Hide overlay after selection


    });
});











/* Clint Flight Details */
/* Dropdown airport line names functionality */
let flightAirLineInput = document.getElementById('flight_air_line_input_id');

// Get the options within the dropdown
let flightAirLineInputOptions = document.querySelectorAll('#airport_line_name_dropdown h3');

flightAirLineInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        if (option.textContent === 'حذف') {
            flightAirLineInput.value = ''; // Set input value as '' if the 'حذف' h3 is clicked

        } else {
            flightAirLineInput.value = option.textContent; // Set input value to selected option
        }

        hideOverlay(); // Hide overlay after selection
    });
});

/* Function to store the clicjed city name inside the clikced unput */
insertFlightDestinationCityInputValue = function (clickedInputIdName) {
    let clickedInputDropdownIdName = 'airport_destination_name_dropdown';
    let clickedInputDropdown = document.getElementById(clickedInputDropdownIdName);

    // Store the reference to the last clicked input field
    lastClickedFlightDestinationInput = document.getElementById(clickedInputIdName);

    // Set the input field's value based on which input was clicked
    if (clickedInputIdName === 'flight_from_city_input_id') {
        lastClickedFlightDestinationInput = document.getElementById(event.target.id);
        showOverlay(clickedInputDropdownIdName); // Show the dropdown overlay for 'from city' input
    } else if (clickedInputIdName === 'flight_to_city_input_id') {
        lastClickedFlightDestinationInput = document.getElementById(event.target.id);
        showOverlay(clickedInputDropdownIdName); // Show the dropdown overlay for 'to city' input
    }

    // Add event listeners to h3 elements inside the dropdown
    let h3Elements = clickedInputDropdown.querySelectorAll('h3');
    h3Elements.forEach(h3 => {
        h3.onclick = function () {

            // Play a sound effect
            playSoundEffect('click');

            lastClickedFlightDestinationInput.value = this.innerText; // Set input value to h3 inner text
            hideOverlay(); // Hide the overlay after selection
        };
    });
}





/* Function to run the dropdown functonality for flight people amount */
let flightAdultPersonAmountInput = document.getElementById('flight_adult_person_amount_input_id');

// Get the options within the dropdown
let flightAdultPersonAmountInputOptions = document.querySelectorAll('#flight_adult_people_amount_dropdown h3');

flightAdultPersonAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        flightAdultPersonAmountInput.value = option.textContent; // Set input value to selected option
        hideOverlay(); // Hide overlay after selection
    });
});



let infantPackagePersonAmountInput = document.getElementById('infant_package_person_amount_input_id');

// Get the options within the dropdown
let infantPackagePersonAmountInputOptions = document.querySelectorAll('#infat_whole_package_people_amount_dropdown h3');

infantPackagePersonAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        if (option.textContent === 'حذف') {
            infantPackagePersonAmountInput.value = ''; // Set input value as '' if the 'حذف' h3 is clicked

            /* Store the package infant amount for later use when importing */
            document.getElementById('store_google_sheet_package_infant_amount_value').innerText = '';


        } else {
            infantPackagePersonAmountInput.value = option.textContent; // Set input value to selected option

            /* Store the package infant amount for later use when importing */
            document.getElementById('store_google_sheet_package_infant_amount_value').innerText = option.textContent;

        }
        hideOverlay(); // Hide overlay after selection
    });
});







let flightInfantPersonAmountInput = document.getElementById('flight_infant_person_amount_input_id');

// Get the options within the dropdown
let flightInfantPersonAmountInputOptions = document.querySelectorAll('#flight_infant_people_amount_dropdown h3');

flightInfantPersonAmountInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');


        if (option.textContent === 'حذف') {
            flightInfantPersonAmountInput.value = ''; // Set input value as '' if the 'حذف' h3 is clicked

        } else {
            flightInfantPersonAmountInput.value = option.textContent; // Set input value to selected option
        }
        hideOverlay(); // Hide overlay after selection
    });
});



let flightExtraBagsInput = document.getElementById('flight_extra_bags_input_id');

// Get the options within the dropdown
let flightExtraBagsInputOptions = document.querySelectorAll('#airport_extra_bags_name_dropdown h3');

flightExtraBagsInputOptions.forEach(option => {
    option.addEventListener('click', () => {

        // Play a sound effect
        playSoundEffect('click');

        if (option.textContent === 'حذف') {
            flightExtraBagsInput.value = ''; // Set input value as '' if the 'حذف' h3 is clicked

        } else {
            flightExtraBagsInput.value = option.textContent; // Set input value to selected option
        }

        hideOverlay(); // Hide overlay after selection
    });
});






















































/* Function to show clint movements places page */
showClintMovemtsPlacesPage = function (clickedClintMovementsPlacesLocation) {

    // Disable scrolling
    document.body.style.overflow = 'hidden'; // Disable page scrolling during drag


    /* Show the clint movements visting places based on the value of the 'clint_movements_current_city_input_id' */
    if (clickedClintMovementsPlacesLocation.innerText === 'كوتا') {
        kuta_clint_movements_places_div.style.display = 'block';
        ubud_clint_movements_places_div.style.display = 'none';
        jakarta_clint_movements_places_div.style.display = 'none';
        puncak_clint_movements_places_div.style.display = 'none';
        bandung_clint_movements_places_div.style.display = 'none';
        lombok_clint_movements_places_div.style.display = 'none';


    } else if (clickedClintMovementsPlacesLocation.innerText === 'اوبود') {
        kuta_clint_movements_places_div.style.display = 'none';
        ubud_clint_movements_places_div.style.display = 'block';
        jakarta_clint_movements_places_div.style.display = 'none';
        puncak_clint_movements_places_div.style.display = 'none';
        bandung_clint_movements_places_div.style.display = 'none';
        lombok_clint_movements_places_div.style.display = 'none';

    } else if (clickedClintMovementsPlacesLocation.innerText === 'جاكرتا') {
        kuta_clint_movements_places_div.style.display = 'none';
        ubud_clint_movements_places_div.style.display = 'none';
        jakarta_clint_movements_places_div.style.display = 'block';
        puncak_clint_movements_places_div.style.display = 'none';
        bandung_clint_movements_places_div.style.display = 'none';
        lombok_clint_movements_places_div.style.display = 'none';

    } else if (clickedClintMovementsPlacesLocation.innerText === 'بونشاك') {
        kuta_clint_movements_places_div.style.display = 'none';
        ubud_clint_movements_places_div.style.display = 'none';
        jakarta_clint_movements_places_div.style.display = 'none';
        puncak_clint_movements_places_div.style.display = 'block';
        bandung_clint_movements_places_div.style.display = 'none';
        lombok_clint_movements_places_div.style.display = 'none';

    } else if (clickedClintMovementsPlacesLocation.innerText === 'باندونج') {
        kuta_clint_movements_places_div.style.display = 'none';
        ubud_clint_movements_places_div.style.display = 'none';
        jakarta_clint_movements_places_div.style.display = 'none';
        puncak_clint_movements_places_div.style.display = 'none';
        bandung_clint_movements_places_div.style.display = 'block';
        lombok_clint_movements_places_div.style.display = 'none';

    } else if (clickedClintMovementsPlacesLocation.innerText === 'لومبوك') {
        kuta_clint_movements_places_div.style.display = 'none';
        ubud_clint_movements_places_div.style.display = 'none';
        jakarta_clint_movements_places_div.style.display = 'none';
        puncak_clint_movements_places_div.style.display = 'none';
        bandung_clint_movements_places_div.style.display = 'none';
        lombok_clint_movements_places_div.style.display = 'block';

    }



    /* Get the 'all_clint_movements_places_page_divs_container' element */
    let clintMovementsPlacesPageDiv = document.getElementById('all_clint_movements_places_page_divs_container');

    // Show the clint movements places page div
    clintMovementsPlacesPageDiv.style.display = 'flex';

    // Make the clint movements places page div scrollable
    clintMovementsPlacesPageDiv.style.overflowY = 'scroll';

    // Prevent scrolling of the body
    document.body.style.overflow = 'hidden';


    // Create the exit icon
    let exitClintMovementsPlacesPage = document.createElement('ion-icon');
    exitClintMovementsPlacesPage.name = 'arrow-undo-circle-outline';
    exitClintMovementsPlacesPage.className = 'exit_full_screen_icon';
    document.body.appendChild(exitClintMovementsPlacesPage);


    // Function to hide the clint movements places page and remove the exit button
    exitClintMovementsPlacesPage.onclick = function () {


        /* Hide all clint movements places options */
        kuta_clint_movements_places_div.style.display = 'none';
        ubud_clint_movements_places_div.style.display = 'none';
        jakarta_clint_movements_places_div.style.display = 'none';
        puncak_clint_movements_places_div.style.display = 'none';
        bandung_clint_movements_places_div.style.display = 'none';
        lombok_clint_movements_places_div.style.display = 'none';
        clintMovementsPlacesPageDiv.style.display = 'none';


        document.body.style.overflow = ''; // Restore body scrolling


        if (exitClintMovementsPlacesPage) {
            exitClintMovementsPlacesPage.remove();
        }

        // Enable scrolling
        document.body.style.overflow = ''; // Re-enable page scrolling
    }



    /* Function to pick a clint movements place */
    pickThisClintMovementsPlace = function (clickedPlace) {


        // Copy the text of the clicked <p> element to the clipboard
        let textToCopy = clickedPlace.innerText;

        // Create a temporary textarea element to facilitate copying
        let tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        document.body.appendChild(tempTextarea);

        // Select the text and copy it to the clipboard
        tempTextarea.select();
        document.execCommand('copy');

        // Remove the temporary textarea element
        document.body.removeChild(tempTextarea);



        /* Get the 'all_clint_movements_places_page_divs_container' element */
        let clintMovementsPlacesPageDiv = document.getElementById('all_clint_movements_places_page_divs_container');


        /* Hide all clint movements places options */
        kuta_clint_movements_places_div.style.display = 'none';
        ubud_clint_movements_places_div.style.display = 'none';
        jakarta_clint_movements_places_div.style.display = 'none';
        puncak_clint_movements_places_div.style.display = 'none';
        bandung_clint_movements_places_div.style.display = 'none';
        lombok_clint_movements_places_div.style.display = 'none';



        /* Hide the holde clint visiting places divs container */
        clintMovementsPlacesPageDiv.style.display = 'none';


        document.body.style.overflow = ''; // Restore body scrolling

        if (exitClintMovementsPlacesPage) {
            exitClintMovementsPlacesPage.remove();
        }


        // Enable scrolling
        document.body.style.overflow = ''; // Re-enable page scrolling

    }


}


/* Function to hide or show the 'downloaded_pdf_package_including_data_page' section */
hideAndShowPackageIncludingAndNotIncludingSectionFunction = function () {

    if (document.getElementById('downloaded_pdf_package_including_data_page').style.display === 'none') {
        document.getElementById('downloaded_pdf_package_including_data_page').style.display = 'block';

    } else {
        document.getElementById('downloaded_pdf_package_including_data_page').style.display = 'none';
    }

}


/* Function to hide or show the 'downloaded_pdf_flight_data_page' section */
hideAndShowFlightSectionFunction = function () {

    if (document.getElementById('downloaded_pdf_flight_data_page').style.display === 'none') {
        document.getElementById('downloaded_pdf_flight_data_page').style.display = 'block';

    } else {
        document.getElementById('downloaded_pdf_flight_data_page').style.display = 'none';
    }

}


/* Function to hide or show the 'downloaded_pdf_clint_movements_data_page' section */
hideAndShowClintMovementSectionFunction = function () {

    if (document.getElementById('downloaded_pdf_clint_movements_data_page').style.display === 'none') {
        document.getElementById('downloaded_pdf_clint_movements_data_page').style.display = 'block';
        document.getElementById('inserted_clint_movements_data_position_div').style.display = 'block';

    } else {
        document.getElementById('downloaded_pdf_clint_movements_data_page').style.display = 'none';
        document.getElementById('inserted_clint_movements_data_position_div').style.display = 'none';
    }
}






// Function to parse a date string in 'DD month' format
function parseDate(dateString) {
    let arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    let parts = dateString.split(' ');
    let day = parseInt(parts[0]);
    let month = arabicMonths.indexOf(parts[1]);
    let year = new Date().getFullYear(); // Assuming the current year

    return new Date(year, month, day);
}

// Function to format a date in Arabic month format
function formatDate(date) {
    let arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    let day = date.getDate();
    let month = arabicMonths[date.getMonth()];
    return `${day} ${month}`;
}






























// Function to show the overlay
function showOverlay(clickedInputDropdownIdName) {

    // Disable scrolling
    document.documentElement.style.overflow = 'hidden';


    let clickedInputDropdown = document.getElementById(clickedInputDropdownIdName);

    // Store the reference to the last clicked input field
    lastClickedClintMovementsCityInput = document.getElementById(event.target.id);
    clickedInputDropdown.classList.add('show'); // Show the clicked input dropdown
    clickedInputDropdown.style.transition = 'transform 0.2s ease-in-out'; // Ensure transform transition is smooth

    overlayLayer = document.createElement('div'); // Create a new overlay element
    overlayLayer.className = 'black_overlay'; // Set the class name for styling
    overlayLayer.onclick = hideOverlay; // Set the click event listener to hide the overlay when clicked outside
    document.body.appendChild(overlayLayer); // Append overlay to the document body

    setTimeout(() => {
        overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance
    }, 50);
}


// Function to hide the overlay and any visible dropdown
function hideOverlay() {

    // Re-enable scrolling
    document.documentElement.style.overflow = 'auto';


    // Check if any dropdown with the class name 'searchable_names_dropdown_class' is visible and hide it
    let visibleDropdown_1 = document.querySelector('.searchable_names_dropdown_class.show');
    if (visibleDropdown_1) {
        visibleDropdown_1.classList.remove('show'); // Remove 'show' class to hide dropdown
    }


    // Reset all 'searchable_names_dropdown_class' elements back to their default styling
    let dropdownDivElements = document.querySelectorAll('.searchable_names_dropdown_class');
    dropdownDivElements.forEach(dropdown => {
        dropdown.style.maxHeight = ''; // Reset maxHeight to default
        dropdown.style.minHeight = ''; // Reset minHeight to default
        dropdown.style.transition = ''; // Reset transition to default
    });

    // Hide the overlay if it exists
    if (overlayLayer) {
        overlayLayer.style.opacity = '0'; // Set opacity to 0 for smooth disappearance

        setTimeout(() => {
            if (overlayLayer) {
                document.body.removeChild(overlayLayer); // Remove overlay from DOM
                overlayLayer = null; // Reset overlay variable
            }
        }, 200); // Assuming 200ms is the duration of your opacity transition
    }
}
































// Arabic month names
let innerDatePickerArabicMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Arabic day names
let arabicDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


// Arabic month names
let arabicMonths = {
    January: 'Jan',
    February: 'Feb',
    March: 'Mar',
    April: 'Apr',
    May: 'May',
    June: 'Jun',
    July: 'Jul',
    August: 'Aug',
    September: 'Sep',
    October: 'Oct',
    November: 'Nov',
    December: 'Dec'
};

// Arabic month names reverse lookup
let arabicMonthsReverse = {
    'Jan': 'January',
    'Feb': 'February',
    'Mar': 'March',
    'Apr': 'April',
    'May': 'May',
    'Jun': 'June',
    'Jul': 'July',
    'Aug': 'August',
    'Sep': 'September',
    'Oct': 'October',
    'Nov': 'November',
    'Dec': 'December'
};


// Function to calculate the difference in days between two dates
function calculateDaysDifference(startDate, endDate) {
    if (!startDate || !endDate) return '';
    let [startDay, startMonth] = startDate.split(' ');
    let [endDay, endMonth] = endDate.split(' ');

    let start = new Date(`${arabicMonthsReverse[startMonth]} ${startDay}, ${new Date().getFullYear()}`);
    let end = new Date(`${arabicMonthsReverse[endMonth]} ${endDay}, ${new Date().getFullYear()}`);
    let diffTime = end - start; // Difference in time
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Difference in days
    return diffDays;
}


// Arabic month names
let arabicMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Helper function to get Arabic month name from month number
function getArabicMonthName(monthNumber) {
    return arabicMonthNames[monthNumber];
}









/* Store the hotel total nights for later use (when inserting hotel row data) */
let storePackageTotalNights;


// Variables to track the visibility of the date pickers
var isWholePackageStartDatePickerVisible = false;
var isWholePackageEndDatePickerVisible = false;

// Helper function to parse Arabic date strings (already provided)
function parseArabicDate(dateStr, year = null) {
    let parts = dateStr.split(' ');
    let day = parseInt(parts[0]);
    let monthShortNames = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };
    let month = monthShortNames[parts[1]];
    year = year || new Date().getFullYear(); // Use provided year or default to current year
    return new Date(year, month, day);
}


// Function to update the total nights input for whole package
function updateWholePackageTotalNights() {
    let startDateInput = document.getElementById('whole_package_start_date_input_id');
    let endDateInput = document.getElementById('whole_package_end_date_input_id');
    let totalNightsInput = document.getElementById('package_total_nights_input_id');

    let startDate = startDateInput.value;
    let endDate = endDateInput.value;

    if (startDate !== '' && endDate !== '') {
        let parsedStartDate = parseArabicDate(startDate, selectedStartYear);
        let parsedEndDate = parseArabicDate(endDate, parsedStartDate.getFullYear());

        if (parsedEndDate < parsedStartDate) {
            parsedEndDate.setFullYear(parsedStartDate.getFullYear() + 1);
        }

        let totalNights = wholePackageCalculateDaysDifference(parsedStartDate, parsedEndDate);

        storePackageTotalNights = totalNights;
        totalNightsInput.value = `${totalNights} ليالي`;

        if (parsedStartDate >= parsedEndDate) {
            endDateInput.value = '';
            totalNightsInput.value = '';
        }
    } else {
        totalNightsInput.value = '';
    }
}

function wholePackageCalculateDaysDifference(startDate, endDate) {
    let diff = endDate - startDate;
    return Math.round(diff / (1000 * 60 * 60 * 24));
}


// Function to disable specific dates
function disableSpecificDates(date, startDateInputId) {
    let startDateInput = document.getElementById(startDateInputId).value;
    if (startDateInput) {
        let startDate = parseArabicDate(startDateInput);
        return date.getTime() <= startDate.getTime(); // Disable the exact start date and any date before it
    }
    return false;
}

// Variable to store the selected year and month of the start date
let selectedStartYear;
let selectedStartMonth;

// Get today's date
var today = new Date();



// Inputs date for whole package start period
var wholePackageStartDatePicker = new Pikaday({
    field: document.getElementById('whole_package_start_date_input_id'),
    format: 'DD-M',
    minDate: today,
    toString(date, format) {
        let day = date.getDate();
        let month = getArabicMonthName(date.getMonth());
        return `${day} ${month}`;
    },
    i18n: {
        previousMonth: '',
        nextMonth: '',
        months: innerDatePickerArabicMonths,
        weekdays: arabicDays,
        weekdaysShort: arabicDays
    },
    onSelect: function () {

        // Play a sound effect
        playSoundEffect('click');

        // Clear the end date and total nights inputs
        document.getElementById('whole_package_end_date_input_id').value = '';
        document.getElementById('package_total_nights_input_id').value = '';

        isWholePackageStartDatePickerVisible = false; // Reset visibility state on date selection
        updateWholePackageTotalNights();
        let selectedDate = this.getDate();
        selectedStartYear = selectedDate.getFullYear(); // Store the selected year
        selectedStartMonth = selectedDate.getMonth();   // Store the selected month
        let minEndDate = new Date(selectedDate);
        minEndDate.setDate(minEndDate.getDate() + 1); // Ensure end date is at least one day after the start date
        wholePackageEndDatePicker.setMinDate(minEndDate); // Update min date for the second picker

        // Automatically open the end date picker
        wholePackageEndDatePicker.show();
    }
});

// Inputs date for whole package end period
var wholePackageEndDatePicker = new Pikaday({
    field: document.getElementById('whole_package_end_date_input_id'),
    format: 'DD-M',
    minDate: today,
    toString(date, format) {
        let day = date.getDate();
        let month = getArabicMonthName(date.getMonth());

        // Check if the year needs to be included
        let year = '';
        if (selectedStartYear && date.getFullYear() !== selectedStartYear) {
            year = ` ${date.getFullYear()}`;
        }

        return `${day} ${month}${year}`;
    },
    i18n: {
        previousMonth: '',
        nextMonth: '',
        months: innerDatePickerArabicMonths,
        weekdays: arabicDays,
        weekdaysShort: arabicDays
    },
    disableDayFn: function (date) {
        return disableSpecificDates(date, 'whole_package_start_date_input_id');
    },
    onOpen: function () {
        let endDateInput = document.getElementById('whole_package_end_date_input_id').value;
        let startDateInput = document.getElementById('whole_package_start_date_input_id').value;

        let currentDate;
        if (endDateInput) {
            // If there's a date in the end date input, parse it and navigate to that date
            currentDate = parseArabicDate(endDateInput);
        } else if (startDateInput) {
            // If there's a start date, parse it and navigate to that date
            currentDate = parseArabicDate(startDateInput);
        } else {
            // Default to today or previously selected date
            currentDate = this.getDate() || new Date();
        }

        if (selectedStartYear && selectedStartMonth !== undefined) {
            currentDate.setFullYear(selectedStartYear);
            currentDate.setMonth(selectedStartMonth);
        }

        this.gotoDate(currentDate);
    },
    onSelect: function () {
        let selectedDate = this.getDate();

        // Play a sound effect
        playSoundEffect('click');

        // Check if the selected date is in the same year as the start date
        if (selectedStartYear && selectedDate.getFullYear() !== selectedStartYear) {
            this._o.field.value = `${selectedDate.getDate()} ${getArabicMonthName(selectedDate.getMonth())} ${selectedDate.getFullYear()}`;
        } else {
            this._o.field.value = `${selectedDate.getDate()} ${getArabicMonthName(selectedDate.getMonth())}`;
        }


        /* Run the close sell function to update based on the picked dates */
        fetchAllCloseSellDataFunction_Supabase();


        isWholePackageEndDatePickerVisible = false; // Reset visibility state on date selection
        updateWholePackageTotalNights(); // Call 'updateWholePackageTotalNights' when a date is selected
    }
});





// Object to store allowed dates
let allowedDates = {};




// Call createH3ElementsForAvailableDates whenever you need to update the dates
function updateAllowedDates() {
    // Get the start date and total nights inputs
    let startDateInput = document.getElementById('whole_package_start_date_input_id').value;
    let totalNightsInput = document.getElementById('package_total_nights_input_id').value;

    // If start date or total nights are empty, clear the allowed dates object
    if (!startDateInput || !totalNightsInput) {
        allowedDates = {};
        createH3ElementsForAvailableDates(); // Clear the target div
        return;
    }

    // Parse the start date
    let parsedStartDate = parseArabicDate(startDateInput, selectedStartYear);

    // Extract the number of nights (remove " ليالي" and convert to integer)
    let totalNights = parseInt(totalNightsInput.replace(" ليالي", ""), 10);

    // Clear the previous allowed dates
    allowedDates = {};

    // Populate the allowed dates object
    for (let i = 0; i <= totalNights; i++) {
        let allowedDate = addDaysToDate(parsedStartDate, i);

        // Combine the day and month name in Arabic into a single string
        let dateStr = `${allowedDate.getDate()} ${getArabicMonthName(allowedDate.getMonth())}`;
        allowedDates[i] = dateStr;
    }



    // Call the function to create and append h3 elements
    createH3ElementsForAvailableDates();
}


// Function to be called whenever the start date or total nights input changes
function updateDatesOnInputChange() {
    updateWholePackageTotalNights();
    createH3ElementsForAvailableDates(); // Call to update and copy h3 elements
}

// Event listeners for start date and total nights inputs
document.getElementById('whole_package_start_date_input_id').addEventListener('change', updateDatesOnInputChange);
document.getElementById('package_total_nights_input_id').addEventListener('input', updateDatesOnInputChange);

// Example helper functions
function parseArabicDate(dateStr, year = null) {
    let parts = dateStr.split(' ');
    let day = parseInt(parts[0]);
    let monthShortNames = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };
    let month = monthShortNames[parts[1]];
    year = year || new Date().getFullYear(); // Use provided year or default to current year
    return new Date(year, month, day);
}

function addDaysToDate(date, days) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}




// Function to toggle the visibility of the Whole Package Start Date Picker
document.getElementById('whole_package_start_date_input_id').addEventListener('click', function () {
    if (!isWholePackageStartDatePickerVisible) {
        wholePackageStartDatePicker.show();
        isWholePackageStartDatePickerVisible = true;
    } else {
        wholePackageStartDatePicker.hide();
        isWholePackageStartDatePickerVisible = false;
    }
});

// Function to toggle the visibility of the Whole Package End Date Picker
document.getElementById('whole_package_end_date_input_id').addEventListener('click', function () {
    if (!isWholePackageEndDatePickerVisible) {
        wholePackageEndDatePicker.show();
        isWholePackageEndDatePickerVisible = true;
    } else {
        wholePackageEndDatePicker.hide();
        isWholePackageEndDatePickerVisible = false;
    }
});





























// Function to initialize Pikaday with Arabic support
var startDatePicker = new Pikaday({
    field: document.getElementById('flight_date_input_id'),
    format: 'DD-M',
    minDate: new Date(),
    toString(date, format) {
        let day = date.getDate();
        let month = getArabicMonthName(date.getMonth());
        return `${day} ${month}`;
    },
    onSelect: function () {

        // Play a sound effect
        playSoundEffect('click');


        isDatePickerVisible = false; // Reset the visibility state when a date is selected
    },
    i18n: {
        previousMonth: '',
        nextMonth: '',
        months: innerDatePickerArabicMonths,
        weekdays: arabicDays,
        weekdaysShort: arabicDays
    }
});

var isDatePickerVisible = false;

document.getElementById('flight_date_input_id').addEventListener('click', function (e) {
    e.stopPropagation(); // Prevent the click event from propagating

    if (isDatePickerVisible) {
        startDatePicker.hide();
    } else {
        startDatePicker.show();
    }

    isDatePickerVisible = !isDatePickerVisible;
});

// Prevent the date picker from hiding when clicking inside it
startDatePicker.el.addEventListener('click', function (e) {
    e.stopPropagation();
});

// Hide the date picker when clicking outside
document.addEventListener('click', function () {
    if (isDatePickerVisible) {
        startDatePicker.hide();
        isDatePickerVisible = false;
    }
});




/* Function for the time picking */
$(document).ready(function () {
    $('#flight_fly_away_time_input_id').pickatime({
        format: 'HH:i',
        interval: 5,
        min: [0, 0],
        max: [23, 59],
        onSet: function () {
            // Play a sound effect
            playSoundEffect('click');
        }
    });

    $('#flight_arrival_time_input_id').pickatime({
        format: 'HH:i',
        interval: 5,
        min: [0, 0],
        max: [23, 59],
        onSet: function () {
            // Play a sound effect
            playSoundEffect('click');
        }
    });
});










































































/* Function to open full screen textarea */
function toggleFullscreen(textAreaId) {
    let textarea = document.getElementById(textAreaId);
    let body = document.body;

    // Disable scrolling
    body.style.overflow = 'hidden';

    // Save the original styles to restore when exiting full-screen
    let originalStyles = {
        width: textarea.style.width,
        height: textarea.style.height,
        zIndex: textarea.style.zIndex,
        position: textarea.style.position,
        top: textarea.style.top,
        left: textarea.style.left,
        transform: textarea.style.transform // Save the transform style
    };

    // Set textarea to full-screen size and center it
    textarea.style.width = '90vw';
    textarea.style.height = '90vh';
    textarea.style.zIndex = '1000';
    textarea.style.position = 'fixed';
    textarea.style.top = '50%'; // Center vertically
    textarea.style.left = '50%'; // Center horizontally
    textarea.style.transform = 'translate(-50%, -50%)'; // Adjust position to center

    // Create an overlay layer for better visual effect
    let overlayLayer = document.createElement('div');
    overlayLayer.classList.add('black_overlay');
    document.body.appendChild(overlayLayer);
    setTimeout(() => {
        overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance
    }, 50);

    // Create an exit button
    let exitTextAreaFullScreenButton = document.createElement('ion-icon');
    exitTextAreaFullScreenButton.name = 'arrow-undo-circle-outline';
    exitTextAreaFullScreenButton.classList.add('exit_full_screen_icon');
    exitTextAreaFullScreenButton.onclick = function () {

        // Play a sound effect
        playSoundEffect('click');


        // Restore original styles
        textarea.style.width = originalStyles.width;
        textarea.style.height = originalStyles.height;
        textarea.style.zIndex = originalStyles.zIndex;
        textarea.style.position = originalStyles.position;
        textarea.style.top = originalStyles.top;
        textarea.style.left = originalStyles.left;
        textarea.style.transform = originalStyles.transform; // Restore the transform style

        // Remove overlay from DOM
        overlayLayer.parentNode.removeChild(overlayLayer);
        overlayLayer = null; // Reset overlay variable

        // Re-enable scrolling
        body.style.overflow = 'auto';

        // Remove exit button
        exitTextAreaFullScreenButton.remove();
    };

    // Append exit button to body
    document.body.appendChild(exitTextAreaFullScreenButton);

}
