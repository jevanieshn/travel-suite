document.addEventListener('DOMContentLoaded', () => {
    // 1. Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // 2. Guest Capacity Mapping
    const roomGuestLimits = {
        'deluxe': 2,
        'suite': 4,
        'family': 6,
        'presidential': 8
    };

    // 3. Date Initialization and Formatting
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000); 

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const defaultCheckin = formatDate(today);
    const defaultCheckout = formatDate(tomorrow);
    
    // Set initial values in the input fields before Flatpickr initialization
    document.getElementById('checkin').value = defaultCheckin;
    document.getElementById('checkout').value = defaultCheckout;


    // 4. Flatpickr Initialization
    const checkoutPicker = flatpickr("#checkout", {
        minDate: tomorrow,
        dateFormat: "Y-m-d",
        disableMobile: true,
        defaultDate: defaultCheckout, 
    });

    const checkinPicker = flatpickr("#checkin", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disableMobile: true,
        defaultDate: defaultCheckin, 
        onChange: function(selectedDates) {
            if (selectedDates.length) {
                // Set checkout minDate to next day
                const nextDay = new Date(selectedDates[0].getTime() + 24 * 60 * 60 * 1000);
                checkoutPicker.set('minDate', nextDay);
                
                // If current checkout date is before the new minDate, clear it
                if (checkoutPicker.selectedDates.length && checkoutPicker.selectedDates[0] <= selectedDates[0]) {
                    checkoutPicker.clear();
                }
            }
        }
    });


    // 5. Availability Check Handler
    const btnAvailability = document.getElementById('btnAvailability');
    const availModal = new bootstrap.Modal(document.getElementById('availabilityModal'));

    btnAvailability.addEventListener('click', function (e) {
        e.preventDefault();

        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const room = document.getElementById('roomType').value;
        const roomText = document.getElementById('roomType').selectedOptions[0].text.split(' (Max')[0];
        const guests = parseInt(document.getElementById('guests').value);
        
        const guestLimit = roomGuestLimits[room];

        const msgEl = document.getElementById('modalMessage');
        const detailsEl = document.getElementById('modalDetails');
        const proceedBtn = document.getElementById('proceedBtn');

        // 1. Validation: Dates must be selected
        if (!checkin || !checkout) {
            msgEl.innerHTML = '<div class="alert alert-warning mb-0" role="alert"><i class="bi bi-calendar-x me-2"></i>Please select both **Check-in** and **Check-out** dates.</div>';
            detailsEl.textContent = '';
            proceedBtn.style.display = 'none';
            availModal.show();
            return;
        }

        const d1 = new Date(checkin);
        const d2 = new Date(checkout);
        
        // 2. Validation: Checkout must be after Check-in
        if (d2 <= d1) {
            msgEl.innerHTML = '<div class="alert alert-danger mb-0" role="alert"><i class="bi bi-exclamation-triangle-fill me-2"></i>Check-out date must be **after** the Check-in date.</div>';
            detailsEl.textContent = '';
            proceedBtn.style.display = 'none';
            availModal.show();
            return;
        }

        const nights = Math.round((d2 - d1) / (24 * 60 * 60 * 1000));
        let available = true;
        let reason = '';

        // 3. Validation: Guest Capacity Check
        if (guests > guestLimit) {
            available = false;
            reason = `The **${roomText}** can only accommodate up to ${guestLimit} guests. Please select a larger room type.`;
        }

        // 4. Simulated Availability Logic (e.g., fully booked on holidays)
        // Simple simulation: Assume low availability during Christmas week (Dec 20-27)
        if (d1.getMonth() === 11 && d1.getDate() >= 20 && d1.getDate() <= 27) {
            if (Math.random() < 0.8) { // 80% chance of being unavailable during peak season
                 available = false;
                 reason = 'High demand season. We are fully booked for some or all of your selected dates.';
            }
        }
        
        // --- Display Result in Modal ---
        if (available) {
            msgEl.innerHTML = '<div class="alert alert-success mb-0" role="alert"><i class="bi bi-check-circle-fill me-2"></i><strong>Great news!</strong> Your selection is available.</div>';
            detailsEl.innerHTML = `
                **Summary:**<br>
                Check-in: **${checkin}** | Check-out: **${checkout}**<br>
                Nights: **${nights}** | Room: **${roomText}** | Guests: **${guests}**
            `;
            proceedBtn.style.display = 'inline-block';
            // Placeholder link for reservation flow
            proceedBtn.href = `/reservation.html?checkin=${checkin}&checkout=${checkout}&room=${room}&guests=${guests}`;
        } else {
            msgEl.innerHTML = `<div class="alert alert-warning mb-0" role="alert"><i class="bi bi-info-circle-fill me-2"></i><strong>Limited availability.</strong></div>`;
            detailsEl.innerHTML = `<em>${reason}</em><br>Try adjusting your room type, guest count, or dates.`;
            proceedBtn.style.display = 'none';
        }

        availModal.show();
    });

    // 6. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a.nav-link, a.btn-book-now').forEach(a => {
        a.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                // Close the mobile menu after clicking a link
                if (window.innerWidth < 992) {
                    const navbarCollapse = document.getElementById('mainNav');
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    }
                }
                document.querySelector(href).scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});