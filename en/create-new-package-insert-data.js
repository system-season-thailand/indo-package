/* Ensure To Use The "Re-Create the data" Codes */




/* Variable to save a number for counting functionality (Ex: hotel row table unique id..?) */
let insertedFlightDataDivUniqueId;
let insertedHotelDataDivUniqueId;
let insertedClintMovementsRowDivUniqueId = 1;















/* Down All Functions For Clint Data Down */

/* Function to create the clint data row */
createWholePackageAndClintDataFunction = function () {
    // Get references to all input elements for later use
    let packageClintNameInput = document.getElementById('package_clint_name_input_id').value;
    let packageClintCodeNumberInput = document.getElementById('package_clint_code_number_input_id').value;
    let adultPackagePersonAmountInput = document.getElementById('adult_package_person_amount_input_id').value;
    let kidsPackagePersonAmountInput = document.getElementById('kids_package_person_amount_input_id').value;
    let infantPackagePersonAmountInput = document.getElementById('infant_package_person_amount_input_id').value;
    let wholePackageStartDateInput = document.getElementById('whole_package_start_date_input_id').value;
    let wholePackageEndDateInput = document.getElementById('whole_package_end_date_input_id').value;
    let clintCompanyNameInput = document.getElementById('clint_company_name_input_id').value;
    let websiteUsersNameInput = document.getElementById('website_users_name_input_id').value;


    if (wholePackageStartDateInput === '' || wholePackageEndDateInput === '' || websiteUsersNameInput === '') {

        // Play a sound effect
        playSoundEffect('error');



        // Change the submit icon color to green to indicate success
        clint_inputs_submit_icon.style.backgroundColor = 'red';
        // Set the background color of the submit icon back to default color
        setTimeout(() => {
            clint_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
        }, 500);


    } else {


        /* in case if field getting the vlaue of the mostTopEmptyCellRowNumberValue from the google sheet then stop the process */
        if (mostTopEmptyCellRowNumberValue === undefined || mostTopEmptyCellRowNumberValue === null || mostTopEmptyCellRowNumberValue === NaN) {

            /* Refresh the page */
            location.reload();
        }




        // Play a sound effect
        playSoundEffect('success');


        // Change the submit icon color to green to indicate success
        clint_inputs_submit_icon.style.backgroundColor = 'rgb(0, 255, 0)';
        // Set the background color of the submit icon back to default color
        setTimeout(() => {
            clint_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
        }, 500);





        if (clintCompanyNameInput !== '') {
            // Create a new image element for the company logo
            let insertedCompanyNameLogoImage = document.createElement('img');
            // Replace spaces with dashes in the company name
            let companyNameWithoutSpaces = clintCompanyNameInput.replace(/\s+/g, '-');
            insertedCompanyNameLogoImage.src = `../خلفية-الشركات/${companyNameWithoutSpaces}.jpg`;
            ; // Assuming this path is correct
            insertedCompanyNameLogoImage.className = 'inserted_company_name_logo';
            insertedCompanyNameLogoImage.id = 'inserted_company_name_logo_id';
            insertedCompanyNameLogoImage.onclick = function (event) {
                event.stopPropagation(); // Stop the event from propagating further

                // Create overlay layer
                let overlayLayer = document.createElement('div');
                overlayLayer.className = 'black_overlay';
                overlayLayer.id = 'black_overlay_id';
                document.body.appendChild(overlayLayer);

                // Show overlay layer with smooth opacity transition
                setTimeout(() => {
                    overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance
                }, 100);

                // Slide in delete box options div
                let deleteHotelCardDiv = document.getElementById('ensure_delete_company_logo_div');

                // Smoothly slide to the middle of the screen
                setTimeout(() => {
                    deleteHotelCardDiv.style.transform = 'translate(-50%, -50%)'; // Slide to the center of the screen
                }, 50); // Adjust timing as needed

                // Event listener to close overlay and delete box div on click outside
                overlayLayer.onclick = () => {
                    // Hide delete box options div
                    deleteHotelCardDiv.style.transform = 'translate(-50%, -130vh)';

                    // Hide overlay layer with opacity transition
                    overlayLayer.style.opacity = '0';

                    // Remove overlay and delete box div from DOM after transition
                    setTimeout(() => {
                        document.body.removeChild(overlayLayer);
                    }, 300); // Match transition duration in CSS
                };
            };

            // Delete any existing company image inside the 'inserted_company_name_image_position_div'
            document.getElementById('inserted_company_name_image_position_div').innerHTML = '';


            // Set the inner 'inserted_company_name_image_position_div' image just for website image
            document.getElementById('inserted_company_name_image_position_div').appendChild(insertedCompanyNameLogoImage);


            // Set the 'welcome_pdf_first_page_image_id' src to the clicked company logo name for pdf image
            document.getElementById('welcome_pdf_first_page_image_id').src = `../خلفية-الشركات/${companyNameWithoutSpaces}.jpg`;


            /* Show the company logo from the website */
            document.getElementById('inserted_company_name_image_position_div').style.display = 'flex';


        } else {
            // Reset the 'welcome_pdf_first_page_image_id' src to the default image
            document.getElementById('welcome_pdf_first_page_image_id').src = 'first-pdf-image.jpg';

            /* Hide the company logo from the website */
            document.getElementById('inserted_company_name_image_position_div').style.display = 'none';

            /* Delete any existing logo */
            document.getElementById('inserted_company_name_image_position_div').innerHTML = '';
        }







        /* Get the h6 element to set the package type text */
        let clintPackagePriceTypeH6 = document.getElementById('package_price_type_h6_id');

        /* Check which checkbox is checked then include the text in the content */
        /* on 10 Mar 2025 delete the following if "store_google_sheet_clint_package_price_type_checkbox_value" exist or no condition (I used it to avoid error in old saved packages) */
        if (document.getElementById('store_google_sheet_clint_package_price_type_checkbox_value')) {

            if (document.getElementById('economy_package_checkbox').checked) {
                clintPackagePriceTypeH6.innerHTML = `  (Economy Package)`;
                document.getElementById('store_google_sheet_clint_package_price_type_checkbox_value').innerText = 'Economy Package';

                /* Make sure to show the element */
                document.getElementById('package_price_type_h6_id').style.display = 'block';


            } else if (document.getElementById('medium_package_checkbox').checked) {
                clintPackagePriceTypeH6.innerHTML = `  (Medium Package)`;
                document.getElementById('store_google_sheet_clint_package_price_type_checkbox_value').innerText = 'Medium Package';

                /* Make sure to show the element */
                document.getElementById('package_price_type_h6_id').style.display = 'block';


            } else if (document.getElementById('vip_package_checkbox').checked) {
                clintPackagePriceTypeH6.innerHTML = `  (VIP Package)`;
                document.getElementById('store_google_sheet_clint_package_price_type_checkbox_value').innerText = 'VIP Package';

                /* Make sure to show the element */
                document.getElementById('package_price_type_h6_id').style.display = 'block';




                /* If no checkbox is checked then reset the value of the h6 and hide it */
            } else {
                document.getElementById('package_price_type_h6_id').innerText = '';
                document.getElementById('package_price_type_h6_id').style.display = 'none';

            }

        }




        /* Get the h6 element to set the package type text */
        let clintPackageTypeH6 = document.getElementById('clint_package_type_h6');

        /* Check which checkbox is checked then include the text in the content */
        if (document.getElementById('honeymoon_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Honeymooners Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Honeymooners Package';

            if (document.getElementById('package_emoji_p_id')) {
                document.getElementById('package_emoji_p_id').innerText = '👩🏻‍❤️‍👨🏻';
            }


        } else if (document.getElementById('guys_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Guys Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Guys Package';


            if (document.getElementById('package_emoji_p_id')) {
                document.getElementById('package_emoji_p_id').innerText = '🤵🏻‍♂️';
            }

        } else if (document.getElementById('family_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Family Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Family Package';


            if (document.getElementById('package_emoji_p_id')) {
                document.getElementById('package_emoji_p_id').innerText = '👨‍👩‍👧‍👦';
            }

        } else if (document.getElementById('two_people_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Two People Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Two People Package';


            if (document.getElementById('package_emoji_p_id')) {
                document.getElementById('package_emoji_p_id').innerText = '💫';
            }

        } else if (document.getElementById('group_of_people_checkbox').checked) {
            clintPackageTypeH6.innerHTML = 'Group Package';
            document.getElementById('store_google_sheet_clint_package_type_checkbox_value').innerText = 'Group Package';


            if (document.getElementById('package_emoji_p_id')) {
                document.getElementById('package_emoji_p_id').innerText = '🤩';
            }

        } else {
            clintPackageTypeH6.innerHTML = 'New Package';

            if (document.getElementById('package_emoji_p_id')) {
                document.getElementById('package_emoji_p_id').innerText = '✨';
            }
        }





        /* if there is any value in the 'packageClintNameInput' then change the border styling and set the innerText of the p element */
        if (packageClintNameInput !== '') {

            /* Set the innerText of the p element */
            clint_full_name_p.innerText = `الأستاذ/ة : ${packageClintNameInput}`;

            /* Change the border styling for better looking */
            pdf_clint_info_section_title_div_id.style.borderBottom = '0.5px solid black';

            /* Show the p element if it was hidden */
            clint_full_name_p.style.display = 'block';


            /* Store the inserted clint name in the stored p elements for later use (when importing) */
            document.getElementById('store_google_sheet_clint_name_value').innerText = packageClintNameInput;


            /* But if there is no any value in the 'packageClintNameInput' then do the following code */
        } else {
            clint_full_name_p.innerText = '';

            pdf_clint_info_section_title_div_id.style.borderBottom = 'none';

            clint_full_name_p.style.display = 'none';

            document.getElementById('store_google_sheet_clint_name_value').innerText = '';
        }















        /* Match the whole website dates based on the changes of the 'whole_package_first_date_p_id' */
        if (document.getElementById('whole_package_first_date_p_id') && document.getElementById('whole_package_first_date_p_id').innerText !== wholePackageStartDateInput) {

            // Get the current date from the 'whole_package_first_date_p_id' element
            let currentStartDate = document.getElementById('whole_package_first_date_p_id').innerText;

            // Parse the current date and the new start date to Date objects
            let parsedCurrentStartDate = parseArabicDate(currentStartDate);
            let parsedNewStartDate = parseArabicDate(wholePackageStartDateInput);

            // Calculate the difference in days
            let timeDifference = parsedNewStartDate - parsedCurrentStartDate;
            let dayDifference = Math.round(timeDifference / (1000 * 3600 * 24));

            // Adjust hotel dates if there are any hotel rows for editing
            if (document.querySelectorAll('.hotel_row_class_for_editing').length > 0) {

                // Adjust the dates of elements with the specified class names
                let checkInElements = document.querySelectorAll('.hotel_check_in_date_for_matching_whole_package_date');
                let checkOutElements = document.querySelectorAll('.hotel_check_out_date_for_matching_whole_package_date');

                checkInElements.forEach(element => {
                    let checkInDate = element.innerText;
                    let parsedCheckInDate = parseArabicDate(checkInDate);
                    let newCheckInDate = new Date(parsedCheckInDate);
                    newCheckInDate.setDate(newCheckInDate.getDate() + dayDifference);
                    element.innerText = `${newCheckInDate.getDate()} ${getArabicMonthName(newCheckInDate.getMonth())}`;
                });

                checkOutElements.forEach(element => {
                    let checkOutDate = element.innerText;
                    let parsedCheckOutDate = parseArabicDate(checkOutDate);
                    let newCheckOutDate = new Date(parsedCheckOutDate);
                    newCheckOutDate.setDate(newCheckOutDate.getDate() + dayDifference);
                    element.innerText = `${newCheckOutDate.getDate()} ${getArabicMonthName(newCheckOutDate.getMonth())}`;
                });


                // Call a function to save the current dates of all hotels for later Re-arranging use (when drag and drop)
                saveOriginalHotelDates();
            }


            // Adjust flight dates if there are any flight rows for editing
            if (document.querySelectorAll('.flight_row_class_for_editing').length > 0) {

                let flyDates = document.querySelectorAll('.flight_date_for_matching_whole_package_date');

                flyDates.forEach(element => {
                    let flightDate = element.innerText;
                    let parsedFlightDate = parseArabicDate(flightDate);
                    let newFlightDate = new Date(parsedFlightDate);
                    newFlightDate.setDate(newFlightDate.getDate() + dayDifference);
                    element.innerText = `${newFlightDate.getDate()} ${getArabicMonthName(newFlightDate.getMonth())}`;
                });

            }

            // Adjust client movement dates if there are any client movement rows for editing
            if (document.querySelectorAll('.clint_movements_row_class_for_editing').length > 0) {

                // Target all divs with the class 'clint_movements_row_class_for_editing'
                let movementRows = document.querySelectorAll('.clint_movements_row_class_for_editing');

                movementRows.forEach(div => {
                    // Get the h1 element within the div
                    let dateElement = div.querySelector('h1');

                    // Check if h1 exists within the div
                    if (dateElement) {
                        // Get the date in Arabic format from the h1 element
                        let arabicDate = dateElement.innerText;

                        // Parse the Arabic date to a Date object
                        let parsedDate = parseArabicDate(arabicDate);

                        // Create a new date object and adjust it by the day difference
                        let newDate = new Date(parsedDate);
                        newDate.setDate(newDate.getDate() + dayDifference);

                        // Update the h1 element with the new date in Arabic format
                        dateElement.innerText = `${newDate.getDate()} ${getArabicMonthName(newDate.getMonth())}`;
                    }
                });
            }
        }







        // Adjust hotel dates if there are any hotel rows for editing
        if (document.querySelectorAll('.hotel_row_class_for_editing').length === 0) {

            document.getElementById('hotel_check_in_input_id').value = wholePackageStartDateInput;

            /* Reset the following input to start creating the hotels dates properly */
            document.getElementById('hotel_check_out_input_id').value = '';
            document.getElementById('hotel_total_nights_input_id').value = '';

        }





        /* Create a new variable to build all the clint info content */
        let insertedClintDataRowDivContent;

        /* Check if there is any data in the 'kidsPackagePersonAmountInput' then combine adult and kids amounts values */
        let combinedPersonAmount = `${adultPackagePersonAmountInput}`;
        if (kidsPackagePersonAmountInput !== '') {
            combinedPersonAmount += ` + ${kidsPackagePersonAmountInput}`;
        }


        /* Check if there is any data in the 'infantPackagePersonAmountInput' then combine adult and infant amounts values */
        if (infantPackagePersonAmountInput !== '') {
            combinedPersonAmount += ` ${infantPackagePersonAmountInput}`;
        }



        insertedClintDataRowDivContent = `
            <div>
                <p>${combinedPersonAmount}</p>
            </div>
            <div>
                <p id="whole_package_first_date_p_id">${wholePackageStartDateInput}</p>
            </div>
            <div>
                <p id="whole_package_last_date_p_id">${wholePackageEndDateInput}</p>
            </div>
            <div>
                <p>${storePackageTotalNights}</p>
            </div>
        `;






        /* Show the 'clint_data_row_main_div_id' if there is any data is inserted */
        document.getElementById('clint_data_row_main_div_id').style.display = 'flex';

        let insertedClintDataRowDiv = document.createElement('div');
        insertedClintDataRowDiv.className = 'clint_data_row_class clint_data_row_class_for_editing';
        insertedClintDataRowDiv.innerHTML = insertedClintDataRowDivContent;


        // Clear previous client data and insert the new data div
        let insertedClintDataPositionDiv = document.getElementById('inserted_clint_data_position_div');
        insertedClintDataPositionDiv.innerHTML = ''; // Clear the existing content
        insertedClintDataPositionDiv.appendChild(insertedClintDataRowDiv);




        /* Call a function to make sure if all package dates should be hidden or no */
        ensureAllPackageDatesHiddenOrNo();



        /* Store the inserted values in the stored p elements for later use (when importing) */
        document.getElementById('store_google_sheet_whole_package_first_date_value').innerText = wholePackageStartDateInput;
        document.getElementById('store_google_sheet_whole_package_last_date_value').innerText = wholePackageEndDateInput;
        document.getElementById('store_google_sheet_whole_package_total_nights_value').innerText = storePackageTotalNights;
        document.getElementById('store_google_sheet_package_user_name_value').innerText = websiteUsersNameInput;





        /* Create variable for stoing the last clicked website user name */
        let lastCLickedWebsiteUserNameVariable;



        if (document.getElementById('website_users_name_input_id').disabled !== true) {


            if (document.getElementById('package_user_code_name_for_later_import_reference_p_id').innerText === '' || document.getElementById('website_users_name_input_id').value !== lastCLickedWebsiteUserNameVariable) {
                /* Set the package code text based on the website user name & current year & saved packages amount */
                let websiteUsersNameInput;
                if (document.getElementById('website_users_name_input_id').value === 'بكج مستر سامي') {
                    websiteUsersNameInput = 'ss';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج عبد الله') {
                    websiteUsersNameInput = 'tt';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج معتز') {
                    websiteUsersNameInput = 'mm';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج وائل') {
                    websiteUsersNameInput = 'ww';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج عبد الرحمن') {
                    websiteUsersNameInput = 'oo';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج علي') {
                    websiteUsersNameInput = 'aa';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج ناصر') {
                    websiteUsersNameInput = 'zz';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج محمد') {
                    websiteUsersNameInput = 'hh';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج صبري') {
                    websiteUsersNameInput = 'kk';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج مستر ابو سما') {
                    websiteUsersNameInput = 'yy';

                } else if (document.getElementById('website_users_name_input_id').value === 'بكج بندر للتجربة') {
                    websiteUsersNameInput = 'bb';

                }


                // Get the current year as a four-digit number
                let currentYear = new Date().getFullYear();
                // Extract the last two digits of the year
                let lastTwoNumbersOfTheCurrentYear = currentYear % 100;


                /* Store the package user name code for displaying in the pdf file */
                document.getElementById('package_user_code_name_for_later_import_reference_p_id').innerText = `${websiteUsersNameInput}_indo_${lastTwoNumbersOfTheCurrentYear}_${mostTopEmptyCellRowNumberValue}`;



                /* Store the package user name code with no year for later use when importing data */
                document.getElementById('store_google_sheet_package_raw_user_with_no_riv_for_later_reference_when_importing').innerText = `${websiteUsersNameInput}_indo_${lastTwoNumbersOfTheCurrentYear}_${mostTopEmptyCellRowNumberValue}`;


                /* Store the last clicked website user name for later refrence if it got changed */
                lastCLickedWebsiteUserNameVariable = document.getElementById('package_user_code_name_for_later_import_reference_p_id').innerText;
            }
        }






        /* Set the inserted clint code number inside the 'package_clint_code_number_p_id' */
        document.getElementById('package_clint_code_number_p_id').innerText = packageClintCodeNumberInput;


        /* Also store the clint code number in the google sheet for later use (when importing data) */
        document.getElementById('store_google_sheet_package_clint_code_number_value').innerText = document.getElementById('package_clint_code_number_p_id').innerText;


        /* Show up the 'downloaded_pdf_clint_data_page' section */
        document.getElementById('downloaded_pdf_clint_data_page').style.display = 'block';
    }
}

/* Function to delete company logo */
deleteClickedCompanyLogo = function () {
    document.getElementById('inserted_company_name_image_position_div').innerHTML = '';

    // Slide in delete box options div
    let deleteHotelCardDiv = document.getElementById('ensure_delete_company_logo_div');


    // Reset the 'welcome_pdf_first_page_image_id' src to the default image
    document.getElementById('welcome_pdf_first_page_image_id').src = 'first-pdf-image.jpg';


    // Event listener to close overlay and delete box div on click outside
    // Hide delete box div
    deleteHotelCardDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    let overlayLayer = document.getElementById('black_overlay_id')

    overlayLayer.style.opacity = '0';

    // Remove overlay and delete box div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS
}

/* Up All Functions For Clint Data Up */





















/* Down All Funtions For Package Include And Not Include Down */

// Translation mapping for package including content
const packageIncludingTranslations = {
    // Private car with driver
    'سيارة خاصة مريحة (تويوتا افانزا او مايماثلها) مع سائق خاص طوال الرحلة مع برنامج يومي منظم مناسب لكم': 'Comfortable private car (Toyota Avanza or similar) with private driver throughout the trip with organized daily visits suitable for you',
    'سيارة خاصة مريحة (تويوتا افانزا': 'Comfortable private car (Toyota Avanza',
    'او مايماثلها) مع سائق خاص طوال الرحلة مع برنامج يومي منظم مناسب لكم': 'or similar) with private driver throughout the trip with organized daily visits suitable for you',
    'سيارة خاصة مريحة (تويوتا افانزا\n                            او مايماثلها) مع سائق خاص طوال الرحلة مع برنامج يومي منظم مناسب لكم': 'Comfortable private car (Toyota Avanza or similar) with private driver throughout the trip with organized daily visits suitable for you',

    // Additional car for luggage
    'سيارة إضافية للعفش': 'Additional car for luggage',

    // Watersport and Rafting activities
    'فعالية Watersport': 'Watersport Activity',
    'فعالية Rafting': 'Rafting Activity',

    // Hotel booking with breakfast
    'إقامة مريحة في فنادق ومنتجعات مختارة تشمل إفطار يومي لشخصين، وإقامة مجانية لطفل تحت 5 سنوات إن وجد': 'Comfortable accommodation in selected hotels and resorts including daily breakfast for two people, and free accommodation for a child under 5 years old if available',
    'إقامة مريحة في فنادق ومنتجعات': 'Comfortable accommodation in selected hotels and resorts',
    'مختارة تشمل إفطار يومي لشخصين، وإقامة مجانية لطفل تحت 5 سنوات إن وجد': 'including daily breakfast for two people, and free accommodation for a child under 5 years old if available',
    'إقامة مريحة في فنادق ومنتجعات\n                            مختارة تشمل إفطار يومي لشخصين، وإقامة مجانية لطفل تحت 5 سنوات إن وجد': 'Comfortable accommodation in selected hotels and resorts including daily breakfast for two people, and free accommodation for a child under 5 years old if available',

    // Welcome and transfer
    'الإستقبال والتوديع والتوصيل للفنادق والجولات السياحية': 'Welcoming and transport to hotels and tourist tours',
    'الإستقبال والتوديع والتوصيل للفنادق': 'Welcoming and transport to hotels and tourist tours',
    'والجولات السياحية': 'and tourist tours',
    'الإستقبال والتوديع والتوصيل للفنادق\n                            والجولات السياحية': 'Welcoming and transport to hotels and tourist tours',

    // Flight tickets
    'تذاكر الطيران الداخلي': 'Domestic flight tickets',
    'تذاكر الطيران الدولي': 'International flight tickets',

    // Customer service
    'خدمة عملاء 24 ساعة باللغة العربية لراحتكم وطمأنينتكم': '24-hour customer service in Arabic for your comfort and peace of mind',
    'خدمة عملاء 24 ساعة باللغة العربية لراحتكم': '24-hour customer service in Arabic for your comfort',
    'وطمأنينتكم': 'and peace of mind',
    'خدمة عملاء 24 ساعة باللغة العربية لراحتكم\n                            وطمأنينتكم': '24-hour customer service in Arabic for your comfort and peace of mind',

    // Internet cards
    'شرائح إنترنت': 'Internet cards',

    // Flower welcome
    'إستقبال ورد': 'Flower welcome',

    // Special oud
    'صندوق عود مميز': 'Special oud box',

    // Entrance fees and parking
    'تكاليف دخوليات + مواقف السيارت في الحدائق والمنتزهات': 'Entrance fees + car parking in gardens and parks',
    'تكاليف دخوليات + مواقف السيارت في الحدائق و': 'Entrance fees + car parking in gardens and',
    'المنتزهات': 'parks',
    'تكاليف دخوليات + مواقف السيارت في الحدائق و\n                            المنتزهات': 'Entrance fees + car parking in gardens and parks',

    // Bali tax
    'ضريبة دخول بالي': 'Bali entrance tax',

    // Watersport special text
    'استمتعوا ب 3 ألعاب بحرية ممتعة': 'Enjoy 3 fun water activities',
    'كلها مشمولة بدون أي رسوم إضافية': 'All included without any additional fees',

    // Rafting special text
    'اكتشف متعة التجديف': 'Discover the fun of rafting',
    'لحظات حماس وتجربة لاتُنسى هدية منا لكم': 'Exciting moments and unforgettable experience, a gift from us to you'
};

createAllPackageIncludingAndNotIncludingData = function () {
    let checkboxIds = [
        'privet_car_with_driver_to_welcome_and_etc_checkbox',
        'hotel_booking_with_breakfast_for_2_people_checkbox',
        'customer_service_24_hour_checkbox',
        'welcome_goodbye_hotel_delivery_checkbox',
        'welcome_with_flowers_checkbox',
        'sms_card_with_internet_checkbox',
        'special_oud_checkbox',
        'inner_flight_tickets_checkbox',
        'extra_car_for_carring_bags_checkbox',
        'watersport_activity_checkbox',
        'rafting_activity_checkbox',
        'outer_flight_tickets_checkbox',
        'placese_visiting_cost_checkbox',
        'bali_taxes_not_covered_checkbox'
    ];

    playSoundEffect('success');

    // Function to translate Arabic text to English
    function translateToEnglish(text) {
        // First try exact match
        if (packageIncludingTranslations[text]) {
            return packageIncludingTranslations[text];
        }

        // Try to clean the text and match
        let cleanText = text.trim();
        if (packageIncludingTranslations[cleanText]) {
            return packageIncludingTranslations[cleanText];
        }

        // Debug: log untranslated text
        console.log('Untranslated text:', text);

        // If no translation found, return original text
        return text;
    }

    let privetCarWithDriverToWelcomeAndEtc = document.getElementById('specific_car_type_input_id').value;
    let packageIncludingDataTextArea = document.getElementById('package_details_textarea_id').value;
    let smsCardWithInternetAmountInputReayText = document.getElementById('sms_card_with_internet_amount_input_id').value;
    let innerFlightTicketsAmountInputReayText = document.getElementById('inner_flight_tickets_amount_input_id').value;
    let packageTotlaPriceInput = document.getElementById('package_totla_price_input_id').value;

    package_including_data_inputs_submit_icon.style.backgroundColor = 'rgb(0, 255, 0)';
    setTimeout(() => {
        package_including_data_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
    }, 500);

    let insertedPackageIncludingDataDiv = document.createElement('div');
    insertedPackageIncludingDataDiv.id = 'inserted_package_including_data_div';
    insertedPackageIncludingDataDiv.className = 'inserted_package_including_and_not_icluding_data_div_class';

    let insertedPackageNotIncludingDataDiv = document.createElement('div');
    insertedPackageNotIncludingDataDiv.id = 'inserted_package_not_including_data_div';
    insertedPackageNotIncludingDataDiv.className = 'inserted_package_including_and_not_icluding_data_div_class';

    let insertedPackageGiftDataDiv = document.createElement('div');
    insertedPackageGiftDataDiv.id = 'inserted_package_icluding_gift_data_div';
    insertedPackageGiftDataDiv.className = 'inserted_package_including_and_not_icluding_data_div_class';

    if (packageTotlaPriceInput !== '') {
        document.getElementById('downloaded_pdf_total_price_data_page').style.display = 'block';
        document.getElementById('package_total_price_p_id').innerText = packageTotlaPriceInput;
        document.getElementById('store_google_sheet_package_total_price_value').innerText = packageTotlaPriceInput;
    } else {
        document.getElementById('downloaded_pdf_total_price_data_page').style.display = 'none';
        document.getElementById('store_google_sheet_package_total_price_value').innerText = '';
    }

    function getCheckboxColor(checkbox) {
        let label = checkbox.nextElementSibling;
        return window.getComputedStyle(label, '::before').backgroundColor;
    }

    let specificCarTypeInputValue = document.getElementById('specific_car_type_input_id').value;

    // Get first hotel_row_class_for_editing and its last div's first child (usually h5)
    let hotelRows = document.getElementsByClassName('hotel_row_class_for_editing');
    let firstHotelCityText = null;
    if (hotelRows.length > 0) {
        let firstHotelRow = hotelRows[0];
        let lastDiv = firstHotelRow.querySelector('div:last-child');
        if (lastDiv) {
            let firstChild = lastDiv.children[0];
            if (firstChild && firstChild.tagName === 'H5') {
                firstHotelCityText = firstChild.innerText.trim();
            }
        }
    }

    checkboxIds.forEach(id => {
        let checkbox = document.getElementById(id);
        let label = document.querySelector(`label[for="${id}"]`);
        let labelText = label.innerHTML.split('<br>').map(text => text.trim());
        let p = document.createElement('p');
        let icon = document.createElement('ion-icon');
        let color = getCheckboxColor(checkbox);

        if (id === 'privet_car_with_driver_to_welcome_and_etc_checkbox' && specificCarTypeInputValue !== '') {
            labelText = [specificCarTypeInputValue];
            document.getElementById('store_google_sheet_package_specific_car_type_value').innerText = specificCarTypeInputValue;
        }
        if (document.getElementById('specific_car_type_input_id').value === '') {
            document.getElementById('store_google_sheet_package_specific_car_type_value').innerText = '';
        }

        // Watersport/Rafting special logic
        if (id === 'watersport_activity_checkbox' || id === 'rafting_activity_checkbox') {
            if (color === 'rgb(0, 255, 0)') {
                icon.setAttribute('name', 'checkmark-outline');
                icon.style.color = '#007bff';
                p.appendChild(icon);

                if (id === 'watersport_activity_checkbox') {
                    p.innerHTML += " 🌊" + translateToEnglish("استمتعوا ب 3 ألعاب بحرية ممتعة") + "<br>" + translateToEnglish("كلها مشمولة بدون أي رسوم إضافية") + "💙<br>";
                    p.setAttribute('data-gift-order', '1');
                    let container = document.createElement('div');
                    container.className = 'activity_icon_container';
                    ['../activities/donat.webp', '../activities/panana.webp', '../activities/parasut.webp'].forEach(src => {
                        let img = document.createElement('img');
                        img.src = src;
                        img.className = 'activity_icon_img';
                        container.appendChild(img);
                    });
                    p.appendChild(container);
                } else if (id === 'rafting_activity_checkbox') {
                    p.innerHTML += " 🚣‍♂️" + translateToEnglish("اكتشف متعة التجديف") + "<br>" + translateToEnglish("لحظات حماس وتجربة لاتُنسى هدية منا لكم") + "💙<br>";
                    p.setAttribute('data-gift-order', '2');
                    let container = document.createElement('div');
                    container.className = 'activity_icon_container';
                    let img = document.createElement('img');
                    img.src = '../activities/rafting.webp';
                    img.className = 'activity_icon_img';
                    container.appendChild(img);
                    p.appendChild(container);
                }

                p.className = 'inserted_package_including_data_text';
                p.setAttribute('onclick', 'runDeleteThisPackageIncludingDataText(this)');
                insertedPackageGiftDataDiv.appendChild(p);
            } else if (color === 'rgb(255, 0, 0)') {
                icon.setAttribute('name', 'close-outline');
                p.appendChild(icon);
                labelText.forEach((text, index) => {
                    p.appendChild(document.createTextNode(` ${translateToEnglish(text)}`));
                    if (index < labelText.length - 1) p.appendChild(document.createElement('br'));
                });
                p.className = 'inserted_package_not_including_data_text';
                p.setAttribute('onclick', 'runDeleteThisPackageIncludingDataText(this)');
                insertedPackageNotIncludingDataDiv.appendChild(p);
            }
            return;
        }

        // Special logic for special_oud_checkbox if first hotel city is "Bali"
        if (id === 'special_oud_checkbox' && (firstHotelCityText === 'Bali' || firstHotelCityText === 'Lombok')) {
            // Treat as white (do not add to including/gift/not including)
            let pElement = document.createElement('p');
            pElement.innerText = id;
            document.getElementById('store_google_sheet_white_package_including_and_not_including_input_div').appendChild(pElement);
            return;
        }

        // Normal logic for other checkboxes
        if (color === 'rgb(0, 255, 0)') {
            if (id === 'sms_card_with_internet_checkbox' || id === 'welcome_with_flowers_checkbox' || id === 'special_oud_checkbox') {
                icon.setAttribute('name', 'checkmark-outline');
                p.appendChild(icon);

                if (id === 'sms_card_with_internet_checkbox') {
                    let textContent = smsCardWithInternetAmountInputReayText !== ''
                        ? ` ${smsCardWithInternetAmountInputReayText}`
                        : ' ' + translateToEnglish('شرائح إنترنت');
                    p.appendChild(document.createTextNode(textContent));
                    p.style.padding = '0 5px';
                    document.getElementById('store_google_sheet_package_including_sms_value').innerText = smsCardWithInternetAmountInputReayText !== '' ? smsCardWithInternetAmountInputReayText : '';
                    p.setAttribute('data-gift-order', '3');
                    let container = document.createElement('div');
                    container.className = 'activity_icon_container';
                    let img = document.createElement('img');
                    img.src = '../activities/sms-cards.webp';
                    img.className = 'activity_icon_img';
                    container.appendChild(img);
                    p.appendChild(container);
                } else if (id === 'welcome_with_flowers_checkbox') {
                    labelText.forEach((text, index) => {
                        p.appendChild(document.createTextNode(` ${translateToEnglish(text)}`));
                        if (index < labelText.length - 1) p.appendChild(document.createElement('br'));
                    });
                    p.setAttribute('data-gift-order', '4');
                    let container = document.createElement('div');
                    container.className = 'activity_icon_container';
                    let img = document.createElement('img');
                    img.src = '../activities/flower.webp';
                    img.className = 'activity_icon_img';
                    container.appendChild(img);
                    p.appendChild(container);
                } else if (id === 'special_oud_checkbox') {
                    labelText.forEach((text, index) => {
                        p.appendChild(document.createTextNode(` ${translateToEnglish(text)}`));
                        if (index < labelText.length - 1) p.appendChild(document.createElement('br'));
                    });
                    p.setAttribute('data-gift-order', '5');
                    let container = document.createElement('div');
                    container.className = 'activity_icon_container';
                    let img = document.createElement('img');
                    img.src = '../activities/special-oud.webp';
                    img.className = 'activity_icon_img';
                    container.appendChild(img);
                    p.appendChild(container);
                }

                p.className = 'inserted_package_including_data_text';
                p.setAttribute('onclick', 'runDeleteThisPackageIncludingDataText(this)');
                insertedPackageGiftDataDiv.appendChild(p);
                return;
            }
            icon.setAttribute('name', 'checkmark-outline');
            p.appendChild(icon);
            if (id === 'sms_card_with_internet_checkbox') {
                let textContent = smsCardWithInternetAmountInputReayText !== ''
                    ? ` ${smsCardWithInternetAmountInputReayText}`
                    : ' ' + translateToEnglish('شرائح إنترنت');
                p.appendChild(document.createTextNode(textContent));
                p.style.padding = '0 5px';
                document.getElementById('store_google_sheet_package_including_sms_value').innerText = smsCardWithInternetAmountInputReayText !== '' ? smsCardWithInternetAmountInputReayText : '';
            } else if (id === 'inner_flight_tickets_checkbox') {
                let textContent = innerFlightTicketsAmountInputReayText !== ''
                    ? ` ${innerFlightTicketsAmountInputReayText}`
                    : ' ' + translateToEnglish('تذاكر الطيران الداخلي');
                p.appendChild(document.createTextNode(textContent));
                p.style.padding = '0 5px';
                document.getElementById('store_google_sheet_package_including_inner_tickets_value').innerText = innerFlightTicketsAmountInputReayText !== '' ? innerFlightTicketsAmountInputReayText : '';
            } else if (id === 'privet_car_with_driver_to_welcome_and_etc_checkbox' && specificCarTypeInputValue !== '') {
                p.appendChild(document.createTextNode(privetCarWithDriverToWelcomeAndEtc));
                p.style.fontWeight = 'bold';
            } else {
                labelText.forEach((text, index) => {
                    p.appendChild(document.createTextNode(` ${translateToEnglish(text)}`));
                    if (index < labelText.length - 1) p.appendChild(document.createElement('br'));
                });
            }
            p.className = 'inserted_package_including_data_text';
            if (id === 'welcome_goodbye_hotel_delivery_checkbox' || id === 'sms_card_with_internet_checkbox' || id === 'inner_flight_tickets_checkbox' || id === 'extra_car_for_carring_bags_checkbox') {
                p.className = 'special_package_including_data_background_color_text';
            }
            p.setAttribute('onclick', 'runDeleteThisPackageIncludingDataText(this)');
            insertedPackageIncludingDataDiv.appendChild(p);
        } else if (color === 'rgb(255, 0, 0)') {
            icon.setAttribute('name', 'close-outline');
            p.appendChild(icon);
            labelText.forEach((text, index) => {
                p.appendChild(document.createTextNode(` ${translateToEnglish(text)}`));
                if (index < labelText.length - 1) p.appendChild(document.createElement('br'));
            });
            p.className = 'inserted_package_not_including_data_text';
            if (id === 'welcome_goodbye_hotel_delivery_checkbox' || id === 'sms_card_with_internet_checkbox' || id === 'inner_flight_tickets_checkbox') {
                p.className = 'special_package_including_data_background_color_text';
                p.style.padding = '0 5px';
            }
            p.setAttribute('onclick', 'runDeleteThisPackageIncludingDataText(this)');
            insertedPackageNotIncludingDataDiv.appendChild(p);
        }
    });

    if (packageIncludingDataTextArea !== '') {
        packageIncludingDataTextArea.split('\n').forEach(text => {
            if (text.trim() !== '') {
                let p = document.createElement('p');
                let icon = document.createElement('ion-icon');
                icon.setAttribute('name', 'checkmark-outline');
                p.appendChild(icon);
                p.appendChild(document.createTextNode(` ${text.trim()}`));
                p.className = 'special_package_including_data_background_color_text';
                p.style.padding = '0 5px';
                p.setAttribute('onclick', 'runDeleteThisPackageIncludingDataText(this)');
                insertedPackageIncludingDataDiv.appendChild(p);
            }
        });
        document.getElementById('store_google_sheet_package_details_textarea_value').innerText = packageIncludingDataTextArea.replace(/\n/g, '\\n');
    }

    let insertedPackageIncludingDataPositionDiv = document.getElementById('inserted_package_icluding_data_position_div');
    let insertedPackageNotIncludingDataPositionDiv = document.getElementById('inserted_package_not_icluding_data_position_div');
    let insertedPackageGiftDataPositionDiv = document.getElementById('inserted_package_icluding_gift_data_position_div');

    insertedPackageIncludingDataPositionDiv.innerHTML = '';
    insertedPackageIncludingDataPositionDiv.appendChild(insertedPackageIncludingDataDiv);

    insertedPackageNotIncludingDataPositionDiv.innerHTML = '';
    insertedPackageNotIncludingDataPositionDiv.appendChild(insertedPackageNotIncludingDataDiv);

    if (insertedPackageGiftDataPositionDiv) {
        let ordered = Array.from(insertedPackageGiftDataDiv.children)
            .sort((a, b) => {
                let ao = parseInt(a.getAttribute('data-gift-order') || '999', 10);
                let bo = parseInt(b.getAttribute('data-gift-order') || '999', 10);
                return ao - bo;
            });
        insertedPackageGiftDataDiv.innerHTML = '';
        ordered.forEach(child => insertedPackageGiftDataDiv.appendChild(child));
        insertedPackageGiftDataPositionDiv.innerHTML = '';
        insertedPackageGiftDataPositionDiv.appendChild(insertedPackageGiftDataDiv);
    }

    let pdfSectionPackageIncludingDataTitle = document.getElementById('pdf_section_package_icluding_data_title_id');
    let pdfSectionPackageNotIncludingDataTitle = document.getElementById('pdf_section_package_not_icluding_data_title_id');
    let pdfSectionPackageGiftDataTitle = document.getElementById('pdf_section_package_icluding_gift_data_title_id');

    pdfSectionPackageIncludingDataTitle.style.display = insertedPackageIncludingDataDiv.children.length > 0 ? 'flex' : 'none';
    pdfSectionPackageNotIncludingDataTitle.style.display = insertedPackageNotIncludingDataDiv.children.length > 0 ? 'flex' : 'none';
    if (pdfSectionPackageGiftDataTitle) {
        pdfSectionPackageGiftDataTitle.style.display = insertedPackageGiftDataDiv.children.length > 0 ? 'flex' : 'none';
    }

    document.getElementById('downloaded_pdf_package_including_data_page').style.display = 'block';

    document.getElementById('store_google_sheet_green_checked_package_including_and_not_including_input_div').innerHTML = '';
    document.getElementById('store_google_sheet_red_checked_package_including_and_not_including_input_div').innerHTML = '';
    document.getElementById('store_google_sheet_white_package_including_and_not_including_input_div').innerHTML = '';

    checkboxIds.forEach(id => {
        let checkbox = document.getElementById(id);
        if (!checkbox) return;
        let label = checkbox.nextElementSibling;
        let currentColor = window.getComputedStyle(label, '::before').backgroundColor;
        let pElement = document.createElement('p');
        pElement.innerText = id;

        // Special logic for special_oud_checkbox if first hotel city is "Bali"
        if (id === 'special_oud_checkbox' && firstHotelCityText === 'Bali') {
            document.getElementById('store_google_sheet_white_package_including_and_not_including_input_div').appendChild(pElement);
        } else if (currentColor === 'rgb(0, 255, 0)') {
            document.getElementById('store_google_sheet_green_checked_package_including_and_not_including_input_div').appendChild(pElement);
        } else if (currentColor === 'rgb(255, 0, 0)') {
            document.getElementById('store_google_sheet_red_checked_package_including_and_not_including_input_div').appendChild(pElement);
        } else {
            document.getElementById('store_google_sheet_white_package_including_and_not_including_input_div').appendChild(pElement);
        }
    });
}


/* Function to handel clicked clint movements rule element */
runDeleteThisPackageIncludingDataText = function (clickedPackageIncludingDataText) {

    // Create an overlay layer for better visual effect
    let overlayLayer = document.createElement('div');
    overlayLayer.classList.add('black_overlay');
    document.body.appendChild(overlayLayer);


    /* Function to delete the clint movements rule */
    deleteClickedPackageIncludingDataText = function (clickedPackageIncludingDataText) {
        clickedPackageIncludingDataText.remove();

        ensure_delete_package_including_data_text_div.style.transform = 'translate(-50%, -130vh)'; // Slide out
        overlayLayer.style.opacity = '0'; // Hide overlay

        // Remove overlay and delete box div from DOM after transition
        setTimeout(() => {
            document.body.removeChild(overlayLayer);
        }, 300); // Match transition duration in CSS


        // Check if there are any remaining inserted package including data (Searching by the second class name)
        let remainingPackageIncludingDataText = document.querySelectorAll('.inserted_package_including_data_text');
        if (remainingPackageIncludingDataText.length === 0) {
            // Hide section with id 'downloaded_pdf_package_including_data_page'
            document.getElementById('downloaded_pdf_package_including_data_page').style.display = 'none';
        }
    }


    // Delayed opacity transition for smooth appearance
    setTimeout(() => {
        overlayLayer.style.opacity = '1';
        ensure_delete_package_including_data_text_div.style.transform = 'translate(-50%, -50%)'; // Center div
    }, 50);

    /* Function to pass the clicked clint movements rule element */
    passClickedPackageIncludingDataText = function () {

        if (clickedPackageIncludingDataText === 'package_total_price_p_id') {
            document.getElementById('downloaded_pdf_total_price_data_page').style.display = 'none';


            ensure_delete_package_including_data_text_div.style.transform = 'translate(-50%, -130vh)'; // Slide out
            overlayLayer.style.opacity = '0'; // Hide overlay

            // Remove overlay and delete box div from DOM after transition
            setTimeout(() => {
                document.body.removeChild(overlayLayer);
            }, 300); // Match transition duration in CSS


            // Check if there are any remaining inserted package including data (Searching by the second class name)
            let remainingPackageIncludingDataText = document.querySelectorAll('.inserted_package_including_data_text');
            if (remainingPackageIncludingDataText.length === 0) {
                // Hide section with id 'downloaded_pdf_package_including_data_page'
                document.getElementById('downloaded_pdf_package_including_data_page').style.display = 'none';
            }


            return
        }

        deleteClickedPackageIncludingDataText(clickedPackageIncludingDataText);
    }

    // Click handler to close overlay and delete box div on click outside
    overlayLayer.onclick = () => {
        ensure_delete_package_including_data_text_div.style.transform = 'translate(-50%, -130vh)'; // Slide out
        overlayLayer.style.opacity = '0'; // Hide overlay

        // Remove overlay and delete box div from DOM after transition
        setTimeout(() => {
            document.body.removeChild(overlayLayer);
        }, 300); // Match transition duration in CSS
    };

    // Prevent overlayLayer click propagation to avoid immediate closure
    overlayLayer.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent immediate closure of overlay on click
    });
}

/* Up All Funtions For Package Include And Not Include Up */



























/* Down All Functions For Flights Data Down */

/* Function To Automaticlly Create Flights Data */
createAllFlightDataFunction = function () {
    if (document.getElementById('downloaded_pdf_hotel_data_page').style.display === 'none') {

        // Play a sound effect
        playSoundEffect('error');


        /* Change the 'تم' button color */
        clint_flight_inputs_submit_icon.style.backgroundColor = 'red';
        // Set the background color of the submit icon back to default color
        setTimeout(() => {
            clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
        }, 500);


        /* Show the icon button if there is no any created flight row */
        document.getElementById('manually_add_flight_row_icon').style.display = 'block';

    } else {




        // First delete all old flights row data'
        document.getElementById('inserted_flight_data_position_div').innerHTML = '';





        /* Set the 'insertedHotelDataDivUniqueId' value based on the following condition */
        if (document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText !== '') {
            insertedFlightDataDivUniqueId = document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText;
        } else {
            insertedFlightDataDivUniqueId = 1;
        }



        // Get all divs with the class name 'hotel_row_class_for_editing'
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

        let lastCity = null;  // Variable to store the last valid city encountered
        let lastDate = null;  // Variable to store the date associated with the last valid city
        let validCities = ["Bali", "Jakarta", "Bandung", "Puncak", "Lombok"];  // Array of valid cities to check against



        // Get the values of the adult and kids inputs
        let adultAmount = document.getElementById('adult_package_person_amount_input_id').value;
        let kidsAmount = document.getElementById('kids_package_person_amount_input_id').value;
        let infantAmount = document.getElementById('infant_package_person_amount_input_id').value;

        // Function to extract numbers from the string
        function extractNumberFromString(str) {
            let match = str.match(/\d+/);  // Use regex to find the number
            return match ? parseInt(match[0]) : 0;  // Return the number or 0 if no number found
        }

        // Extract numbers from adult and kids input values
        let adultNumber = extractNumberFromString(adultAmount);
        let kidsNumber = extractNumberFromString(kidsAmount);

        // Calculate total people (adults + kids)
        let totalPeople = adultNumber + kidsNumber;




        // Iterate through all found hotel rows
        allHotelRows.forEach((hotelRow, index) => {
            let currentCity = hotelRow.querySelector('h5').innerText;  // Get the city name from the current hotel row's h5 element
            let currentDate = hotelRow.querySelector('h2').innerText;  // Get the date from the current hotel row's h2 element

            // Check if transition between Jakarta and Bandung (in either order) and skip
            if ((lastCity === "Jakarta" && currentCity === "Bandung") || (lastCity === "Bandung" && currentCity === "Jakarta")) {
                lastCity = currentCity;
                lastDate = currentDate;
                return; // Skip this iteration without creating a flightRowTableDiv
            }

            // Check if transition between Jakarta and Puncak and skip
            if (lastCity === "Jakarta" && currentCity === "Puncak") {
                lastCity = currentCity;
                lastDate = currentDate;
                return; // Skip this iteration without creating a flightRowTableDiv
            }

            // Check if transition between Puncak and Jakarta and skip
            if (lastCity === "Puncak" && currentCity === "Jakarta") {
                lastCity = currentCity;
                lastDate = currentDate;
                return; // Skip this iteration without creating a flightRowTableDiv
            }

            // Check if the current and last city are valid and different
            if ((validCities.includes(currentCity) && lastCity && lastCity !== currentCity && validCities.includes(lastCity)) ||
                (lastCity === "Puncak" && currentCity === "Bali") || (lastCity === "Bali" && currentCity === "Puncak")) {

                let fromCity = lastCity;
                let toCity = currentCity;


                /* check the 'lastCity' and the 'currentCity' value and based on the below conditions set the value of the 'fromCity' and the 'toCity' */
                if ((lastCity === "Puncak" && currentCity === "Bali") || (lastCity === "Bandung" && currentCity === "Bali")) {
                    fromCity = "Jakarta";
                    toCity = "Bali";
                } else if ((lastCity === "Bali" && currentCity === "Puncak") || (lastCity === "Bali" && currentCity === "Bandung")) {
                    fromCity = "Bali";
                    toCity = "Jakarta";
                }



                // Check if transition between Bandung and Puncak (in either order) and skip
                if ((lastCity === "Bandung" && currentCity === "Puncak") || (lastCity === "Puncak" && currentCity === "Bandung")) {
                    lastCity = currentCity;
                    lastDate = currentDate;
                    return; // Skip this iteration without creating a flightRowTableDiv
                }


                // Create a new div with flight details
                let flightRowTableDiv = document.createElement('div');
                flightRowTableDiv.id = `flight_row_id_${insertedFlightDataDivUniqueId}`;  // Set a unique ID for the new div
                flightRowTableDiv.className = 'flight_row_class flight_row_class_for_editing';  // Assign class names to the new div

                // Create the HTML content for the new flight row div
                let flightRowTableDivContent = `
                    <div class="flight_row_flight_arrival_time_controller inserted_flight_data_row" style="cursor: pointer;">
                        <p id='flight_air_line_${insertedFlightDataDivUniqueId}'></p>
                    </div>
                    <div>
                        <p id="flight_adult_person_amount_${insertedFlightDataDivUniqueId}">
                            ${totalPeople === 1
                        ? `${totalPeople} Adult`
                        : totalPeople > 10
                            ? `${totalPeople} Adult`
                            : totalPeople !== 0
                                ? `${totalPeople} Adults`
                                : ''
                    }
                        </p>
                        ${infantAmount ? `<p id="flight_infant_person_amount_${insertedFlightDataDivUniqueId}">${infantAmount}</p>` : ''}
                    </div>
                    <div><p>20Kg Per Pax</p></div>
                    <div><h2 id='flight_from_city_${insertedFlightDataDivUniqueId}'>${fromCity}</h2></div>
                    <div><h3 id='flight_to_city_${insertedFlightDataDivUniqueId}'>${toCity}</h3></div>
                    <div><h1 id='flight_date_${insertedFlightDataDivUniqueId}' class="flight_date_for_matching_whole_package_date">${currentDate}</h1></div>
                    <div><p id='flight_fly_away_time_${insertedFlightDataDivUniqueId}'></p></div>
                    <div><p id='flight_arrival_time_${insertedFlightDataDivUniqueId}'></p></div>
                `;



                flightRowTableDiv.innerHTML = flightRowTableDivContent;  // Insert the generated HTML content into the new div

                // Append the new div to the container with id 'inserted_flight_data_position_div'
                document.getElementById('inserted_flight_data_position_div').appendChild(flightRowTableDiv);

                // Increment the unique ID for the next div
                insertedFlightDataDivUniqueId++;
            }

            // Update the lastCity and lastDate for the next iteration
            lastCity = currentCity;
            lastDate = currentDate;
        });










        // Check if there is any element with the class 'flight_row_class_for_editing'
        let allFlightRowdivs = document.getElementsByClassName('flight_row_class_for_editing');

        /* if there is found created flights row data */
        if (allFlightRowdivs.length > 0) {

            // Play a sound effect
            playSoundEffect('success');

            /* Change the 'تم' button color */
            clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 255, 0)';
            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);


            // If any element is found, set the display style of the 'downloaded_pdf_flight_data_page' to 'block'
            document.getElementById('downloaded_pdf_flight_data_page').style.display = 'block';



            /* Hide the icon button if there is created flight row */
            document.getElementById('manually_add_flight_row_icon').style.display = 'none';



            /* Call a function to make sure if all package dates should be hidden or no */
            ensureAllPackageDatesHiddenOrNo();



            /* if there is no any found created flights row data */
        } else {

            // Play a sound effect
            playSoundEffect('error');


            /* Change the 'تم' button color */
            clint_flight_inputs_submit_icon.style.backgroundColor = 'red';
            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);


            // If there is no found element, set the display style of the 'downloaded_pdf_flight_data_page' to 'none'
            document.getElementById('downloaded_pdf_flight_data_page').style.display = 'none';


            /* Show the icon button if there is no any created flight row */
            document.getElementById('manually_add_flight_row_icon').style.display = 'block';
        }



        // Get references to all input elements and reset their values thier
        document.getElementById('flight_from_city_input_id').value = document.getElementById('flight_to_city_input_id').value;
        document.getElementById('flight_to_city_input_id').value = '';
        document.getElementById('flight_date_input_id').value = '';
        document.getElementById('flight_fly_away_time_input_id').value = '';
        document.getElementById('flight_arrival_time_input_id').value = '';




        // Get all dynamically created elements with the class 'flight_row_flight_arrival_time_controller'
        document.querySelectorAll('.flight_row_flight_arrival_time_controller').forEach(function (element) {
            element.onclick = function (event) {
                flightRowAirLineControllerFunction(event, element);
            };
        });


        /* Store the last saved flight unique id name */
        document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText = insertedFlightDataDivUniqueId;
    }
}

// Define a global variable to store the reference
let currentFlightDataDivId;

// Function to handle delete clicked hotel data
deleteClickedFlightData = function (clickedFlightDataDivId) {

    let overlayLayer = document.querySelector('.black_overlay');
    let clickedFlightDataElement = document.getElementById(clickedFlightDataDivId);

    if (clickedFlightDataElement) {
        clickedFlightDataElement.remove();
    }

    // Hide edit/delete options div
    let deleteFlightRowDiv = document.getElementById('ensure_delete_or_edit_flight_data_div');
    deleteFlightRowDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    overlayLayer.style.opacity = '0';

    // Remove overlay and edit/delete div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS

    // Check if there are any remaining inserted flight data div (Searching by the second image class name)
    let remainingFlightDataDivs = document.querySelectorAll('.inserted_flight_data_row');
    if (remainingFlightDataDivs.length === 0) {
        // Hide section with id 'downloaded_pdf_flight_data_page'
        document.getElementById('downloaded_pdf_flight_data_page').style.display = 'none';

        /* Show the icon button after creating a flight row */
        document.getElementById('manually_add_flight_row_icon').style.display = 'block';
    }
}

/* Function to edit the clicked flight row data */
editClickedFlightData = function (clickedFlightDataDivIdName) {

    /* Make sure the correct section is the one that is visible */
    create_new_clint_data_section.style.display = 'none';
    create_new_hotel_package_section.style.display = 'none';
    create_new_flight_package_section.style.display = 'flex';
    create_new_package_including_and_not_including_data_section.style.display = 'none';
    create_new_clint_movements_plan_section.style.display = 'none';

    document.getElementById('clint_flight_inputs_submit_icon').style.display = 'none';
    document.getElementById('confirm_new_flight_data_row_icon').style.display = 'block';
    document.getElementById('cancel_new_flight_data_row_icon').style.display = 'block';

    document.getElementById('flight_content_section_title_text_id').innerText = 'EDIT TICKET';
    document.getElementById('toggle_flight_data_title_div_id').style.background = 'rgb(85, 127, 137)';

    document.getElementById('flight_data_dropdown_content').scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth',
    });

    // Hide delete button div
    let overlayLayer = document.querySelector('.black_overlay');
    let deleteFlightRowDiv = document.getElementById('ensure_delete_or_edit_flight_data_div');
    deleteFlightRowDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    overlayLayer.style.opacity = '0';

    // Remove overlay and edit/delete div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS

    /* Show all inputs for editing the flight data */
    document.getElementById('all_editing_flight_row_data_inputs_div').style.display = 'flex';

    // Get the clicked flight data row
    let clickedFlightDataDiv = document.getElementById(clickedFlightDataDivIdName);
    let insertedFlightDataDivUniqueId = clickedFlightDataDivIdName.split('_').pop(); // Extract the unique ID from the clicked row ID

    // Extract data using IDs
    let flightAirLineInput = clickedFlightDataDiv.querySelector(`p[id^='flight_air_line_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightAdultPersonAmountInput = clickedFlightDataDiv.querySelector(`p[id^='flight_adult_person_amount_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightInfantPersonAmountInput = clickedFlightDataDiv.querySelector(`p[id^='flight_infant_person_amount_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightFromCityInput = clickedFlightDataDiv.querySelector(`h2[id^='flight_from_city_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightToCityInput = clickedFlightDataDiv.querySelector(`h3[id^='flight_to_city_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightDateInput = clickedFlightDataDiv.querySelector(`h1[id^='flight_date_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightFlyAwayTimeInput = clickedFlightDataDiv.querySelector(`p[id^='flight_fly_away_time_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightArrivalTimeInput = clickedFlightDataDiv.querySelector(`p[id^='flight_arrival_time_${insertedFlightDataDivUniqueId}']`)?.innerText || '';
    let flightExtraBagsInput = clickedFlightDataDiv.querySelector(`p[id^='flight_extra_bags_${insertedFlightDataDivUniqueId}']`)?.innerText || '';

    // Assign values to inputs
    document.getElementById('flight_air_line_input_id').value = flightAirLineInput;
    document.getElementById('flight_adult_person_amount_input_id').value = flightAdultPersonAmountInput;
    document.getElementById('flight_infant_person_amount_input_id').value = flightInfantPersonAmountInput;
    document.getElementById('flight_from_city_input_id').value = flightFromCityInput;
    document.getElementById('flight_to_city_input_id').value = flightToCityInput;
    document.getElementById('flight_date_input_id').value = flightDateInput;
    document.getElementById('flight_fly_away_time_input_id').value = flightFlyAwayTimeInput;
    document.getElementById('flight_arrival_time_input_id').value = flightArrivalTimeInput;
    document.getElementById('flight_extra_bags_input_id').value = flightExtraBagsInput;

    /* Function to cancel the flight row data editing process */
    cancelNewFlightDataRow = function () {
        // Get references to all input elements and delete their values
        document.getElementById('flight_air_line_input_id').value = '';
        document.getElementById('flight_from_city_input_id').value = '';
        document.getElementById('flight_to_city_input_id').value = '';
        document.getElementById('flight_date_input_id').value = '';
        document.getElementById('flight_fly_away_time_input_id').value = '';
        document.getElementById('flight_arrival_time_input_id').value = '';
        document.getElementById('flight_extra_bags_input_id').value = '';

        /* Hide and show different icons */
        document.getElementById('clint_flight_inputs_submit_icon').style.display = 'block';
        document.getElementById('confirm_new_flight_data_row_icon').style.display = 'none';
        document.getElementById('cancel_new_flight_data_row_icon').style.display = 'none';

        /* Reset the innerText and styling to default */
        document.getElementById('flight_content_section_title_text_id').innerText = 'TICKET DATA';
        document.getElementById('toggle_flight_data_title_div_id').style.background = 'rgb(131, 0, 148)';

        /* Hide all inputs for editing the flight data */
        document.getElementById('all_editing_flight_row_data_inputs_div').style.display = 'none';


        /* Call a function to make sure if all package dates should be hidden or no */
        ensureAllPackageDatesHiddenOrNo();
    }

    /* Function to confirm the new flight row data */
    confirmNewFlightDataRow = function () {

        // Play a sound effect
        playSoundEffect('success');

        // Get the clicked flight data row
        let clickedFlightDataDiv = document.getElementById(clickedFlightDataDivIdName);

        // Clear the old data
        clickedFlightDataDiv.innerHTML = '';

        // Extract the new data from the input fields
        let flightAirLineInput = document.getElementById('flight_air_line_input_id').value;
        let flightAdultPersonAmountInput = document.getElementById('flight_adult_person_amount_input_id').value;
        let flightInfantPersonAmountInput = document.getElementById('flight_infant_person_amount_input_id').value;
        let flightFromCityInput = document.getElementById('flight_from_city_input_id').value;
        let flightToCityInput = document.getElementById('flight_to_city_input_id').value;
        let flightDateInput = document.getElementById('flight_date_input_id').value;
        let flightFlyAwayTimeInput = document.getElementById('flight_fly_away_time_input_id').value;
        let flightArrivalTimeInput = document.getElementById('flight_arrival_time_input_id').value;
        let flightExtraBagsInput = document.getElementById('flight_extra_bags_input_id').value;

        // Create the HTML content for a new flight row, only including non-empty values
        let flightRowTableDivContent = `
            <div class="flight_row_flight_arrival_time_controller inserted_flight_data_row" style="cursor: pointer;">
                ${flightAirLineInput ? `<p id="flight_air_line_${insertedFlightDataDivUniqueId}">${flightAirLineInput}</p>` : ''}
            </div>
            <div>
                <p id="flight_adult_person_amount_${insertedFlightDataDivUniqueId}">${flightAdultPersonAmountInput}</p>
                ${flightInfantPersonAmountInput ? `<p id="flight_infant_person_amount_${insertedFlightDataDivUniqueId}">${flightInfantPersonAmountInput}</p>` : ''}
            </div>
            <div>
                <p>20Kg Per Pax</p>
                ${flightExtraBagsInput ? `<p id="flight_extra_bags_${insertedFlightDataDivUniqueId}">${flightExtraBagsInput}</p>` : ''}
            </div>
            <div>
                ${flightFromCityInput ? `<h2 id="flight_from_city_${insertedFlightDataDivUniqueId}">${flightFromCityInput}</h2>` : ''}
            </div>
            <div>
                ${flightToCityInput ? `<h3 id="flight_to_city_${insertedFlightDataDivUniqueId}">${flightToCityInput}</h3>` : ''}
            </div>
            <div>
                ${flightDateInput ? `<h1 id="flight_date_${insertedFlightDataDivUniqueId}" class="flight_date_for_matching_whole_package_date">${flightDateInput}</h1>` : ''}
            </div>
            <div>
                ${flightFlyAwayTimeInput ? `<p id="flight_fly_away_time_${insertedFlightDataDivUniqueId}">${flightFlyAwayTimeInput}</p>` : ''}
            </div>
            <div>
                ${flightArrivalTimeInput ? `<p id="flight_arrival_time_${insertedFlightDataDivUniqueId}">${flightArrivalTimeInput}</p>` : ''}
            </div>
        `;


        // Insert the new data into the clicked flight data div
        clickedFlightDataDiv.innerHTML = flightRowTableDivContent;


        /* Run a function to exit the editing flight data mood */
        cancelNewFlightDataRow();


        // Get all dynamically created elements with the class 'flight_row_flight_arrival_time_controller'
        document.querySelectorAll('.flight_row_flight_arrival_time_controller').forEach(function (element) {
            element.onclick = function (event) {
                flightRowAirLineControllerFunction(event, element);
            };
        });
    }
}

// Function to handle flight row div click or touch
flightRowAirLineControllerFunction = function (event) {
    let deleteFlightRowDiv = document.getElementById('ensure_delete_or_edit_flight_data_div');
    let clickedFlightDataDiv = event.target.closest('.flight_row_class');

    if (clickedFlightDataDiv) {
        currentFlightDataDivId = clickedFlightDataDiv.id;


        // Check if the overlay already exists
        let overlayLayer = document.querySelector('.black_overlay');
        if (!overlayLayer) {
            overlayLayer = document.createElement('div');
            overlayLayer.classList.add('black_overlay');
            document.body.appendChild(overlayLayer);

            setTimeout(() => {
                overlayLayer.style.opacity = '1';
                deleteFlightRowDiv.style.transform = 'translate(-50%, -50%)';
            }, 50);

            // Handle both click and touch events on overlay for consistency
            let handleOverlayClick = () => {
                deleteFlightRowDiv.style.transform = 'translate(-50%, -130vh)';
                overlayLayer.style.opacity = '0';
                setTimeout(() => {
                    // Only remove the overlay if it is still a child of the body
                    if (document.body.contains(overlayLayer)) {
                        document.body.removeChild(overlayLayer);
                    }
                }, 300);
            };

            overlayLayer.addEventListener('click', handleOverlayClick);

            overlayLayer.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }


        /* Function to run delete clicked flight row data */
        runDeleteClickedFlightDataFunction = function () {
            deleteClickedFlightData(currentFlightDataDivId);
        }

        /* Function to run delete clicked flight row data */
        runEditClickedFlightDataFunction = function () {
            editClickedFlightData(currentFlightDataDivId);

            /* Make sure hotel package type text is colored in rgb(0, 46, 57) */
            document.getElementById('header_navbar_links_clint_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_hotel_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_flight_a').style.backgroundColor = 'rgb(0, 46, 57)';
            document.getElementById('header_navbar_links_package_icluding_and_not_including_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_clint_movements_a').style.backgroundColor = 'rgb(85, 127, 137)';
        }
    }
};

/* Function to add more flights row data */
addMoreFlightRowTableDivFunction = function (position) {
    // Get all divs with the class name 'flight_row_class_for_editing'
    let allFlightRows = document.querySelectorAll('.flight_row_class_for_editing');

    if (allFlightRows.length === 0 || !currentFlightDataDivId) return; // If no flight rows exist or no div was clicked, exit the function

    // Find the clicked flight data div
    let clickedFlightDataDiv = document.getElementById(currentFlightDataDivId);
    if (!clickedFlightDataDiv) return; // If the clicked div is not found, exit the function



    /* Set the 'insertedFlightDataDivUniqueId' value based on the 'store_google_sheet_flight_uniuqe_id_name_value' innerText */
    insertedFlightDataDivUniqueId = document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText;



    // Clone the clicked flight row
    let clonedRow = clickedFlightDataDiv.cloneNode(true);

    // Update the cloned row's ID using the unique ID counter
    clonedRow.id = `flight_row_id_${insertedFlightDataDivUniqueId}`;

    // Update all IDs within the cloned row to maintain uniqueness
    clonedRow.querySelectorAll('[id]').forEach((element) => {
        let idParts = element.id.split('_');
        idParts[idParts.length - 1] = insertedFlightDataDivUniqueId;
        element.id = idParts.join('_');
    });


    // Swap the innerText of h2 and h3 elements in the cloned row
    let h2Element = clonedRow.querySelector('h2');
    let h3Element = clonedRow.querySelector('h3');

    if (h2Element && h3Element) {
        let tempText = h2Element.innerText;
        h2Element.innerText = h3Element.innerText;
        h3Element.innerText = tempText;
    }


    // Increment the unique ID for the next row
    insertedFlightDataDivUniqueId++;

    if (position === 'up') {
        // Insert the cloned div above the first found div
        allFlightRows[0].parentNode.insertBefore(clonedRow, allFlightRows[0]);


        // Get all divs with the class name 'hotel_row_class_for_editing'
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');
        if (allHotelRows.length > 0) {
            // Target the first found hotel_row_class_for_editing
            let firstHotelRow = allHotelRows[0];

            // Get the innerText of the h2 element of the first hotel row
            let firstHotelRowH2Text = firstHotelRow.querySelector('h2')?.innerText;

            // Clear the innerText of the h1 element inside the cloned row and set it to the first hotel's h2 text
            let h1Element = clonedRow.querySelector('h1');
            if (h1Element && firstHotelRowH2Text) {
                h1Element.innerText = firstHotelRowH2Text;
            }
        }


    } else if (position === 'down') {
        // Insert the cloned div after the last found div
        allFlightRows[allFlightRows.length - 1].parentNode.insertBefore(clonedRow, allFlightRows[allFlightRows.length - 1].nextSibling);


        // Get all divs with the class name 'hotel_row_class_for_editing'
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');
        if (allHotelRows.length > 0) {
            // Target the last found hotel_row_class_for_editing
            let lastHotelRow = allHotelRows[allHotelRows.length - 1];

            // Get the innerText of the h3 element of the last hotel row
            let lastHotelRowH3Text = lastHotelRow.querySelector('h3')?.innerText;

            // Clear the innerText of the h1 element inside the cloned row and set it to the last hotel's h3 text
            let h1Element = clonedRow.querySelector('h1');
            if (h1Element && lastHotelRowH3Text) {
                h1Element.innerText = lastHotelRowH3Text;
            }
        }
    }




    // Hide delete button div
    let overlayLayer = document.querySelector('.black_overlay');
    let deleteFlightRowDiv = document.getElementById('ensure_delete_or_edit_flight_data_div');
    deleteFlightRowDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    overlayLayer.style.opacity = '0';

    // Remove overlay and edit/delete div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS




    // Get all dynamically created elements with the class 'flight_row_flight_arrival_time_controller'
    document.querySelectorAll('.flight_row_flight_arrival_time_controller').forEach(function (element) {
        element.onclick = function (event) {
            flightRowAirLineControllerFunction(event, element);
        };
    });



    /* Store the last saved flight unique number */
    document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText = insertedFlightDataDivUniqueId;



    /* Call a function to make sure if all package dates should be hidden or no */
    ensureAllPackageDatesHiddenOrNo();
};

/* Function to manually create a flight row data */
manuallyCreateNewFlightRow = function () {


    // First delete all old flights row data'
    document.getElementById('inserted_flight_data_position_div').innerHTML = '';


    /* Set the 'insertedHotelDataDivUniqueId' value based on the following condition */
    if (document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText !== '') {
        insertedFlightDataDivUniqueId = document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText;
    } else {
        insertedFlightDataDivUniqueId = 1;
    }


    // Create a new div with flight details
    let flightRowTableDiv = document.createElement('div');
    flightRowTableDiv.id = `flight_row_id_${insertedFlightDataDivUniqueId}`;  // Set a unique ID for the new div
    flightRowTableDiv.className = 'flight_row_class flight_row_class_for_editing';  // Assign class names to the new div




    // Get the values of the adult and kids inputs
    let adultAmount = document.getElementById('adult_package_person_amount_input_id').value;
    let kidsAmount = document.getElementById('kids_package_person_amount_input_id').value;
    let infantAmount = document.getElementById('infant_package_person_amount_input_id').value;

    // Function to extract numbers from the string
    function extractNumberFromString(str) {
        let match = str.match(/\d+/);  // Use regex to find the number
        return match ? parseInt(match[0]) : 0;  // Return the number or 0 if no number found
    }

    // Extract numbers from adult and kids input values
    let adultNumber = extractNumberFromString(adultAmount);
    let kidsNumber = extractNumberFromString(kidsAmount);

    // Calculate total people (adults + kids)
    let totalPeople = adultNumber + kidsNumber;


    // Create the HTML content for the new flight row div
    let flightRowTableDivContent = `
        <div class="flight_row_flight_arrival_time_controller inserted_flight_data_row" style="cursor: pointer;"><p id='flight_air_line_${insertedFlightDataDivUniqueId}'></p></div>
        <div>
            <p id="flight_adult_person_amount_${insertedFlightDataDivUniqueId}">
                ${totalPeople === 1
            ? `${totalPeople} Adult`
            : totalPeople > 10
                ? `${totalPeople} Adult`
                : totalPeople !== 0
                    ? `${totalPeople} Adults`
                    : ''
        }
            </p>
            ${infantAmount ? `<p id="flight_infant_person_amount_${insertedFlightDataDivUniqueId}">${infantAmount}</p>` : ''}
        </div>
        <div><p>20Kg Per Pax</p></div>
        <div><h2 id='flight_from_city_${insertedFlightDataDivUniqueId}'></h2></div>
        <div><h3 id='flight_to_city_${insertedFlightDataDivUniqueId}'></h3></div>
        <div><h1 id='flight_date_${insertedFlightDataDivUniqueId}' class="flight_date_for_matching_whole_package_date"></h1></div>
        <div><p id='flight_fly_away_time_${insertedFlightDataDivUniqueId}'></p></div>
        <div><p id='flight_arrival_time_${insertedFlightDataDivUniqueId}'></p></div>
    `;

    flightRowTableDiv.innerHTML = flightRowTableDivContent;  // Insert the generated HTML content into the new div

    // Append the new div to the container with id 'inserted_flight_data_position_div'
    document.getElementById('inserted_flight_data_position_div').appendChild(flightRowTableDiv);
    document.getElementById('downloaded_pdf_flight_data_page').style.display = 'block';


    // Get all divs with the class name 'hotel_row_class_for_editing'
    let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');
    if (allHotelRows.length > 0) {
        // Target the first found hotel_row_class_for_editing
        let firstHotelRow = allHotelRows[0];

        // Get the innerText of the h2 and h5 elements of the first hotel row
        let firstHotelRowH2Text = firstHotelRow.querySelector('h2')?.innerText;
        let firstHotelRowH5Text = firstHotelRow.querySelector('h5')?.innerText;

        // Clear the innerText of the h1 element inside the cloned row and set it to the first hotel's h2 text
        let h1Element = flightRowTableDiv.querySelector('h1');
        if (h1Element && firstHotelRowH2Text) {
            h1Element.innerText = firstHotelRowH2Text;
        }

        // Additional condition: If the h5 innerText is "Bali"
        if (firstHotelRowH5Text === "Bali") {
            let h2Element = flightRowTableDiv.querySelector('h2');
            let h3Element = flightRowTableDiv.querySelector('h3');

            if (h2Element) {
                h2Element.innerText = "Jakarta";  // Set h2 to "Jakarta"
            }

            if (h3Element) {
                h3Element.innerText = "Bali";  // Set h3 to "Bali"
            }


            /* But if the first found hotel row does not located "Bali" then reveres the contries */
        } else {
            let h2Element = flightRowTableDiv.querySelector('h2');
            let h3Element = flightRowTableDiv.querySelector('h3');

            if (h2Element) {
                h2Element.innerText = "Bali";  // Set h2 to "Jakarta"
            }

            if (h3Element) {
                h3Element.innerText = "Jakarta";  // Set h3 to "Bali"
            }
        }
    }


    // Get all dynamically created elements with the class 'flight_row_flight_arrival_time_controller'
    document.querySelectorAll('.flight_row_flight_arrival_time_controller').forEach(function (element) {
        element.onclick = function (event) {
            flightRowAirLineControllerFunction(event, element);
        };
    });


    /* Hide the icon button after creating a flight row */
    document.getElementById('manually_add_flight_row_icon').style.display = 'none';


    // Increment the unique ID for the next div
    insertedFlightDataDivUniqueId++;

    /* Store the last saved flight unique id name */
    document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText = insertedFlightDataDivUniqueId;



    /* Call a function to make sure if all package dates should be hidden or no */
    ensureAllPackageDatesHiddenOrNo();
}

/* Up All Functions For Flights Data Up */

























/* Down All Functions For Hotels Data Down */


/* Function to create hotels data row */
createHotelsDataFunction = function () {

    // Get references to all input elements for later use
    let hotelNameReadyText = document.getElementById('hotel_name_input_id').value;
    let hotelLocationInput = document.getElementById('hotel_location_input_id').value;
    let hotelBaliAreaInput = document.getElementById('hotel_bali_area_input_id').value;
    let hotelStarsRateInput = document.getElementById('hotel_stars_rate_input_id').value;
    let hotelCheckInReadyText = document.getElementById('hotel_check_in_input_id').value;
    let hotelCheckOutReadyText = document.getElementById('hotel_check_out_input_id').value;
    let hotelRoomTypeDescriptionInput = document.getElementById('hotel_room_type_description_input_id').value;
    let hotelRoomContainPoolInput = document.getElementById('hotel_room_contain_pool_input_id').value;
    let hotelRoomViewInput = document.getElementById('hotel_room_view_input_id').value;
    let hotelUnitAmountInput = document.getElementById('hotel_unit_amount_input_id').value;
    let hotelBreakfastPeopleAmountInput = document.getElementById('hotel_breakfast_people_amount_input_id').value;
    let hotelExtraBedInput = document.getElementById('hotel_extra_bed_input_id').value;
    let hotelSpecialRoomRequestInput = document.getElementById('hotel_special_room_request_input_id').value;
    let hotelRoomExtraInfoReadyText = document.getElementById('hotel_room_extra_info_textarea_id').value;

    /* Second hotel room data input values */
    let hotelRoomTypeDescriptionInput_2 = document.getElementById('hotel_room_type_description_input_id_2').value;
    let hotelRoomContainPoolInput_2 = document.getElementById('hotel_room_contain_pool_input_id_2').value;
    let hotelRoomViewInput_2 = document.getElementById('hotel_room_view_input_id_2').value;
    let hotelUnitAmountInput_2 = document.getElementById('hotel_unit_amount_input_id_2').value;
    let hotelBreakfastPeopleAmountInput_2 = document.getElementById('hotel_breakfast_people_amount_input_id_2').value;
    let hotelExtraBedInput_2 = document.getElementById('hotel_extra_bed_input_id_2').value;
    let hotelSpecialRoomRequestInput_2 = document.getElementById('hotel_special_room_request_input_id_2').value;
    let hotelRoomExtraInfoReadyText_2 = document.getElementById('hotel_room_extra_info_textarea_id_2').value;


    if (hotelNameReadyText === '' || hotelCheckInReadyText === '' || hotelCheckOutReadyText === '' || hotelRoomTypeDescriptionInput === '' || hotelUnitAmountInput === '' || document.getElementById('downloaded_pdf_clint_data_page').style.display === 'none') {

        // Play a sound effect
        playSoundEffect('error');

        // Change the submit icon background color
        hotel_inputs_submit_icon.style.backgroundColor = 'red';

        // Set the background color of the submit icon back to default color
        setTimeout(() => {
            hotel_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
        }, 500);


        /* Exit the function and stop the process */
        return;
    }



    /* in case the second room data inputs div is visible and there are empty inputs then stop the process */
    if (document.getElementById('hotel_second_room_data_input_div').style.display === 'flex') {

        if (hotelRoomTypeDescriptionInput_2 === '' || hotelUnitAmountInput_2 === '') {

            // Play a sound effect
            playSoundEffect('error');

            // Change the submit icon background color
            hotel_inputs_submit_icon.style.backgroundColor = 'red';

            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                hotel_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);


            /* Exit the function and stop the process */
            return;
        }
    }







    /* Stop the process if the 'hotel_location_input_id' is visible and it is empty */
    if (document.getElementById('hotel_location_input_id').style.display !== 'none') {

        if (document.getElementById('hotel_location_input_id').value === '') {

            // Play a sound effect
            playSoundEffect('error');

            // Change the submit icon background color
            hotel_inputs_submit_icon.style.backgroundColor = 'red';

            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                hotel_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);

            return;
        }


        /* Stop the process if the hotel location is bali but the area is not selected */
        if (document.getElementById('hotel_location_input_id').value === 'Bali' && document.getElementById('hotel_bali_area_input_id').value === '') {

            // Play a sound effect
            playSoundEffect('error');

            // Change the submit icon background color
            hotel_inputs_submit_icon.style.backgroundColor = 'red';

            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                hotel_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);

            return;
        }
    }






    // Play a sound effect
    playSoundEffect('success');

    /* Change the 'تم' button color */
    hotel_inputs_submit_icon.style.backgroundColor = 'rgb(0, 255, 0)';
    // Set the background color of the submit icon back to default color
    setTimeout(() => {
        hotel_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
    }, 2000);




    /* Set the 'insertedHotelDataDivUniqueId' value based on the following condition */
    let insertedHotelDataDivUniqueId = document.getElementById('store_google_sheet_hotel_uniuqe_id_name_value').innerText !== ''
        ? document.getElementById('store_google_sheet_hotel_uniuqe_id_name_value').innerText
        : 1;






    /* Check the insert hotel data system is by picking or writing by checking the visibilaty of the 'hotel_location_input_id' input */
    if (document.getElementById('hotel_location_input_id').style.display !== 'none') {


        /* Check the amount of stars picked in the 'hotelStarsRateInput' input */
        let starsAmount = null;
        if (hotelStarsRateInput === '5 نجوم') {
            starsAmount = 'five';

        } else if (hotelStarsRateInput === '4 نجوم') {
            starsAmount = 'four';

        } else if (hotelStarsRateInput === '3 نجوم') {
            starsAmount = 'three';

        } else {
            starsAmount = 'no';

        }



        // Create the HTML content for a new hotel row
        let hotelRowTableDivContent = `
            <div><h1 id='hotel_name_${insertedHotelDataDivUniqueId}'>${hotelNameReadyText}</h1></div>
            <div><h2 id='hotel_check_in_${insertedHotelDataDivUniqueId}' class="hotel_check_in_date_for_matching_whole_package_date">${hotelCheckInReadyText}</h2></div>
            <div><h3 style="color: red" id='hotel_check_out_${insertedHotelDataDivUniqueId}' class="hotel_check_out_date_for_matching_whole_package_date">${hotelCheckOutReadyText}</h3></div>
            <div><h4 id='hotel_total_nights_${insertedHotelDataDivUniqueId}'>${storeHotelTotalNights}</h4></div>
            <div class="description_cell">
                <span id='hotel_room_type_description_${insertedHotelDataDivUniqueId}'>${hotelRoomTypeDescriptionInput}</span></div>
            <div>
                <p id='hotel_total_unit_${insertedHotelDataDivUniqueId}'>${storeHotelTotalUnitNumber}</p>
                ${hotelUnitAmountInput_2 && document.getElementById('hotel_second_room_data_input_div').style.display !== "none" ? `<p style="width: 100%; background: rgb(5, 17, 21); color: white">+ </p><p id="hotel_total_unit_2_${insertedHotelDataDivUniqueId}" style="width: 100%; background: rgb(5, 17, 21); color: white">${storeHotelTotalUnitNumber_2}</p>` : ''}
            </div>
            <div>
                <h5 id='hotel_location_${insertedHotelDataDivUniqueId}'>${hotelLocationInput}</h5>
                ${hotelBaliAreaInput ? `<br><h6 id='hotel_area_${insertedHotelDataDivUniqueId}'>${hotelBaliAreaInput}</h6>` : ''}
                <img src="../صور-الفنادق/${starsAmount}-stars-hotel-image.jpg" id='hotel_image_${insertedHotelDataDivUniqueId}' class="hotel_row_image_controller inserted_hotel_data_row" style="cursor: pointer">
            </div>
        `;

        // Create a new div element to hold the hotel row
        let hotelRowTableDiv = document.createElement('div');
        hotelRowTableDiv.id = `hotel_row_id_${insertedHotelDataDivUniqueId}`; // Set a unique ID for the hotel row div
        hotelRowTableDiv.className = 'hotel_row_class hotel_row_class_for_editing new_hotel_data_by_user_writing_class'; // Add a class to the div for styling

        // Insert the HTML content into the newly created div
        hotelRowTableDiv.innerHTML = hotelRowTableDivContent;

        // Append <span> elements for each input with text
        if (hotelRoomContainPoolInput !== '') {
            let poolSpan = document.createElement('span');
            poolSpan.id = `hotel_pool_span_id_${insertedHotelDataDivUniqueId}`;
            poolSpan.innerText = hotelRoomContainPoolInput;
            hotelRowTableDiv.querySelector('.description_cell').appendChild(poolSpan);
        }
        if (hotelRoomViewInput !== '') {
            let viewSpan = document.createElement('span');
            viewSpan.id = `hotel_view_span_id_${insertedHotelDataDivUniqueId}`;
            viewSpan.innerText = hotelRoomViewInput;
            hotelRowTableDiv.querySelector('.description_cell').appendChild(viewSpan);
        }
        if (hotelBreakfastPeopleAmountInput !== '') {
            let breakfastSpan = document.createElement('span');
            breakfastSpan.id = `hotel_breakfast_span_id_${insertedHotelDataDivUniqueId}`;
            breakfastSpan.innerText = hotelBreakfastPeopleAmountInput;
            hotelRowTableDiv.querySelector('.description_cell').appendChild(breakfastSpan);
        }
        if (hotelExtraBedInput !== '') {
            let extraBedSpan = document.createElement('span');
            extraBedSpan.id = `hotel_extra_bed_span_id_${insertedHotelDataDivUniqueId}`;
            extraBedSpan.className = 'hotel_special_request_span_class';
            extraBedSpan.innerText = hotelExtraBedInput;
            extraBedSpan.style.width = '100%';
            extraBedSpan.style.background = 'rgb(85, 127, 137)';
            extraBedSpan.style.color = 'white';
            extraBedSpan.style.padding = '0 5px';
            hotelRowTableDiv.querySelector('.description_cell').appendChild(extraBedSpan);
        }
        if (hotelSpecialRoomRequestInput !== '') {
            let specialRequestSpan = document.createElement('span');
            specialRequestSpan.id = `hotel_special_request_span_id_${insertedHotelDataDivUniqueId}`;
            specialRequestSpan.className = 'hotel_special_request_span_class';
            specialRequestSpan.innerText = hotelSpecialRoomRequestInput;
            specialRequestSpan.style.background = 'rgb(85, 127, 137)';
            specialRequestSpan.style.color = 'white';
            specialRequestSpan.style.padding = '0 5px';
            hotelRowTableDiv.querySelector('.description_cell').appendChild(specialRequestSpan);
        }
        if (hotelRoomExtraInfoReadyText !== '') {
            // Remove duplicated + signs and any + signs at the beginning
            let cleanedExtraInfoText = hotelRoomExtraInfoReadyText
                .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces


            let extraInfoSpan = document.createElement('span');
            extraInfoSpan.id = `hotel_extra_info_span_id_${insertedHotelDataDivUniqueId}`;
            extraInfoSpan.innerText = `+ ${cleanedExtraInfoText}`;
            extraInfoSpan.style.width = '100%';
            extraInfoSpan.style.background = 'rgb(85, 127, 137)';
            extraInfoSpan.style.color = 'white';
            extraInfoSpan.style.padding = '0 5px';

            // Append the span to the description cell div
            hotelRowTableDiv.querySelector('.description_cell').appendChild(extraInfoSpan);
        }




        // Handle the second room data if the second room div is visible
        if (document.getElementById('hotel_second_room_data_input_div').style.display !== "none") {
            if (hotelRoomTypeDescriptionInput_2 !== '') {
                let roomTypeDescriptionSpan_2 = document.createElement('span');
                roomTypeDescriptionSpan_2.id = `hotel_room_type_description_2_${insertedHotelDataDivUniqueId}`;
                roomTypeDescriptionSpan_2.innerText = hotelRoomTypeDescriptionInput_2;
                roomTypeDescriptionSpan_2.style.width = '100%';
                roomTypeDescriptionSpan_2.style.background = 'rgb(5, 17, 21)';
                roomTypeDescriptionSpan_2.style.color = 'white';


                let plusSign = document.createElement('span');
                plusSign.innerText = '+ ';
                plusSign.style.width = '100%';
                plusSign.style.background = 'rgb(5, 17, 21)';
                plusSign.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(plusSign);
                hotelRowTableDiv.querySelector('.description_cell').appendChild(roomTypeDescriptionSpan_2);
            }
            if (hotelRoomContainPoolInput_2 !== '') {
                let poolSpan_2 = document.createElement('span');
                poolSpan_2.id = `hotel_pool_span_id_2_${insertedHotelDataDivUniqueId}`;
                poolSpan_2.innerText = hotelRoomContainPoolInput_2;
                poolSpan_2.style.width = '100%';
                poolSpan_2.style.background = 'rgb(5, 17, 21)';
                poolSpan_2.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(poolSpan_2);
            }
            if (hotelRoomViewInput_2 !== '') {
                let viewSpan_2 = document.createElement('span');
                viewSpan_2.id = `hotel_view_span_id_2_${insertedHotelDataDivUniqueId}`;
                viewSpan_2.style.width = '100%';
                viewSpan_2.innerText = hotelRoomViewInput_2;
                viewSpan_2.style.background = 'rgb(5, 17, 21)';
                viewSpan_2.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(viewSpan_2);
            }
            if (hotelBreakfastPeopleAmountInput_2 !== '') {
                let breakfastSpan_2 = document.createElement('span');
                breakfastSpan_2.id = `hotel_breakfast_span_id_2_${insertedHotelDataDivUniqueId}`;
                breakfastSpan_2.innerText = hotelBreakfastPeopleAmountInput_2;
                breakfastSpan_2.style.width = '100%';
                breakfastSpan_2.style.background = 'rgb(5, 17, 21)';
                breakfastSpan_2.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(breakfastSpan_2);
            }
            if (hotelExtraBedInput_2 !== '') {
                let extraBedSpan_2 = document.createElement('span');
                extraBedSpan_2.id = `hotel_extra_bed_span_id_2_${insertedHotelDataDivUniqueId}`;
                extraBedSpan_2.className = 'hotel_special_request_span_class';
                extraBedSpan_2.innerText = hotelExtraBedInput_2;
                extraBedSpan_2.style.width = '100%';
                extraBedSpan_2.style.background = 'rgb(5, 17, 21)';
                extraBedSpan_2.style.color = 'white';
                extraBedSpan_2.style.padding = '0 5px';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(extraBedSpan_2);
            }
            if (hotelSpecialRoomRequestInput_2 !== '') {
                let specialRequestSpan_2 = document.createElement('span');
                specialRequestSpan_2.id = `hotel_special_request_span_id_2_${insertedHotelDataDivUniqueId}`;
                specialRequestSpan_2.className = 'hotel_special_request_span_class';
                specialRequestSpan_2.innerText = hotelSpecialRoomRequestInput_2;
                specialRequestSpan_2.style.width = '100%';
                specialRequestSpan_2.style.background = 'rgb(5, 17, 21)';
                specialRequestSpan_2.style.color = 'white';
                specialRequestSpan_2.style.padding = '0 5px';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(specialRequestSpan_2);
            }
            if (hotelRoomExtraInfoReadyText_2 !== '') {
                // Remove duplicated + signs and any + signs at the beginning
                let cleanedExtraInfoText = hotelRoomExtraInfoReadyText_2
                    .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

                let extraInfoSpan_2 = document.createElement('span');
                extraInfoSpan_2.id = `hotel_extra_info_span_id_2_${insertedHotelDataDivUniqueId}`;
                extraInfoSpan_2.innerText = `+ ${cleanedExtraInfoText}`;
                extraInfoSpan_2.style.width = '100%';
                extraInfoSpan_2.style.background = 'rgb(5, 17, 21)';
                extraInfoSpan_2.style.color = 'white';
                extraInfoSpan_2.style.padding = '0 5px';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(extraInfoSpan_2);
            }
        }



        // Append the new hotel row div to the parent div that holds all inserted hotel data
        document.getElementById('inserted_hotel_data_position_div').appendChild(hotelRowTableDiv);



        // Get the 'hotel_row_image_controller' elements inside each 'hotel_row_class' element
        let hotelRowImageControllers = hotelRowTableDiv.querySelectorAll('.hotel_row_image_controller');


        // Attach click and touch event listeners to each element
        hotelRowImageControllers.forEach(element => {
            handleClickEvent(element);
        });




        // Hide the hotel location input
        document.getElementById('hotel_location_input_id').style.display = 'none';
        document.getElementById('hotel_location_input_id').value = '';
        document.getElementById('hotel_bali_area_input_id').style.display = 'none';
        document.getElementById('hotel_bali_area_input_id').value = '';
        document.getElementById('hotel_stars_rate_input_id').style.display = 'none';
        document.getElementById('hotel_stars_rate_input_id').value = '';


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



        /* in case the insert hotel data system is picking then do the following code */
    } else {



        // Convert the hotel name to lowercase and replace spaces with hyphens to create a suitable image filename
        let hotelImgSrcReadyText = hotelNameReadyText.toLowerCase().replace(/\s+/g, '-');



        let hotelLocationReadyText = '';
        let hotelAreaReadyText = '';

        for (let hotelData of allHotelDataArray) {
            if (hotelData.hotelName === hotelNameReadyText) {
                hotelLocationReadyText = hotelData.hotelLocation;
                if (hotelData.hasOwnProperty('hotelArea')) {
                    hotelAreaReadyText = hotelData.hotelArea;
                }
                break;
            }
        }

        // Create the HTML content for a new hotel row
        let hotelRowTableDivContent = `
            <div><h1 id='hotel_name_${insertedHotelDataDivUniqueId}'>${hotelNameReadyText}</h1></div>
            <div><h2 id='hotel_check_in_${insertedHotelDataDivUniqueId}' class="hotel_check_in_date_for_matching_whole_package_date">${hotelCheckInReadyText}</h2></div>
            <div><h3 style="color: red" id='hotel_check_out_${insertedHotelDataDivUniqueId}' class="hotel_check_out_date_for_matching_whole_package_date">${hotelCheckOutReadyText}</h3></div>
            <div><h4 id='hotel_total_nights_${insertedHotelDataDivUniqueId}'>${storeHotelTotalNights}</h4></div>
            <div class="description_cell">
                <span id='hotel_room_type_description_${insertedHotelDataDivUniqueId}'>${hotelRoomTypeDescriptionInput}</span></div>
            <div>
                <p id='hotel_total_unit_${insertedHotelDataDivUniqueId}'>${storeHotelTotalUnitNumber}</p>
                ${hotelUnitAmountInput_2 && document.getElementById('hotel_second_room_data_input_div').style.display !== "none" ? `<p style="width: 100%; background: rgb(5, 17, 21); color: white">+ </p><p id="hotel_total_unit_2_${insertedHotelDataDivUniqueId}" style="width: 100%; background: rgb(5, 17, 21); color: white">${storeHotelTotalUnitNumber_2}</p>` : ''}
            </div>
            <div>
                <h5 id='hotel_location_${insertedHotelDataDivUniqueId}'>${hotelLocationReadyText}</h5>
                ${hotelAreaReadyText ? `<br><h6 id='hotel_area_${insertedHotelDataDivUniqueId}'>${hotelAreaReadyText}</h6>` : ''}
                <img src="../صور-الفنادق/${hotelImgSrcReadyText}.jpg" class="hotel_row_image_controller inserted_hotel_data_row" style="cursor: pointer">
            </div>
        `;

        // Create a new div element to hold the hotel row
        let hotelRowTableDiv = document.createElement('div');
        hotelRowTableDiv.id = `hotel_row_id_${insertedHotelDataDivUniqueId}`; // Set a unique ID for the hotel row div
        hotelRowTableDiv.className = 'hotel_row_class hotel_row_class_for_editing'; // Add a class to the div for styling

        // Insert the HTML content into the newly created div
        hotelRowTableDiv.innerHTML = hotelRowTableDivContent;

        // Append <span> elements for each input with text
        if (hotelRoomContainPoolInput !== '') {
            let poolSpan = document.createElement('span');
            poolSpan.id = `hotel_pool_span_id_${insertedHotelDataDivUniqueId}`;
            poolSpan.innerText = hotelRoomContainPoolInput;
            hotelRowTableDiv.querySelector('.description_cell').appendChild(poolSpan);
        }
        if (hotelRoomViewInput !== '') {
            let viewSpan = document.createElement('span');
            viewSpan.id = `hotel_view_span_id_${insertedHotelDataDivUniqueId}`;
            viewSpan.innerText = hotelRoomViewInput;
            hotelRowTableDiv.querySelector('.description_cell').appendChild(viewSpan);
        }
        if (hotelBreakfastPeopleAmountInput !== '') {
            let breakfastSpan = document.createElement('span');
            breakfastSpan.id = `hotel_breakfast_span_id_${insertedHotelDataDivUniqueId}`;
            breakfastSpan.innerText = hotelBreakfastPeopleAmountInput;
            hotelRowTableDiv.querySelector('.description_cell').appendChild(breakfastSpan);
        }
        if (hotelExtraBedInput !== '') {
            let extraBedSpan = document.createElement('span');
            extraBedSpan.id = `hotel_extra_bed_span_id_${insertedHotelDataDivUniqueId}`;
            extraBedSpan.className = 'hotel_special_request_span_class';
            extraBedSpan.innerText = hotelExtraBedInput;
            extraBedSpan.style.width = '100%';
            extraBedSpan.style.background = 'rgb(85, 127, 137)';
            extraBedSpan.style.color = 'white';
            extraBedSpan.style.padding = '0 5px';
            hotelRowTableDiv.querySelector('.description_cell').appendChild(extraBedSpan);
        }
        if (hotelSpecialRoomRequestInput !== '') {
            let specialRequestSpan = document.createElement('span');
            specialRequestSpan.id = `hotel_special_request_span_id_${insertedHotelDataDivUniqueId}`;
            specialRequestSpan.className = 'hotel_special_request_span_class';
            specialRequestSpan.innerText = hotelSpecialRoomRequestInput;
            specialRequestSpan.style.background = 'rgb(85, 127, 137)';
            specialRequestSpan.style.color = 'white';
            specialRequestSpan.style.padding = '0 5px';
            hotelRowTableDiv.querySelector('.description_cell').appendChild(specialRequestSpan);
        }
        if (hotelRoomExtraInfoReadyText !== '') {
            // Remove duplicated + signs and any + signs at the beginning
            let cleanedExtraInfoText = hotelRoomExtraInfoReadyText
                .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

            let extraInfoSpan = document.createElement('span');
            extraInfoSpan.id = `hotel_extra_info_span_id_${insertedHotelDataDivUniqueId}`;
            extraInfoSpan.innerText = `+ ${cleanedExtraInfoText}`;
            extraInfoSpan.style.width = '100%';
            extraInfoSpan.style.background = 'rgb(85, 127, 137)';
            extraInfoSpan.style.color = 'white';
            extraInfoSpan.style.padding = '0 5px';
            hotelRowTableDiv.querySelector('.description_cell').appendChild(extraInfoSpan);
        }




        // Handle the second room data if the second room div is visible
        if (document.getElementById('hotel_second_room_data_input_div').style.display !== "none") {
            if (hotelRoomTypeDescriptionInput_2 !== '') {
                let roomTypeDescriptionSpan_2 = document.createElement('span');
                roomTypeDescriptionSpan_2.id = `hotel_room_type_description_2_${insertedHotelDataDivUniqueId}`;
                roomTypeDescriptionSpan_2.innerText = hotelRoomTypeDescriptionInput_2;
                roomTypeDescriptionSpan_2.style.width = '100%';
                roomTypeDescriptionSpan_2.style.background = 'rgb(5, 17, 21)';
                roomTypeDescriptionSpan_2.style.color = 'white';


                let plusSign = document.createElement('span');
                plusSign.innerText = '+ ';
                plusSign.style.width = '100%';
                plusSign.style.background = 'rgb(5, 17, 21)';
                plusSign.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(plusSign);
                hotelRowTableDiv.querySelector('.description_cell').appendChild(roomTypeDescriptionSpan_2);
            }
            if (hotelRoomContainPoolInput_2 !== '') {
                let poolSpan_2 = document.createElement('span');
                poolSpan_2.id = `hotel_pool_span_id_2_${insertedHotelDataDivUniqueId}`;
                poolSpan_2.innerText = hotelRoomContainPoolInput_2;
                poolSpan_2.style.width = '100%';
                poolSpan_2.style.background = 'rgb(5, 17, 21)';
                poolSpan_2.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(poolSpan_2);
            }
            if (hotelRoomViewInput_2 !== '') {
                let viewSpan_2 = document.createElement('span');
                viewSpan_2.id = `hotel_view_span_id_2_${insertedHotelDataDivUniqueId}`;
                viewSpan_2.style.width = '100%';
                viewSpan_2.innerText = hotelRoomViewInput_2;
                viewSpan_2.style.background = 'rgb(5, 17, 21)';
                viewSpan_2.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(viewSpan_2);
            }
            if (hotelBreakfastPeopleAmountInput_2 !== '') {
                let breakfastSpan_2 = document.createElement('span');
                breakfastSpan_2.id = `hotel_breakfast_span_id_2_${insertedHotelDataDivUniqueId}`;
                breakfastSpan_2.innerText = hotelBreakfastPeopleAmountInput_2;
                breakfastSpan_2.style.width = '100%';
                breakfastSpan_2.style.background = 'rgb(5, 17, 21)';
                breakfastSpan_2.style.color = 'white';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(breakfastSpan_2);
            }
            if (hotelExtraBedInput_2 !== '') {
                let extraBedSpan_2 = document.createElement('span');
                extraBedSpan_2.id = `hotel_extra_bed_span_id_2_${insertedHotelDataDivUniqueId}`;
                extraBedSpan_2.className = 'hotel_special_request_span_class';
                extraBedSpan_2.innerText = hotelExtraBedInput_2;
                extraBedSpan_2.style.width = '100%';
                extraBedSpan_2.style.background = 'rgb(5, 17, 21)';
                extraBedSpan_2.style.color = 'white';
                extraBedSpan_2.style.padding = '0 5px';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(extraBedSpan_2);
            }
            if (hotelSpecialRoomRequestInput_2 !== '') {
                let specialRequestSpan_2 = document.createElement('span');
                specialRequestSpan_2.id = `hotel_special_request_span_id_2_${insertedHotelDataDivUniqueId}`;
                specialRequestSpan_2.className = 'hotel_special_request_span_class';
                specialRequestSpan_2.innerText = hotelSpecialRoomRequestInput_2;
                specialRequestSpan_2.style.width = '100%';
                specialRequestSpan_2.style.background = 'rgb(5, 17, 21)';
                specialRequestSpan_2.style.color = 'white';
                specialRequestSpan_2.style.padding = '0 5px';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(specialRequestSpan_2);
            }
            if (hotelRoomExtraInfoReadyText_2 !== '') {
                // Remove duplicated + signs and any + signs at the beginning
                let cleanedExtraInfoText = hotelRoomExtraInfoReadyText_2
                    .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

                let extraInfoSpan_2 = document.createElement('span');
                extraInfoSpan_2.id = `hotel_extra_info_span_id_2_${insertedHotelDataDivUniqueId}`;
                extraInfoSpan_2.innerText = `+ ${cleanedExtraInfoText}`;
                extraInfoSpan_2.style.width = '100%';
                extraInfoSpan_2.style.background = 'rgb(5, 17, 21)';
                extraInfoSpan_2.style.color = 'white';
                extraInfoSpan_2.style.padding = '0 5px';
                hotelRowTableDiv.querySelector('.description_cell').appendChild(extraInfoSpan_2);
            }
        }



        // Append the new hotel row div to the parent div that holds all inserted hotel data
        document.getElementById('inserted_hotel_data_position_div').appendChild(hotelRowTableDiv);




        // Get all dynamically created elements with the class 'hotelRowImageController'
        let hotelRowImageControllers = hotelRowTableDiv.querySelectorAll('.hotel_row_image_controller');


        // Attach click and touch event listeners to each element
        hotelRowImageControllers.forEach(element => {
            handleClickEvent(element);
        });
    }






    /* Add more number to the 'insertedHotelDataDivUniqueId' to keep a unique id name for each created 'hotelRowTableDiv' div */
    insertedHotelDataDivUniqueId++;




    /* Store the new unique id name 'insertedHotelDataDivUniqueId' for later refrence and use (when importing data) */
    document.getElementById('store_google_sheet_hotel_uniuqe_id_name_value').innerText = insertedHotelDataDivUniqueId;



    /* Show up the 'downloaded_pdf_hotel_data_page' section */
    document.getElementById('downloaded_pdf_hotel_data_page').style.display = 'block';




    /* Call a function to make sure if all package dates should be hidden or no */
    ensureAllPackageDatesHiddenOrNo();




    // Get references to all input elements and reset their values
    document.getElementById('hotel_name_input_id').value = '';
    document.getElementById('hotel_location_input_id').value = '';
    document.getElementById('hotel_stars_rate_input_id').value = '';


    document.getElementById('hotel_check_in_input_id').value = document.getElementById('hotel_check_out_input_id').value;

    /* Store the last stooped hotel check out date for later use (when importing data) */
    document.getElementById('store_google_sheet_hotel_last_stopped_check_out_date_value').innerText = document.getElementById('hotel_check_in_input_id').value;



    document.getElementById('hotel_check_out_input_id').value = '';
    document.getElementById('hotel_total_nights_input_id').value = '';
    document.getElementById('hotel_room_type_description_input_id').value = '';
    document.getElementById('hotel_room_contain_pool_input_id').value = '';
    document.getElementById('hotel_room_view_input_id').value = '';
    document.getElementById('hotel_special_room_request_input_id').value = '';
    document.getElementById('hotel_room_extra_info_textarea_id').value = '';


    document.getElementById('hotel_room_type_description_input_id_2').value = '';
    document.getElementById('hotel_room_contain_pool_input_id_2').value = '';
    document.getElementById('hotel_room_view_input_id_2').value = '';
    document.getElementById('hotel_special_room_request_input_id_2').value = '';
    document.getElementById('hotel_room_extra_info_textarea_id_2').value = '';




    // Call the function to set up drag-and-drop functionality
    createHotelDragAndDropMood();



    // Call a function to save the current dates of all hotels for later Re-arranging use (when drag and drop)
    saveOriginalHotelDates();




    /* Re-Create the data of the flights details when submit new changes in the hotels data */
    if (document.getElementById('downloaded_pdf_flight_data_page').style.display !== 'none') {
        // First delete all old flights row data'
        document.getElementById('inserted_flight_data_position_div').innerHTML = '';





        /* Set the 'insertedHotelDataDivUniqueId' value based on the following condition */
        if (document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText !== '') {
            insertedFlightDataDivUniqueId = document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText;
        } else {
            insertedFlightDataDivUniqueId = 1;
        }



        // Get all divs with the class name 'hotel_row_class_for_editing'
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

        let lastCity = null;  // Variable to store the last valid city encountered
        let lastDate = null;  // Variable to store the date associated with the last valid city
        let validCities = ["Bali", "Jakarta", "Bandung", "Puncak", "Lombok"];  // Array of valid cities to check against



        // Get the values of the adult and kids inputs
        let adultAmount = document.getElementById('adult_package_person_amount_input_id').value;
        let kidsAmount = document.getElementById('kids_package_person_amount_input_id').value;
        let infantAmount = document.getElementById('infant_package_person_amount_input_id').value;

        // Function to extract numbers from the string
        function extractNumberFromString(str) {
            let match = str.match(/\d+/);  // Use regex to find the number
            return match ? parseInt(match[0]) : 0;  // Return the number or 0 if no number found
        }

        // Extract numbers from adult and kids input values
        let adultNumber = extractNumberFromString(adultAmount);
        let kidsNumber = extractNumberFromString(kidsAmount);

        // Calculate total people (adults + kids)
        let totalPeople = adultNumber + kidsNumber;




        // Iterate through all found hotel rows
        allHotelRows.forEach((hotelRow, index) => {
            let currentCity = hotelRow.querySelector('h5').innerText;  // Get the city name from the current hotel row's h5 element
            let currentDate = hotelRow.querySelector('h2').innerText;  // Get the date from the current hotel row's h2 element

            // Check if transition between Jakarta and Bandung (in either order) and skip
            if ((lastCity === "Jakarta" && currentCity === "Bandung") || (lastCity === "Bandung" && currentCity === "Jakarta")) {
                lastCity = currentCity;
                lastDate = currentDate;
                return; // Skip this iteration without creating a flightRowTableDiv
            }

            // Check if transition between Jakarta and Puncak and skip
            if (lastCity === "Jakarta" && currentCity === "Puncak") {
                lastCity = currentCity;
                lastDate = currentDate;
                return; // Skip this iteration without creating a flightRowTableDiv
            }

            // Check if transition between Puncak and Jakarta and skip
            if (lastCity === "Puncak" && currentCity === "Jakarta") {
                lastCity = currentCity;
                lastDate = currentDate;
                return; // Skip this iteration without creating a flightRowTableDiv
            }

            // Check if the current and last city are valid and different
            if ((validCities.includes(currentCity) && lastCity && lastCity !== currentCity && validCities.includes(lastCity)) ||
                (lastCity === "Puncak" && currentCity === "Bali") || (lastCity === "Bali" && currentCity === "Puncak")) {

                let fromCity = lastCity;
                let toCity = currentCity;


                /* check the 'lastCity' and the 'currentCity' value and based on the below conditions set the value of the 'fromCity' and the 'toCity' */
                if ((lastCity === "Puncak" && currentCity === "Bali") || (lastCity === "Bandung" && currentCity === "Bali")) {
                    fromCity = "Jakarta";
                    toCity = "Bali";
                } else if ((lastCity === "Bali" && currentCity === "Puncak") || (lastCity === "Bali" && currentCity === "Bandung")) {
                    fromCity = "Bali";
                    toCity = "Jakarta";
                }



                // Check if transition between Bandung and Puncak (in either order) and skip
                if ((lastCity === "Bandung" && currentCity === "Puncak") || (lastCity === "Puncak" && currentCity === "Bandung")) {
                    lastCity = currentCity;
                    lastDate = currentDate;
                    return; // Skip this iteration without creating a flightRowTableDiv
                }


                // Create a new div with flight details
                let flightRowTableDiv = document.createElement('div');
                flightRowTableDiv.id = `flight_row_id_${insertedFlightDataDivUniqueId}`;  // Set a unique ID for the new div
                flightRowTableDiv.className = 'flight_row_class flight_row_class_for_editing';  // Assign class names to the new div

                // Create the HTML content for the new flight row div
                let flightRowTableDivContent = `
                <div class="flight_row_flight_arrival_time_controller inserted_flight_data_row" style="cursor: pointer;"><p id='flight_air_line_${insertedFlightDataDivUniqueId}'></p></div>
                <div>
                        <p id="flight_adult_person_amount_${insertedFlightDataDivUniqueId}">
                            ${totalPeople === 1
                        ? `${totalPeople} Adult`
                        : totalPeople > 10
                            ? `${totalPeople} Adult`
                            : totalPeople !== 0
                                ? `${totalPeople} Adults`
                                : ''
                    }
                        </p>
                        ${infantAmount ? `<p id="flight_infant_person_amount_${insertedFlightDataDivUniqueId}">${infantAmount}</p>` : ''}
                    </div>
                <div><p>20Kg Per Pax</p></div>
                <div><h2 id='flight_from_city_${insertedFlightDataDivUniqueId}'>${fromCity}</h2></div>
                <div><h3 id='flight_to_city_${insertedFlightDataDivUniqueId}'>${toCity}</h3></div>
                <div><h1 id='flight_date_${insertedFlightDataDivUniqueId}' class="flight_date_for_matching_whole_package_date">${currentDate}</h1></div>
                <div><p id='flight_fly_away_time_${insertedFlightDataDivUniqueId}'></p></div>
                <div><p id='flight_arrival_time_${insertedFlightDataDivUniqueId}'></p></div>
            `;


                flightRowTableDiv.innerHTML = flightRowTableDivContent;  // Insert the generated HTML content into the new div

                // Append the new div to the container with id 'inserted_flight_data_position_div'
                document.getElementById('inserted_flight_data_position_div').appendChild(flightRowTableDiv);

                // Increment the unique ID for the next div
                insertedFlightDataDivUniqueId++;
            }

            // Update the lastCity and lastDate for the next iteration
            lastCity = currentCity;
            lastDate = currentDate;
        });










        // Check if there is any element with the class 'flight_row_class_for_editing'
        let allFlightRowdivs = document.getElementsByClassName('flight_row_class_for_editing');

        /* if there is found created flights row data */
        if (allFlightRowdivs.length > 0) {

            // Play a sound effect
            playSoundEffect('success');

            /* Change the 'تم' button color */
            clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 255, 0)';
            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);


            // If any element is found, set the display style of the 'downloaded_pdf_flight_data_page' to 'block'
            document.getElementById('downloaded_pdf_flight_data_page').style.display = 'block';



            /* Hide the icon button after creating a flight row */
            document.getElementById('manually_add_flight_row_icon').style.display = 'none';



            /* Call a function to make sure if all package dates should be hidden or no */
            ensureAllPackageDatesHiddenOrNo();



            /* if there is no any found created flights row data */
        } else {

            // Play a sound effect
            playSoundEffect('error');


            /* Change the 'تم' button color */
            clint_flight_inputs_submit_icon.style.backgroundColor = 'red';
            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);


            // If there is no found element, set the display style of the 'downloaded_pdf_flight_data_page' to 'none'
            document.getElementById('downloaded_pdf_flight_data_page').style.display = 'none';
        }



        // Get references to all input elements and reset their values thier
        document.getElementById('flight_from_city_input_id').value = document.getElementById('flight_to_city_input_id').value;
        document.getElementById('flight_to_city_input_id').value = '';
        document.getElementById('flight_date_input_id').value = '';
        document.getElementById('flight_fly_away_time_input_id').value = '';
        document.getElementById('flight_arrival_time_input_id').value = '';




        // Get all dynamically created elements with the class 'flight_row_flight_arrival_time_controller'
        document.querySelectorAll('.flight_row_flight_arrival_time_controller').forEach(function (element) {
            element.onclick = function (event) {
                flightRowAirLineControllerFunction(event, element);
            };
        });


        /* Store the last saved flight unique id name */
        document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText = insertedFlightDataDivUniqueId;
    }
    /* Re-Create the data of the clint movements details when submit new changes in the hotels data */
    if (document.getElementById('downloaded_pdf_clint_movements_data_page').style.display !== 'none') {

        /* Delete all data inside the 'inserted_clint_movements_data_position_div' in every time the 'clint_movements_auto_create_icon' is clicked */
        document.getElementById('inserted_clint_movements_data_position_div').innerHTML = '';


        // Function to increment a date by a specified number of days
        function incrementDate(dateString, days) {
            let [day, month] = dateString.split(' '); // Split the date string into day and month
            let monthsMap = {
                "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
                "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
            };
            let monthNames = Object.keys(monthsMap); // Array of month names in English

            let date = new Date(); // Create a new date object
            date.setDate(parseInt(day)); // Set the day of the date object
            date.setMonth(monthsMap[month]); // Set the month of the date object
            date.setDate(date.getDate() + days); // Increment the date by the specified number of days

            let newDay = date.getDate(); // Get the new day after incrementing
            let newMonth = monthNames[date.getMonth()]; // Get the new month name in English

            return `${newDay} ${newMonth}`; // Return the new date in the same format (day month)
        }





        // Function to clean up text and ensure no duplicated '+'
        function cleanUpText(text) {
            return text.replace(/\+\s*\+/g, ' + ').trim();
        }

        // Get the state of the airport welcome checkbox
        let isAirportWelcomeIncluded = document.getElementById('include_airport_welcome__checkbox').checked;
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');
        let totalHotels = allHotelRows.length;
        let usedVisitingPlaces = {
            baliUbudKeramas: {},
            baliOthers: {},
            jakarta: {},
            puncak: {},
            bandung: {},
            lombok: {},
        };

        let previousCityName = '';
        let previousHotelName = '';
        let isFirstHotelRowCreated = false; // Flag to check the first created row
        let hasCenterTourTextBeenAdded = false; // Flag to track if "التجول في السنتر" text has been added

        let isFirstJakartaHotelFound = false; // Flag to track the first Jakarta hotel found

        let firstCreatedClintMovementsRowDivForLastHotel = null; // Variable to store the first created div for the last hotel


        let isFirstClintMovementsRowCreated = false; // Flag to track the first created clintMovementsRowTableDiv


        /* Variable to store if the h5 inside the first found 'hotel_row_class_for_editing' is "Puncak" or "Bandung" */
        let firstHotelCityName = allHotelRows[0].querySelector('h5').innerText;


        // Store the innerText of the h5 inside the last found hotel_row_class_for_editing
        let lastHotelCityName = allHotelRows[totalHotels - 1].querySelector('h5').innerText;


        // Variable to store the combined city names for the last found hotel row
        let lastHotelRowCombinedCityName = '';

        allHotelRows.forEach((hotelRow, index) => {
            let hotelName = hotelRow.querySelector('h1').innerText;
            let checkInDate = hotelRow.querySelector('h2').innerText;
            let nights = parseInt(hotelRow.querySelector('h4').innerText, 10);
            let cityName = hotelRow.querySelector('h5').innerText;
            let areaName = cityName === "Bali" ? hotelRow.querySelector('h6').innerText : null;
            let packageType = document.getElementById('clint_package_type_h6').innerText.trim();

            let packageMapping = {
                "Honeymooners Package": "honeymoon",
                "Guys Package": "guys",
                "Family Package": "family",
                "Two People Package": "twopeople",
                "Group Package": "family",
                "New Package": "family"
            };
            let packageKey = packageMapping[packageType] || "family";

            let targetObject;
            let usedDays; // Declare usedDays to be assigned later

            if (cityName === "Bali" && areaName) {
                if (areaName === "Ubud" || areaName === "Keramas") {
                    targetObject = allClintVisitingPlacesArray[1][packageKey];
                    usedDays = usedVisitingPlaces.baliUbudKeramas;
                } else if (["Kuta", "Nusa Dua", "Seminyak", "Jimbaran", "Uluwatu", "Legian", "Sanur", "Tabanan", "Canggu", "Tampaksiring"].includes(areaName)) {
                    targetObject = allClintVisitingPlacesArray[0][packageKey];
                    usedDays = usedVisitingPlaces.baliOthers;
                }
            } else if (cityName === 'Jakarta') {
                targetObject = allClintVisitingPlacesArray[2][packageKey];
                usedDays = usedVisitingPlaces.jakarta;
            } else if (cityName === 'Puncak') {
                targetObject = allClintVisitingPlacesArray[3][packageKey];
                usedDays = usedVisitingPlaces.puncak;
            } else if (cityName === 'Bandung') {
                targetObject = allClintVisitingPlacesArray[4][packageKey];
                usedDays = usedVisitingPlaces.bandung;
            } else if (cityName === 'Lombok') {
                targetObject = allClintVisitingPlacesArray[5][packageKey];
                usedDays = usedVisitingPlaces.lombok;
            }

            if (!usedVisitingPlaces[cityName]) {
                usedVisitingPlaces[cityName] = {};
            }

            let isCheckOutTextAdded = false; // Flag to track if check-out text has been added for this hotel
            let dayIndex = 0; // Initialize dayIndex separately for each hotel

            for (let i = 0; i < nights; i++) {
                let clintMovementsRowTableDiv = document.createElement('div');
                clintMovementsRowTableDiv.className = 'clint_movements_row_class clint_movements_row_class_for_editing';

                let newDate = incrementDate(checkInDate, i);

                let visitingPlacesText = "";

                // Skip appending text for the first created div
                if (targetObject) {
                    while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        dayIndex++;
                    }
                    if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                        usedDays[dayIndex] = true;
                        if (textArray && textArray.length > 0) {
                            visitingPlacesText = `${textArray.join(' + ')} `;
                        }
                        dayIndex++; // Increment dayIndex after appending text
                    }
                }

                let checkInOutText = i === 0 ? `${hotelName} Check-in` : '';
                let combinedCityName = cityName;

                // Logic for check-in/out text and combined city name based on previous city/hotel
                if (i === 0 && index > 0) {
                    previousCityName = allHotelRows[index - 1].querySelector('h5').innerText;
                    previousHotelName = allHotelRows[index - 1].querySelector('h1').innerText;

                    if (cityName !== previousCityName) {
                        combinedCityName = `${previousCityName}-${cityName}`;
                        lastHotelRowCombinedCityName = combinedCityName; // Update combined city name
                    }

                    let additionalText = "";
                    if (isAirportWelcomeIncluded && (cityName === "Bali" || cityName === "Jakarta") && cityName !== previousCityName) {
                        if (!(previousCityName === "Puncak" && cityName === "Jakarta") && !(previousCityName === "Bandung" && cityName === "Jakarta")) {
                            additionalText = `Welcoming in ${cityName} Airport + `;
                        }
                    }


                    if (!isCheckOutTextAdded) {
                        checkInOutText = `${previousHotelName} Check-out `;

                        if (previousCityName !== cityName) {
                            checkInOutText += `+ Going To ${cityName} `;
                        }

                        checkInOutText += `+ ${additionalText}${visitingPlacesText} + ${hotelName} Check-in`;
                        isCheckOutTextAdded = true;
                    }
                }

                if ((cityName === "Bali" || cityName === "Jakarta") && !hasCenterTourTextBeenAdded) {
                    checkInOutText = checkInOutText.replace(`${hotelName} Check-in`, `${hotelName} Check-in + Going around the center`);
                    hasCenterTourTextBeenAdded = true;
                }

                if (!isFirstHotelRowCreated && (cityName === "Bali" || cityName === "Jakarta") && isAirportWelcomeIncluded) {
                    checkInOutText = `Welcoming in ${cityName} Airport + ${checkInOutText}`;
                    isFirstHotelRowCreated = true;
                }

                // Additional condition for the first hotel row
                if (!isFirstHotelRowCreated && index === 0 && isAirportWelcomeIncluded && (firstHotelCityName === "Puncak" || firstHotelCityName === "Bandung")) {
                    checkInOutText = `Welcoming in Jakarta + Going To ${cityName} + ${hotelName} Check-in`;
                    isFirstHotelRowCreated = true; // Set the flag to avoid reapplying this condition
                }

                // Clean up text to ensure no duplicated '+'
                checkInOutText = cleanUpText(checkInOutText);

                clintMovementsRowTableDiv.innerHTML = `
                    <div><h1>${newDate}</h1></div>
                    <div><h2>${checkInOutText}</h2></div>
                    <div class="clint_movements_row_controller" style="cursor: pointer;"><h3>${i === 0 ? combinedCityName : cityName}</h3></div>
                `;

                // Apply the new condition to append text if needed, but skip the first hotel row
                if (!isFirstJakartaHotelFound && cityName === "Jakarta" && i === 0 && index !== 0) {
                    let currentH2 = clintMovementsRowTableDiv.querySelector('h2');
                    currentH2.innerText += " + Going To Alsadda restaurant for dinner";
                    currentH2.innerText = cleanUpText(currentH2.innerText); // Clean up text to ensure no duplicated '+'
                    isFirstJakartaHotelFound = true;
                }

                if (targetObject && i === 0) {
                    let dayIndex = 1;
                    while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        dayIndex++;
                    }
                    if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                        usedDays[dayIndex] = true;
                        if (textArray && textArray.length > 0) {
                            visitingPlacesText = `${textArray.join(' + ')} `;
                        }
                    }
                }

                if (targetObject) {
                    let dayIndex = i + 1;
                    while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        dayIndex++;
                    }
                    if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                        usedDays[dayIndex] = true;
                        if (textArray && textArray.length > 0) {
                            visitingPlacesText = `${textArray.join(' + ')} `;
                        }
                    }
                }

                if (visitingPlacesText) {
                    clintMovementsRowTableDiv.querySelector('h2').innerText += `${visitingPlacesText}`;
                }

                document.getElementById('inserted_clint_movements_data_position_div').appendChild(clintMovementsRowTableDiv);

                if (index === totalHotels - 1 && i === nights - 1) {
                    // Check if this is not the first created clintMovementsRowTableDiv
                    if (isFirstClintMovementsRowCreated) {
                        let lastH3 = clintMovementsRowTableDiv.querySelector('h3');
                        lastH3.innerText = lastHotelCityName;
                    } else {
                        isFirstClintMovementsRowCreated = true; // Set the flag after the first creation
                    }
                }
            }


            if (index === totalHotels - 1) {
                let extraDate = incrementDate(checkInDate, nights);
                let extraClintMovementsRowTableDiv = document.createElement('div');

                extraClintMovementsRowTableDiv.className = 'clint_movements_row_class clint_movements_row_class_for_editing';

                extraClintMovementsRowTableDiv.innerHTML = `
            <div><h1>${extraDate}</h1></div>
            <div><h2>${hotelName} Check-out and going to Airport for leaving</h2></div>
            <div class="clint_movements_row_controller" style="cursor: pointer;"><h3>${cityName}-مغادرة</h3></div>
        `;

                document.getElementById('inserted_clint_movements_data_position_div').appendChild(extraClintMovementsRowTableDiv);
            }
        });


        /* Show up the 'downloaded_pdf_clint_movements_data_page' section */
        document.getElementById('downloaded_pdf_clint_movements_data_page').style.display = 'block';


        /* Update the available clint visiting places based on the current existing visiting places */
        filterUsedClintVisitingPlacesNames();



        // Get all elements with the class name 'flight_row_class'
        let clintMovementsRowTableDiv = document.querySelectorAll('.clint_movements_row_class_for_editing');

        // Loop through each 'flight_row_class' element
        clintMovementsRowTableDiv.forEach(clintMovementsRowTableDiv => {

            // Get all dynamically created elements with the class 'clint_movements_row_controller'
            clintMovementsRowTableDiv.querySelectorAll('.clint_movements_row_controller').forEach(function (element) {
                element.onclick = function (event) {
                    clintMovementsRowCityNameControllerFunction(event, element);
                };
            });

        });



        /* Call a function to make sure if all package dates should be hidden or no */
        ensureAllPackageDatesHiddenOrNo();


        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }
}


// Function to handle touch and mouse events to distinguish between click and drag
function handleClickEvent(element) {
    let touchStartX, touchStartY, touchStartTime;
    let isDragging = false;
    let isTouchEvent = false; // Flag to distinguish between touch and mouse events

    element.addEventListener('touchstart', (event) => {
        let touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = new Date().getTime();
        isDragging = false;
        isTouchEvent = true; // Set the flag to indicate a touch event
    });

    element.addEventListener('touchmove', () => {
        isDragging = true;
    });

    element.addEventListener('touchend', (event) => {
        isTouchEvent = false; // Reset the flag after the touch event ends
    });

    element.addEventListener('mousedown', (event) => {
        if (!isTouchEvent) { // Only execute if it is not a touch event
            touchStartX = event.clientX;
            touchStartY = event.clientY;
            touchStartTime = new Date().getTime();
            isDragging = false;
        }
    });

    element.addEventListener('mousemove', () => {
        isDragging = true;
    });

    element.addEventListener('mouseup', (event) => {
        if (!isDragging && !isTouchEvent) { // Only execute if it is not a touch event
            hotelRowImageControllerFunction(event);
        }
    });
}

// Define a global variable to store the reference
let currentHotelDataDivId;

// Function to handle delete clicked hotel data
deleteClickedHotelData = function (clickedHotelRowIdName) {

    let clickedHotelCardElement = document.getElementById(clickedHotelRowIdName);
    if (clickedHotelCardElement) {
        clickedHotelCardElement.remove();
    }

    // Hide delete button div
    let overlayLayer = document.querySelector('.black_overlay');
    let deleteHotelRowDiv = document.getElementById('ensure_delete_or_edit_hotel_data_div');
    deleteHotelRowDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    overlayLayer.style.opacity = '0';

    // Remove overlay and edit/delete div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS



    // Call a function to update dates inside 'hotel_row_class_for_editing' divs based on their order in the DOM
    updateHotelRowDates();



    // Check if there are any remaining inserted hotel data divs (Searching by the second image class name)
    let remainingHotelDataDivs = document.querySelectorAll('.inserted_hotel_data_row');
    if (remainingHotelDataDivs.length === 0) {
        // Hide section with id 'downloaded_pdf_hotel_data_page'
        document.getElementById('downloaded_pdf_hotel_data_page').style.display = 'none';


        /* Reset the value of the saved hotel dates for later Re-arranging */
        saveOriginalHotelDates();


        /* in case if there is no remaaining 'inserted_hotel_data_row' then check if the 'create_new_clint_data_section' is visible */
        if (document.getElementById('create_new_clint_data_section').style.display !== 'none') {

            /* Set the date of the 'hotel_check_in_input_id' as the the date in the 'whole_package_start_date_input_id' */
            document.getElementById('hotel_check_in_input_id').value = document.getElementById('whole_package_start_date_input_id').value;

        } else {

            document.getElementById('hotel_check_in_input_id').value = '';
        }


    } else {

        // Get all divs with the class name 'hotel_row_class_for_editing'
        let allFoundHotelRowDivs = document.querySelectorAll('.hotel_row_class_for_editing');

        // Get the last found div with the class name "hotel_row_class_for_editing"
        let lastHotelRowDiv = allFoundHotelRowDivs[allFoundHotelRowDivs.length - 1];

        // Get the date value from the h3 element inside the lastHotelRowDiv
        let dateElement = lastHotelRowDiv.querySelector('h3');
        let dateValue = dateElement ? dateElement.innerText.trim() : '';

        // Set the value of the hotel_check_in_input_id to the extracted date value
        document.getElementById('hotel_check_in_input_id').value = dateValue;

        // Store the last stopped hotel check-out date for later use (when importing data)
        document.getElementById('store_google_sheet_hotel_last_stopped_check_out_date_value').innerText = dateValue;

    }
};

/* Function to edit the clicked hotel row data */
editClickedHotelDataFunction = function (clickedHotelRowIdName) {



    /* Make sure to get the close sell data by running the 'handleHotelNameInputClick */
    fetchAllCloseSellDataFunction_Supabase();




    /* Make sure the correct section is the one that is visiable */
    create_new_clint_data_section.style.display = 'none';
    create_new_hotel_package_section.style.display = 'flex';
    create_new_flight_package_section.style.display = 'none';
    create_new_package_including_and_not_including_data_section.style.display = 'none';
    create_new_clint_movements_plan_section.style.display = 'none';


    /* Hide and show different icons */
    document.getElementById('hotel_inputs_submit_icon').style.display = 'none';
    document.getElementById('change_insert_hotel_data_system_icon').style.display = 'none';
    document.getElementById('show_or_hide_second_room_inputs_div_icon').style.display = 'none';

    document.getElementById('confirm_new_hotel_data_row_icon').style.display = 'block';
    document.getElementById('cancel_new_hotel_data_row_icon').style.display = 'block';
    document.getElementById('show_or_hide_second_room_inputs_div_icon_2').style.display = 'block';
    document.getElementById('change_insert_hotel_data_system_icon_2').style.display = 'block';


    /* Change the innerText and the background color of the 'hotel_content_section_title_text_id' */
    document.getElementById('hotel_content_section_title_text_id').innerText = 'EDIT HOTEL';
    document.getElementById('toggle_hotel_data_title_div_id').style.backgroundColor = 'rgb(85, 127, 137)';


    /* Scroll up to the middle of the 'hotel_data_dropdown_content' */
    document.getElementById('hotel_data_dropdown_content').scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth',
    });


    // Hide delete button div
    let overlayLayer = document.querySelector('.black_overlay');
    let deleteHotelRowDiv = document.getElementById('ensure_delete_or_edit_hotel_data_div');
    deleteHotelRowDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    overlayLayer.style.opacity = '0';

    // Remove overlay and edit/delete div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS

    // Get the clicked hotel data row
    let clickedHotelDataDiv = document.getElementById(clickedHotelRowIdName);
    let insertedHotelDataDivUniqueId = clickedHotelRowIdName.split('_').pop(); // Extract the unique ID from the clicked row ID


    /* Make the 'hotel_check_in_input_id' clickable for users to change the date */
    document.getElementById('hotel_check_in_input_id').disabled = false;


    /* Get all the values from the clicked hotel row */
    let hotelNameText = clickedHotelDataDiv.querySelector(`h1[id^='hotel_name_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelLocationText = clickedHotelDataDiv.querySelector(`h5[id^='hotel_location_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelBaliAreaInput = clickedHotelDataDiv.querySelector(`h6[id^='hotel_area_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelCheckInText = clickedHotelDataDiv.querySelector(`h2[id^='hotel_check_in_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelCheckOutText = clickedHotelDataDiv.querySelector(`h3[id^='hotel_check_out_${insertedHotelDataDivUniqueId}']`)?.innerText || '';


    /* Store the extracted number form the hotel total night just (as a number) */
    storeHotelTotalNights = clickedHotelDataDiv.querySelector(`h4[id^='hotel_total_nights_${insertedHotelDataDivUniqueId}']`)?.innerText || '';


    let hotelRoomTypeDescriptionText = clickedHotelDataDiv.querySelector(`span[id^='hotel_room_type_description_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelRoomContainPoolText = clickedHotelDataDiv.querySelector(`span[id^='hotel_pool_span_id_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelRoomViewText = clickedHotelDataDiv.querySelector(`span[id^='hotel_view_span_id_${insertedHotelDataDivUniqueId}']`)?.innerText || '';


    /* Store the extracted number form the hotel total unit just (as a number) */
    storeHotelTotalUnitNumber = clickedHotelDataDiv.querySelector(`p[id^='hotel_total_unit_${insertedHotelDataDivUniqueId}']`)?.innerText || '';


    let hotelBreakfastPeopleAmountText = clickedHotelDataDiv.querySelector(`span[id^='hotel_breakfast_span_id_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelExtraBedText = clickedHotelDataDiv.querySelector(`span[id^='hotel_extra_bed_span_id_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelSpecialRoomRequestText = clickedHotelDataDiv.querySelector(`span[id^='hotel_special_request_span_id_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
    let hotelRoomExtraInfoText = clickedHotelDataDiv.querySelector(`span[id^='hotel_extra_info_span_id_${insertedHotelDataDivUniqueId}']`)?.innerText || '';


    /* Get the image src name to check the stars amount */
    let hotelImage = document.querySelector(`img[id^='hotel_image_${insertedHotelDataDivUniqueId}']`)?.src || '';



    /* in case if there was a second room data in the clicked hotel row then target those data */
    if (clickedHotelDataDiv.querySelector(`span[id^='hotel_room_type_description_2_${insertedHotelDataDivUniqueId}`)) {

        // Get all hotel first and second room data inputs for width styling
        let inputsAndTextareas = document.querySelectorAll('#hotel_two_room_data_input_divs_container input, #hotel_two_room_data_input_divs_container textarea');
        document.getElementById('hotel_second_room_data_input_div').style.display = 'flex';

        // Save the current width before changing it to 100%
        inputsAndTextareas.forEach(element => {
            if (!element.dataset.originalWidth) {
                element.dataset.originalWidth = element.style.width; // Save the original width
            }
            element.style.width = '100%'; // Set width to 100%
        });


        let hotelRoomTypeDescriptionText_2 = clickedHotelDataDiv.querySelector(`span[id^='hotel_room_type_description_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
        let hotelRoomContainPoolText_2 = clickedHotelDataDiv.querySelector(`span[id^='hotel_pool_span_id_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
        let hotelRoomViewText_2 = clickedHotelDataDiv.querySelector(`span[id^='hotel_view_span_id_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';

        /* Store the extracted number form the hotel total unit just (as a number) */
        storeHotelTotalUnitNumber_2 = clickedHotelDataDiv.querySelector(`p[id^='hotel_total_unit_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';


        let hotelBreakfastPeopleAmountText_2 = clickedHotelDataDiv.querySelector(`span[id^='hotel_breakfast_span_id_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
        let hotelExtraBedText_2 = clickedHotelDataDiv.querySelector(`span[id^='hotel_extra_bed_span_id_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
        let hotelSpecialRoomRequestText_2 = clickedHotelDataDiv.querySelector(`span[id^='hotel_special_request_span_id_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';
        let hotelRoomExtraInfoText_2 = clickedHotelDataDiv.querySelector(`span[id^='hotel_extra_info_span_id_2_${insertedHotelDataDivUniqueId}']`)?.innerText || '';





        document.getElementById('hotel_room_type_description_input_id_2').value = hotelRoomTypeDescriptionText_2;
        document.getElementById('hotel_room_contain_pool_input_id_2').value = hotelRoomContainPoolText_2;
        document.getElementById('hotel_room_view_input_id_2').value = hotelRoomViewText_2;
        document.getElementById('hotel_unit_amount_input_id_2').value = `عدد الوحدات ${storeHotelTotalUnitNumber_2}`;
        document.getElementById('hotel_breakfast_people_amount_input_id_2').value = hotelBreakfastPeopleAmountText_2;
        document.getElementById('hotel_extra_bed_input_id_2').value = hotelExtraBedText_2;
        document.getElementById('hotel_special_room_request_input_id_2').value = hotelSpecialRoomRequestText_2;


        // Remove duplicated + signs and any + signs at the beginning
        let cleanedExtraInfoText = hotelRoomExtraInfoText_2
            .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

        document.getElementById('hotel_room_extra_info_textarea_id_2').value = cleanedExtraInfoText;


        /* In case if the clicked hotel row data does not have a second room type data then hide the second room inputs div */
    } else {
        // Get all hotel first and second room data inputs for width styling
        let inputsAndTextareas = document.querySelectorAll('#hotel_two_room_data_input_divs_container input, #hotel_two_room_data_input_divs_container textarea');
        document.getElementById('hotel_second_room_data_input_div').style.display = 'none';

        // Set width back to the original saved width value
        inputsAndTextareas.forEach(element => {
            element.style.width = element.dataset.originalWidth; // Use the saved width value
        });

    }



    /* Check if the clicked hotel row has a class name of 'new_hotel_data_by_user_writing_class' or no (hotel inserted by picking or writing) */
    if (clickedHotelDataDiv.classList.contains('new_hotel_data_by_user_writing_class')) {
        // Enter the values of the clicked hotel row div to inputs
        document.getElementById('hotel_location_input_id').value = hotelLocationText;
        document.getElementById('hotel_bali_area_input_id').value = hotelBaliAreaInput;


        // Show the hotel location & stars input
        document.getElementById('hotel_location_input_id').style.display = 'block';
        document.getElementById('hotel_stars_rate_input_id').style.display = 'block';


        /* Show the 'hotel_bali_area_input_id' if the value of the 'hotel_location_input_id' is 'Bali' */
        if (document.getElementById('hotel_location_input_id').value === 'Bali') {
            // Show the hotel bali area input
            document.getElementById('hotel_bali_area_input_id').style.display = 'block';


        } else {
            // Hide the hotel bali area input
            document.getElementById('hotel_bali_area_input_id').style.display = 'none';
        }



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

    }




    // Enter the values of the clicked hotel row div to inputs for the first room data
    document.getElementById('hotel_name_input_id').value = hotelNameText;
    document.getElementById('hotel_check_in_input_id').value = hotelCheckInText;
    document.getElementById('hotel_check_out_input_id').value = hotelCheckOutText;
    document.getElementById('hotel_total_nights_input_id').value = `${storeHotelTotalNights} ليالي`;
    document.getElementById('hotel_room_type_description_input_id').value = hotelRoomTypeDescriptionText;
    document.getElementById('hotel_room_contain_pool_input_id').value = hotelRoomContainPoolText;
    document.getElementById('hotel_room_view_input_id').value = hotelRoomViewText;
    document.getElementById('hotel_unit_amount_input_id').value = `عدد الوحدات ${storeHotelTotalUnitNumber}`;
    document.getElementById('hotel_breakfast_people_amount_input_id').value = hotelBreakfastPeopleAmountText;
    document.getElementById('hotel_extra_bed_input_id').value = hotelExtraBedText;
    document.getElementById('hotel_special_room_request_input_id').value = hotelSpecialRoomRequestText;



    /* Check the value of the 'hotelImage' to get the correct value for the 'hotel_stars_rate_input_id' input */
    if (hotelImage.includes('five-stars-hotel-image')) {
        document.getElementById('hotel_stars_rate_input_id').value = '5 نجوم';

    } else if (hotelImage.includes('four-stars-hotel-image')) {
        document.getElementById('hotel_stars_rate_input_id').value = '4 نجوم';

    } else if (hotelImage.includes('three-stars-hotel-image')) {
        document.getElementById('hotel_stars_rate_input_id').value = '3 نجوم';

    } else if (hotelImage.includes('no-stars-hotel-image')) {
        document.getElementById('hotel_stars_rate_input_id').value = '';

    }


    // Remove duplicated + signs and any + signs at the beginning
    let cleanedExtraInfoText = hotelRoomExtraInfoText
        .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

    document.getElementById('hotel_room_extra_info_textarea_id').value = cleanedExtraInfoText;













    /* Function to cancel the hotel row data editing process */
    cancelNewHotelDataRow = function () {

        // Get all divs with the class name 'hotel_row_class_for_editing' to compare its id name
        let allFoundHotelRowDivs = document.querySelectorAll('.hotel_row_class_for_editing');

        // Get the last found div with the class name "hotel_row_class_for_editing"
        let lastHotelRowDiv = allFoundHotelRowDivs[allFoundHotelRowDivs.length - 1];



        /* if the last found div is the one that got clicked then make sure to set the value of the check in as the value of the check out */
        if (lastHotelRowDiv.querySelector('h3') !== null || lastHotelRowDiv.querySelector('h3') !== undefined) {

            document.getElementById('hotel_check_in_input_id').value = lastHotelRowDiv.querySelector('h3').innerText;

            /* Store the last stooped hotel check out date for later use (when importing data) */
            document.getElementById('store_google_sheet_hotel_last_stopped_check_out_date_value').innerText = lastHotelRowDiv.querySelector('h3').innerText;


        } else {
            document.getElementById('hotel_check_in_input_id').value = document.getElementById('hotel_check_out_input_id').value;
            /* Store the last stooped hotel check out date for later use (when importing data) */
            document.getElementById('store_google_sheet_hotel_last_stopped_check_out_date_value').innerText = document.getElementById('hotel_check_out_input_id').value;
        }







        // Get references to all input elements and reset their values
        document.getElementById('hotel_name_input_id').value = '';
        document.getElementById('hotel_check_out_input_id').value = '';
        document.getElementById('hotel_total_nights_input_id').value = '';
        document.getElementById('hotel_room_type_description_input_id').value = '';
        document.getElementById('hotel_room_contain_pool_input_id').value = '';
        document.getElementById('hotel_room_view_input_id').value = '';
        document.getElementById('hotel_special_room_request_input_id').value = '';
        document.getElementById('hotel_room_extra_info_textarea_id').value = '';


        document.getElementById('hotel_room_type_description_input_id_2').value = '';
        document.getElementById('hotel_room_contain_pool_input_id_2').value = '';
        document.getElementById('hotel_room_view_input_id_2').value = '';
        document.getElementById('hotel_special_room_request_input_id_2').value = '';
        document.getElementById('hotel_room_extra_info_textarea_id_2').value = '';


        /* Hide and show different icons */
        document.getElementById('hotel_inputs_submit_icon').style.display = 'block';
        document.getElementById('change_insert_hotel_data_system_icon').style.display = 'block';
        document.getElementById('show_or_hide_second_room_inputs_div_icon').style.display = 'block';

        document.getElementById('confirm_new_hotel_data_row_icon').style.display = 'none';
        document.getElementById('cancel_new_hotel_data_row_icon').style.display = 'none';
        document.getElementById('show_or_hide_second_room_inputs_div_icon_2').style.display = 'none';
        document.getElementById('change_insert_hotel_data_system_icon_2').style.display = 'none';



        /* Reset the innerText and styling to defualt */
        document.getElementById('hotel_content_section_title_text_id').innerText = 'HOTEL DATA';
        document.getElementById('toggle_hotel_data_title_div_id').style.background = 'rgb(131, 0, 148)';


        // Call a function to save the current dates of all hotels for later Re-arranging use (when drag and drop)
        saveOriginalHotelDates();


        /* Make sure to Re-set the 'hotel_check_in_input_id' to unclickable */
        document.getElementById('hotel_check_in_input_id').disabled = true;



        // Hide the hotel location input
        document.getElementById('hotel_location_input_id').style.display = 'none';
        document.getElementById('hotel_location_input_id').value = '';
        document.getElementById('hotel_bali_area_input_id').style.display = 'none';
        document.getElementById('hotel_bali_area_input_id').value = '';
        document.getElementById('hotel_stars_rate_input_id').style.display = 'none';
        document.getElementById('hotel_stars_rate_input_id').value = '';

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



        /* Call a function to make sure if all package dates should be hidden or no */
        ensureAllPackageDatesHiddenOrNo();
    };



    // Function to confirm the new hotel row data
    confirmNewHotelDataRow = function () {


        // Get the clicked hotel data row
        let clickedHotelDataDiv = document.getElementById(clickedHotelRowIdName);

        // Clear the old data
        clickedHotelDataDiv.innerHTML = '';

        // Extract the new data from the input fields
        let hotelNameReadyText = document.getElementById('hotel_name_input_id').value;
        let hotelLocationInput = document.getElementById('hotel_location_input_id').value;
        let hotelBaliAreaInput = document.getElementById('hotel_bali_area_input_id').value;
        let hotelStarsRateInput = document.getElementById('hotel_stars_rate_input_id').value;
        let hotelCheckInReadyText = document.getElementById('hotel_check_in_input_id').value;
        let hotelCheckOutReadyText = document.getElementById('hotel_check_out_input_id').value;
        let hotelRoomTypeDescriptionInput = document.getElementById('hotel_room_type_description_input_id').value;
        let hotelRoomContainPoolInput = document.getElementById('hotel_room_contain_pool_input_id').value;
        let hotelRoomViewInput = document.getElementById('hotel_room_view_input_id').value;
        let hotelBreakfastPeopleAmountInput = document.getElementById('hotel_breakfast_people_amount_input_id').value;
        let hotelExtraBedInput = document.getElementById('hotel_extra_bed_input_id').value;
        let hotelSpecialRoomRequestInput = document.getElementById('hotel_special_room_request_input_id').value;
        let hotelRoomExtraInfoReadyText = document.getElementById('hotel_room_extra_info_textarea_id').value;


        /* Second hotel room data input values */
        let hotelRoomTypeDescriptionInput_2 = document.getElementById('hotel_room_type_description_input_id_2').value;
        let hotelRoomContainPoolInput_2 = document.getElementById('hotel_room_contain_pool_input_id_2').value;
        let hotelRoomViewInput_2 = document.getElementById('hotel_room_view_input_id_2').value;
        let hotelUnitAmountInput_2 = document.getElementById('hotel_unit_amount_input_id_2').value;
        let hotelBreakfastPeopleAmountInput_2 = document.getElementById('hotel_breakfast_people_amount_input_id_2').value;
        let hotelExtraBedInput_2 = document.getElementById('hotel_extra_bed_input_id_2').value;
        let hotelSpecialRoomRequestInput_2 = document.getElementById('hotel_special_room_request_input_id_2').value;
        let hotelRoomExtraInfoReadyText_2 = document.getElementById('hotel_room_extra_info_textarea_id_2').value;



        if (hotelNameReadyText === '' || hotelCheckInReadyText === '' || hotelCheckOutReadyText === '' || hotelRoomTypeDescriptionInput === '') {

            // Play a sound effect
            playSoundEffect('error');

            // Change the submit icon background color
            confirm_new_hotel_data_row_icon.style.backgroundColor = 'red';

            // Set the background color of the submit icon back to default color
            setTimeout(() => {
                confirm_new_hotel_data_row_icon.style.backgroundColor = 'rgb(0, 87, 116)';
            }, 500);


            /* Exit the function and stop the process */
            return;
        }



        /* in case the second room data inputs div is visible and there are empty inputs then stop the process */
        if (document.getElementById('hotel_second_room_data_input_div').style.display === 'flex') {

            if (hotelRoomTypeDescriptionInput_2 === '' || hotelUnitAmountInput_2 === '') {

                // Play a sound effect
                playSoundEffect('error');

                // Change the submit icon background color
                confirm_new_hotel_data_row_icon.style.backgroundColor = 'red';

                // Set the background color of the submit icon back to default color
                setTimeout(() => {
                    confirm_new_hotel_data_row_icon.style.backgroundColor = 'rgb(0, 87, 116)';
                }, 500);


                /* Exit the function and stop the process */
                return;
            }
        }





        /* Stop the process if the 'hotel_location_input_id' is visible and it is empty */
        if (document.getElementById('hotel_location_input_id').style.display !== 'none') {

            if (document.getElementById('hotel_location_input_id').value === '') {
                return;

            }


            /* Stop the process if the hotel location is bali but the area is not selected */
            if (document.getElementById('hotel_location_input_id').value === 'Bali' && document.getElementById('hotel_bali_area_input_id').value === '') {

                // Play a sound effect
                playSoundEffect('error');

                // Change the submit icon background color
                confirm_new_hotel_data_row_icon.style.backgroundColor = 'red';

                // Set the background color of the submit icon back to default color
                setTimeout(() => {
                    confirm_new_hotel_data_row_icon.style.backgroundColor = 'rgb(0, 87, 116)';
                }, 500);

                return;
            }
        }



        // Play a sound effect
        playSoundEffect('success');



        /* Check the insert hotel data system is by picking or writing by checking the visibilaty of the 'hotel_location_input_id' input */
        if (document.getElementById('hotel_location_input_id').style.display !== 'none') {


            // Check if the element has the class 'new_hotel_data_by_user_writing_class'
            if (!clickedHotelDataDiv.classList.contains('new_hotel_data_by_user_writing_class')) {
                // Remove the class
                clickedHotelDataDiv.classList.add('new_hotel_data_by_user_writing_class');
            }


            /* Check the amount of stars picked in the 'hotelStarsRateInput' input */
            let starsAmount = null;
            if (hotelStarsRateInput === '5 نجوم') {
                starsAmount = 'five';

            } else if (hotelStarsRateInput === '4 نجوم') {
                starsAmount = 'four';

            } else if (hotelStarsRateInput === '3 نجوم') {
                starsAmount = 'three';

            } else {
                starsAmount = 'no';

            }

            // Create the HTML content for a new hotel row
            let hotelRowTableDivContent = `
                <div><h1 id='hotel_name_${insertedHotelDataDivUniqueId}'>${hotelNameReadyText}</h1></div>
                <div><h2 id='hotel_check_in_${insertedHotelDataDivUniqueId}' class="hotel_check_in_date_for_matching_whole_package_date">${hotelCheckInReadyText}</h2></div>
                <div><h3 style="color: red" id='hotel_check_out_${insertedHotelDataDivUniqueId}' class="hotel_check_out_date_for_matching_whole_package_date">${hotelCheckOutReadyText}</h3></div>
                <div><h4 id='hotel_total_nights_${insertedHotelDataDivUniqueId}'>${storeHotelTotalNights}</h4></div>
                <div class="description_cell">
                    <span id='hotel_room_type_description_${insertedHotelDataDivUniqueId}'>${hotelRoomTypeDescriptionInput}</span></div>
                <div>
                    <p id='hotel_total_unit_${insertedHotelDataDivUniqueId}'>${storeHotelTotalUnitNumber}</p>
                    ${hotelUnitAmountInput_2 && document.getElementById('hotel_second_room_data_input_div').style.display !== "none" ? `<p style="width: 100%; background: rgb(5, 17, 21); color: white">+ </p><p id="hotel_total_unit_2_${insertedHotelDataDivUniqueId}" style="width: 100%; background: rgb(5, 17, 21); color: white">${storeHotelTotalUnitNumber_2}</p>` : ''}
                </div>
                <div>
                    <h5 id='hotel_location_${insertedHotelDataDivUniqueId}'>${hotelLocationInput}</h5>
                    ${hotelBaliAreaInput ? `<br><h6 id='hotel_area_${insertedHotelDataDivUniqueId}'>${hotelBaliAreaInput}</h6>` : ''}
                    <img src="../صور-الفنادق/${starsAmount}-stars-hotel-image.jpg" id='hotel_image_${insertedHotelDataDivUniqueId}' class="hotel_row_image_controller inserted_hotel_data_row" style="cursor: pointer">
                </div>
            `;




            // Insert the new HTML content into the clicked hotel data div
            clickedHotelDataDiv.innerHTML = hotelRowTableDivContent;


            // Append <span> elements for each input with text
            if (hotelRoomContainPoolInput !== '') {
                let poolSpan = document.createElement('span');
                poolSpan.id = `hotel_pool_span_id_${insertedHotelDataDivUniqueId}`;
                poolSpan.innerText = hotelRoomContainPoolInput;
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(poolSpan);
            }
            if (hotelRoomViewInput !== '') {
                let viewSpan = document.createElement('span');
                viewSpan.id = `hotel_view_span_id_${insertedHotelDataDivUniqueId}`;
                viewSpan.innerText = hotelRoomViewInput;
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(viewSpan);
            }
            if (hotelBreakfastPeopleAmountInput !== '') {
                let breakfastSpan = document.createElement('span');
                breakfastSpan.id = `hotel_breakfast_span_id_${insertedHotelDataDivUniqueId}`;
                breakfastSpan.innerText = hotelBreakfastPeopleAmountInput;
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(breakfastSpan);
            }
            if (hotelExtraBedInput !== '') {
                let extraBedSpan = document.createElement('span');
                extraBedSpan.id = `hotel_extra_bed_span_id_${insertedHotelDataDivUniqueId}`;
                extraBedSpan.className = 'hotel_special_request_span_class';
                extraBedSpan.innerText = hotelExtraBedInput;
                extraBedSpan.style.width = '100%';
                extraBedSpan.style.background = 'rgb(85, 127, 137)';
                extraBedSpan.style.color = 'white';
                extraBedSpan.style.padding = '0 5px';
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraBedSpan);
            }
            if (hotelSpecialRoomRequestInput !== '') {
                let specialRequestSpan = document.createElement('span');
                specialRequestSpan.id = `hotel_special_request_span_id_${insertedHotelDataDivUniqueId}`;
                specialRequestSpan.className = 'hotel_special_request_span_class';
                specialRequestSpan.innerText = hotelSpecialRoomRequestInput;
                specialRequestSpan.style.background = 'rgb(85, 127, 137)';
                specialRequestSpan.style.color = 'white';
                specialRequestSpan.style.padding = '0 5px';
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(specialRequestSpan);
            }
            if (hotelRoomExtraInfoReadyText !== '') {
                // Remove duplicated + signs and any + signs at the beginning
                let cleanedExtraInfoText = hotelRoomExtraInfoReadyText
                    .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

                let extraInfoSpan = document.createElement('span');
                extraInfoSpan.id = `hotel_extra_info_span_id_${insertedHotelDataDivUniqueId}`;
                extraInfoSpan.innerText = `+ ${cleanedExtraInfoText}`;
                extraInfoSpan.style.width = '100%';
                extraInfoSpan.style.background = 'rgb(85, 127, 137)';
                extraInfoSpan.style.color = 'white';
                extraInfoSpan.style.padding = '0 5px';
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraInfoSpan);
            }




            // Handle the second room data if the second room div is visible
            if (document.getElementById('hotel_second_room_data_input_div').style.display !== "none") {
                if (hotelRoomTypeDescriptionInput_2 !== '') {
                    let roomTypeDescriptionSpan_2 = document.createElement('span');
                    roomTypeDescriptionSpan_2.id = `hotel_room_type_description_2_${insertedHotelDataDivUniqueId}`;
                    roomTypeDescriptionSpan_2.innerText = hotelRoomTypeDescriptionInput_2;
                    roomTypeDescriptionSpan_2.style.width = '100%';
                    roomTypeDescriptionSpan_2.style.background = 'rgb(5, 17, 21)';
                    roomTypeDescriptionSpan_2.style.color = 'white';


                    let plusSign = document.createElement('span');
                    plusSign.innerText = '+ ';
                    plusSign.style.width = '100%';
                    plusSign.style.background = 'rgb(5, 17, 21)';
                    plusSign.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(plusSign);
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(roomTypeDescriptionSpan_2);
                }
                if (hotelRoomContainPoolInput_2 !== '') {
                    let poolSpan_2 = document.createElement('span');
                    poolSpan_2.id = `hotel_pool_span_id_2_${insertedHotelDataDivUniqueId}`;
                    poolSpan_2.innerText = hotelRoomContainPoolInput_2;
                    poolSpan_2.style.width = '100%';
                    poolSpan_2.style.background = 'rgb(5, 17, 21)';
                    poolSpan_2.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(poolSpan_2);
                }
                if (hotelRoomViewInput_2 !== '') {
                    let viewSpan_2 = document.createElement('span');
                    viewSpan_2.id = `hotel_view_span_id_2_${insertedHotelDataDivUniqueId}`;
                    viewSpan_2.style.width = '100%';
                    viewSpan_2.innerText = hotelRoomViewInput_2;
                    viewSpan_2.style.background = 'rgb(5, 17, 21)';
                    viewSpan_2.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(viewSpan_2);
                }
                if (hotelBreakfastPeopleAmountInput_2 !== '') {
                    let breakfastSpan_2 = document.createElement('span');
                    breakfastSpan_2.id = `hotel_breakfast_span_id_2_${insertedHotelDataDivUniqueId}`;
                    breakfastSpan_2.innerText = hotelBreakfastPeopleAmountInput_2;
                    breakfastSpan_2.style.width = '100%';
                    breakfastSpan_2.style.background = 'rgb(5, 17, 21)';
                    breakfastSpan_2.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(breakfastSpan_2);
                }
                if (hotelExtraBedInput_2 !== '') {
                    let extraBedSpan_2 = document.createElement('span');
                    extraBedSpan_2.id = `hotel_extra_bed_span_id_2_${insertedHotelDataDivUniqueId}`;
                    extraBedSpan_2.className = 'hotel_special_request_span_class';
                    extraBedSpan_2.innerText = hotelExtraBedInput_2;
                    extraBedSpan_2.style.width = '100%';
                    extraBedSpan_2.style.background = 'rgb(5, 17, 21)';
                    extraBedSpan_2.style.color = 'white';
                    extraBedSpan_2.style.padding = '0 5px';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraBedSpan_2);
                }
                if (hotelSpecialRoomRequestInput_2 !== '') {
                    let specialRequestSpan_2 = document.createElement('span');
                    specialRequestSpan_2.id = `hotel_special_request_span_id_2_${insertedHotelDataDivUniqueId}`;
                    specialRequestSpan_2.className = 'hotel_special_request_span_class';
                    specialRequestSpan_2.innerText = hotelSpecialRoomRequestInput_2;
                    specialRequestSpan_2.style.width = '100%';
                    specialRequestSpan_2.style.background = 'rgb(5, 17, 21)';
                    specialRequestSpan_2.style.color = 'white';
                    specialRequestSpan_2.style.padding = '0 5px';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(specialRequestSpan_2);
                }
                if (hotelRoomExtraInfoReadyText_2 !== '') {
                    // Remove duplicated + signs and any + signs at the beginning
                    let cleanedExtraInfoText = hotelRoomExtraInfoReadyText_2
                        .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

                    let extraInfoSpan_2 = document.createElement('span');
                    extraInfoSpan_2.id = `hotel_extra_info_span_id_2_${insertedHotelDataDivUniqueId}`;
                    extraInfoSpan_2.innerText = `+ ${cleanedExtraInfoText}`;
                    extraInfoSpan_2.style.width = '100%';
                    extraInfoSpan_2.style.background = 'rgb(5, 17, 21)';
                    extraInfoSpan_2.style.color = 'white';
                    extraInfoSpan_2.style.padding = '0 5px';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraInfoSpan_2);
                }
            }


            // Get the 'hotel_row_image_controller' elements inside each 'hotel_row_class' element
            let hotelRowImageControllers = document.querySelectorAll('.hotel_row_image_controller');


            // Attach click and touch event listeners to each element
            hotelRowImageControllers.forEach(element => {
                handleClickEvent(element);
            });







            /* But in case the 'hotel_location_input_id' input is hidden then do the following code */
        } else {


            // Check if the element has the class 'new_hotel_data_by_user_writing_class'
            if (clickedHotelDataDiv.classList.contains('new_hotel_data_by_user_writing_class')) {
                // Remove the class
                clickedHotelDataDiv.classList.remove('new_hotel_data_by_user_writing_class');
            }


            // Convert the hotel name to lowercase and replace spaces with hyphens to create a suitable image filename
            let hotelImgSrcReadyText = hotelNameReadyText.toLowerCase().replace(/\s+/g, '-');

            let hotelLocationReadyText = '';
            let hotelAreaReadyText = '';

            for (let hotelData of allHotelDataArray) {
                if (hotelData.hotelName === hotelNameReadyText) {
                    hotelLocationReadyText = hotelData.hotelLocation;
                    if (hotelData.hasOwnProperty('hotelArea')) {
                        hotelAreaReadyText = hotelData.hotelArea;
                    }
                    break;
                }
            }

            // Create the HTML content for a new hotel row
            let hotelRowTableDivContent = `
                <div><h1 id='hotel_name_${insertedHotelDataDivUniqueId}'>${hotelNameReadyText}</h1></div>
                <div><h2 id='hotel_check_in_${insertedHotelDataDivUniqueId}' class="hotel_check_in_date_for_matching_whole_package_date">${hotelCheckInReadyText}</h2></div>
                <div><h3 style="color: red" id='hotel_check_out_${insertedHotelDataDivUniqueId}' class="hotel_check_out_date_for_matching_whole_package_date">${hotelCheckOutReadyText}</h3></div>
                <div><h4 id='hotel_total_nights_${insertedHotelDataDivUniqueId}'>${storeHotelTotalNights}</h4></div>
                <div class="description_cell">
                    <span id='hotel_room_type_description_${insertedHotelDataDivUniqueId}'>${hotelRoomTypeDescriptionInput}</span></div>
                <div>
                    <p id='hotel_total_unit_${insertedHotelDataDivUniqueId}'>${storeHotelTotalUnitNumber}</p>
                    ${hotelUnitAmountInput_2 && document.getElementById('hotel_second_room_data_input_div').style.display !== "none" ? `<p style="width: 100%; background: rgb(5, 17, 21); color: white">+ </p><p id="hotel_total_unit_2_${insertedHotelDataDivUniqueId}" style="width: 100%; background: rgb(5, 17, 21); color: white">${storeHotelTotalUnitNumber_2}</p>` : ''}
                </div>
                <div>
                    <h5 id='hotel_location_${insertedHotelDataDivUniqueId}'>${hotelLocationReadyText}</h5>
                    ${hotelAreaReadyText ? `<br><h6 id='hotel_area_${insertedHotelDataDivUniqueId}'>${hotelAreaReadyText}</h6>` : ''}
                    <img src="../صور-الفنادق/${hotelImgSrcReadyText}.jpg" class="hotel_row_image_controller inserted_hotel_data_row" style="cursor: pointer">
                </div>
            `;


            // Insert the new HTML content into the clicked hotel data div
            clickedHotelDataDiv.innerHTML = hotelRowTableDivContent;


            // Append <span> elements for each input with text
            if (hotelRoomContainPoolInput !== '') {
                let poolSpan = document.createElement('span');
                poolSpan.id = `hotel_pool_span_id_${insertedHotelDataDivUniqueId}`;
                poolSpan.innerText = hotelRoomContainPoolInput;
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(poolSpan);
            }
            if (hotelRoomViewInput !== '') {
                let viewSpan = document.createElement('span');
                viewSpan.id = `hotel_view_span_id_${insertedHotelDataDivUniqueId}`;
                viewSpan.innerText = hotelRoomViewInput;
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(viewSpan);
            }
            if (hotelBreakfastPeopleAmountInput !== '') {
                let breakfastSpan = document.createElement('span');
                breakfastSpan.id = `hotel_breakfast_span_id_${insertedHotelDataDivUniqueId}`;
                breakfastSpan.innerText = hotelBreakfastPeopleAmountInput;
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(breakfastSpan);
            }
            if (hotelExtraBedInput !== '') {
                let extraBedSpan = document.createElement('span');
                extraBedSpan.id = `hotel_extra_bed_span_id_${insertedHotelDataDivUniqueId}`;
                extraBedSpan.className = 'hotel_special_request_span_class';
                extraBedSpan.innerText = hotelExtraBedInput;
                extraBedSpan.style.width = '100%';
                extraBedSpan.style.background = 'rgb(85, 127, 137)';
                extraBedSpan.style.color = 'white';
                extraBedSpan.style.padding = '0 5px';
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraBedSpan);
            }
            if (hotelSpecialRoomRequestInput !== '') {
                let specialRequestSpan = document.createElement('span');
                specialRequestSpan.id = `hotel_special_request_span_id_${insertedHotelDataDivUniqueId}`;
                specialRequestSpan.className = 'hotel_special_request_span_class';
                specialRequestSpan.innerText = hotelSpecialRoomRequestInput;
                specialRequestSpan.style.background = 'rgb(85, 127, 137)';
                specialRequestSpan.style.color = 'white';
                specialRequestSpan.style.padding = '0 5px';
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(specialRequestSpan);
            }
            if (hotelRoomExtraInfoReadyText !== '') {
                // Remove duplicated + signs and any + signs at the beginning
                let cleanedExtraInfoText = hotelRoomExtraInfoReadyText
                    .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

                let extraInfoSpan = document.createElement('span');
                extraInfoSpan.id = `hotel_extra_info_span_id_${insertedHotelDataDivUniqueId}`;
                extraInfoSpan.innerText = `+ ${cleanedExtraInfoText}`;
                extraInfoSpan.style.width = '100%';
                extraInfoSpan.style.background = 'rgb(85, 127, 137)';
                extraInfoSpan.style.color = 'white';
                extraInfoSpan.style.padding = '0 5px';
                clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraInfoSpan);
            }




            // Handle the second room data if the second room div is visible
            if (document.getElementById('hotel_second_room_data_input_div').style.display !== "none") {
                if (hotelRoomTypeDescriptionInput_2 !== '') {
                    let roomTypeDescriptionSpan_2 = document.createElement('span');
                    roomTypeDescriptionSpan_2.id = `hotel_room_type_description_2_${insertedHotelDataDivUniqueId}`;
                    roomTypeDescriptionSpan_2.innerText = hotelRoomTypeDescriptionInput_2;
                    roomTypeDescriptionSpan_2.style.width = '100%';
                    roomTypeDescriptionSpan_2.style.background = 'rgb(5, 17, 21)';
                    roomTypeDescriptionSpan_2.style.color = 'white';


                    let plusSign = document.createElement('span');
                    plusSign.innerText = '+ ';
                    plusSign.style.width = '100%';
                    plusSign.style.background = 'rgb(5, 17, 21)';
                    plusSign.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(plusSign);
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(roomTypeDescriptionSpan_2);
                }
                if (hotelRoomContainPoolInput_2 !== '') {
                    let poolSpan_2 = document.createElement('span');
                    poolSpan_2.id = `hotel_pool_span_id_2_${insertedHotelDataDivUniqueId}`;
                    poolSpan_2.innerText = hotelRoomContainPoolInput_2;
                    poolSpan_2.style.width = '100%';
                    poolSpan_2.style.background = 'rgb(5, 17, 21)';
                    poolSpan_2.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(poolSpan_2);
                }
                if (hotelRoomViewInput_2 !== '') {
                    let viewSpan_2 = document.createElement('span');
                    viewSpan_2.id = `hotel_view_span_id_2_${insertedHotelDataDivUniqueId}`;
                    viewSpan_2.style.width = '100%';
                    viewSpan_2.innerText = hotelRoomViewInput_2;
                    viewSpan_2.style.background = 'rgb(5, 17, 21)';
                    viewSpan_2.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(viewSpan_2);
                }
                if (hotelBreakfastPeopleAmountInput_2 !== '') {
                    let breakfastSpan_2 = document.createElement('span');
                    breakfastSpan_2.id = `hotel_breakfast_span_id_2_${insertedHotelDataDivUniqueId}`;
                    breakfastSpan_2.innerText = hotelBreakfastPeopleAmountInput_2;
                    breakfastSpan_2.style.width = '100%';
                    breakfastSpan_2.style.background = 'rgb(5, 17, 21)';
                    breakfastSpan_2.style.color = 'white';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(breakfastSpan_2);
                }
                if (hotelExtraBedInput_2 !== '') {
                    let extraBedSpan_2 = document.createElement('span');
                    extraBedSpan_2.id = `hotel_extra_bed_span_id_2_${insertedHotelDataDivUniqueId}`;
                    extraBedSpan_2.className = 'hotel_special_request_span_class';
                    extraBedSpan_2.innerText = hotelExtraBedInput_2;
                    extraBedSpan_2.style.width = '100%';
                    extraBedSpan_2.style.background = 'rgb(5, 17, 21)';
                    extraBedSpan_2.style.color = 'white';
                    extraBedSpan_2.style.padding = '0 5px';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraBedSpan_2);
                }
                if (hotelSpecialRoomRequestInput_2 !== '') {
                    let specialRequestSpan_2 = document.createElement('span');
                    specialRequestSpan_2.id = `hotel_special_request_span_id_2_${insertedHotelDataDivUniqueId}`;
                    specialRequestSpan_2.className = 'hotel_special_request_span_class';
                    specialRequestSpan_2.innerText = hotelSpecialRoomRequestInput_2;
                    specialRequestSpan_2.style.width = '100%';
                    specialRequestSpan_2.style.background = 'rgb(5, 17, 21)';
                    specialRequestSpan_2.style.color = 'white';
                    specialRequestSpan_2.style.padding = '0 5px';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(specialRequestSpan_2);
                }
                if (hotelRoomExtraInfoReadyText_2 !== '') {
                    // Remove duplicated + signs and any + signs at the beginning
                    let cleanedExtraInfoText = hotelRoomExtraInfoReadyText_2
                        .replace(/^\s*\++\s*/, '')  // Remove leading + signs with optional spaces

                    let extraInfoSpan_2 = document.createElement('span');
                    extraInfoSpan_2.id = `hotel_extra_info_span_id_2_${insertedHotelDataDivUniqueId}`;
                    extraInfoSpan_2.innerText = `+ ${cleanedExtraInfoText}`;
                    extraInfoSpan_2.style.width = '100%';
                    extraInfoSpan_2.style.background = 'rgb(5, 17, 21)';
                    extraInfoSpan_2.style.color = 'white';
                    extraInfoSpan_2.style.padding = '0 5px';
                    clickedHotelDataDiv.querySelector('.description_cell').appendChild(extraInfoSpan_2);
                }
            }


            // Get the 'hotel_row_image_controller' elements inside each 'hotel_row_class' element
            let hotelRowImageControllers = document.querySelectorAll('.hotel_row_image_controller');


            // Attach click and touch event listeners to each element
            hotelRowImageControllers.forEach(element => {
                handleClickEvent(element);
            });

        }







        /* Re-Create the data of the flights details when submit new changes in the hotels data */
        if (document.getElementById('downloaded_pdf_flight_data_page').style.display !== 'none') {
            // First delete all old flights row data'
            document.getElementById('inserted_flight_data_position_div').innerHTML = '';





            /* Set the 'insertedHotelDataDivUniqueId' value based on the following condition */
            if (document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText !== '') {
                insertedFlightDataDivUniqueId = document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText;
            } else {
                insertedFlightDataDivUniqueId = 1;
            }



            // Get all divs with the class name 'hotel_row_class_for_editing'
            let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

            let lastCity = null;  // Variable to store the last valid city encountered
            let lastDate = null;  // Variable to store the date associated with the last valid city
            let validCities = ["Bali", "Jakarta", "Bandung", "Puncak", "Lombok"];  // Array of valid cities to check against



            // Get the values of the adult and kids inputs
            let adultAmount = document.getElementById('adult_package_person_amount_input_id').value;
            let kidsAmount = document.getElementById('kids_package_person_amount_input_id').value;
            let infantAmount = document.getElementById('infant_package_person_amount_input_id').value;

            // Function to extract numbers from the string
            function extractNumberFromString(str) {
                let match = str.match(/\d+/);  // Use regex to find the number
                return match ? parseInt(match[0]) : 0;  // Return the number or 0 if no number found
            }

            // Extract numbers from adult and kids input values
            let adultNumber = extractNumberFromString(adultAmount);
            let kidsNumber = extractNumberFromString(kidsAmount);

            // Calculate total people (adults + kids)
            let totalPeople = adultNumber + kidsNumber;




            // Iterate through all found hotel rows
            allHotelRows.forEach((hotelRow, index) => {
                let currentCity = hotelRow.querySelector('h5').innerText;  // Get the city name from the current hotel row's h5 element
                let currentDate = hotelRow.querySelector('h2').innerText;  // Get the date from the current hotel row's h2 element

                // Check if transition between Jakarta and Bandung (in either order) and skip
                if ((lastCity === "Jakarta" && currentCity === "Bandung") || (lastCity === "Bandung" && currentCity === "Jakarta")) {
                    lastCity = currentCity;
                    lastDate = currentDate;
                    return; // Skip this iteration without creating a flightRowTableDiv
                }

                // Check if transition between Jakarta and Puncak and skip
                if (lastCity === "Jakarta" && currentCity === "Puncak") {
                    lastCity = currentCity;
                    lastDate = currentDate;
                    return; // Skip this iteration without creating a flightRowTableDiv
                }

                // Check if transition between Puncak and Jakarta and skip
                if (lastCity === "Puncak" && currentCity === "Jakarta") {
                    lastCity = currentCity;
                    lastDate = currentDate;
                    return; // Skip this iteration without creating a flightRowTableDiv
                }

                // Check if the current and last city are valid and different
                if ((validCities.includes(currentCity) && lastCity && lastCity !== currentCity && validCities.includes(lastCity)) ||
                    (lastCity === "Puncak" && currentCity === "Bali") || (lastCity === "Bali" && currentCity === "Puncak")) {

                    let fromCity = lastCity;
                    let toCity = currentCity;


                    /* check the 'lastCity' and the 'currentCity' value and based on the below conditions set the value of the 'fromCity' and the 'toCity' */
                    if ((lastCity === "Puncak" && currentCity === "Bali") || (lastCity === "Bandung" && currentCity === "Bali")) {
                        fromCity = "Jakarta";
                        toCity = "Bali";
                    } else if ((lastCity === "Bali" && currentCity === "Puncak") || (lastCity === "Bali" && currentCity === "Bandung")) {
                        fromCity = "Bali";
                        toCity = "Jakarta";
                    }



                    // Check if transition between Bandung and Puncak (in either order) and skip
                    if ((lastCity === "Bandung" && currentCity === "Puncak") || (lastCity === "Puncak" && currentCity === "Bandung")) {
                        lastCity = currentCity;
                        lastDate = currentDate;
                        return; // Skip this iteration without creating a flightRowTableDiv
                    }


                    // Create a new div with flight details
                    let flightRowTableDiv = document.createElement('div');
                    flightRowTableDiv.id = `flight_row_id_${insertedFlightDataDivUniqueId}`;  // Set a unique ID for the new div
                    flightRowTableDiv.className = 'flight_row_class flight_row_class_for_editing';  // Assign class names to the new div

                    // Create the HTML content for the new flight row div
                    let flightRowTableDivContent = `
                    <div class="flight_row_flight_arrival_time_controller inserted_flight_data_row" style="cursor: pointer;"><p id='flight_air_line_${insertedFlightDataDivUniqueId}'></p></div>
                    <div>
                        <p id="flight_adult_person_amount_${insertedFlightDataDivUniqueId}">
                            ${totalPeople === 1
                            ? `${totalPeople} Adult`
                            : totalPeople > 10
                                ? `${totalPeople} Adult`
                                : totalPeople !== 0
                                    ? `${totalPeople} Adults`
                                    : ''
                        }
                        </p>
                        ${infantAmount ? `<p id="flight_infant_person_amount_${insertedFlightDataDivUniqueId}">${infantAmount}</p>` : ''}
                    </div>
                    <div><p>20Kg Per Pax</p></div>
                    <div><h2 id='flight_from_city_${insertedFlightDataDivUniqueId}'>${fromCity}</h2></div>
                    <div><h3 id='flight_to_city_${insertedFlightDataDivUniqueId}'>${toCity}</h3></div>
                    <div><h1 id='flight_date_${insertedFlightDataDivUniqueId}' class="flight_date_for_matching_whole_package_date">${currentDate}</h1></div>
                    <div><p id='flight_fly_away_time_${insertedFlightDataDivUniqueId}'></p></div>
                    <div><p id='flight_arrival_time_${insertedFlightDataDivUniqueId}'></p></div>
                `;


                    flightRowTableDiv.innerHTML = flightRowTableDivContent;  // Insert the generated HTML content into the new div

                    // Append the new div to the container with id 'inserted_flight_data_position_div'
                    document.getElementById('inserted_flight_data_position_div').appendChild(flightRowTableDiv);

                    // Increment the unique ID for the next div
                    insertedFlightDataDivUniqueId++;
                }

                // Update the lastCity and lastDate for the next iteration
                lastCity = currentCity;
                lastDate = currentDate;
            });










            // Check if there is any element with the class 'flight_row_class_for_editing'
            let allFlightRowdivs = document.getElementsByClassName('flight_row_class_for_editing');

            /* if there is found created flights row data */
            if (allFlightRowdivs.length > 0) {

                // Play a sound effect
                playSoundEffect('success');

                /* Change the 'تم' button color */
                clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 255, 0)';
                // Set the background color of the submit icon back to default color
                setTimeout(() => {
                    clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
                }, 500);


                // If any element is found, set the display style of the 'downloaded_pdf_flight_data_page' to 'block'
                document.getElementById('downloaded_pdf_flight_data_page').style.display = 'block';



                /* Hide the icon button after creating a flight row */
                document.getElementById('manually_add_flight_row_icon').style.display = 'none';



                /* Call a function to make sure if all package dates should be hidden or no */
                ensureAllPackageDatesHiddenOrNo();



                /* if there is no any found created flights row data */
            } else {

                // Play a sound effect
                playSoundEffect('error');


                /* Change the 'تم' button color */
                clint_flight_inputs_submit_icon.style.backgroundColor = 'red';
                // Set the background color of the submit icon back to default color
                setTimeout(() => {
                    clint_flight_inputs_submit_icon.style.backgroundColor = 'rgb(0, 87, 116)';
                }, 500);


                // If there is no found element, set the display style of the 'downloaded_pdf_flight_data_page' to 'none'
                document.getElementById('downloaded_pdf_flight_data_page').style.display = 'none';
            }



            // Get references to all input elements and reset their values thier
            document.getElementById('flight_from_city_input_id').value = document.getElementById('flight_to_city_input_id').value;
            document.getElementById('flight_to_city_input_id').value = '';
            document.getElementById('flight_date_input_id').value = '';
            document.getElementById('flight_fly_away_time_input_id').value = '';
            document.getElementById('flight_arrival_time_input_id').value = '';




            // Get all dynamically created elements with the class 'flight_row_flight_arrival_time_controller'
            document.querySelectorAll('.flight_row_flight_arrival_time_controller').forEach(function (element) {
                element.onclick = function (event) {
                    flightRowAirLineControllerFunction(event, element);
                };
            });


            /* Store the last saved flight unique id name */
            document.getElementById('store_google_sheet_flight_uniuqe_id_name_value').innerText = insertedFlightDataDivUniqueId;
        }
        /* Re-Create the data of the clint movements details when submit new changes in the hotels data */
        if (document.getElementById('downloaded_pdf_clint_movements_data_page').style.display !== 'none') {

            /* Delete all data inside the 'inserted_clint_movements_data_position_div' in every time the 'clint_movements_auto_create_icon' is clicked */
            document.getElementById('inserted_clint_movements_data_position_div').innerHTML = '';


            // Function to increment a date by a specified number of days
            function incrementDate(dateString, days) {
                let [day, month] = dateString.split(' '); // Split the date string into day and month
                let monthsMap = {
                    "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
                    "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
                };
                let monthNames = Object.keys(monthsMap); // Array of month names in English

                let date = new Date(); // Create a new date object
                date.setDate(parseInt(day)); // Set the day of the date object
                date.setMonth(monthsMap[month]); // Set the month of the date object
                date.setDate(date.getDate() + days); // Increment the date by the specified number of days

                let newDay = date.getDate(); // Get the new day after incrementing
                let newMonth = monthNames[date.getMonth()]; // Get the new month name in English

                return `${newDay} ${newMonth}`; // Return the new date in the same format (day month)
            }





            // Function to clean up text and ensure no duplicated '+'
            function cleanUpText(text) {
                return text.replace(/\+\s*\+/g, ' + ').trim();
            }

            // Get the state of the airport welcome checkbox
            let isAirportWelcomeIncluded = document.getElementById('include_airport_welcome__checkbox').checked;
            let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');
            let totalHotels = allHotelRows.length;
            let usedVisitingPlaces = {
                baliUbudKeramas: {},
                baliOthers: {},
                jakarta: {},
                puncak: {},
                bandung: {},
                lombok: {},
            };

            let previousCityName = '';
            let previousHotelName = '';
            let isFirstHotelRowCreated = false; // Flag to check the first created row
            let hasCenterTourTextBeenAdded = false; // Flag to track if "التجول في السنتر" text has been added

            let isFirstJakartaHotelFound = false; // Flag to track the first Jakarta hotel found

            let firstCreatedClintMovementsRowDivForLastHotel = null; // Variable to store the first created div for the last hotel


            let isFirstClintMovementsRowCreated = false; // Flag to track the first created clintMovementsRowTableDiv


            /* Variable to store if the h5 inside the first found 'hotel_row_class_for_editing' is "Puncak" or "Bandung" */
            let firstHotelCityName = allHotelRows[0].querySelector('h5').innerText;


            // Store the innerText of the h5 inside the last found hotel_row_class_for_editing
            let lastHotelCityName = allHotelRows[totalHotels - 1].querySelector('h5').innerText;


            // Variable to store the combined city names for the last found hotel row
            let lastHotelRowCombinedCityName = '';

            allHotelRows.forEach((hotelRow, index) => {
                let hotelName = hotelRow.querySelector('h1').innerText;
                let checkInDate = hotelRow.querySelector('h2').innerText;
                let nights = parseInt(hotelRow.querySelector('h4').innerText, 10);
                let cityName = hotelRow.querySelector('h5').innerText;
                let areaName = cityName === "Bali" ? hotelRow.querySelector('h6').innerText : null;
                let packageType = document.getElementById('clint_package_type_h6').innerText.trim();

                let packageMapping = {
                    "Honeymooners Package": "honeymoon",
                    "Guys Package": "guys",
                    "Family Package": "family",
                    "Two People Package": "twopeople",
                    "Group Package": "family",
                    "New Package": "family"
                };
                let packageKey = packageMapping[packageType] || "family";

                let targetObject;
                let usedDays; // Declare usedDays to be assigned later

                if (cityName === "Bali" && areaName) {
                    if (areaName === "Ubud" || areaName === "Keramas") {
                        targetObject = allClintVisitingPlacesArray[1][packageKey];
                        usedDays = usedVisitingPlaces.baliUbudKeramas;
                    } else if (["Kuta", "Nusa Dua", "Seminyak", "Jimbaran", "Uluwatu", "Legian", "Sanur", "Payangan", "Canggu", "Tampaksiring"].includes(areaName)) {
                        targetObject = allClintVisitingPlacesArray[0][packageKey];
                        usedDays = usedVisitingPlaces.baliOthers;
                    }
                } else if (cityName === 'Jakarta') {
                    targetObject = allClintVisitingPlacesArray[2][packageKey];
                    usedDays = usedVisitingPlaces.jakarta;
                } else if (cityName === 'Puncak') {
                    targetObject = allClintVisitingPlacesArray[3][packageKey];
                    usedDays = usedVisitingPlaces.puncak;
                } else if (cityName === 'Bandung') {
                    targetObject = allClintVisitingPlacesArray[4][packageKey];
                    usedDays = usedVisitingPlaces.bandung;
                } else if (cityName === 'Lombok') {
                    targetObject = allClintVisitingPlacesArray[5][packageKey];
                    usedDays = usedVisitingPlaces.lombok;
                }

                if (!usedVisitingPlaces[cityName]) {
                    usedVisitingPlaces[cityName] = {};
                }

                let isCheckOutTextAdded = false; // Flag to track if check-out text has been added for this hotel
                let dayIndex = 0; // Initialize dayIndex separately for each hotel

                for (let i = 0; i < nights; i++) {
                    let clintMovementsRowTableDiv = document.createElement('div');
                    clintMovementsRowTableDiv.className = 'clint_movements_row_class clint_movements_row_class_for_editing';

                    let newDate = incrementDate(checkInDate, i);

                    let visitingPlacesText = "";

                    // Skip appending text for the first created div
                    if (targetObject) {
                        while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                            dayIndex++;
                        }
                        if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                            let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                            usedDays[dayIndex] = true;
                            if (textArray && textArray.length > 0) {
                                visitingPlacesText = `${textArray.join(' + ')} `;
                            }
                            dayIndex++; // Increment dayIndex after appending text
                        }
                    }

                    let checkInOutText = i === 0 ? `${hotelName} Check-in` : '';
                    let combinedCityName = cityName;

                    // Logic for check-in/out text and combined city name based on previous city/hotel
                    if (i === 0 && index > 0) {
                        previousCityName = allHotelRows[index - 1].querySelector('h5').innerText;
                        previousHotelName = allHotelRows[index - 1].querySelector('h1').innerText;

                        if (cityName !== previousCityName) {
                            combinedCityName = `${previousCityName}-${cityName}`;
                            lastHotelRowCombinedCityName = combinedCityName; // Update combined city name
                        }

                        let additionalText = "";
                        if (isAirportWelcomeIncluded && (cityName === "Bali" || cityName === "Jakarta") && cityName !== previousCityName) {
                            if (!(previousCityName === "Puncak" && cityName === "Jakarta") && !(previousCityName === "Bandung" && cityName === "Jakarta")) {
                                additionalText = `Welcoming in ${cityName} Airport + `;
                            }
                        }


                        if (!isCheckOutTextAdded) {
                            checkInOutText = `${previousHotelName} Check-out `;

                            if (previousCityName !== cityName) {
                                checkInOutText += `+ Going To ${cityName} `;
                            }

                            checkInOutText += `+ ${additionalText}${visitingPlacesText} + ${hotelName} Check-in`;
                            isCheckOutTextAdded = true;
                        }
                    }

                    if ((cityName === "Bali" || cityName === "Jakarta") && !hasCenterTourTextBeenAdded) {
                        checkInOutText = checkInOutText.replace(`${hotelName} Check-in`, `${hotelName} Check-in + Going around the center`);
                        hasCenterTourTextBeenAdded = true;
                    }

                    if (!isFirstHotelRowCreated && (cityName === "Bali" || cityName === "Jakarta") && isAirportWelcomeIncluded) {
                        checkInOutText = `Welcoming in ${cityName} Airport + ${checkInOutText}`;
                        isFirstHotelRowCreated = true;
                    }

                    // Additional condition for the first hotel row
                    if (!isFirstHotelRowCreated && index === 0 && isAirportWelcomeIncluded && (firstHotelCityName === "Puncak" || firstHotelCityName === "Bandung")) {
                        checkInOutText = `Welcoming in Jakarta Airport + Going to ${cityName} + ${hotelName} Check-in`;
                        isFirstHotelRowCreated = true; // Set the flag to avoid reapplying this condition
                    }

                    // Clean up text to ensure no duplicated '+'
                    checkInOutText = cleanUpText(checkInOutText);

                    clintMovementsRowTableDiv.innerHTML = `
                        <div><h1>${newDate}</h1></div>
                        <div><h2>${checkInOutText}</h2></div>
                        <div class="clint_movements_row_controller" style="cursor: pointer;"><h3>${i === 0 ? combinedCityName : cityName}</h3></div>
                    `;

                    // Apply the new condition to append text if needed, but skip the first hotel row
                    if (!isFirstJakartaHotelFound && cityName === "Jakarta" && i === 0 && index !== 0) {
                        let currentH2 = clintMovementsRowTableDiv.querySelector('h2');
                        currentH2.innerText += " + Going To Alsadda restaurant for dinner";
                        currentH2.innerText = cleanUpText(currentH2.innerText); // Clean up text to ensure no duplicated '+'
                        isFirstJakartaHotelFound = true;
                    }

                    if (targetObject && i === 0) {
                        let dayIndex = 1;
                        while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                            dayIndex++;
                        }
                        if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                            let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                            usedDays[dayIndex] = true;
                            if (textArray && textArray.length > 0) {
                                visitingPlacesText = `${textArray.join(' + ')} `;
                            }
                        }
                    }

                    if (targetObject) {
                        let dayIndex = i + 1;
                        while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                            dayIndex++;
                        }
                        if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                            let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                            usedDays[dayIndex] = true;
                            if (textArray && textArray.length > 0) {
                                visitingPlacesText = `${textArray.join(' + ')} `;
                            }
                        }
                    }

                    if (visitingPlacesText) {
                        clintMovementsRowTableDiv.querySelector('h2').innerText += `${visitingPlacesText}`;
                    }

                    document.getElementById('inserted_clint_movements_data_position_div').appendChild(clintMovementsRowTableDiv);

                    if (index === totalHotels - 1 && i === nights - 1) {
                        // Check if this is not the first created clintMovementsRowTableDiv
                        if (isFirstClintMovementsRowCreated) {
                            let lastH3 = clintMovementsRowTableDiv.querySelector('h3');
                            lastH3.innerText = lastHotelCityName;
                        } else {
                            isFirstClintMovementsRowCreated = true; // Set the flag after the first creation
                        }
                    }
                }


                if (index === totalHotels - 1) {
                    let extraDate = incrementDate(checkInDate, nights);
                    let extraClintMovementsRowTableDiv = document.createElement('div');

                    extraClintMovementsRowTableDiv.className = 'clint_movements_row_class clint_movements_row_class_for_editing';

                    extraClintMovementsRowTableDiv.innerHTML = `
                <div><h1>${extraDate}</h1></div>
                <div><h2>${hotelName} Check-out and going to Airport for leaving</h2></div>
                <div class="clint_movements_row_controller" style="cursor: pointer;"><h3>${cityName}-مغادرة</h3></div>
            `;

                    document.getElementById('inserted_clint_movements_data_position_div').appendChild(extraClintMovementsRowTableDiv);
                }
            });


            /* Show up the 'downloaded_pdf_clint_movements_data_page' section */
            document.getElementById('downloaded_pdf_clint_movements_data_page').style.display = 'block';


            /* Update the available clint visiting places based on the current existing visiting places */
            filterUsedClintVisitingPlacesNames();



            // Get all elements with the class name 'flight_row_class'
            let clintMovementsRowTableDiv = document.querySelectorAll('.clint_movements_row_class_for_editing');

            // Loop through each 'flight_row_class' element
            clintMovementsRowTableDiv.forEach(clintMovementsRowTableDiv => {

                // Get all dynamically created elements with the class 'clint_movements_row_controller'
                clintMovementsRowTableDiv.querySelectorAll('.clint_movements_row_controller').forEach(function (element) {
                    element.onclick = function (event) {
                        clintMovementsRowCityNameControllerFunction(event, element);
                    };
                });

            });



            /* Call a function to make sure if all package dates should be hidden or no */
            ensureAllPackageDatesHiddenOrNo();


            /* Call a function to highlight the Saturday and Sanday days */
            highlightWeekendClintMovements();
        }







        // Clear the input after confirm the new hotel data
        cancelNewHotelDataRow();
    };

};






/* Function to split the clicked hotel row div inner info */
duplicateClickedHotelDataFunctio = function () {

    // Get the original div element
    let originalDiv = document.getElementById(currentHotelDataDivId);


    // Clone the original div
    let clonedDiv = originalDiv.cloneNode(true);

    // Generate a unique ID for the new cloned div
    let newDivId = currentHotelDataDivId + "_copy_" + new Date().getTime();
    clonedDiv.id = newDivId;

    // Insert the cloned div right after the original div
    originalDiv.parentNode.insertBefore(clonedDiv, originalDiv.nextSibling);



    // Hide delete button div
    let overlayLayer = document.querySelector('.black_overlay');
    let deleteHotelRowDiv = document.getElementById('ensure_delete_or_edit_hotel_data_div');
    deleteHotelRowDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    overlayLayer.style.opacity = '0';

    // Remove overlay and edit/delete div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS






    /* Reset the value of the saved hotel dates for later Re-arranging */
    saveOriginalHotelDates();


    // Get all dynamically created elements with the class 'hotelRowImageController'
    let hotelRowImageControllers = document.querySelectorAll('.hotel_row_image_controller');

    // Attach click and touch event listeners to each element
    hotelRowImageControllers.forEach(element => {
        handleClickEvent(element);
    });


    /* Call a function to apply drag and drop functionality to all hotels rows */
    createHotelDragAndDropMood();
}






// Function to show delete or edit the inserted hotel data
function hotelRowImageControllerFunction(event) {
    let deleteHotelRowDiv = document.getElementById('ensure_delete_or_edit_hotel_data_div');
    let clickedHotelDataDiv = event.target.closest('.hotel_row_class');

    if (clickedHotelDataDiv) {
        currentHotelDataDivId = clickedHotelDataDiv.id;



        // Check if the overlay already exists
        let overlayLayer = document.querySelector('.black_overlay');
        if (!overlayLayer) {
            overlayLayer = document.createElement('div');
            overlayLayer.classList.add('black_overlay');
            document.body.appendChild(overlayLayer);

            setTimeout(() => {
                overlayLayer.style.opacity = '1';
                deleteHotelRowDiv.style.transform = 'translate(-50%, -50%)';
            }, 50);

            // Handle both click and touch events on overlay for consistency
            let handleOverlayClick = () => {
                deleteHotelRowDiv.style.transform = 'translate(-50%, -130vh)';
                overlayLayer.style.opacity = '0';
                setTimeout(() => {
                    // Only remove the overlay if it is still a child of the body
                    if (document.body.contains(overlayLayer)) {
                        document.body.removeChild(overlayLayer);
                    }
                }, 300);
            };

            overlayLayer.addEventListener('click', handleOverlayClick);

            overlayLayer.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }



        /* Function to run delete clikced hotel row data */
        runDeleteClickedHotelDataFunction = function () {
            deleteClickedHotelData(currentHotelDataDivId);
        }


        /* Function to run edit clikced hotel row data */
        runEditClickedHotelDataFunction = function () {
            editClickedHotelDataFunction(currentHotelDataDivId);

            /* Make sure hotel package type text is colored in rgb(0, 46, 57) */
            document.getElementById('header_navbar_links_clint_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_hotel_a').style.backgroundColor = 'rgb(0, 46, 57)';
            document.getElementById('header_navbar_links_flight_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_package_icluding_and_not_including_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_clint_movements_a').style.backgroundColor = 'rgb(85, 127, 137)';
        }


        /* Function to run duplicate clikced hotel row data */
        runDuplicateClickedHotelDataFunction = function () {
            duplicateClickedHotelDataFunctio(currentHotelDataDivId);
        }
    }
};

// Function to save the current dates of all hotels for later Re-arranging use (when drag and drop)
function saveOriginalHotelDates() {
    originalHotelDates = [];
    let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

    allHotelRows.forEach(row => {
        let h2Date = row.querySelector('h2').innerText;
        let h3Date = row.querySelector('h3').innerText;
        let h4TotalNights = row.querySelector('h4').innerText;
        originalHotelDates.push({ h2Date, h3Date, h4TotalNights, element: row });
    });
}

// Function to update dates inside 'hotel_row_class_for_editing' divs based on their order in the DOM
function updateHotelRowDates() {
    let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');

    allHotelRows.forEach((row, index) => {
        let h2Element = row.querySelector('h2');
        let h3Element = row.querySelector('h3');
        let h4Element = row.querySelector('h4');

        if (h2Element && h3Element && h4Element && originalHotelDates[index]) {
            // Update the dates based on the new order of elements
            h2Element.innerText = originalHotelDates[index].h2Date; // Or any date calculation logic here
            h3Element.innerText = originalHotelDates[index].h3Date; // Or any date calculation logic here
            h4Element.innerText = originalHotelDates[index].h4TotalNights; // Or any date calculation logic here
        }
    });
}

// Function to handle the drop and reapply the dates
function handleDrop() {
    // After dropping, reapply the dates based on the current DOM order
    updateHotelRowDates(); // Call the update function here
}

// Function to prepare drag and drop functionality
function createHotelDragAndDropMood() {
    let dropZone = document.getElementById('inserted_hotel_data_position_div');

    function mouseDown(event) {
        if (event.target.tagName.toLowerCase() === 'img') {
            let draggingElement = event.target.closest('.hotel_row_class');
            draggingElement.classList.add('dragging');
            draggingElement.dataset.startY = event.clientY;
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);

            document.body.style.touchAction = 'none';
            document.body.style.userSelect = 'none';
        }
    }

    function touchStart(event) {
        let touch = event.touches[0];
        if (touch.target.tagName.toLowerCase() === 'img') {
            let draggingElement = touch.target.closest('.hotel_row_class');
            draggingElement.classList.add('dragging');
            draggingElement.dataset.startY = touch.clientY;
            document.addEventListener('touchmove', touchMove, { passive: false });
            document.addEventListener('touchend', touchEnd);

            document.body.style.touchAction = 'none';
            document.body.style.userSelect = 'none';
        }
    }

    function mouseMove(event) {
        let draggingElement = document.querySelector('.dragging');
        let startY = parseInt(draggingElement.dataset.startY || 0);
        let deltaY = event.clientY - startY;
        draggingElement.style.transform = `translateY(${deltaY}px)`;

        let dropElements = Array.from(dropZone.children);
        let currentIndex = dropElements.indexOf(draggingElement);

        let targetIndex = currentIndex;
        for (let i = 0; i < dropElements.length; i++) {
            let element = dropElements[i];
            let rect = element.getBoundingClientRect();
            if (i !== currentIndex && event.clientY > rect.top && event.clientY < rect.bottom) {
                if (deltaY > 0 && event.clientY > rect.bottom - 20) {
                    targetIndex = i + 1;
                } else if (deltaY < 0 && event.clientY < rect.top + 20) {
                    targetIndex = i;
                }
                break;
            }
        }

        if (targetIndex !== currentIndex) {
            dropZone.insertBefore(draggingElement, dropElements[targetIndex]);
        }
    }

    function touchMove(event) {
        event.preventDefault();
        let draggingElement = document.querySelector('.dragging');
        let touch = event.touches[0];
        let startY = parseInt(draggingElement.dataset.startY || 0);
        let deltaY = touch.clientY - startY;
        draggingElement.style.transform = `translateY(${deltaY}px)`;

        let dropElements = Array.from(dropZone.children);
        let currentIndex = dropElements.indexOf(draggingElement);

        let targetIndex = currentIndex;
        for (let i = 0; i < dropElements.length; i++) {
            let element = dropElements[i];
            let rect = element.getBoundingClientRect();
            if (i !== currentIndex && touch.clientY > rect.top && touch.clientY < rect.bottom) {
                if (deltaY > 0 && touch.clientY > rect.bottom - 20) {
                    targetIndex = i + 1;
                } else if (deltaY < 0 && touch.clientY < rect.top + 20) {
                    targetIndex = i;
                }
                break;
            }
        }

        if (targetIndex !== currentIndex) {
            dropZone.insertBefore(draggingElement, dropElements[targetIndex]);
        }
    }

    function mouseUp(event) {
        let draggingElement = document.querySelector('.dragging');

        if (draggingElement) {
            draggingElement.classList.remove('dragging');
            draggingElement.style.transform = '';
            draggingElement.removeAttribute('data-start-y');

            handleDrop();  // Call the function to update dates after drop ends
        }

        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('mouseup', mouseUp);

        document.body.style.touchAction = '';
        document.body.style.userSelect = '';
    }

    function touchEnd(event) {
        let draggingElement = document.querySelector('.dragging');

        if (draggingElement) {
            draggingElement.classList.remove('dragging');
            draggingElement.style.transform = '';
            draggingElement.removeAttribute('data-start-y');

            handleDrop();  // Call the function to update dates after drop ends
        }

        document.removeEventListener('touchmove', touchMove);
        document.removeEventListener('touchend', touchEnd);

        document.body.style.touchAction = '';
        document.body.style.userSelect = '';
    }

    let insertedHotelDataDivs = document.querySelectorAll('.hotel_row_class');
    insertedHotelDataDivs.forEach((div) => {
        div.addEventListener('mousedown', mouseDown);
        div.addEventListener('touchstart', touchStart);
    });
}

/* Up All Functions For Hotels Data Up */


























/* Down All Functions For Clint Movements Data Down */

/* Function to automaticlly create all clint movements data */
autoCreateALlClintMovementsData = function () {
    /* if one of the clint data or hotel data sections is hidden then stop the process */
    if (document.getElementById('downloaded_pdf_clint_data_page').style.display === 'none' || document.getElementById('downloaded_pdf_hotel_data_page').style.display === 'none') {

        // Play a sound effect
        playSoundEffect('error');

        // Change the submit icon background color
        clint_movements_auto_create_icon.style.backgroundColor = 'red';

        // Set the background color of the submit icon back to default color
        setTimeout(() => {
            clint_movements_auto_create_icon.style.backgroundColor = 'rgb(0, 87, 116)';
        }, 500);

    } else {

        // Play a sound effect
        playSoundEffect('success');


        // Change the submit icon background color
        clint_movements_auto_create_icon.style.backgroundColor = 'rgb(0, 255, 0)';

        // Set the background color of the submit icon back to default color
        setTimeout(() => {
            clint_movements_auto_create_icon.style.backgroundColor = 'rgb(0, 87, 116)';
        }, 500);


        /* Delete all data inside the 'inserted_clint_movements_data_position_div' in every time the 'clint_movements_auto_create_icon' is clicked */
        document.getElementById('inserted_clint_movements_data_position_div').innerHTML = '';


        // Function to increment a date by a specified number of days
        function incrementDate(dateString, days) {
            let [day, month] = dateString.split(' '); // Split the date string into day and month
            let monthsMap = {
                "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
                "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
            };
            let monthNames = Object.keys(monthsMap); // Array of month names in English

            let currentYear = new Date().getFullYear(); // Get the current year

            // Set the full date including the correct month and year
            let date = new Date(currentYear, monthsMap[month], parseInt(day));

            date.setDate(date.getDate() + days); // Increment the date by the specified number of days

            let newDay = date.getDate(); // Get the new day after incrementing
            let newMonth = monthNames[date.getMonth()]; // Get the new month name in English

            return `${newDay} ${newMonth}`; // Return the new date in the same format (day month)
        }






        // Function to clean up text and ensure no duplicated '+'
        function cleanUpText(text) {
            return text.replace(/\+\s*\+/g, ' + ').trim();
        }

        // Get the state of the airport welcome checkbox
        let isAirportWelcomeIncluded = document.getElementById('include_airport_welcome__checkbox').checked;
        let allHotelRows = document.querySelectorAll('.hotel_row_class_for_editing');
        let totalHotels = allHotelRows.length;
        let usedVisitingPlaces = {
            baliUbudKeramas: {},
            baliOthers: {},
            jakarta: {},
            puncak: {},
            bandung: {},
            lombok: {},
        };

        let previousCityName = '';
        let previousHotelName = '';
        let isFirstHotelRowCreated = false; // Flag to check the first created row
        let hasCenterTourTextBeenAdded = false; // Flag to track if "التجول في السنتر" text has been added

        let isFirstJakartaHotelFound = false; // Flag to track the first Jakarta hotel found

        let firstCreatedClintMovementsRowDivForLastHotel = null; // Variable to store the first created div for the last hotel


        let isFirstClintMovementsRowCreated = false; // Flag to track the first created clintMovementsRowTableDiv


        /* Variable to store if the h5 inside the first found 'hotel_row_class_for_editing' is "Puncak" or "Bandung" */
        let firstHotelCityName = allHotelRows[0].querySelector('h5').innerText;


        // Store the innerText of the h5 inside the last found hotel_row_class_for_editing
        let lastHotelCityName = allHotelRows[totalHotels - 1].querySelector('h5').innerText;


        // Variable to store the combined city names for the last found hotel row
        let lastHotelRowCombinedCityName = '';

        allHotelRows.forEach((hotelRow, index) => {
            let hotelName = hotelRow.querySelector('h1').innerText;
            let checkInDate = hotelRow.querySelector('h2').innerText;
            let nights = parseInt(hotelRow.querySelector('h4').innerText, 10);
            let cityName = hotelRow.querySelector('h5').innerText;
            let areaName = cityName === "Bali" ? hotelRow.querySelector('h6').innerText : null;
            let packageType = document.getElementById('clint_package_type_h6').innerText.trim();

            let packageMapping = {
                "Honeymooners Package": "honeymoon",
                "Guys Package": "guys",
                "Family Package": "family",
                "Two People Package": "twopeople",
                "Group Package": "family",
                "New Package": "family"
            };

            let packageKey = packageMapping[packageType] || "family";

            let targetObject;
            let usedDays; // Declare usedDays to be assigned later

            if (cityName === "Bali" && areaName) {
                if (areaName === "Ubud" || areaName === "Keramas") {
                    targetObject = allClintVisitingPlacesArray[1][packageKey];
                    usedDays = usedVisitingPlaces.baliUbudKeramas;
                } else if (["Kuta", "Nusa Dua", "Seminyak", "Jimbaran", "Uluwatu", "Legian", "Sanur", "Payangan", "Canggu", "Tampaksiring"].includes(areaName)) {
                    targetObject = allClintVisitingPlacesArray[0][packageKey];
                    usedDays = usedVisitingPlaces.baliOthers;
                }
            } else if (cityName === 'Jakarta') {
                targetObject = allClintVisitingPlacesArray[2][packageKey];
                usedDays = usedVisitingPlaces.jakarta;
            } else if (cityName === 'Puncak') {
                targetObject = allClintVisitingPlacesArray[3][packageKey];
                usedDays = usedVisitingPlaces.puncak;
            } else if (cityName === 'Bandung') {
                targetObject = allClintVisitingPlacesArray[4][packageKey];
                usedDays = usedVisitingPlaces.bandung;
            } else if (cityName === 'Lombok') {
                targetObject = allClintVisitingPlacesArray[5][packageKey];
                usedDays = usedVisitingPlaces.lombok;
            }

            if (!usedVisitingPlaces[cityName]) {
                usedVisitingPlaces[cityName] = {};
            }

            let isCheckOutTextAdded = false; // Flag to track if check-out text has been added for this hotel
            let dayIndex = 0; // Initialize dayIndex separately for each hotel

            for (let i = 0; i < nights; i++) {
                let clintMovementsRowTableDiv = document.createElement('div');
                clintMovementsRowTableDiv.className = 'clint_movements_row_class clint_movements_row_class_for_editing';

                let newDate = incrementDate(checkInDate, i);

                let visitingPlacesText = "";

                // Skip appending text for the first created div
                if (targetObject) {
                    while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        dayIndex++;
                    }
                    if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                        usedDays[dayIndex] = true;
                        if (textArray && textArray.length > 0) {
                            visitingPlacesText = `${textArray.join(' + ')} `;
                        }
                        dayIndex++; // Increment dayIndex after appending text
                    }
                }

                let checkInOutText = i === 0 ? `${hotelName} Check-in` : '';
                let combinedCityName = cityName;

                // Logic for check-in/out text and combined city name based on previous city/hotel
                if (i === 0 && index > 0) {
                    previousCityName = allHotelRows[index - 1].querySelector('h5').innerText;
                    previousHotelName = allHotelRows[index - 1].querySelector('h1').innerText;

                    if (cityName !== previousCityName) {
                        combinedCityName = `${previousCityName}-${cityName}`;
                        lastHotelRowCombinedCityName = combinedCityName; // Update combined city name
                    }

                    let additionalText = "";
                    if (isAirportWelcomeIncluded && (cityName === "Bali" || cityName === "Jakarta") && cityName !== previousCityName) {
                        if (!(previousCityName === "Puncak" && cityName === "Jakarta") && !(previousCityName === "Bandung" && cityName === "Jakarta")) {
                            additionalText = `Welcome in ${cityName} Airport + `;
                        }
                    }


                    if (!isCheckOutTextAdded) {
                        checkInOutText = `${previousHotelName} Check-out `;

                        if (previousCityName !== cityName) {
                            checkInOutText += `+ Going To ${cityName} `;
                        }

                        checkInOutText += `+ ${additionalText}${visitingPlacesText} + ${hotelName} Check-in`;
                        isCheckOutTextAdded = true;
                    }
                }

                if ((cityName === "Bali" || cityName === "Jakarta") && !hasCenterTourTextBeenAdded) {
                    checkInOutText = checkInOutText.replace(`${hotelName} Check-in`, `${hotelName} Check-in + Going around the center`);
                    hasCenterTourTextBeenAdded = true;
                }

                if (!isFirstHotelRowCreated && (cityName === "Bali" || cityName === "Jakarta") && isAirportWelcomeIncluded) {
                    checkInOutText = `Welcome in ${cityName} Airport + ${checkInOutText}`;
                    isFirstHotelRowCreated = true;
                }

                // Additional condition for the first hotel row
                if (!isFirstHotelRowCreated && index === 0 && isAirportWelcomeIncluded && (firstHotelCityName === "Puncak" || firstHotelCityName === "Bandung")) {
                    checkInOutText = `Welcome in Jakarta Airport + Going to ${cityName} + ${hotelName} Check-in`;
                    isFirstHotelRowCreated = true; // Set the flag to avoid reapplying this condition
                }

                // Clean up text to ensure no duplicated '+'
                checkInOutText = cleanUpText(checkInOutText);

                clintMovementsRowTableDiv.innerHTML = `
                    <div><h1>${newDate}</h1></div>
                    <div><h2>${checkInOutText}</h2></div>
                    <div class="clint_movements_row_controller" style="cursor: pointer;"><h3>${i === 0 ? combinedCityName : cityName}</h3></div>
                `;

                // Apply the new condition to append text if needed, but skip the first hotel row
                if (!isFirstJakartaHotelFound && cityName === "Jakarta" && i === 0 && index !== 0) {
                    let currentH2 = clintMovementsRowTableDiv.querySelector('h2');
                    currentH2.innerText += " + Going To Alsadda restaurant for dinner";
                    currentH2.innerText = cleanUpText(currentH2.innerText); // Clean up text to ensure no duplicated '+'
                    isFirstJakartaHotelFound = true;
                }

                if (targetObject && i === 0) {
                    let dayIndex = 1;
                    while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        dayIndex++;
                    }
                    if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                        usedDays[dayIndex] = true;
                        if (textArray && textArray.length > 0) {
                            visitingPlacesText = `${textArray.join(' + ')} `;
                        }
                    }
                }

                if (targetObject) {
                    let dayIndex = i + 1;
                    while (usedDays[dayIndex] && targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        dayIndex++;
                    }
                    if (targetObject[`visitingPlaceNamesDay${dayIndex - 1}`]) {
                        let textArray = targetObject[`visitingPlaceNamesDay${dayIndex - 1}`];
                        usedDays[dayIndex] = true;
                        if (textArray && textArray.length > 0) {
                            visitingPlacesText = `${textArray.join(' + ')} `;
                        }
                    }
                }

                if (visitingPlacesText) {
                    clintMovementsRowTableDiv.querySelector('h2').innerText += `${visitingPlacesText}`;
                }

                document.getElementById('inserted_clint_movements_data_position_div').appendChild(clintMovementsRowTableDiv);

                if (index === totalHotels - 1 && i === nights - 1) {
                    // Check if this is not the first created clintMovementsRowTableDiv
                    if (isFirstClintMovementsRowCreated) {
                        let lastH3 = clintMovementsRowTableDiv.querySelector('h3');
                        lastH3.innerText = lastHotelCityName;
                    } else {
                        isFirstClintMovementsRowCreated = true; // Set the flag after the first creation
                    }
                }
            }


            if (index === totalHotels - 1) {
                let extraDate = incrementDate(checkInDate, nights);
                let extraClintMovementsRowTableDiv = document.createElement('div');

                extraClintMovementsRowTableDiv.className = 'clint_movements_row_class clint_movements_row_class_for_editing';

                extraClintMovementsRowTableDiv.innerHTML = `
                    <div><h1>${extraDate}</h1></div>
                    <div><h2>${hotelName} Check-out and going to Airport for leaving</h2></div>
                    <div class="clint_movements_row_controller" style="cursor: pointer;"><h3>${cityName}-Leave</h3></div>
                `;

                document.getElementById('inserted_clint_movements_data_position_div').appendChild(extraClintMovementsRowTableDiv);
            }
        });


        /* Show up the 'downloaded_pdf_clint_movements_data_page' section */
        document.getElementById('downloaded_pdf_clint_movements_data_page').style.display = 'block';


        /* Update the available clint visiting places based on the current existing visiting places */
        filterUsedClintVisitingPlacesNames();



        // Get all elements with the class name 'flight_row_class'
        let clintMovementsRowTableDiv = document.querySelectorAll('.clint_movements_row_class_for_editing');

        // Loop through each 'flight_row_class' element
        clintMovementsRowTableDiv.forEach(clintMovementsRowTableDiv => {

            // Get all dynamically created elements with the class 'clint_movements_row_controller'
            clintMovementsRowTableDiv.querySelectorAll('.clint_movements_row_controller').forEach(function (element) {
                element.onclick = function (event) {
                    clintMovementsRowCityNameControllerFunction(event, element);
                };
            });

        });



        /* Call a function to make sure if all package dates should be hidden or no */
        ensureAllPackageDatesHiddenOrNo();


        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }
}

// Define a global variable to store the reference
let currentClintMovementsDataDiv;



/* Function to delete the clicked clint movement row data */
deleteClickedClintMovementsData = function (currentClintMovementsDataDiv) {

    // Find all divs with the class name "clint_movements_row_class_for_editing"
    let allClintMovementsRows = document.querySelectorAll('.clint_movements_row_class_for_editing');

    // Check if there are any divs found
    if (allClintMovementsRows.length > 0) {
        // Get the index of the passed currentClintMovementsDataDiv in the NodeList
        let divIndex = Array.from(allClintMovementsRows).indexOf(currentClintMovementsDataDiv);

        // Check if the passed div is the first or the last div in the list
        if (divIndex === 0 || divIndex === allClintMovementsRows.length - 1) {

            // Play a sound effect
            playSoundEffect('success');


            /* Delete the clicked 'currentClintMovementsDataDiv' from the document */
            currentClintMovementsDataDiv.remove();

        } else {
            // Play a sound effect
            playSoundEffect('error');
        }


        // Get the following element to hide them
        let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
        let overlayLayer = document.querySelector('.black_overlay');

        deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
        overlayLayer.style.opacity = '0';
        setTimeout(() => {
            // Only remove the overlay if it is still a child of the body
            if (document.body.contains(overlayLayer)) {
                document.body.removeChild(overlayLayer);
            }
        }, 300);

        // Get references to all input elements and reset their values
        document.getElementById('clint_movements_whole_day_actions_details_textarea_id').value = '';
        document.getElementById('clint_movements_current_city_name_input_id').value = '';

        /* Hide and show different icons */
        document.getElementById('clint_movements_auto_create_icon').style.display = 'block';
        document.getElementById('confirm_new_clint_movements_data_row_icon').style.display = 'none';
        document.getElementById('cancel_new_clint_movements_data_row_icon').style.display = 'none';

        /* Reset the innerText and styling to default */
        document.getElementById('clint_movements_content_section_title_text_id').innerText = 'TRANSPORTATION';
        document.getElementById('toggle_clint_movements_details_title_div_id').style.background = 'rgb(131, 0, 148)';

        /* Update the available clint visiting places based on the current existing visiting places */
        filterUsedClintVisitingPlacesNames();

        // Loop through each found div to reset the serial number in h4 elements
        allClintMovementsRows.forEach((clintMovementRow, index) => {
            let h4Element = clintMovementRow.querySelector('h4');
            if (h4Element) {
                // Reset the innerText of the h4 element with a serial number starting from 1
                h4Element.innerText = (index + 1).toString();
            }
        });

        /* Call a function to highlight the Saturday and Sunday days */
        highlightWeekendClintMovements();


        // Check if there are any remaining inserted clint movements data div (Searching by the unique class name)
        let remainingFlightDataDivs = document.querySelectorAll('.clint_movements_row_class_for_editing');
        if (remainingFlightDataDivs.length === 0) {
            // Hide section with id 'downloaded_pdf_clint_movements_data_page'
            document.getElementById('downloaded_pdf_clint_movements_data_page').style.display = 'none';
        }
    }
};


// Function to handle edit clicked clint movements data
editClickedClintMovementsData = function (currentClintMovementsDataDiv) {
    // Make sure the correct section is the one that is visible
    create_new_clint_data_section.style.display = 'none';
    create_new_hotel_package_section.style.display = 'none';
    create_new_flight_package_section.style.display = 'none';
    create_new_package_including_and_not_including_data_section.style.display = 'none';
    create_new_clint_movements_plan_section.style.display = 'block';

    // Show and hide different icons
    document.getElementById('clint_movements_auto_create_icon').style.display = 'none';
    document.getElementById('confirm_new_clint_movements_data_row_icon').style.display = 'block';
    document.getElementById('cancel_new_clint_movements_data_row_icon').style.display = 'block';

    // Change the innerText and styling to default
    document.getElementById('clint_movements_content_section_title_text_id').innerText = `EDIT DAY ${currentClintMovementsDataDiv.querySelector('h1').innerText}`;
    document.getElementById('toggle_clint_movements_details_title_div_id').style.background = 'rgb(85, 127, 137)';

    // Scroll up to the middle of the 'toggle_clint_movements_details_title_div_id'
    document.getElementById('toggle_clint_movements_details_title_div_id').scrollIntoView({
        block: 'center',
        inline: 'center',
        behavior: 'smooth',
    });

    // Disable the clint movements dates when editing
    document.getElementById('whole_package_start_date_input_id').disabled = true;
    document.getElementById('whole_package_end_date_input_id').disabled = true;

    // Hide delete button div
    let overlayLayer = document.querySelector('.black_overlay');
    let deleteHotelRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    deleteHotelRowDiv.style.transform = 'translate(-50%, -130vh)';

    // Hide overlay layer with opacity transition
    overlayLayer.style.opacity = '0';

    // Remove overlay and edit/delete div from DOM after transition
    setTimeout(() => {
        document.body.removeChild(overlayLayer);
    }, 300); // Match transition duration in CSS




    /* Set the clicked clint movemenet row h2 innerText inside the input to start editing */
    document.getElementById('clint_movements_whole_day_actions_details_textarea_id').value = currentClintMovementsDataDiv.querySelector('h2').innerText;


    /* Set the clicked clint movemenet row h2 innerText inside the input to start editing */
    document.getElementById('clint_movements_current_city_name_input_id').value = currentClintMovementsDataDiv.querySelector('h3').innerText;


    /* Update the available clint visiting places based on the current existing visiting places */
    filterUsedClintVisitingPlacesNames();



    /* Function to cancel the clint movements row data editing process */
    cancelNewClintMovementsDataRow = function () {
        // Get references to all input elements and reset their values
        document.getElementById('clint_movements_whole_day_actions_details_textarea_id').value = '';
        document.getElementById('clint_movements_current_city_name_input_id').value = '';



        /* Hide and show different icons */
        document.getElementById('clint_movements_auto_create_icon').style.display = 'block';
        document.getElementById('confirm_new_clint_movements_data_row_icon').style.display = 'none';
        document.getElementById('cancel_new_clint_movements_data_row_icon').style.display = 'none';


        /* Reset the innerText and styling to defualt */
        document.getElementById('clint_movements_content_section_title_text_id').innerText = 'TRANSPORTATION';
        document.getElementById('toggle_clint_movements_details_title_div_id').style.background = 'rgb(131, 0, 148)';


        /* Re-enable the clint movements dates when editing */
        document.getElementById('whole_package_start_date_input_id').disabled = false;
        document.getElementById('whole_package_end_date_input_id').disabled = false;


        /* Update the available clint visiting places based on the current existing visiting places */
        filterUsedClintVisitingPlacesNames();



        // Find all divs with the class name "clint_movements_row_class_for_editing"
        let allClintMovementsRows = document.querySelectorAll('.clint_movements_row_class_for_editing');

        // Check if there are any divs found
        if (allClintMovementsRows.length > 0) {
            // Loop through each found div
            allClintMovementsRows.forEach((clintMovementRow, index) => {
                // Target the h4 element inside each found div
                let h4Element = clintMovementRow.querySelector('h4');

                // Check if the h4 element exists
                if (h4Element) {
                    // Reset the innerText of the h4 element with a serial number starting from 1
                    h4Element.innerText = (index + 1).toString();
                }
            });
        }
    }




    /* Function to confirm the new clint movements row data */
    confirmNewClintMovementsDataRow = function () {

        // Get references to all input elements for later use
        currentClintMovementsDataDiv.querySelector('h2').innerText = document.getElementById('clint_movements_whole_day_actions_details_textarea_id').value;

        // Get references to all input elements for later use
        currentClintMovementsDataDiv.querySelector('h3').innerText = document.getElementById('clint_movements_current_city_name_input_id').value;


        // Get all elements with the class name 'flight_row_class'
        let clintMovementsRowTableDiv = document.querySelectorAll('.clint_movements_row_class_for_editing');

        // Loop through each 'flight_row_class' element
        clintMovementsRowTableDiv.forEach(clintMovementsRowTableDiv => {

            // Get all dynamically created elements with the class 'clint_movements_row_controller'
            clintMovementsRowTableDiv.querySelectorAll('.clint_movements_row_controller').forEach(function (element) {
                element.onclick = function (event) {
                    clintMovementsRowCityNameControllerFunction(event, element);
                };
            });

        });


        // Clear the input after confirm the new flight data
        cancelNewClintMovementsDataRow()
    }
}

// Function to handle clint movements row div click or touch
clintMovementsRowCityNameControllerFunction = function (event) {
    let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    let clickedclintMovementsDataDiv = event.target.closest('.clint_movements_row_class');

    // Ensure the target is a clint_movements_row_class div
    if (clickedclintMovementsDataDiv) {
        currentClintMovementsDataDiv = clickedclintMovementsDataDiv;

        /* Function to run edit the clicked client movements row data */
        runDeleteClickedClintMovementsDataFunction = function () {
            deleteClickedClintMovementsData(currentClintMovementsDataDiv);

        }


        /* Function to run edit the clicked client movements row data */
        runEditClickedClintMovementsDataFunction = function () {
            editClickedClintMovementsData(currentClintMovementsDataDiv);

            /* Make sure hotel package type text is colored in rgb(0, 46, 57) */
            document.getElementById('header_navbar_links_clint_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_hotel_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_flight_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_package_icluding_and_not_including_a').style.backgroundColor = 'rgb(85, 127, 137)';
            document.getElementById('header_navbar_links_clint_movements_a').style.backgroundColor = 'rgb(0, 46, 57)';
        }





        /* Run a function to copy or paste the clicked clint movement row h2 text */
        copyAndReplaceClintMovementsRowTableDivFunction = function (clickedMethod) {

            if (clickedMethod === 'copy') {

                runCopyClickedClintMovementH2TextFunction(currentClintMovementsDataDiv);

            } else {

                runReplaceClickedClintMovementH2TextFunction(currentClintMovementsDataDiv);

            }

        }





        /* Run a function to split and place the clint visiting places */
        splitAndPlaceClintMovementsRowTableDivFunction = function (clickedMethod) {

            if (clickedMethod === 'split') {

                runSplitAndPlaceClintMovementsRowTableDivFunction(currentClintMovementsDataDiv);

            } else {

                runPlaceClintMovementsRowTableDivFunction(currentClintMovementsDataDiv);

            }

        }






        /* Run  function to add "يوم مفتوح بدون سائق" text in the clicked div */
        addFreeTransportationDayWithoutDriverFunction = function () {

            runAddFreeTransportationDayWithoutDriverFunction(currentClintMovementsDataDiv);

        }


        /* Run  function to add "يوم مفتوح بدون سائق" text in the clicked div */
        addFreeTransportationDayWithDriverFunction = function () {

            runAddFreeTransportationDayWithDriverFunction(currentClintMovementsDataDiv);

        }




        // Check if the overlay already exists
        let overlayLayer = document.querySelector('.black_overlay');
        if (!overlayLayer) {
            overlayLayer = document.createElement('div');
            overlayLayer.classList.add('black_overlay');
            document.body.appendChild(overlayLayer);

            setTimeout(() => {
                overlayLayer.style.opacity = '1';
                deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -50%)';
            }, 50);

            // Handle both click and touch events on overlay for consistency
            let handleOverlayClick = () => {
                deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
                overlayLayer.style.opacity = '0';
                setTimeout(() => {
                    // Only remove the overlay if it is still a child of the body
                    if (document.body.contains(overlayLayer)) {
                        document.body.removeChild(overlayLayer);
                    }
                }, 300);
            };

            overlayLayer.addEventListener('click', handleOverlayClick);

            overlayLayer.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
    }
};

let lastCopiedClintMovementRowDiv = null;
let lastCopiedClintMovementH2Text = null;

let lastClickedClintMovementRowDiv_for_replacing = null;
let lastClickedClintMovementH2Text_for_replacing = null;

/* Function to copy the clicked clint movement h2 text */
runCopyClickedClintMovementH2TextFunction = function (currentClintMovementsDataDiv) {

    /* Reset the old clicked clint movement row div for copping if exist */
    if (lastCopiedClintMovementRowDiv !== null) {

        // Apply the background and text color changes to only the two divs
        let firstDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[0];
        let secondDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[1];
        let thirdDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[2];
        firstDiv_1.style.backgroundColor = 'white';
        firstDiv_1.style.color = 'black';
        secondDiv_1.style.backgroundColor = 'white';
        secondDiv_1.style.color = 'black';
        thirdDiv_1.style.backgroundColor = 'white';
        thirdDiv_1.style.color = 'black';
    }


    /* Store the second clicked clint movement row div for copping */
    lastCopiedClintMovementRowDiv = currentClintMovementsDataDiv;
    lastCopiedClintMovementH2Text = currentClintMovementsDataDiv.querySelector('h2').innerText;

    // Get the following element to hide them
    let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    let overlayLayer = document.querySelector('.black_overlay');

    deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
    overlayLayer.style.opacity = '0';
    setTimeout(() => {
        // Only remove the overlay if it is still a child of the body
        if (document.body.contains(overlayLayer)) {
            document.body.removeChild(overlayLayer);
        }
    }, 300);


    // Apply the background and text color changes to all three divs
    let firstDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[0];
    let secondDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[1];
    let thirdDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[2];
    firstDiv_1.style.backgroundColor = 'rgb(0, 93, 119)';
    firstDiv_1.style.color = 'white';
    secondDiv_1.style.backgroundColor = 'rgb(0, 93, 119)';
    secondDiv_1.style.color = 'white';
    thirdDiv_1.style.backgroundColor = 'rgb(0, 93, 119)';
    thirdDiv_1.style.color = 'white';


    setTimeout(() => {
        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }, 500);
}


/* Function to replace the clicked clint movement h2 text with the copied one */
runReplaceClickedClintMovementH2TextFunction = function (currentClintMovementsDataDiv) {

    /* Store the second clicked clint movement row div for replacing */
    lastClickedClintMovementRowDiv_for_replacing = currentClintMovementsDataDiv;
    lastClickedClintMovementH2Text_for_replacing = currentClintMovementsDataDiv.querySelector('h2').innerText;


    /* Replace the text beteen both clicked clint movement row divs */
    if (lastCopiedClintMovementRowDiv !== null) {

        /* Play a sound effect if the value of the 'lastCopiedClintMovementRowDiv' is not null*/
        playSoundEffect('success');


        lastCopiedClintMovementRowDiv.querySelector('h2').innerText = lastClickedClintMovementH2Text_for_replacing;
        lastClickedClintMovementRowDiv_for_replacing.querySelector('h2').innerText = lastCopiedClintMovementH2Text;



        // Apply the background and text color changes to only the two divs
        let firstDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[0];
        let secondDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[1];
        let thirdDiv_1 = lastCopiedClintMovementRowDiv.querySelectorAll('div')[2];
        firstDiv_1.style.backgroundColor = 'green';
        firstDiv_1.style.color = 'white';
        secondDiv_1.style.backgroundColor = 'green';
        secondDiv_1.style.color = 'white';
        thirdDiv_1.style.backgroundColor = 'green';
        thirdDiv_1.style.color = 'white';

        let firstDiv_2 = lastClickedClintMovementRowDiv_for_replacing.querySelectorAll('div')[0];
        let secondDiv_2 = lastClickedClintMovementRowDiv_for_replacing.querySelectorAll('div')[1];
        let thirdDiv_2 = lastClickedClintMovementRowDiv_for_replacing.querySelectorAll('div')[2];
        firstDiv_2.style.backgroundColor = 'green';
        firstDiv_2.style.color = 'white';
        secondDiv_2.style.backgroundColor = 'green';
        secondDiv_2.style.color = 'white';
        thirdDiv_2.style.backgroundColor = 'green';
        thirdDiv_2.style.color = 'white';



        // Set a timeout to change the background and text color back after 1 second
        setTimeout(() => {

            firstDiv_1.style.backgroundColor = 'white'; // Change background back to white
            firstDiv_1.style.color = 'black'; // Change text color back to black
            secondDiv_1.style.backgroundColor = 'white'; // Change background back to white
            secondDiv_1.style.color = 'black'; // Change text color back to black
            thirdDiv_1.style.backgroundColor = 'white'; // Change background back to white
            thirdDiv_1.style.color = 'black'; // Change text color back to black


            firstDiv_2.style.backgroundColor = 'white'; // Change background back to white
            firstDiv_2.style.color = 'black'; // Change text color back to black
            secondDiv_2.style.backgroundColor = 'white'; // Change background back to white
            secondDiv_2.style.color = 'black'; // Change text color back to black
            thirdDiv_2.style.backgroundColor = 'white'; // Change background back to white
            thirdDiv_2.style.color = 'black'; // Change text color back to black

        }, 1000);



        /* Reset all the variables to null for a new replacing functionality */
        lastCopiedClintMovementRowDiv = null;
        lastCopiedClintMovementH2Text = null;

        lastClickedClintMovementRowDiv_for_replacing = null;
        lastClickedClintMovementH2Text_for_replacing = null;



    } else {

        /* Play a sound effect if the value of the 'lastCopiedClintMovementRowDiv' is null*/
        playSoundEffect('error');

    }


    // Get the following element to hide them
    let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    let overlayLayer = document.querySelector('.black_overlay');

    deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
    overlayLayer.style.opacity = '0';
    setTimeout(() => {
        // Only remove the overlay if it is still a child of the body
        if (document.body.contains(overlayLayer)) {
            document.body.removeChild(overlayLayer);
        }
    }, 300);


    setTimeout(() => {
        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }, 1000);
}




let lastSplitClintMovementRowDiv = null;
let lastSplitClintMovementH2Text = null;

let lastClickedClintMovementRowDiv_for_placing = null;


/* Function to split the clint visting places */
runSplitAndPlaceClintMovementsRowTableDivFunction = function (currentClintMovementsDataDiv) {
    /* Reset the old clicked clint movement row div for copping if exist */
    if (lastSplitClintMovementRowDiv !== null) {

        // Apply the background and text color changes to only the two divs
        let firstDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[0];
        let secondDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[1];
        let thirdDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[2];
        firstDiv_1.style.backgroundColor = 'white';
        firstDiv_1.style.color = 'black';
        secondDiv_1.style.backgroundColor = 'white';
        secondDiv_1.style.color = 'black';
        thirdDiv_1.style.backgroundColor = 'white';
        thirdDiv_1.style.color = 'black';
    }



    /* Store the second clicked clint movement row div for copping */
    lastSplitClintMovementRowDiv = currentClintMovementsDataDiv;
    lastSplitClintMovementH2Text = currentClintMovementsDataDiv.querySelector('h2').innerText;


    // Get the following element to hide them
    let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    let overlayLayer = document.querySelector('.black_overlay');

    deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
    overlayLayer.style.opacity = '0';
    setTimeout(() => {
        // Only remove the overlay if it is still a child of the body
        if (document.body.contains(overlayLayer)) {
            document.body.removeChild(overlayLayer);
        }
    }, 300);



    // Apply the background and text color changes to all three divs
    let firstDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[0];
    let secondDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[1];
    let thirdDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[2];
    firstDiv_1.style.backgroundColor = 'rgb(0, 93, 119)';
    firstDiv_1.style.color = 'white';
    secondDiv_1.style.backgroundColor = 'rgb(0, 93, 119)';
    secondDiv_1.style.color = 'white';
    thirdDiv_1.style.backgroundColor = 'rgb(0, 93, 119)';
    thirdDiv_1.style.color = 'white';


    setTimeout(() => {
        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }, 500);
}



/* Function to add "يوم مفتوح بدون سائق" text inside the clicked div */
runAddFreeTransportationDayWithoutDriverFunction = function (currentClintMovementsDataDiv) {

    /* Play a sound effect if the value of the 'lastCopiedClintMovementRowDiv' is not null*/
    playSoundEffect('success');

    currentClintMovementsDataDiv.querySelector('h2').innerText = 'يوم مفتوح بدون سائق';




    // Apply the background and text color changes to only the two divs
    let firstDiv_1 = currentClintMovementsDataDiv.querySelectorAll('div')[0];
    let secondDiv_1 = currentClintMovementsDataDiv.querySelectorAll('div')[1];
    let thirdDiv_1 = currentClintMovementsDataDiv.querySelectorAll('div')[2];
    firstDiv_1.style.backgroundColor = 'green';
    firstDiv_1.style.color = 'white';
    secondDiv_1.style.backgroundColor = 'green';
    secondDiv_1.style.color = 'white';
    thirdDiv_1.style.backgroundColor = 'green';
    thirdDiv_1.style.color = 'white';


    // Set a timeout to change the background and text color back after 1 second
    setTimeout(() => {

        firstDiv_1.style.backgroundColor = 'white'; // Change background back to white
        firstDiv_1.style.color = 'black'; // Change text color back to black
        secondDiv_1.style.backgroundColor = 'white'; // Change background back to white
        secondDiv_1.style.color = 'black'; // Change text color back to black
        thirdDiv_1.style.backgroundColor = 'white'; // Change background back to white
        thirdDiv_1.style.color = 'black'; // Change text color back to black

    }, 1000);





    // Get the following element to hide them
    let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    let overlayLayer = document.querySelector('.black_overlay');

    deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
    overlayLayer.style.opacity = '0';
    setTimeout(() => {
        // Only remove the overlay if it is still a child of the body
        if (document.body.contains(overlayLayer)) {
            document.body.removeChild(overlayLayer);
        }
    }, 300);


    setTimeout(() => {
        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }, 1000);
}



/* Function to add "يوم مفتوح بدون سائق" text inside the clicked div */
runAddFreeTransportationDayWithDriverFunction = function (currentClintMovementsDataDiv) {

    /* Play a sound effect if the value of the 'lastCopiedClintMovementRowDiv' is not null*/
    playSoundEffect('success');

    currentClintMovementsDataDiv.querySelector('h2').innerText = 'جولة مع سائق خاص لمدة 8 ساعات';




    // Apply the background and text color changes to only the two divs
    let firstDiv_1 = currentClintMovementsDataDiv.querySelectorAll('div')[0];
    let secondDiv_1 = currentClintMovementsDataDiv.querySelectorAll('div')[1];
    let thirdDiv_1 = currentClintMovementsDataDiv.querySelectorAll('div')[2];
    firstDiv_1.style.backgroundColor = 'green';
    firstDiv_1.style.color = 'white';
    secondDiv_1.style.backgroundColor = 'green';
    secondDiv_1.style.color = 'white';
    thirdDiv_1.style.backgroundColor = 'green';
    thirdDiv_1.style.color = 'white';


    // Set a timeout to change the background and text color back after 1 second
    setTimeout(() => {

        firstDiv_1.style.backgroundColor = 'white'; // Change background back to white
        firstDiv_1.style.color = 'black'; // Change text color back to black
        secondDiv_1.style.backgroundColor = 'white'; // Change background back to white
        secondDiv_1.style.color = 'black'; // Change text color back to black
        thirdDiv_1.style.backgroundColor = 'white'; // Change background back to white
        thirdDiv_1.style.color = 'black'; // Change text color back to black

    }, 1000);





    // Get the following element to hide them
    let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    let overlayLayer = document.querySelector('.black_overlay');

    deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
    overlayLayer.style.opacity = '0';
    setTimeout(() => {
        // Only remove the overlay if it is still a child of the body
        if (document.body.contains(overlayLayer)) {
            document.body.removeChild(overlayLayer);
        }
    }, 300);


    setTimeout(() => {
        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }, 1000);
}



/* Function to place the splited clint movements visiting places */
runPlaceClintMovementsRowTableDivFunction = function (currentClintMovementsDataDiv) {

    /* Store the second clicked clint movement row div for replacing */
    lastClickedClintMovementRowDiv_for_placing = currentClintMovementsDataDiv;


    /* in case the second clicked clint movements row is empty */
    if (currentClintMovementsDataDiv.querySelector('h2').innerText === '') {

        /* Replace the text beteen both clicked clint movement row divs */
        if (lastSplitClintMovementRowDiv !== null) {

            /* Play a sound effect if the value of the 'lastCopiedClintMovementRowDiv' is not null*/
            playSoundEffect('success');



            /* Split the 'lastSplitClintMovementH2Text' text based on the + sign */
            let splitTextArray = lastSplitClintMovementH2Text.split('+').map(item => item.trim());

            if (splitTextArray.length > 1) {
                /* Determine the midpoint to split the text into two halves */
                let midIndex = Math.ceil(splitTextArray.length / 2);

                /* Join the first half of the text */
                let firstHalf = splitTextArray.slice(0, midIndex).join(' + ');

                /* Join the second half of the text */
                let secondHalf = splitTextArray.slice(midIndex).join(' + ');

                /* Update the original div's text to the first half */
                lastSplitClintMovementRowDiv.querySelector('h2').innerText = firstHalf;

                /* Place the second half into the current clint movement div */
                currentClintMovementsDataDiv.querySelector('h2').innerText = secondHalf;
            }



            // Apply the background and text color changes to only the two divs
            let firstDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[0];
            let secondDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[1];
            let thirdDiv_1 = lastSplitClintMovementRowDiv.querySelectorAll('div')[2];
            firstDiv_1.style.backgroundColor = 'green';
            firstDiv_1.style.color = 'white';
            secondDiv_1.style.backgroundColor = 'green';
            secondDiv_1.style.color = 'white';
            thirdDiv_1.style.backgroundColor = 'green';
            thirdDiv_1.style.color = 'white';

            let firstDiv_2 = lastClickedClintMovementRowDiv_for_placing.querySelectorAll('div')[0];
            let secondDiv_2 = lastClickedClintMovementRowDiv_for_placing.querySelectorAll('div')[1];
            let thirdDiv_2 = lastClickedClintMovementRowDiv_for_placing.querySelectorAll('div')[2];
            firstDiv_2.style.backgroundColor = 'green';
            firstDiv_2.style.color = 'white';
            secondDiv_2.style.backgroundColor = 'green';
            secondDiv_2.style.color = 'white';
            thirdDiv_2.style.backgroundColor = 'green';
            thirdDiv_2.style.color = 'white';



            // Set a timeout to change the background and text color back after 1 second
            setTimeout(() => {

                firstDiv_1.style.backgroundColor = 'white'; // Change background back to white
                firstDiv_1.style.color = 'black'; // Change text color back to black
                secondDiv_1.style.backgroundColor = 'white'; // Change background back to white
                secondDiv_1.style.color = 'black'; // Change text color back to black
                thirdDiv_1.style.backgroundColor = 'white'; // Change background back to white
                thirdDiv_1.style.color = 'black'; // Change text color back to black


                firstDiv_2.style.backgroundColor = 'white'; // Change background back to white
                firstDiv_2.style.color = 'black'; // Change text color back to black
                secondDiv_2.style.backgroundColor = 'white'; // Change background back to white
                secondDiv_2.style.color = 'black'; // Change text color back to black
                thirdDiv_2.style.backgroundColor = 'white'; // Change background back to white
                thirdDiv_2.style.color = 'black'; // Change text color back to black

            }, 1000);



            /* Reset all the variables to null for a new replacing functionality */
            lastSplitClintMovementRowDiv = null;
            lastSplitClintMovementH2Text = null;

            lastClickedClintMovementRowDiv_for_placing = null;
        }



        /* in case there is no splited clint movements row div found */
    } else {

        /* Play a sound effect if the value of the 'lastCopiedClintMovementRowDiv' is null*/
        playSoundEffect('error');

    }


    // Get the following element to hide them
    let deleteclintMovementsRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
    let overlayLayer = document.querySelector('.black_overlay');

    deleteclintMovementsRowDiv.style.transform = 'translate(-50%, -130vh)';
    overlayLayer.style.opacity = '0';
    setTimeout(() => {
        // Only remove the overlay if it is still a child of the body
        if (document.body.contains(overlayLayer)) {
            document.body.removeChild(overlayLayer);
        }
    }, 300);


    setTimeout(() => {
        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }, 1000);
}






/* Function to add more clint movements days */
addMoreClintMovementsRowTableDivFunction = function (position) {
    let allClintMovementsRows = document.querySelectorAll('.clint_movements_row_class_for_editing');

    if (allClintMovementsRows.length > 0) {
        let referenceRow, newDate;

        if (position === 'up') {
            // Handle 'up' position: Add above the first found div
            referenceRow = allClintMovementsRows[0];  // First found div
            let firstDate = referenceRow.querySelector('h1').innerText;
            newDate = decrementDate(firstDate);  // Date before the firstDate
        } else if (position === 'down') {
            // Handle 'down' position: Add below the last found div
            referenceRow = allClintMovementsRows[allClintMovementsRows.length - 1];  // Last found div
            let lastDate = referenceRow.querySelector('h1').innerText;
            newDate = incrementDate(lastDate);  // Date after the lastDate
        }

        // Create the new clintMovementsRowTableDiv
        let newClintMovementsRowTableDiv = document.createElement('div');
        newClintMovementsRowTableDiv.className = 'clint_movements_row_class clint_movements_row_class_for_editing';

        // Set the inner HTML of the new div with the new date and empty h2 and h3
        newClintMovementsRowTableDiv.innerHTML = `
            <div><h1>${newDate}</h1></div>
            <div><h2></h2></div>
            <div class="clint_movements_row_controller" style="cursor: pointer;"><h3>${referenceRow.querySelector('h3').innerText}</h3></div>
        `;

        // Insert the new div at the appropriate position
        if (position === 'up') {
            referenceRow.parentNode.insertBefore(newClintMovementsRowTableDiv, referenceRow);
        } else if (position === 'down') {
            referenceRow.parentNode.insertBefore(newClintMovementsRowTableDiv, referenceRow.nextSibling);
        }



        // Hide delete button div
        let overlayLayer = document.querySelector('.black_overlay');
        let deleteFlightRowDiv = document.getElementById('ensure_delete_or_edit_clint_movemnt_data_div');
        deleteFlightRowDiv.style.transform = 'translate(-50%, -130vh)';

        // Hide overlay layer with opacity transition
        overlayLayer.style.opacity = '0';

        // Remove overlay and edit/delete div from DOM after transition
        setTimeout(() => {
            document.body.removeChild(overlayLayer);
        }, 300); // Match transition duration in CSS




        // Get all elements with the class name 'flight_row_class'
        let clintMovementsRowTableDiv = document.querySelectorAll('.clint_movements_row_class_for_editing');

        // Loop through each 'flight_row_class' element
        clintMovementsRowTableDiv.forEach(clintMovementsRowTableDiv => {

            // Get all dynamically created elements with the class 'clint_movements_row_controller'
            clintMovementsRowTableDiv.querySelectorAll('.clint_movements_row_controller').forEach(function (element) {
                element.onclick = function (event) {
                    clintMovementsRowCityNameControllerFunction(event, element);
                };
            });

        });


        /* Call a function to make sure if all package dates should be hidden or no */
        ensureAllPackageDatesHiddenOrNo();




        // Loop through each found div
        allClintMovementsRows.forEach((clintMovementRow, index) => {
            // Target the h4 element inside each found div
            let h4Element = clintMovementRow.querySelector('h4');

            // Check if the h4 element exists
            if (h4Element) {
                // Reset the innerText of the h4 element with a serial number starting from 1
                h4Element.innerText = (index + 1).toString();
            }
        });



        /* Call a function to highlight the Saturday and Sanday days */
        highlightWeekendClintMovements();
    }
}

// Helper function to decrement a date by one day
function decrementDate(dateString) {
    let dateParts = dateString.split(' ');
    let day = parseInt(dateParts[0], 10);
    let month = dateParts[1];

    let newDate = new Date(); // Create a new Date object
    newDate.setDate(day - 1); // Subtract one day
    // Assuming the month doesn't change, return the new day with the same month
    return `${newDate.getDate()} ${month}`;
}
// Helper function to increment a date by one day
function incrementDate(dateString) {
    let dateParts = dateString.split(' ');
    let day = parseInt(dateParts[0], 10);
    let month = dateParts[1];

    let newDate = new Date(); // Create a new Date object
    newDate.setDate(day + 1); // Add one day
    // Assuming the month doesn't change, return the new day with the same month
    return `${newDate.getDate()} ${month}`;
}


/* Function to update the available client visiting places based on the current existing visiting places */
function filterUsedClintVisitingPlacesNames() {

    // Select all divs with the class 'clint_movements_row_class_for_editing'
    let allClintMovementsDivs = document.querySelectorAll('.clint_movements_row_class_for_editing');

    // Initialize an array to store all sentences from the h2 elements inside these divs
    let sentencesFromH2 = [];

    // Loop through each 'clint_movements_row_class_for_editing' div
    allClintMovementsDivs.forEach((div) => {
        // Get the innerText of the h2 element inside the current div
        let h2Text = div.querySelector('h2').innerText;

        // Split the h2 text into individual sentences based on the '+' delimiter
        let sentences = h2Text.split('+').map(sentence => sentence.trim());

        // Add each sentence to the 'sentencesFromH2' array
        sentencesFromH2 = sentencesFromH2.concat(sentences);
    });

    // Select the div containing all the p elements
    let allClintMovementsPlacesPageDivsContainer = document.getElementById('all_clint_movements_places_page_divs_container');

    // Select all p elements inside the container
    let allPElements = allClintMovementsPlacesPageDivsContainer.querySelectorAll('p');

    // Function to normalize spaces in a text (replace multiple spaces with a single space)
    function normalizeSpaces(text) {
        return text.replace(/\s+/g, ' ').trim();
    }

    // Loop through each p element
    allPElements.forEach((pElement) => {
        // Get the normalized innerText of the current p element
        let pText = normalizeSpaces(pElement.innerText);

        // Check if the normalized innerText of the p element exists in the 'sentencesFromH2' array
        if (sentencesFromH2.some(sentence => normalizeSpaces(sentence) === pText)) {
            // If the sentence exists, set the display of the p element to 'none' to hide it
            pElement.style.display = 'none';

        } else {
            // If the sentence does not exist, set the display of the p element to 'block' to show it
            pElement.style.display = 'block';
        }
    });
}



/* Function to highlight the first div inside the clint movements row that are in Saturday or Sunday */
function highlightWeekendClintMovements() {
    let monthNames = {
        "Jan": 0,
        "Feb": 1,
        "Mar": 2,
        "Apr": 3,
        "May": 4,
        "Jun": 5,
        "Jul": 6,
        "Aug": 7,
        "Sep": 8,
        "Oct": 9,
        "Nov": 10,
        "Dec": 11
    };

    // Target all divs with the class "clint_movements_row_class_for_editing"
    let clintMovementDivs = document.querySelectorAll(".clint_movements_row_class_for_editing");

    // Iterate through each found div
    clintMovementDivs.forEach(div => {
        let h1Element = div.querySelector("h1");
        let h3Element = div.querySelector("h3");

        if (h1Element && h3Element) {
            // Extract date in English short month format, e.g., "2 May" -> now "2 May" but we standardize to short names elsewhere
            let dateText = h1Element.innerText.trim();
            let [day, monthName] = dateText.split(" ");
            let dayNumber = parseInt(day, 10);
            let monthNumber = monthNames[monthName];

            if (!isNaN(dayNumber) && monthNumber !== undefined) {
                // Create a new Date object using the extracted day and month
                let date = new Date();
                date.setDate(dayNumber);
                date.setMonth(monthNumber);

                // Check if the day is Saturday or Sunday
                let dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                if ((dayOfWeek === 0 || dayOfWeek === 6) && h3Element.innerText.includes('Puncak')) {
                    // Find the first div inside the target .clint_movements_row_class_for_editing div
                    let firstChildDiv = div.querySelector("div:first-child");

                    if (firstChildDiv) {
                        // Change the background color of the first child div
                        // Masure the color '' matches the reseting color functionaity inside the 'downloadPdfWithCurrentUserCodeName' function
                        firstChildDiv.style.backgroundColor = "rgb(190, 0, 0)";
                        firstChildDiv.style.color = "white";
                    }
                }
            }
        }
    });
}





/* Up All Functions For Clint Movements Data Up */












































/* Function to open choosing pdf file name box */
openPdfDownloadBox = function () {

    if (document.getElementById('package_user_code_name_for_later_import_reference_p_id').innerText !== '' && document.getElementById('downloaded_pdf_clint_data_page').style.display !== 'none') {
        let packageUserCodeNameForLaterImportReferenceP = document.getElementById('package_user_code_name_for_later_import_reference_p_id').innerText;
        document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').innerText = `استخدم كود صاحب البكج ${packageUserCodeNameForLaterImportReferenceP}`;
        document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').style.backgroundColor = 'rgb(85, 127, 137)';

    } else {
        document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').innerText = 'تأكد من إدخال معلومات العميل';
        document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').style.backgroundColor = 'rgb(190, 0, 0)';

    }

    // Create overlay layer
    let overlayLayer = document.createElement('div');
    overlayLayer.className = 'black_overlay';
    document.body.appendChild(overlayLayer);


    // Show overlay layer with smooth opacity transition
    setTimeout(() => {
        overlayLayer.style.opacity = '1'; // Delayed opacity transition for smooth appearance

        // Slide to the center of the screen
        document.getElementById('name_pdf_file_div').style.transform = 'translate(-50%, -50%)';
    }, 100);




    // Event listener to close overlay and delete box div on click outside
    overlayLayer.onclick = () => {
        // Hide delete box options div
        document.getElementById('name_pdf_file_div').style.transform = 'translate(-50%, -130vh)';

        // Hide overlay layer with opacity transition
        overlayLayer.style.opacity = '0';

        // Remove overlay and delete box div from DOM after transition
        setTimeout(() => {
            document.body.removeChild(overlayLayer);
        }, 300); // Match transition duration in CSS
    };
};

// Updated function using .then()
downloadPdfWithCurrentUserCodeName = function () {
    if (document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').style.backgroundColor !== 'rgb(190, 0, 0)') {

        let formPromise = Promise.resolve(); // Default to a resolved promise

        // Only call submitForm if 'existingDataStatus' is equal to "newData"
        if (websiteUserUniqueNumber === "newUniqueNumber") {
            handleUserPackageUniqueNumber(document.getElementById('website_users_name_input_id').value, 'insert');
        }


        playSoundEffect('success');
        document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').style.pointerEvents = 'none';


        document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').innerText = 'جاري التحميل..';


        let clintMovementDivs = document.querySelectorAll(".clint_movements_row_class_for_editing");

        clintMovementDivs.forEach(clintMovementDiv => {
            let childDivs = clintMovementDiv.querySelectorAll("div");
            childDivs.forEach(childDiv => {
                if (childDiv.style.backgroundColor !== "rgb(190, 0, 0)") {
                    childDiv.style.backgroundColor = "white";
                    childDiv.style.color = "black";
                }
            });
        });


        // Ensure 'handleUserPackageUniqueNumber' function that is called above to completes first, then call the sendDataToSupabase
        formPromise
            .then(() => {
                sendDataToSupabase();
            })
            .then(() => {
                const userCodeNameAsPdfDownloadedFIleName = document.getElementById('package_user_code_name_for_later_import_reference_p_id').innerText;
                downloadPdfWithCustomName(userCodeNameAsPdfDownloadedFIleName);
            });
    }
};

/* Download the pdf file with the given name */
downloadPdfWithCustomName = async function (pdfName) {
    let { jsPDF } = window.jspdf;

    // Function to capture a canvas of a given section
    let captureCanvas = async function (section, scale) {
        try {
            // Ensure resources are loaded and elements are visible before capturing
            await new Promise(resolve => setTimeout(resolve, 500)); // Increase the wait to 500ms

            let canvas = await html2canvas(section, {
                scale: scale,
                backgroundColor: 'white',
                scrollY: 0,
                useCORS: true, // Ensure cross-origin images are loaded correctly
                logging: false // Disable logging to improve speed
            });
            return canvas;
        } catch (error) {
        }
    };

    // Ensure the downloaded_pdf_clint_movements_data_page section has a consistent aspect ratio
    let adjustClintMovementsCanvas = function (canvas) {
        let pdfWidth = 210; // A4 width in mm
        let pdfHeight = 297; // A4 height in mm
        let scaleFactor = canvas.width / pdfWidth;

        // Calculate the minimum required height in pixels for the A4 page
        let minHeight = pdfHeight * scaleFactor;

        // If the canvas is shorter than the minimum height, pad it with empty space
        if (canvas.height < minHeight) {
            let paddedCanvas = document.createElement('canvas');
            paddedCanvas.width = canvas.width;
            paddedCanvas.height = minHeight;

            let context = paddedCanvas.getContext('2d');
            context.fillStyle = '#ffffff'; // Set background color to white
            context.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
            context.drawImage(canvas, 0, 0);

            return paddedCanvas;
        }

        return canvas;
    };

    // Show all elements with the class name before checking visibility
    let images = document.querySelectorAll('.inserted_package_data_section_page_image_class');
    images.forEach(img => {
        img.style.display = 'inline';
    });



    // Hide the company name image and show the importatnt noted page in the end of the pdf file
    document.getElementById('downloaded_pdf_important_notes_data_page').style.display = 'block';
    document.getElementById('inserted_company_name_image_position_div').style.display = 'none';



    /* Show All The Important Notes Divs Before Downloading The PDF */
    // Select all divs with the given class name
    const notesDivs = document.querySelectorAll('.Important_notes_for_each_pdf_section_div_class');
    // Loop through each and set display to 'block'
    notesDivs.forEach(div => {
        div.style.display = 'block';
    });










    /* Code Hiding Text For Sky Global Company PDF Style */
    // Get the input element
    const clientInput = document.getElementById('clint_company_name_input_id');

    // Check if input exists
    if (clientInput) {
        // Get the value of the input
        const clientValue = clientInput.value.trim();

        // Select all elements with the target class
        const elementsToHide = document.querySelectorAll('.hide_for_sky_global');

        // Check if the value matches "سكاي جلوبال"
        if (clientValue === 'سكاي جلوبال') {

            // Loop and hide each one
            elementsToHide.forEach(el => {
                el.style.display = 'none';
            });


        } else {

            // Loop and hide each one
            elementsToHide.forEach(el => {
                el.style.display = 'block';
            });


            /* Set the display value of the following element to flex (because it will be 'blcok' because of the above code) */
            document.getElementById('pdf_section_title_div_usuful_notes_id').style.display = 'flex';
        }
    }





    // Define the sections we want to include
    let sectionsToInclude = [
        'downloaded_pdf_clint_data_page',
        'downloaded_pdf_flight_data_page',
        'downloaded_pdf_hotel_data_page',
        'downloaded_pdf_package_including_data_page',
        'downloaded_pdf_clint_movements_data_page',
        'downloaded_pdf_important_notes_data_page' // Always include important notes as the last page
    ];





    // Get all h6 elements inside .pdf_section_title_div_class
    const h6Elements = document.querySelectorAll('.pdf_section_title_div_class h6');
    const divElements = document.querySelectorAll('.inserted_main_row_color_class');
    const imgElements = document.querySelectorAll('.inserted_package_data_section_page_image_class');


    /* Change the pdf colors in case a Special Company is choosen */
    if (document.getElementById('clint_company_name_input_id').value === 'مغادر') {

        // Change to white text on blue background
        h6Elements.forEach(h6 => {
            h6.style.backgroundColor = 'rgb(214, 156, 57)'; // Google blue background
            h6.style.color = 'white';
        });


        // Change to white text on blue background
        divElements.forEach(div => {
            div.style.backgroundColor = 'rgb(5, 52, 90)'; // Google blue background
            div.style.color = 'white';
        });




        // Remove class from all elements with class "pdf_section_title_div_class"
        document.querySelectorAll('.pdf_section_title_div_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_h6_class');
        });
        document.querySelectorAll('.inserted_main_row_color_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_div_class');
        });
        document.querySelectorAll('.special_package_including_data_background_color_text').forEach(p => {
            p.style.background = 'rgb(85, 127, 137)';
        });
        // Remove class from elements with specified IDs
        document.getElementById('package_clint_code_number_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('welcome_pdf_first_page_image_id')?.classList.remove('no_right_padding_for_vid_design_img_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.textAlign = 'left';
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.float = 'left';
        document.getElementById('package_clint_code_number_p_id').style.textAlign = 'right';
        document.getElementById('package_clint_code_number_p_id').style.float = 'right';



        /* Show all icons elements */
        document.querySelectorAll('.pdf_section_title_div_class').forEach(section => {
            section.querySelectorAll('ion-icon').forEach(icon => {
                icon.style.display = '';
            });
        });


        /* Hide the clint deposit noted p element */
        if (document.getElementById('vid_clint_deposit_note_p_id')) {
            document.getElementById('vid_clint_deposit_note_p_id').style.display = 'none';
        }



        // Change to white text on blue background
        imgElements.forEach(img => {
            img.src = '../moghader-middle-pdf-image.jpg'; // Google blue background
        });


        document.getElementById('welcome_pdf_first_page_image_id').src = 'خلفية-الشركات/مغادر.jpg';
        /* document.getElementById('inserted_package_important_notes_data_section_page_image_id').src = 'moghader-last-pdf-image.jpg'; */


        document.getElementById('package_clint_code_number_p_id').style.display = 'block';




        /* Change the pdf colors in case a Special Company is choosen */
    } else if (document.getElementById('clint_company_name_input_id').value === 'فيد') {

        // Add class to all elements with class "pdf_section_title_div_class"
        document.querySelectorAll('.pdf_section_title_div_class').forEach(div => {
            div.classList.add('no_right_padding_for_vid_design_h6_class');
        });
        document.querySelectorAll('.inserted_main_row_color_class').forEach(div => {
            div.classList.add('no_right_padding_for_vid_design_div_class');
        });
        document.querySelectorAll('.special_package_including_data_background_color_text').forEach(p => {
            p.style.background = 'rgb(99, 37, 35)';
        });
        // Add class to elements with specified IDs
        document.getElementById('package_clint_code_number_p_id')?.classList.add('no_right_padding_for_vid_design_p_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id')?.classList.add('no_right_padding_for_vid_design_p_class');
        document.getElementById('welcome_pdf_first_page_image_id')?.classList.add('no_right_padding_for_vid_design_img_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.textAlign = 'right';
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.float = 'right';
        document.getElementById('package_clint_code_number_p_id').style.textAlign = 'left';
        document.getElementById('package_clint_code_number_p_id').style.float = 'left';


        /* Show all icons elements */
        document.querySelectorAll('.pdf_section_title_div_class').forEach(section => {
            section.querySelectorAll('ion-icon').forEach(icon => {
                icon.style.display = '';
            });
        });



        /* Show the clint deposit noted p element */
        if (document.getElementById('vid_clint_deposit_note_p_id')) {
            document.getElementById('vid_clint_deposit_note_p_id').style.display = 'block';
        }



        // Change to white text on blue background
        imgElements.forEach(img => {
            img.src = '../vid-middle-pdf-image.jpg'; // Google blue background
        });


        document.getElementById('welcome_pdf_first_page_image_id').src = 'خلفية-الشركات/فيد.jpg';
        /* document.getElementById('inserted_package_important_notes_data_section_page_image_id').src = 'vid-last-pdf-image.jpg'; */

        document.getElementById('package_clint_code_number_p_id').style.display = 'block';





    } else if (document.getElementById('clint_company_name_input_id').value === 'سكاي جلوبال') {

        // Change to white text on blue background
        h6Elements.forEach(h6 => {
            h6.style.backgroundColor = 'rgb(4, 52, 90)'; // Google blue background
            h6.style.color = 'white'; // Google blue background
        });

        // Change to white text on blue background
        divElements.forEach(div => {
            div.style.backgroundColor = 'rgb(120, 202, 223)'; // Google blue background
            div.style.color = 'black'; // Google blue background
        });




        // Remove class from all elements with class "pdf_section_title_div_class"
        document.querySelectorAll('.pdf_section_title_div_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_h6_class');
        });
        document.querySelectorAll('.inserted_main_row_color_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_div_class');
        });
        document.querySelectorAll('.special_package_including_data_background_color_text').forEach(p => {
            p.style.background = 'rgb(4, 52, 90)';
        });
        // Remove class from elements with specified IDs
        document.getElementById('package_clint_code_number_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('welcome_pdf_first_page_image_id')?.classList.remove('no_right_padding_for_vid_design_img_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.textAlign = 'left';
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.float = 'left';
        document.getElementById('package_clint_code_number_p_id').style.textAlign = 'right';
        document.getElementById('package_clint_code_number_p_id').style.float = 'right';


        /* Hide all icons elements */
        document.querySelectorAll('.pdf_section_title_div_class').forEach(section => {
            section.querySelectorAll('ion-icon').forEach(icon => {
                icon.style.display = 'none';
            });
        });



        /* Hide the clint deposit noted p element */
        if (document.getElementById('vid_clint_deposit_note_p_id')) {
            document.getElementById('vid_clint_deposit_note_p_id').style.display = 'none';
        }



        // Change to white text on blue background
        imgElements.forEach(img => {
            img.src = '../sky-global-middle-pdf-image.jpg'; // Google blue background
        });


        document.getElementById('welcome_pdf_first_page_image_id').src = '../خلفية-الشركات/سكاي-جلوبال.jpg';
        /* document.getElementById('inserted_package_important_notes_data_section_page_image_id').src = 'ajwaa-sky-last-pdf-image.jpg'; */


        document.getElementById('package_clint_code_number_p_id').style.display = 'block';







    } else if (document.getElementById('clint_company_name_input_id').value === 'ترافل جت') {

        // Change to white text on blue background
        h6Elements.forEach(h6 => {
            h6.style.backgroundColor = 'rgb(232, 107, 41)'; // Google blue background
            h6.style.color = 'white'; // Google blue background
        });

        // Change to white text on blue background
        divElements.forEach(div => {
            div.style.backgroundColor = 'rgb(5, 150, 152)'; // Google blue background
            div.style.color = 'white'; // Google blue background
        });




        // Remove class from all elements with class "pdf_section_title_div_class"
        document.querySelectorAll('.pdf_section_title_div_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_h6_class');
        });
        document.querySelectorAll('.inserted_main_row_color_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_div_class');
        });
        document.querySelectorAll('.special_package_including_data_background_color_text').forEach(p => {
            p.style.background = 'rgb(5, 150, 152)';
        });
        // Remove class from elements with specified IDs
        document.getElementById('package_clint_code_number_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('welcome_pdf_first_page_image_id')?.classList.remove('no_right_padding_for_vid_design_img_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.textAlign = 'left';
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.float = 'left';
        document.getElementById('package_clint_code_number_p_id').style.textAlign = 'right';
        document.getElementById('package_clint_code_number_p_id').style.float = 'right';


        /* Hide all icons elements */
        document.querySelectorAll('.pdf_section_title_div_class').forEach(section => {
            section.querySelectorAll('ion-icon').forEach(icon => {
                icon.style.display = '';
            });
        });



        /* Hide the clint deposit noted p element */
        if (document.getElementById('vid_clint_deposit_note_p_id')) {
            document.getElementById('vid_clint_deposit_note_p_id').style.display = 'none';
        }



        // Change to white text on blue background
        imgElements.forEach(img => {
            img.src = '../travel-gate-middle-pdf-image.jpg'; // Google blue background
        });


        document.getElementById('welcome_pdf_first_page_image_id').src = '../خلفية-الشركات/ترافل-جت.jpg';
        /* document.getElementById('inserted_package_important_notes_data_section_page_image_id').src = 'travel-gate-last-pdf-image.jpg'; */


        document.getElementById('package_clint_code_number_p_id').style.display = 'block';






    } else if (document.getElementById('clint_company_name_input_id').value === '') {

        // Change to white text on blue background
        h6Elements.forEach(h6 => {
            h6.style.backgroundColor = 'rgb(161, 45, 10)'; // Google blue background
            h6.style.color = 'white';
        });

        // Change to white text on blue background
        divElements.forEach(div => {
            div.style.backgroundColor = 'rgb(207, 83, 21)'; // Google blue background
            div.style.color = 'white';
        });



        // Remove class from all elements with class "pdf_section_title_div_class"
        document.querySelectorAll('.pdf_section_title_div_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_h6_class');
        });
        document.querySelectorAll('.inserted_main_row_color_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_div_class');
        });
        document.querySelectorAll('.special_package_including_data_background_color_text').forEach(p => {
            p.style.background = 'rgb(85, 127, 137)';
        });
        // Remove class from elements with specified IDs
        document.getElementById('package_clint_code_number_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('welcome_pdf_first_page_image_id')?.classList.remove('no_right_padding_for_vid_design_img_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.textAlign = 'left';
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.float = 'left';
        document.getElementById('package_clint_code_number_p_id').style.textAlign = 'right';
        document.getElementById('package_clint_code_number_p_id').style.float = 'right';


        /* Show all icons elements */
        document.querySelectorAll('.pdf_section_title_div_class').forEach(section => {
            section.querySelectorAll('ion-icon').forEach(icon => {
                icon.style.display = '';
            });
        });


        /* Hide the clint deposit noted p element */
        if (document.getElementById('vid_clint_deposit_note_p_id')) {
            document.getElementById('vid_clint_deposit_note_p_id').style.display = 'none';
        }



        // Change to white text on blue background
        imgElements.forEach(img => {
            img.src = '../middle-pdf-image.jpg'; // Google blue background
        });


        document.getElementById('welcome_pdf_first_page_image_id').src = 'first-pdf-image.jpg';
        /* document.getElementById('inserted_package_important_notes_data_section_page_image_id').src = 'last-pdf-image.jpg'; */

        document.getElementById('package_clint_code_number_p_id').style.display = 'none';



    } else {

        // Change to white text on blue background
        h6Elements.forEach(h6 => {
            h6.style.backgroundColor = 'rgb(161, 45, 10)';
        });

        // Change to white text on blue background
        divElements.forEach(div => {
            div.style.backgroundColor = 'rgb(207, 83, 21)';
        });



        // Remove class from all elements with class "pdf_section_title_div_class"
        document.querySelectorAll('.pdf_section_title_div_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_h6_class');
        });
        document.querySelectorAll('.inserted_main_row_color_class').forEach(div => {
            div.classList.remove('no_right_padding_for_vid_design_div_class');
        });
        document.querySelectorAll('.special_package_including_data_background_color_text').forEach(p => {
            p.style.background = 'rgb(85, 127, 137)';
        });
        // Remove class from elements with specified IDs
        document.getElementById('package_clint_code_number_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id')?.classList.remove('no_right_padding_for_vid_design_p_class');
        document.getElementById('welcome_pdf_first_page_image_id')?.classList.remove('no_right_padding_for_vid_design_img_class');
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.textAlign = 'left';
        document.getElementById('package_user_code_name_for_later_import_reference_p_id').style.float = 'left';
        document.getElementById('package_clint_code_number_p_id').style.textAlign = 'right';
        document.getElementById('package_clint_code_number_p_id').style.float = 'right';


        /* Show all icons elements */
        document.querySelectorAll('.pdf_section_title_div_class').forEach(section => {
            section.querySelectorAll('ion-icon').forEach(icon => {
                icon.style.display = '';
            });
        });



        /* Hide the clint deposit noted p element */
        if (document.getElementById('vid_clint_deposit_note_p_id')) {
            document.getElementById('vid_clint_deposit_note_p_id').style.display = 'none';
        }



        // Change to white text on blue background
        imgElements.forEach(img => {
            img.src = '../middle-pdf-image.jpg';
        });

        document.getElementById('welcome_pdf_first_page_image_id').src = `../خلفية-الشركات/${document.getElementById('clint_company_name_input_id').value.replace(/\s+/g, '-')}.jpg`;
        /* document.getElementById('inserted_package_important_notes_data_section_page_image_id').src = 'last-pdf-image.jpg'; */

        document.getElementById('package_clint_code_number_p_id').style.display = 'none';
    }





    // Check which sections are visible
    let visibleSections = [];

    sectionsToInclude.forEach(sectionId => {
        let section = document.getElementById(sectionId);
        if (section && isVisible(section)) {
            visibleSections.push(section);
        }
    });

    if (visibleSections.length === 0) {
        return;
    }

    let scale = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 3.3 : 3.3;
    let pdf = null;
    let pdfWidth = 210;

    // Always keep important notes and clint movements as separate pages
    let importantNotesSection = visibleSections.find(s => s.id === 'downloaded_pdf_important_notes_data_page');
    let clintMovementsSection = visibleSections.find(s => s.id === 'downloaded_pdf_clint_movements_data_page');
    let regularSections = visibleSections.filter(s =>
        s.id !== 'downloaded_pdf_important_notes_data_page' &&
        s.id !== 'downloaded_pdf_clint_movements_data_page'
    );

    // Helper: merge up to two canvases vertically into one
    let mergeCanvasesVertically = function (topCanvas, bottomCanvas) {
        let mergedWidth = Math.max(topCanvas.width, bottomCanvas ? bottomCanvas.width : 0);
        let mergedHeight = topCanvas.height + (bottomCanvas ? bottomCanvas.height : 0);
        let merged = document.createElement('canvas');
        merged.width = mergedWidth;
        merged.height = mergedHeight;
        let ctx = merged.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, merged.width, merged.height);
        // Center each canvas horizontally if widths differ
        let topX = Math.floor((mergedWidth - topCanvas.width) / 2);
        ctx.drawImage(topCanvas, topX, 0);
        if (bottomCanvas) {
            let bottomX = Math.floor((mergedWidth - bottomCanvas.width) / 2);
            ctx.drawImage(bottomCanvas, bottomX, topCanvas.height);
        }
        return merged;
    };

    // Process regular sections in pairs (2 per PDF page)
    for (let i = 0; i < regularSections.length; i += 2) {
        let firstSection = regularSections[i];
        let secondSection = regularSections[i + 1];

        let firstCanvas = await captureCanvas(firstSection, scale);
        if (!firstCanvas) { continue; }

        let secondCanvas = null;
        if (secondSection) {
            secondCanvas = await captureCanvas(secondSection, scale);
        }

        let combinedCanvas = mergeCanvasesVertically(firstCanvas, secondCanvas);
        let pdfHeight = (combinedCanvas.height * pdfWidth) / combinedCanvas.width;
        if (!pdf) {
            pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
        } else {
            pdf.addPage([pdfWidth, pdfHeight]);
        }
        let imgData = combinedCanvas.toDataURL('image/jpeg', 0.9);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
    }

    // Add Clint Movements as a separate page (if visible)
    if (clintMovementsSection) {
        let movementsCanvas = await captureCanvas(clintMovementsSection, scale);
        if (movementsCanvas) {
            movementsCanvas = adjustClintMovementsCanvas(movementsCanvas);
            let pdfHeight = (movementsCanvas.height * pdfWidth) / movementsCanvas.width;
            if (!pdf) {
                pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
            } else {
                pdf.addPage([pdfWidth, pdfHeight]);
            }
            let imgData = movementsCanvas.toDataURL('image/jpeg', 0.9);
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
        }
    }

    // Add Important Notes as the final separate page (if visible)
    if (importantNotesSection) {
        let notesCanvas = await captureCanvas(importantNotesSection, scale);
        if (notesCanvas) {
            let pdfHeight = (notesCanvas.height * pdfWidth) / notesCanvas.width;
            if (!pdf) {
                pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
            } else {
                pdf.addPage([pdfWidth, pdfHeight]);
            }
            let imgData = notesCanvas.toDataURL('image/jpeg', 0.9);
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
        }
    }

    if (pdf) {
        pdf.save(pdfName);
    }

    // Hide all images with class name of 'inserted_package_data_section_page_image_class'
    images.forEach(img => {
        img.style.display = 'none';
    });


    /* Hide All The Important Notes Divs After Downloading The PDF */
    // Loop through each and set display to 'none'
    notesDivs.forEach(div => {
        div.style.display = 'none';
    });


    // Hide the the last pdf page (thank you page)
    document.getElementById('downloaded_pdf_important_notes_data_page').style.display = 'none';



    // The important notes page is now handled by sectionsToInclude, so no need to explicitly hide it here.
    document.getElementById('inserted_company_name_image_position_div').style.display = 'flex';


    // Play a sound effect
    playSoundEffect('success');



    let packageUserCodeNameForLaterImportReferenceP = document.getElementById('package_user_code_name_for_later_import_reference_p_id').innerText;
    document.getElementById('use_website_user_code_name_as_downloaded_pdf_file_name_p_id').innerText = `استخدم كود صاحب البكج ${packageUserCodeNameForLaterImportReferenceP}`;


    /* Call a function to highlight the Saturday and Sanday days */
    highlightWeekendClintMovements();
};

// Helper function to check if an element is visible
function isVisible(element) {
    return element.offsetWidth > 0 && element.offsetHeight > 0;
}



/* Function to check if the clint movements data div is visible or no */
downloadOnlyClintMovementsDataFunction = function () {

    if (document.getElementById('downloaded_pdf_clint_movements_data_page').style.display !== 'none') {


        let formPromise = Promise.resolve(); // Default to a resolved promise

        // Only call submitForm if 'existingDataStatus' is equal to "newData"
        if (websiteUserUniqueNumber === "newUniqueNumber") {
            handleUserPackageUniqueNumber(document.getElementById('website_users_name_input_id').value, 'insert');
        }



        // Play a sound effect
        playSoundEffect('success');


        document.getElementById('download_clint_movements_data_p_id').style.backgroundColor = 'rgb(0, 46, 57)';
        document.getElementById('download_clint_movements_data_p_id').innerText = 'جاري التحميل..';


        // Ensure 'handleUserPackageUniqueNumber' function that is called above to completes first, then call the sendDataToSupabase
        formPromise
            .then(() => {
                sendDataToSupabase();
            })
            .then(() => {
                /* Call a function to dowwnload the clint movements data */
                runDownloadOnlyClintMovementsDataFunction();
            });


    } else {

        // Play a sound effect
        playSoundEffect('error');

        document.getElementById('download_clint_movements_data_p_id').style.backgroundColor = 'red';
        // Set the background color of the submit icon back to default color
        setTimeout(() => {
            document.getElementById('download_clint_movements_data_p_id').style.backgroundColor = 'rgb(0, 87, 116)';
        }, 500);

    }

}

/* Function to download only trtthe clint movements data */
runDownloadOnlyClintMovementsDataFunction = async function () {

    // Target all divs with the class "clint_movements_row_class_for_editing"
    let clintMovementDivs = document.querySelectorAll(".clint_movements_row_class_for_editing");

    // Iterate through each found clint_movements_row_class_for_editing div
    clintMovementDivs.forEach(clintMovementDiv => {
        // Target all child divs inside the current clint_movements_row_class_for_editing div
        let childDivs = clintMovementDiv.querySelectorAll("div");

        // Set background to white and color to black for each child div
        childDivs.forEach(childDiv => {
            childDiv.style.backgroundColor = "white";
            childDiv.style.color = "black";
        });
    });



    let { jsPDF } = window.jspdf;

    // Function to capture a canvas of the Clint Movements section
    let captureCanvas = async function (section, scale) {
        try {
            // Ensure resources are loaded and elements are visible before capturing
            await new Promise(resolve => setTimeout(resolve, 500)); // Increase the wait to 500ms

            let canvas = await html2canvas(section, {
                scale: scale,
                backgroundColor: 'white',
                scrollY: 0,
                useCORS: true, // Ensure cross-origin images are loaded correctly
                logging: false // Disable logging to improve speed
            });
            return canvas;
        } catch (error) {
        }
    };

    // Function to adjust the canvas of the Clint Movements page
    let adjustClintMovementsCanvas = function (canvas) {
        let pdfWidth = 210; // A4 width in mm
        let pdfHeight = 297; // A4 height in mm
        let scaleFactor = canvas.width / pdfWidth;

        // Calculate the minimum required height in pixels for the A4 page
        let minHeight = pdfHeight * scaleFactor;

        // If the canvas is shorter than the minimum height, pad it with empty space
        if (canvas.height < minHeight) {
            let paddedCanvas = document.createElement('canvas');
            paddedCanvas.width = canvas.width;
            paddedCanvas.height = minHeight;

            let context = paddedCanvas.getContext('2d');
            context.fillStyle = '#ffffff'; // Set background color to white
            context.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
            context.drawImage(canvas, 0, 0);

            return paddedCanvas;
        }

        return canvas;
    };


    let pdfName = '';


    if (document.getElementById('clint_company_name_input_id').value !== '') {

        // Replace spaces with dashes in the company name
        let companyNameWithoutSpaces = document.getElementById('clint_company_name_input_id').value.replace(/\s+/g, '-');

        // in case there is campany name then set the company name as the first pdf image inside the 'downloaded_pdf_clint_movements_data_page'
        document.getElementById('downloaded_pdf_clint_movements_data_page').querySelector('img').src = `../خلفية-الشركات/${companyNameWithoutSpaces}.jpg`;


        /* Name the clint movements data pdf file */
        pdfName = `جدول تحركات ${document.getElementById('clint_company_name_input_id').value} ${document.getElementById('store_google_sheet_package_raw_user_with_no_riv_for_later_reference_when_importing').innerText}`;

    } else {

        // in case there is no campany name then set the default first pdf image to the first image inside the 'downloaded_pdf_clint_movements_data_page'
        document.getElementById('downloaded_pdf_clint_movements_data_page').querySelector('img').src = 'first-pdf-image.jpg';


        /* Name the clint movements data pdf file */
        pdfName = `جدول تحركات بكج ${document.getElementById('store_google_sheet_package_raw_user_with_no_riv_for_later_reference_when_importing').innerText}`;
    }


    // Find the first image:
    document.getElementById('downloaded_pdf_clint_movements_data_page').querySelector('img').style.display = 'inline';

    // Find the second image:
    document.getElementById('downloaded_pdf_clint_movements_data_page').querySelectorAll('img')[1].src = 'last-pdf-image.jpg';
    document.getElementById('downloaded_pdf_clint_movements_data_page').querySelectorAll('img')[1].style.display = 'inline';




    /* Show All The Important Notes Divs Before Downloading The PDF */
    // Select all divs with the given class name
    const notesDivs = document.querySelectorAll('.Important_notes_for_each_pdf_section_div_class');
    // Loop through each and set display to 'block'
    notesDivs.forEach(div => {
        div.style.display = 'block';
    });





    // Show the Clint Movements section and hide the company name image
    let section = document.getElementById('downloaded_pdf_clint_movements_data_page');

    // Check if the section is visible
    if (!section || !isVisible(section)) {
        return;
    }

    let scale = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 3.3 : 3.3;

    // Capture the Clint Movements section as a canvas
    let combinedCanvas = await captureCanvas(section, scale);
    if (!combinedCanvas) {
        return;
    }

    // Adjust the captured canvas to fit the A4 size
    combinedCanvas = adjustClintMovementsCanvas(combinedCanvas);

    let pdf = new jsPDF('p', 'mm', 'a4');
    let pdfWidth = 210;
    let pdfHeight = (combinedCanvas.height * pdfWidth) / combinedCanvas.width;

    // Add the captured Clint Movements section to the PDF
    pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
    let imgData = combinedCanvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');

    // Save the PDF with the custom name
    pdf.save(pdfName);



    /* Hide All The Important Notes Divs After Downloading The PDF */
    // Loop through each and set display to 'none'
    notesDivs.forEach(div => {
        div.style.display = 'none';
    });


    // Play a sound effect
    playSoundEffect('success');


    /* Call a function to highlight the Saturday and Sunday days */
    highlightWeekendClintMovements();


    document.getElementById('download_clint_movements_data_p_id').style.backgroundColor = 'rgb(0, 87, 116)';
    document.getElementById('download_clint_movements_data_p_id').innerText = 'تحميل التحركات';


    // Reset all clint movements images src to the default image 'middle-pdf-image.jpg'
    document.getElementById('downloaded_pdf_clint_movements_data_page').querySelector('img').style.display = 'none';
    document.getElementById('downloaded_pdf_clint_movements_data_page').querySelectorAll('img')[1].style.display = 'none';

    document.getElementById('downloaded_pdf_clint_movements_data_page').querySelector('img').src = 'middle-pdf-image.jpg';
    document.getElementById('downloaded_pdf_clint_movements_data_page').querySelectorAll('img')[1].src = 'middle-pdf-image.jpg';
};