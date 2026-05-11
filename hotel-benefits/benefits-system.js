(() => {
    // ======================= CONFIGURATION =======================
    const SUPABASE_URL = "https://zrunsrimyijarswjfycw.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydW5zcmlteWlqYXJzd2pmeWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjgzOTEsImV4cCI6MjA2MjMwNDM5MX0.UdW4LiIY-t1jZlrat1VUGnW0yRE7YEzW5SHbpkE29H8";
    const TABLE_NAME = "indo_hotel_benefits";
    const ADMIN_PASSWORD_STORAGE_KEY = "hotel_benefits_admin_password";
    const ADMIN_PASSWORD_VALUE = "bndr123";

    let sbClient = null;
    let supportsIsHiddenColumn = true;
    let hotelSearchQuery = "";
    let hotelPickerModalRefs = null;
    let adminAccessHideTimer = null;
    let hotelPickerHideTimer = null;
    let allHotelsModalRefs = null;
    let allHotelsHideTimer = null;

    const resolvedHotelNames = (() => {
        if (typeof hotelNames !== "undefined" && Array.isArray(hotelNames)) return hotelNames;
        if (Array.isArray(window.hotelNames)) return window.hotelNames;
        return [];
    })();

    const allowedHotelNames = Array.isArray(resolvedHotelNames)
        ? [...new Set(resolvedHotelNames.map(name => String(name).trim()).filter(Boolean))]
        : [];
    const allowedHotelNameSet = new Set(allowedHotelNames);

    function toTitleCase(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    function attachLiveTitleCase(inputEl) {
        if (!inputEl) return;
        inputEl.addEventListener("input", () => {
            const cursorPos = inputEl.selectionStart ?? inputEl.value.length;
            inputEl.value = toTitleCase(inputEl.value);
            inputEl.setSelectionRange(cursorPos, cursorPos);
        });
        inputEl.addEventListener("blur", () => {
            inputEl.value = toTitleCase(inputEl.value).trim();
        });
    }

    function autoResizeTextarea(textareaEl) {
        if (!textareaEl) return;
        textareaEl.style.height = "auto";
        textareaEl.style.height = `${textareaEl.scrollHeight}px`;
    }

    function showToast(msg, isError = false) {
        let toast = document.querySelector(".toast-msg");
        if (toast) toast.remove();
        const div = document.createElement("div");
        div.className = "toast-msg";
        div.style.background = isError ? "#aa2e1c" : "#1f6e43";
        div.innerHTML = `<i class="fas ${isError ? "fa-exclamation-triangle" : "fa-check-circle"}"></i> ${msg}`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3200);
    }

    function hasSaveAccess() {
        try {
            return localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) === ADMIN_PASSWORD_VALUE;
        } catch (err) {
            return false;
        }
    }

    function updateSaveButtonAccessState() {
        const saveBtn = document.getElementById("saveAllBtn");
        if (!saveBtn) return;
        const accessGranted = hasSaveAccess();
        saveBtn.disabled = !accessGranted;
        saveBtn.title = accessGranted
            ? "Save changes to database"
            : "Admin password required to save";
    }

    function applyAdminPasswordFromInput() {
        const input = document.getElementById("adminPasswordInput");
        if (!input) return;
        const typedPassword = (input.value || "").trim();

        if (typedPassword !== ADMIN_PASSWORD_VALUE) {
            showToast("Incorrect admin password", true);
            updateSaveButtonAccessState();
            return;
        }

        try {
            localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, typedPassword);
            showToast("Admin access granted", false);
            closeAdminAccessBox();
            input.value = "";
        } catch (err) {
            showToast("Cannot write to local storage", true);
        }
        updateSaveButtonAccessState();
    }

    function openAdminAccessBox() {
        const accessBox = document.getElementById("adminAccessBox");
        const adminPasswordInput = document.getElementById("adminPasswordInput");
        if (!accessBox) return;
        if (adminAccessHideTimer) {
            clearTimeout(adminAccessHideTimer);
            adminAccessHideTimer = null;
        }
        accessBox.hidden = false;
        requestAnimationFrame(() => {
            accessBox.classList.add("is-open");
            adminPasswordInput?.focus();
        });
    }

    function closeAdminAccessBox() {
        const accessBox = document.getElementById("adminAccessBox");
        const adminPasswordInput = document.getElementById("adminPasswordInput");
        if (!accessBox) return;
        accessBox.classList.remove("is-open");
        if (adminAccessHideTimer) clearTimeout(adminAccessHideTimer);
        adminAccessHideTimer = setTimeout(() => {
            accessBox.hidden = true;
            adminAccessHideTimer = null;
        }, 240);
        if (adminPasswordInput) adminPasswordInput.value = "";
    }

    function normalizeBenefits(benefits) {
        if (!Array.isArray(benefits)) return [];
        return benefits.map(item => String(item || "").trim()).filter(Boolean);
    }

    function areStringArraysEqual(a, b) {
        const arrA = Array.isArray(a) ? a : [];
        const arrB = Array.isArray(b) ? b : [];
        if (arrA.length !== arrB.length) return false;
        for (let i = 0; i < arrA.length; i += 1) {
            if (arrA[i] !== arrB[i]) return false;
        }
        return true;
    }

    function splitBenefitsAndExpiredInfo(benefits) {
        const normalized = normalizeBenefits(benefits);
        if (!normalized.length) return { benefitsOnly: [], bookingPeriodText: "", expiredText: "" };
        const benefitsOnly = [];
        let bookingPeriodText = "";
        let expiredText = "";

        normalized.forEach(line => {
            const bookingMatch = line.match(/^booking\s*period\s*:\s*(.+)$/i);
            if (bookingMatch) {
                bookingPeriodText = bookingMatch[1].trim();
                return;
            }
            const expiredMatch = line.match(/^(expired|expiry)\s*:\s*(.+)$/i);
            if (expiredMatch) {
                expiredText = expiredMatch[2].trim();
                return;
            }
            benefitsOnly.push(line);
        });

        return { benefitsOnly, bookingPeriodText, expiredText };
    }

    function ensureHotelNamesDatalist(listId = "hotelNamesDatalist") {
        let datalist = document.getElementById(listId);
        if (datalist) return datalist;
        datalist = document.createElement("datalist");
        datalist.id = listId;
        allowedHotelNames.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            datalist.appendChild(option);
        });
        document.body.appendChild(datalist);
        return datalist;
    }

    function setupHotelNameInput(inputEl, selectedName) {
        if (!inputEl) return;
        inputEl.type = "text";
        inputEl.autocomplete = "off";
        inputEl.placeholder = "Type hotel name...";
        inputEl.setAttribute("list", "hotelNamesDatalist");
        ensureHotelNamesDatalist("hotelNamesDatalist");
        inputEl.value = selectedName || "";
        inputEl.addEventListener("input", () => setHotelNameInputValidity(inputEl));
        inputEl.addEventListener("blur", () => setHotelNameInputValidity(inputEl));
    }

    function createBenefitRow(benefitText) {
        const row = document.createElement("div");
        row.className = "benefit-row";
        const input = document.createElement("textarea");
        input.className = "benefit-input";
        input.value = benefitText;
        input.rows = 1;
        input.placeholder = "example, Min 2 nights = floating breakfast";
        attachLiveTitleCase(input);
        input.addEventListener("input", () => autoResizeTextarea(input));
        input.addEventListener("blur", () => autoResizeTextarea(input));
        requestAnimationFrame(() => autoResizeTextarea(input));
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-benefit";
        removeBtn.innerHTML = '<i class="fas fa-times-circle"></i>';
        removeBtn.addEventListener("click", () => {
            const currentValue = (input.value || "").trim();
            if (!currentValue) {
                row.remove();
                return;
            }
            const shouldDelete = confirm("This benefit has text. Delete it?");
            if (shouldDelete) row.remove();
        });
        row.appendChild(input);
        row.appendChild(removeBtn);
        return row;
    }

    function getCurrentCardHotelNames() {
        const cards = document.querySelectorAll(".hotel-card .hotel-name-input");
        return new Set(
            [...cards]
                .map(select => (select.value || "").trim())
                .filter(Boolean)
        );
    }

    function getCurrentCardHotelNamesLowerSet() {
        const cards = document.querySelectorAll(".hotel-card .hotel-name-input");
        return new Set(
            [...cards]
                .map(input => (input.value || "").trim().toLowerCase())
                .filter(Boolean)
        );
    }

    async function copyTextToClipboard(text) {
        if (!text) return false;
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                // Ignore and fallback to legacy copy.
            }
        }
        const tempTextarea = document.createElement("textarea");
        tempTextarea.value = text;
        tempTextarea.setAttribute("readonly", "");
        tempTextarea.style.position = "fixed";
        tempTextarea.style.opacity = "0";
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(tempTextarea);
        return copied;
    }

    function ensureAllHotelsModal() {
        if (allHotelsModalRefs) return allHotelsModalRefs;

        const overlay = document.createElement("div");
        overlay.className = "all-hotels-overlay";
        overlay.hidden = true;
        overlay.innerHTML = `
        <div class="all-hotels-modal" role="dialog" aria-modal="true" aria-labelledby="allHotelsTitle">
            <div class="all-hotels-modal-head">
                <h3 id="allHotelsTitle">All Hotels</h3>
                <div id="allHotelsSummary" class="all-hotels-summary"></div>
            </div>
            <input id="allHotelsSearchInput" class="all-hotels-search" type="text" placeholder="Search hotel name..." list="allHotelsDatalist" autocomplete="off">
            <datalist id="allHotelsDatalist"></datalist>
            <div id="allHotelsList" class="all-hotels-list"></div>
            <div class="all-hotels-actions">
                <button id="closeAllHotelsBtn" type="button" class="btn-outline">Close</button>
            </div>
        </div>
    `;
        document.body.appendChild(overlay);

        const searchInput = overlay.querySelector("#allHotelsSearchInput");
        const datalistEl = overlay.querySelector("#allHotelsDatalist");
        const listEl = overlay.querySelector("#allHotelsList");
        const summaryEl = overlay.querySelector("#allHotelsSummary");
        const closeBtn = overlay.querySelector("#closeAllHotelsBtn");

        datalistEl.innerHTML = "";
        allowedHotelNames.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            datalistEl.appendChild(option);
        });

        closeBtn.addEventListener("click", () => closeAllHotelsModal());
        overlay.addEventListener("click", e => {
            if (e.target === overlay) closeAllHotelsModal();
        });
        searchInput.addEventListener("keydown", e => {
            if (e.key === "Escape") closeAllHotelsModal();
        });
        searchInput.addEventListener("input", () => renderAllHotelsList());
        listEl.addEventListener("click", async e => {
            const clickedItem = e.target.closest(".all-hotels-item");
            if (!clickedItem) return;
            const hotelName = (clickedItem.dataset.hotelName || "").trim();
            if (!hotelName) return;
            const copied = await copyTextToClipboard(hotelName);
            showToast(copied ? `Copied: ${hotelName}` : "Could not copy hotel name", !copied);
        });

        allHotelsModalRefs = { overlay, searchInput, listEl, summaryEl };
        return allHotelsModalRefs;
    }

    function renderAllHotelsList() {
        const refs = ensureAllHotelsModal();
        const { searchInput, listEl, summaryEl } = refs;
        const query = (searchInput.value || "").trim().toLowerCase();
        const existingHotelNamesLowerSet = getCurrentCardHotelNamesLowerSet();

        const filteredNames = allowedHotelNames.filter(name => name.toLowerCase().includes(query));
        const addedCount = filteredNames.filter(name => existingHotelNamesLowerSet.has(name.toLowerCase())).length;
        const missingCount = filteredNames.length - addedCount;

        summaryEl.textContent = `Added: ${addedCount} || Missing: ${missingCount}`;

        if (!filteredNames.length) {
            listEl.innerHTML = '<div class="all-hotels-empty">No hotels match your search.</div>';
            return;
        }

        listEl.innerHTML = filteredNames.map(name => {
            const isAdded = existingHotelNamesLowerSet.has(name.toLowerCase());
            const statusClass = isAdded ? "hotel-status-added" : "hotel-status-missing";
            const statusText = isAdded ? "Added" : "Missing";
            return `
                <div class="all-hotels-item" data-hotel-name="${name.replace(/"/g, "&quot;")}">
                    <div class="all-hotels-name">${name}</div>
                    <span class="hotel-status-badge ${statusClass}">${statusText}</span>
                </div>
            `;
        }).join("");
    }

    function openAllHotelsModal() {
        const { overlay, searchInput } = ensureAllHotelsModal();
        if (allHotelsHideTimer) {
            clearTimeout(allHotelsHideTimer);
            allHotelsHideTimer = null;
        }
        overlay.hidden = false;
        renderAllHotelsList();
        requestAnimationFrame(() => overlay.classList.add("is-open"));
        setTimeout(() => searchInput.focus(), 0);
    }

    function closeAllHotelsModal() {
        const { overlay, searchInput } = ensureAllHotelsModal();
        overlay.classList.remove("is-open");
        if (allHotelsHideTimer) clearTimeout(allHotelsHideTimer);
        allHotelsHideTimer = setTimeout(() => {
            overlay.hidden = true;
            allHotelsHideTimer = null;
        }, 240);
        searchInput.value = "";
    }

    function ensureHotelPickerModal() {
        if (hotelPickerModalRefs) return hotelPickerModalRefs;

        const overlay = document.createElement("div");
        overlay.className = "hotel-picker-overlay";
        overlay.hidden = true;
        overlay.innerHTML = `
        <div class="hotel-picker-modal" role="dialog" aria-modal="true" aria-labelledby="hotelPickerTitle">
            <h3 id="hotelPickerTitle">Choose Hotel Name</h3>
            <input id="hotelPickerInput" class="hotel-picker-input" type="text" placeholder="Type hotel name..." list="hotelPickerDatalist" autocomplete="off">
            <datalist id="hotelPickerDatalist"></datalist>
            <div class="hotel-picker-actions">
                <button type="button" class="btn-outline" id="cancelHotelPickBtn">Cancel</button>
                <button type="button" class="btn-primary" id="confirmHotelPickBtn">Add Hotel Card</button>
            </div>
        </div>
    `;

        document.body.appendChild(overlay);

        const inputEl = overlay.querySelector("#hotelPickerInput");
        const datalistEl = overlay.querySelector("#hotelPickerDatalist");
        const cancelBtn = overlay.querySelector("#cancelHotelPickBtn");
        const confirmBtn = overlay.querySelector("#confirmHotelPickBtn");

        cancelBtn.addEventListener("click", () => {
            closeHotelPickerModal();
        });

        overlay.addEventListener("click", e => {
            if (e.target === overlay) closeHotelPickerModal();
        });

        inputEl.addEventListener("keydown", e => {
            if (e.key === "Escape") closeHotelPickerModal();
        });

        hotelPickerModalRefs = { overlay, inputEl, datalistEl, confirmBtn };
        return hotelPickerModalRefs;
    }

    function openHotelPickerModal() {
        const { overlay } = ensureHotelPickerModal();
        if (hotelPickerHideTimer) {
            clearTimeout(hotelPickerHideTimer);
            hotelPickerHideTimer = null;
        }
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add("is-open"));
    }

    function closeHotelPickerModal() {
        const { overlay } = ensureHotelPickerModal();
        overlay.classList.remove("is-open");
        if (hotelPickerHideTimer) clearTimeout(hotelPickerHideTimer);
        hotelPickerHideTimer = setTimeout(() => {
            overlay.hidden = true;
            hotelPickerHideTimer = null;
        }, 240);
    }

    function openAddHotelPicker() {
        const { inputEl, datalistEl, confirmBtn } = ensureHotelPickerModal();
        const existingNames = getCurrentCardHotelNames();

        inputEl.value = "";
        inputEl.classList.remove("invalid-choice");
        datalistEl.innerHTML = "";

        allowedHotelNames.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            datalistEl.appendChild(option);
        });

        const handleDuplicateSelection = () => {
            const selectedName = (inputEl.value || "").trim();
            if (!selectedName) return false;
            if (!existingNames.has(selectedName)) return false;
            alert("This hotel already exist");
            inputEl.value = "";
            return true;
        };

        inputEl.oninput = () => {
            const currentValue = (inputEl.value || "").trim();
            const hasValue = currentValue.length > 0;
            const validName = allowedHotelNameSet.has(currentValue);
            inputEl.classList.toggle("invalid-choice", hasValue && !validName);
        };

        confirmBtn.onclick = () => {
            if (handleDuplicateSelection()) return;
            const selectedName = (inputEl.value || "").trim();
            if (!selectedName) {
                alert("Please choose a hotel name first.");
                return;
            }
            if (!allowedHotelNameSet.has(selectedName)) {
                inputEl.classList.add("invalid-choice");
                alert(`Invalid hotel name: "${selectedName}". Please choose from suggestions.`);
                return;
            }
            addHotelCardByName(selectedName);
            closeHotelPickerModal();
        };

        openHotelPickerModal();
        setTimeout(() => inputEl.focus(), 0);
    }

    function setHotelNameInputValidity(nameInput) {
        const value = nameInput.value.trim();
        const isValid = value !== "" && allowedHotelNameSet.has(value);
        nameInput.classList.toggle("invalid-choice", !isValid && value !== "");
        return isValid;
    }

    function applyHotelHiddenVisualState(card, hideToggleBtn, isHidden) {
        card.dataset.hidden = isHidden ? "true" : "false";
        card.classList.toggle("hotel-card-hidden", isHidden);
        hideToggleBtn.classList.toggle("is-show-state", isHidden);
        hideToggleBtn.innerHTML = isHidden
            ? '<i class="fas fa-eye"></i> Show'
            : '<i class="fas fa-eye-slash"></i> Hide';
    }

    function applyHotelsFilter() {
        const cards = document.querySelectorAll(".hotel-card");
        const normalizedQuery = hotelSearchQuery.trim().toLowerCase();
        cards.forEach(card => {
            const hotelName = (card.querySelector(".hotel-name-input")?.value || "").toLowerCase();
            const matches = !normalizedQuery || hotelName.includes(normalizedQuery);
            card.style.display = matches ? "" : "none";
        });
    }

    function renderHotels(hotelsArray) {
        const container = document.getElementById("hotelsContainer");
        if (!container) return;

        if (!hotelsArray.length) {
            container.innerHTML = '<div class="loading-overlay" style="grid-column:1/-1"><i class="fas fa-hotel"></i> No hotels yet. Click "Add Hotel" to start.</div>';
            return;
        }

        container.innerHTML = "";

        hotelsArray.forEach(hotel => {
            const card = document.createElement("div");
            card.className = "hotel-card";
            card.dataset.id = hotel.id ? String(hotel.id) : "";
            card.dataset.hidden = hotel.isHidden ? "true" : "false";

            const headerDiv = document.createElement("div");
            headerDiv.className = "card-header";
            const nameInput = document.createElement("input");
            nameInput.className = "hotel-name-input";
            setupHotelNameInput(nameInput, hotel.hotelName || "");
            headerDiv.appendChild(nameInput);

            const benefitsSection = document.createElement("div");
            benefitsSection.className = "benefits-section";
            const benefitsTitle = document.createElement("div");
            benefitsTitle.className = "benefits-title";
            benefitsTitle.innerHTML = '<i class="fas fa-gift"></i> BENEFITS/NOTES';
            benefitsSection.appendChild(benefitsTitle);

            const benefitsList = document.createElement("div");
            benefitsList.className = "benefits-list";
            const { benefitsOnly, bookingPeriodText, expiredText } = splitBenefitsAndExpiredInfo(hotel.benefits);
            (benefitsOnly.length ? benefitsOnly : [""]).forEach(benefit => {
                const row = createBenefitRow(benefit);
                benefitsList.appendChild(row);
            });
            benefitsSection.appendChild(benefitsList);

            const addBenefitBtn = document.createElement("button");
            addBenefitBtn.className = "add-benefit-btn";
            addBenefitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add benefit';
            addBenefitBtn.addEventListener("click", e => {
                e.stopPropagation();
                benefitsList.appendChild(createBenefitRow(""));
            });
            benefitsSection.appendChild(addBenefitBtn);

            const bookingPeriodTitle = document.createElement("div");
            bookingPeriodTitle.className = "benefits-title booking-period-title";
            bookingPeriodTitle.innerHTML = '<i class="fas fa-calendar-alt"></i> STAY PERIOD';
            benefitsSection.appendChild(bookingPeriodTitle);

            const bookingPeriodInput = document.createElement("input");
            bookingPeriodInput.type = "text";
            bookingPeriodInput.className = "booking-period-input";
            bookingPeriodInput.placeholder = "Stay Period";
            bookingPeriodInput.value = bookingPeriodText;
            attachLiveTitleCase(bookingPeriodInput);
            benefitsSection.appendChild(bookingPeriodInput);

            const expiredTitle = document.createElement("div");
            expiredTitle.className = "benefits-title expired-title";
            expiredTitle.innerHTML = '<i class="fas fa-hourglass-end"></i> EXPIRE DATE';
            benefitsSection.appendChild(expiredTitle);

            const expiredInput = document.createElement("input");
            expiredInput.type = "text";
            expiredInput.className = "expired-info-input";
            expiredInput.placeholder = "Expired Date";
            expiredInput.value = expiredText;
            attachLiveTitleCase(expiredInput);
            benefitsSection.appendChild(expiredInput);

            const cardActions = document.createElement("div");
            cardActions.className = "card-actions";
            const hideToggleBtn = document.createElement("button");
            hideToggleBtn.className = "toggle-hide-hotel-btn";
            hideToggleBtn.addEventListener("click", () => {
                const isHidden = card.dataset.hidden === "true";
                applyHotelHiddenVisualState(card, hideToggleBtn, !isHidden);
                const currentName = nameInput.value.trim() || "Unnamed Hotel";
                showToast(
                    !isHidden
                        ? `"${currentName}" set to hidden (pending save)`
                        : `"${currentName}" set to visible (pending save)`,
                    false
                );
            });
            applyHotelHiddenVisualState(card, hideToggleBtn, Boolean(hotel.isHidden));
            cardActions.appendChild(hideToggleBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-hotel-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Hotel';
            deleteBtn.addEventListener("click", () => {
                const name = nameInput.value.trim() || "Unnamed Hotel";
                const shouldDelete = confirm(`Delete "${name}" from this list?`);
                if (!shouldDelete) return;
                card.remove();
                showToast(`"${name}" removed (pending save)`, false);
            });
            cardActions.appendChild(deleteBtn);

            card.appendChild(headerDiv);
            card.appendChild(benefitsSection);
            card.appendChild(cardActions);
            container.appendChild(card);
            setHotelNameInputValidity(nameInput);
        });

        applyHotelsFilter();
    }

    function collectHotelsFromDOM() {
        const cards = document.querySelectorAll(".hotel-card");
        const hotels = [];
        const errors = [];
        const seenHotelNames = new Set();

        cards.forEach(card => {
            const nameInput = card.querySelector(".hotel-name-input");
            const hotelName = (nameInput?.value || "").trim();
            const isNameValid = hotelName && allowedHotelNameSet.has(hotelName);
            if (!isNameValid) {
                nameInput?.classList.add("invalid-choice");
                errors.push(`Invalid hotel name: "${hotelName || "(empty)"}". Please choose from suggestions.`);
                return;
            }
            nameInput?.classList.remove("invalid-choice");

            if (seenHotelNames.has(hotelName)) {
                errors.push(`Duplicate hotel selected: "${hotelName}". Keep one card per hotel.`);
                return;
            }
            seenHotelNames.add(hotelName);

            const benefitRows = card.querySelectorAll(".benefit-row");
            const benefits = [];
            benefitRows.forEach(row => {
                const value = (row.querySelector(".benefit-input")?.value || "").trim();
                if (value) benefits.push(value);
            });
            const bookingPeriodInput = card.querySelector(".booking-period-input");
            const bookingPeriodText = (bookingPeriodInput?.value || "").trim();
            if (bookingPeriodText) benefits.push(`Stay Period: ${bookingPeriodText}`);
            const expiredInput = card.querySelector(".expired-info-input");
            const expiredText = (expiredInput?.value || "").trim();
            if (expiredText) benefits.push(`Expired: ${expiredText}`);

            hotels.push({
                id: card.dataset.id ? Number(card.dataset.id) : null,
                hotelName,
                benefits,
                isHidden: card.dataset.hidden === "true"
            });
        });

        return { hotels, errors };
    }

    async function loadAndRenderHotels() {
        const container = document.getElementById("hotelsContainer");
        if (!sbClient) {
            container.innerHTML = '<div class="loading-overlay" style="color:#b91c1c"><i class="fas fa-database"></i> Supabase client not configured.</div>';
            return;
        }
        try {
            container.innerHTML = '<div class="loading-overlay"><i class="fas fa-spinner fa-pulse"></i> Fetching hotels...</div>';
            let data = null;
            let error = null;
            const withHiddenRes = await sbClient
                .from(TABLE_NAME)
                .select("id, hotel_name, benefits, is_hidden")
                .order("id", { ascending: true });
            data = withHiddenRes.data;
            error = withHiddenRes.error;

            if (error && /is_hidden|column/i.test(String(error.message || ""))) {
                supportsIsHiddenColumn = false;
                const fallbackRes = await sbClient
                    .from(TABLE_NAME)
                    .select("id, hotel_name, benefits")
                    .order("id", { ascending: true });
                data = fallbackRes.data;
                error = fallbackRes.error;
                if (!error) showToast('Tip: add "is_hidden" column to enable Hide/Show in main page.', true);
            } else {
                supportsIsHiddenColumn = true;
            }

            if (error) throw error;

            const hotels = (data || []).map(row => ({
                id: row.id,
                hotelName: row.hotel_name,
                benefits: normalizeBenefits(row.benefits),
                isHidden: Boolean(row.is_hidden)
            }));
            renderHotels(hotels);
        } catch (err) {
            console.error(err);
            container.innerHTML = `<div class="loading-overlay" style="color:#a00">⚠️ Error loading data: ${err.message}</div>`;
            showToast("DB load error: check credentials/table", true);
        }
    }

    async function saveAllToSupabase() {
        if (!hasSaveAccess()) {
            showToast("Admin password required to save changes", true);
            updateSaveButtonAccessState();
            return;
        }

        if (!sbClient) {
            showToast("Supabase not configured", true);
            return;
        }

        const saveBtn = document.getElementById("saveAllBtn");
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Saving...';

        const { hotels, errors } = collectHotelsFromDOM();
        if (errors.length > 0) {
            showToast(errors[0], true);
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save to Database';
            return;
        }

        if (hotels.length === 0) {
            const confirmEmpty = confirm("No hotels found. This will clear the entire table. Proceed?");
            if (!confirmEmpty) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save to Database';
                return;
            }
        }

        try {
            let existingRows = null;
            let existingErr = null;
            if (supportsIsHiddenColumn) {
                const withHiddenRes = await sbClient
                    .from(TABLE_NAME)
                    .select("id, hotel_name, benefits, is_hidden");
                existingRows = withHiddenRes.data;
                existingErr = withHiddenRes.error;
                if (existingErr && /is_hidden|column/i.test(String(existingErr.message || ""))) {
                    supportsIsHiddenColumn = false;
                    const fallbackRes = await sbClient
                        .from(TABLE_NAME)
                        .select("id, hotel_name, benefits");
                    existingRows = fallbackRes.data;
                    existingErr = fallbackRes.error;
                }
            } else {
                const fallbackRes = await sbClient
                    .from(TABLE_NAME)
                    .select("id, hotel_name, benefits");
                existingRows = fallbackRes.data;
                existingErr = fallbackRes.error;
            }
            if (existingErr) throw existingErr;

            const normalizedExistingRows = (existingRows || []).map(row => ({
                id: row.id,
                hotelName: String(row.hotel_name || "").trim(),
                benefits: normalizeBenefits(row.benefits),
                isHidden: Boolean(row.is_hidden)
            }));

            const existingRowsById = new Map(
                normalizedExistingRows
                    .filter(row => Number.isInteger(row.id))
                    .map(row => [row.id, row])
            );

            const existingIds = new Set(normalizedExistingRows.map(row => row.id));
            const keptIds = new Set(hotels.filter(h => Number.isInteger(h.id)).map(h => h.id));
            const idsToDelete = [...existingIds].filter(id => !keptIds.has(id));
            if (idsToDelete.length) {
                const { error: deleteErr } = await sbClient.from(TABLE_NAME).delete().in("id", idsToDelete);
                if (deleteErr) throw deleteErr;
            }

            let insertedCount = 0;
            let updatedCount = 0;
            let deletedCount = idsToDelete.length;

            for (const hotel of hotels) {
                const payload = { hotel_name: hotel.hotelName, benefits: hotel.benefits };
                if (supportsIsHiddenColumn) payload.is_hidden = Boolean(hotel.isHidden);
                if (Number.isInteger(hotel.id)) {
                    const existingRow = existingRowsById.get(hotel.id);
                    const isChanged = !existingRow
                        || existingRow.hotelName !== hotel.hotelName
                        || !areStringArraysEqual(existingRow.benefits, hotel.benefits)
                        || (supportsIsHiddenColumn && existingRow.isHidden !== Boolean(hotel.isHidden));
                    if (!isChanged) continue;
                    const { error: updateErr } = await sbClient.from(TABLE_NAME).update(payload).eq("id", hotel.id);
                    if (updateErr) throw updateErr;
                    updatedCount += 1;
                } else {
                    const { error: insertErr } = await sbClient.from(TABLE_NAME).insert(payload);
                    if (insertErr) throw insertErr;
                    insertedCount += 1;
                }
            }

            const totalChanges = insertedCount + updatedCount + deletedCount;
            if (totalChanges === 0) {
                showToast("No changes detected. Database is already up to date.", false);
            } else {
                showToast(
                    `Saved changes - Added: ${insertedCount}, Updated: ${updatedCount}, Deleted: ${deletedCount}`,
                    false
                );
            }
            await loadAndRenderHotels();
        } catch (err) {
            console.error(err);
            showToast("Save failed: " + err.message, true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save to Database';
        }
    }

    function addHotelCardByName(hotelName) {
        const existing = collectHotelsFromDOM().hotels;
        const usedNames = new Set(existing.map(hotel => hotel.hotelName));
        const selectedName = String(hotelName || "").trim();
        if (!selectedName) return;
        if (usedNames.has(selectedName)) {
            alert("This hotel already exist");
            return;
        }
        if (!allowedHotelNameSet.has(selectedName)) {
            showToast(`"${selectedName}" is not in hotel list.`, true);
            return;
        }
        existing.push({ id: null, hotelName: selectedName, benefits: [""], isHidden: false });
        renderHotels(existing);
        const cards = document.querySelectorAll(".hotel-card");
        const newestCard = cards[cards.length - 1];
        newestCard?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        showToast(`"${selectedName}" added. Edit benefits then save.`, false);
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (!allowedHotelNames.length) {
            document.getElementById("hotelsContainer").innerHTML = '<div class="loading-overlay" style="color:#b91c1c"><i class="fas fa-exclamation-triangle"></i> hotelNames array is not loaded. Check script path.</div>';
            return;
        }

        try {
            sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error("Supabase init error", e);
        }

        if (!sbClient) {
            document.getElementById("hotelsContainer").innerHTML = '<div class="loading-overlay">❗ Supabase credentials are invalid or missing.</div>';
        } else {
            loadAndRenderHotels();
        }

        const openAdminAccessBtn = document.getElementById("openAdminAccessBtn");
        const openAllHotelsBtn = document.getElementById("openAllHotelsBtn");
        const adminAccessBox = document.getElementById("adminAccessBox");
        const applyAdminPasswordBtn = document.getElementById("applyAdminPasswordBtn");
        const adminPasswordInput = document.getElementById("adminPasswordInput");
        if (openAdminAccessBtn && adminAccessBox) {
            openAdminAccessBtn.addEventListener("click", () => {
                openAdminAccessBox();
            });
            adminAccessBox.addEventListener("click", e => {
                if (e.target === adminAccessBox) closeAdminAccessBox();
            });
        }
        applyAdminPasswordBtn?.addEventListener("click", applyAdminPasswordFromInput);
        adminPasswordInput?.addEventListener("keydown", e => {
            if (e.key === "Enter") applyAdminPasswordFromInput();
            if (e.key === "Escape") closeAdminAccessBox();
        });
        openAllHotelsBtn?.addEventListener("click", openAllHotelsModal);

        document.getElementById("addHotelBtn").addEventListener("click", openAddHotelPicker);
        document.getElementById("saveAllBtn").addEventListener("click", saveAllToSupabase);
        updateSaveButtonAccessState();
        const hotelSearchInput = document.getElementById("hotelSearchInput");
        if (hotelSearchInput) {
            hotelSearchInput.addEventListener("input", e => {
                hotelSearchQuery = (e.target.value || "").trim();
                applyHotelsFilter();
            });
        }
    });




    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();
