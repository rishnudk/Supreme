
      

/// chatgpt validation

document.addEventListener("DOMContentLoaded", function () {
    const editAddressForm = document.getElementById("editAddressForm");
    const editAddressModal = new bootstrap.Modal(document.getElementById('editAddressModal'));

    editAddressForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form submission if validation fails
        let isValid = true;

        // Clear previous validation messages
        editAddressForm.querySelectorAll(".invalid-feedback").forEach(el => el.textContent = "");
        editAddressForm.querySelectorAll(".form-control, .form-select").forEach(el => el.classList.remove("is-invalid"));

        // Get form values
        const fullName = editAddressForm.elements["fullName"];
        const address = editAddressForm.elements["address"];
        const city = editAddressForm.elements["city"];
        const pincode = editAddressForm.elements["pincode"];
        const state = editAddressForm.elements["state"];
        const country = editAddressForm.elements["country"];
        const phone = editAddressForm.elements["phone"];
        const addressType = editAddressForm.elements["addressType"];

        // Regular expressions for validation
        const nameRegex = /^[A-Za-z\s]+$/;
        const pincodeRegex = /^\d{4,10}$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        // Validation function
        function validateField(field, regex, message) {
            if (!field.value.trim()) {
                field.classList.add("is-invalid");
                field.nextElementSibling.textContent = "This field is required.";
                isValid = false;
            } else if (regex && !regex.test(field.value.trim())) {
                field.classList.add("is-invalid");
                field.nextElementSibling.textContent = message;
                isValid = false;
            }
        }

        // Apply validations
        validateField(fullName, nameRegex, "Full name must contain only letters.");
        validateField(address, null, "Address is required.");
        validateField(city, nameRegex, "City name must contain only letters.");
        validateField(pincode, pincodeRegex, "Pincode must be between 4 to 10 digits.");
        validateField(state, nameRegex, "State name must contain only letters.");
        validateField(country, nameRegex, "Country name must contain only letters.");
        validateField(phone, phoneRegex, "Phone number must be 10-15 digits.");

        // Address Type validation (Dropdown)
        if (!addressType.value) {
            addressType.classList.add("is-invalid");
            addressType.nextElementSibling.textContent = "Please select an address type.";
            isValid = false;
        }

        // If validation fails, keep the modal open
        if (!isValid) {
            editAddressModal.show();
            return;
        }

        // Prepare data for submission
        const formData = new FormData(editAddressForm);
        const data = Object.fromEntries(formData);
        data.isDefault = data.isDefault === 'on';
        const addressId = data.addressId;

        console.log("Debug: Update data being sent:", data);

        try {
            const response = await fetch(`/user/checkout/address/${addressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("Debug: Update response:", { status: response.status, result });
            console.log('response', result);
             const address = result.address;

            const form = document.getElementById('editAddressForm');
            form.addressId.value = address._id || '';
            form.fullName.value = address.fullName || '';
            form.address.value = address.address || '';
            form.city.value = address.city || '';
            form.pincode.value = address.pincode || '';
            form.state.value = address.state || '';
            form.country.value = address.country || '';
            form.phone.value = address.phone || '';
            form.addressType.value = address.addressType || 'Home';
            form.isDefault.checked = address.isDefault || false;



        //     document.getElementById(`fullName-${addressId}`)?.textContent = address.fullName || '';
        // document.getElementById(`phone-${addressId}`)?.textContent = address.phone || '';

        // const addressDetailsElement = document.getElementById(`addressDetails-${addressId}`);
        // if (addressDetailsElement) {
        //     addressDetailsElement.textContent = `${address.address}, ${address.city}, ${address.state}, ${address.pincode}`;
        // }

        // const isDefaultBadge = document.getElementById(`defaultBadge-${addressId}`);
        // if (isDefaultBadge) {
        //     isDefaultBadge.style.display = address.isDefault ? "inline-block" : "none";
        // }


            // Hide the modal
            editAddressModal.hide();

            // Update Address in UI Without Reload
            updateAddressOnPage(addressId, data);

            alert('Address updated successfully!');
        } catch (error) {
            console.error("Debug: Update error:", {
                message: error.message,
                stack: error.stack
            });
            // alert(`Failed to update address: ${error.message || 'Network error'}`);
        }
    });
});












//     function editAddress(addressId) {
//         // Placeholder for edit logic (e.g., populate a modal)
//         console.log("Edit address with ID:", addressId);
//         // You can add code here to fetch address details via AJAX and populate the edit modal
//     }



// // Add Address Form Submission
// document.getElementById('addAddressForm')?.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const data = Object.fromEntries(formData);
//     data.isDefault = data.isDefault === 'on';

//     console.log("Debug: Form Data being sent:", data);
//     console.log("Debug: Target URL:", '/user/checkout/address/add'); // Updated URL

//     try {
//         const response = await fetch('/user/checkout/address/add', { // Updated endpoint
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(data)
//         });
        
//         const result = await response.json();
//         console.log("Debug: Server Response:", { status: response.status, result });

//         if (response.ok) {
//             bootstrap.Modal.getInstance(document.getElementById('addAddressModal')).hide();
//             location.reload();
//         } else {
//             alert(`Failed to add address: ${result.message || `Server returned ${response.status}`}`);
//         }
//     } catch (error) {
//         console.error("Debug: Fetch Error:", {
//             message: error.message,
//             stack: error.stack,
//             url: '/user/checkout/address/add'
//         });
//         alert(`Failed to add address: ${error.message || 'Network error'}`);
//     }
// });



// // Edit Address Modal Population and Submission
// document.querySelectorAll('[data-bs-target="#editAddressModal"]').forEach(button => {
//     button.addEventListener('click', async () => {
//         const addressId = button.dataset.addressId;
//         console.log("Debug: Editing address ID:", addressId);

//         try {
//             const response = await fetch(`/user/checkout/address/${addressId}`, {
//                 method: 'GET',
//                 headers: { 'Content-Type': 'application/json' }
//             });
            
//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `Server returned ${response.status}`);
//             }

//             const address = await response.json();
//             console.log("Debug: Fetched address data:", address);

//             const form = document.getElementById('editAddressForm');
//             form.addressId.value = address._id || '';
//             form.fullName.value = address.fullName || '';
//             form.address.value = address.address || '';
//             form.city.value = address.city || '';
//             form.pincode.value = address.pincode || '';
//             form.state.value = address.state || '';
//             form.country.value = address.country || '';
//             form.phone.value = address.phone || '';
//             form.addressType.value = address.addressType || 'Home';
//             form.isDefault.checked = address.isDefault || false;
//         } catch (error) {
//             console.error("Debug: Error fetching address:", {
//                 message: error.message,
//                 stack: error.stack
//             });
//             alert(`Failed to load address: ${error.message}`);
//         }
//     });
// });

// // Edit Address Form Submission (unchanged unless you report issues)
// document.getElementById('editAddressForm')?.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const data = Object.fromEntries(formData);
//     data.isDefault = data.isDefault === 'on';
//     const addressId = data.addressId;

//     console.log("Debug: Update data being sent:", data);

//     try {
//         const response = await fetch(`/user/checkout/address/${addressId}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(data)
//         });
        
//         const result = await response.json();
//         console.log("Debug: Update response:", { status: response.status, result });

//         if (response.ok) {
//             bootstrap.Modal.getInstance(document.getElementById('editAddressModal')).hide();
//             location.reload();
//         } else {
//             alert(`Failed to update address: ${result.message || `Server returned ${response.status}`}`);
//         }
//     } catch (error) {
//         console.error("Debug: Update error:", {
//             message: error.message,
//             stack: error.stack
//         });
//         alert(`Failed to update address: ${error.message || 'Network error'}`);
//     }
// });











// Function to Populate the Edit Address Modal
document.querySelectorAll('[data-bs-target="#editAddressModal"]').forEach(button => {
    button.addEventListener('click', async () => {
        const addressId = button.dataset.addressId;
        console.log("Debug: Editing address ID:", addressId);

        try {
            const response = await fetch(`/user/checkout/address/${addressId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Server returned ${response.status}`);
            }

            const address = await response.json();
            console.log("Debug: Fetched address data:", address);

            const form = document.getElementById('editAddressForm');
            form.addressId.value = address._id || '';
            form.fullName.value = address.fullName || '';
            form.address.value = address.address || '';
            form.city.value = address.city || '';
            form.pincode.value = address.pincode || '';
            form.state.value = address.state || '';
            form.country.value = address.country || '';
            form.phone.value = address.phone || '';
            form.addressType.value = address.addressType || 'Home';
            form.isDefault.checked = address.isDefault || false;

        } catch (error) {
            console.error("Debug: Error fetching address:", {
                message: error.message,
                stack: error.stack
            });
            alert(`Failed to load address: ${error.message}`);
        }
    });
});



// Function to Update Address in the UI Dynamically
function updateAddressOnPage(addressId, data) {
    const addressElement = document.querySelector(`[data-address-id="${addressId}"]`);
    
    // 🔴 If the address element is missing, show an error and return
    if (!addressElement) {
        console.error(`Debug: No address element found for ID: ${addressId}`);
        alert('Failed to update address: Address element not found.');
        return;
    }
    addressElement.querySelector(".address-fullname").textContent = data.fullName;
    addressElement.querySelector(".address-text").textContent = data.address;
    addressElement.querySelector(".address-city").textContent = data.city;
    addressElement.querySelector(".address-state").textContent = data.state;
    addressElement.querySelector(".address-country").textContent = data.country;
    addressElement.querySelector(".address-pincode").textContent = data.pincode;
    addressElement.querySelector(".address-phone").textContent = data.phone;
    addressElement.querySelector(".address-type").textContent = data.addressType;

    if (data.isDefault) {
        document.querySelectorAll('.default-address').forEach(el => el.textContent = '');
        addressElement.querySelector(".default-address").textContent = ' (Default)';
    }
}

// Add Address Form Submission (No Page Reload)
document.getElementById('addAddressForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.isDefault = data.isDefault === 'on';

    console.log("Debug: Form Data being sent:", data);
    console.log("Debug: Target URL:", '/user/checkout/address/add'); 

    try {
        const response = await fetch('/user/checkout/address/add', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Debug: Server Response:", { status: response.status, result });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('addAddressModal')).hide();

            // Add New Address to UI Without Reload
            addNewAddressToPage(result.address);

            alert('Address added successfully!');
        } else {
            alert(`Failed to add address: ${result.message || `Server returned ${response.status}`}`);
        }
    } catch (error) {
        console.error("Debug: Fetch Error:", {
            message: error.message,
            stack: error.stack,
            url: '/user/checkout/address/add'
        });
        alert(`Failed to add address: ${error.message || 'Network error'}`);
    }
});

// Function to Add New Address to the UI Dynamically
function addNewAddressToPage(address) {
    const addressContainer = document.getElementById('addressList'); // Ensure you have this container in your HTML
    if (!addressContainer) return;

    const newAddressHTML = `
        <div class="address-item" data-address-id="${address._id}">
            <p class="address-fullname">${address.fullName}</p>
            <p class="address-text">${address.address}</p>
            <p class="address-city">${address.city}</p>
            <p class="address-state">${address.state}</p>
            <p class="address-country">${address.country}</p>
            <p class="address-pincode">${address.pincode}</p>
            <p class="address-phone">${address.phone}</p>
            <p class="address-type">${address.addressType}</p>
            <span class="default-address">${address.isDefault ? '(Default)' : ''}</span>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editAddressModal" data-address-id="${address._id}">Edit</button>
        </div>
    `;

    addressContainer.insertAdjacentHTML('beforeend', newAddressHTML);
}












// function copyCode(code) {
        //     navigator.clipboard.writeText(code);
        //     Swal.fire({
        //         icon: 'success',
        //         title: 'Coupon Copied!',
        //         text: `Coupon code ${code} has been copied to clipboard.`,
        //         toast: true,
        //         position: 'top-end',
        //         showConfirmButton: false,
        //         timer: 3000
        //     });
        // }

        // function selectPayment(element, method) {
        //     document.querySelectorAll('.payment-method').forEach(el => {
        //         el.classList.remove('selected');
        //     });
        //     element.classList.add('selected');
        // }

        // function placeOrder() {
        //     Swal.fire({
        //         title: 'Order Confirmed!',
        //         html: `
        //             <div style="text-align: center;">
        //                 <i class="bi bi-check-circle" style="color: #4F6367; font-size: 4rem;"></i>
        //                 <p>Your order has been placed successfully.</p>
        //                 <p>Order Number: <strong>#FUR-12345</strong></p>
        //             </div>
        //         `,
        //         icon: 'success',
        //         confirmButtonText: 'Continue Shopping',
        //         confirmButtonColor: '#FE5F55'
        //     });
        // }
   
        // function applyCoupon() {
        //     const couponInput = document.getElementById('couponCode');
        //     const feedbackElement = document.getElementById('coupon-feedback');
        //     const couponCode = couponInput.value.trim().toUpperCase();
    
        //     // Sample valid coupon codes
        //     const validCoupons = ['NEWFURN10', 'SUMMER25', 'WELCOME20'];
    
        //     if (validCoupons.includes(couponCode)) {
        //         feedbackElement.innerHTML = `
        //             <span class="coupon-valid">
        //                 <i class="bi bi-check-circle-fill me-2"></i>
        //                 Coupon ${couponCode} applied successfully!
        //             </span>
        //         `;
        //         // Here you would typically update the order total
        //         // For example: applyDiscount(couponCode);
        //     } else {
        //         feedbackElement.innerHTML = `
        //             <span class="coupon-invalid">
        //                 <i class="bi bi-x-circle-fill me-2"></i>
        //                 Invalid coupon code. Please try again.
        //             </span>
        //         `;
        //     }
        // }