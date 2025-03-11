document.addEventListener("DOMContentLoaded", function () {
    const editAddressForm = document.getElementById("editAddressForm");
    const addAddressForm = document.getElementById("addAddressForm");
    const editAddressModal = new bootstrap.Modal(document.getElementById('editAddressModal'));
    const addAddressModal = new bootstrap.Modal(document.getElementById('addAddressModal'));

    // Common validation function
    function validateField(field, regex, message) {
        if (!field.value.trim()) {
            field.classList.add("is-invalid");
            field.nextElementSibling.textContent = "This field is required.";
            return false;
        } else if (regex && !regex.test(field.value.trim())) {
            field.classList.add("is-invalid");
            field.nextElementSibling.textContent = message;
            return false;
        }
        return true;
    }

    // Common validation logic for both forms
    function validateForm(form) {
        let isValid = true;

        // Clear previous validation messages
        form.querySelectorAll(".invalid-feedback").forEach(el => el.textContent = "");
        form.querySelectorAll(".form-control, .form-select").forEach(el => el.classList.remove("is-invalid"));

        // Get form values
        const fullName = form.elements["fullName"];
        const address = form.elements["address"];
        const city = form.elements["city"];
        const pincode = form.elements["pincode"];
        const state = form.elements["state"];
        const country = form.elements["country"];
        const phone = form.elements["phone"];
        const addressType = form.elements["addressType"];

        // Regular expressions for validation
        const nameRegex = /^[A-Za-z\s]+$/;
        const pincodeRegex = /^\d{4,10}$/;
        const phoneRegex = /^[0-9]{10,15}$/;

        // Apply validations
        isValid &= validateField(fullName, nameRegex, "Full name must contain only letters.");
        isValid &= validateField(address, null, "Address is required.");
        isValid &= validateField(city, nameRegex, "City name must contain only letters.");
        isValid &= validateField(pincode, pincodeRegex, "Pincode must be between 4 to 10 digits.");
        isValid &= validateField(state, nameRegex, "State name must contain only letters.");
        isValid &= validateField(country, nameRegex, "Country name must contain only letters.");
        isValid &= validateField(phone, phoneRegex, "Phone number must be 10-15 digits.");

        // Address Type validation (Dropdown)
        if (!addressType.value) {
            addressType.classList.add("is-invalid");
            addressType.nextElementSibling.textContent = "Please select an address type.";
            isValid = false;
        }

        return isValid;
    }

    // Edit Address Form Submission
    editAddressForm?.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form submission if validation fails

        if (!validateForm(editAddressForm)) {
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
        }
    });

    // Add Address Form Submission
    addAddressForm?.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form submission if validation fails

        if (!validateForm(addAddressForm)) {
            addAddressModal.show();
            return;
        }

        // Prepare data for submission
        const formData = new FormData(addAddressForm);
        const data = Object.fromEntries(formData);
        data.isDefault = data.isDefault === 'on';

        console.log("Debug: Form Data being sent:", data);

        try {
            const response = await fetch('/user/checkout/address/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log("Debug: Server Response:", { status: response.status, result });

            if (response.ok) {
                // Hide the modal
                addAddressModal.hide();

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
});

// Function to Update Address in the UI Dynamically


// function updateAddressOnPage(addressId, data) {
//     // Find the address container using the addressId
//     const addressElement = document.getElementById(`address-card-${addressId}`);
//     if (!addressElement) {
//         console.error(`Debug: No address element found for ID: ${addressId}`);
//         alert('Failed to update address: Address element not found.');
//         return;
//     }

//     console.log("Debug: addressElement:", addressElement);
//     console.log("Debug: addressElement HTML:", addressElement.innerHTML);

//     // Update the address details in the DOM
//     const fullNameElement = document.getElementById(`fullName-${addressId}`);
//     const addressDetailsElement = document.getElementById(`addressDetails-${addressId}`);
//     const phoneElement = document.getElementById(`phone-${addressId}`);
//     const defaultBadgeElement = document.getElementById(`defaultBadge-${addressId}`);

//     if (fullNameElement) {
//         fullNameElement.textContent = data.fullName;
//     } else {
//         console.error(`Debug: Full Name element not found for ID: ${addressId}`);
//     }

//     if (addressDetailsElement) {
//         addressDetailsElement.textContent = `${data.address}, ${data.city}, ${data.state}, ${data.pincode}`;
//     } else {
//         console.error(`Debug: Address Details element not found for ID: ${addressId}`);
//     }

//     if (phoneElement) {
//         phoneElement.textContent = data.phone;
//     } else {
//         console.error(`Debug: Phone element not found for ID: ${addressId}`);
//     }

//     // Update the default address indicator
//     if (data.isDefault) {
//         // Remove "Default" badge from all addresses
//         document.querySelectorAll('.badge.bg-success').forEach(el => el.remove());
//         // Add "Default" badge to the current address
//         if (defaultBadgeElement) {
//             defaultBadgeElement.textContent = 'Default';
//             defaultBadgeElement.classList.add('badge', 'bg-success', 'me-2');
//         } else {
//             console.error(`Debug: Default Badge element not found for ID: ${addressId}`);
//         }
//     } else {
//         // Remove "Default" badge if the address is no longer default
//         if (defaultBadgeElement) {
//             defaultBadgeElement.remove();
//         }
//     }

//     console.log("Debug: Address updated successfully in the DOM.");
// }


function updateAddressOnPage(addressId, data) {
    try {
        // Validate input
        if (!addressId || !data) {
            throw new Error('Address ID and data are required.');
        }

        // Find the address container using the addressId
        const addressElement = document.getElementById(`address-card-${addressId}`);
        if (!addressElement) {
            throw new Error(`No address element found for ID: ${addressId}`);
        }

        console.log("Debug: addressElement:", addressElement);
        console.log("Debug: addressElement HTML:", addressElement.innerHTML);

        // Update the address details in the DOM
        const fullNameElement = document.getElementById(`fullName-${addressId}`);
        const addressDetailsElement = document.getElementById(`addressDetails-${addressId}`);
        const phoneElement = document.getElementById(`phone-${addressId}`);
        const defaultBadgeElement = document.getElementById(`defaultBadge-${addressId}`);

        // Update Full Name
        if (fullNameElement) {
            fullNameElement.textContent = data.fullName;
        } else {
            console.error(`Debug: Full Name element not found for ID: ${addressId}`);
        }

        // Update Address Details
        if (addressDetailsElement) {
            addressDetailsElement.textContent = `${data.address}, ${data.city}, ${data.state}, ${data.pincode}`;
        } else {
            console.error(`Debug: Address Details element not found for ID: ${addressId}`);
        }

        // Update Phone Number
        if (phoneElement) {
            phoneElement.textContent = data.phone;
        } else {
            console.error(`Debug: Phone element not found for ID: ${addressId}`);
        }

        // Update the default address indicator
        if (data.isDefault) {
            // Remove "Default" badge from all addresses
            document.querySelectorAll('.badge.bg-success').forEach(el => el.remove());

            // Add "Default" badge to the current address
            if (defaultBadgeElement) {
                defaultBadgeElement.textContent = 'Default';
                defaultBadgeElement.classList.add('badge', 'bg-success', 'me-2');
            } else {
                console.error(`Debug: Default Badge element not found for ID: ${addressId}`);
            }
        } else {
            // Remove "Default" badge if the address is no longer default
            if (defaultBadgeElement) {
                defaultBadgeElement.remove();
            }
        }

        console.log("Debug: Address updated successfully in the DOM.");
    } catch (error) {
        console.error("Debug: Error updating address on page:", {
            message: error.message,
            stack: error.stack
        });
        alert(`Failed to update address: ${error.message}`);
    }
}


// Function to Add New Address to the UI Dynamically


// function addNewAddressToPage(address) {
//     const addressContainer = document.getElementById('addressList');
//     if (!addressContainer) {
//         console.error("Debug: addressList container not found.");
//         return;
//     }

//     // Create the new address HTML
//     const newAddressHTML = `
//         <div id="address-card-${address._id}" class="address-card ${address.isDefault ? 'selected' : ''} mb-2">
//             <div class="d-flex justify-content-between align-items-center">
//                 <div>
//                     <h6 id="fullName-${address._id}" class="mb-1">${address.fullName}</h6>
//                     <p id="addressDetails-${address._id}" class="text-muted mb-0">
//                         ${address.address}, ${address.city}, ${address.state}, ${address.pincode}
//                     </p>
//                     <small id="phone-${address._id}" class="text-muted">${address.phone}</small>
//                 </div>
//                 <div>
//                     ${address.isDefault ? `<span id="defaultBadge-${address._id}" class="badge bg-success me-2">Default</span>` : ''}
//                     <button id="editAddressBtn-${address._id}" class="btn btn-sm btn-outline-secondary"
//                             data-bs-toggle="modal"
//                             data-bs-target="#editAddressModal"
//                             data-address-id="${address._id}">
//                         Edit
//                     </button>
//                 </div>
//             </div>
//         </div>
//     `;

//     // Append the new address to the container
//     addressContainer.insertAdjacentHTML('beforeend', newAddressHTML);

//     // Re-attach event listeners to the new "Edit" button
//     const editButton = document.getElementById(`editAddressBtn-${address._id}`);
//     if (editButton) {
//         editButton.addEventListener('click', async () => {
//             const addressId = editButton.dataset.addressId;
//             console.log("Debug: Editing address ID:", addressId);

//             try {
//                 const response = await fetch(`/user/checkout/address/${addressId}`, {
//                     method: 'GET',
//                     headers: { 'Content-Type': 'application/json' }
//                 });

//                 if (!response.ok) {
//                     const errorData = await response.json();
//                     throw new Error(errorData.message || `Server returned ${response.status}`);
//                 }

//                 const address = await response.json();
//                 console.log("Debug: Fetched address data:", address);

//                 const form = document.getElementById('editAddressForm');
//                 form.addressId.value = address._id || '';
//                 form.fullName.value = address.fullName || '';
//                 form.address.value = address.address || '';
//                 form.city.value = address.city || '';
//                 form.pincode.value = address.pincode || '';
//                 form.state.value = address.state || '';
//                 form.country.value = address.country || '';
//                 form.phone.value = address.phone || '';
//                 form.addressType.value = address.addressType || 'Home';
//                 form.isDefault.checked = address.isDefault || false;

//             } catch (error) {
//                 console.error("Debug: Error fetching address:", {
//                     message: error.message,
//                     stack: error.stack
//                 });
//                 alert(`Failed to load address: ${error.message}`);
//             }
//         });
//     }

//     console.log("Debug: New address added to the DOM:", newAddressHTML);
// }



function addNewAddressToPage(address) {
    const addressContainer = document.getElementById('addressList');
    if (!addressContainer) {
        console.error("Debug: addressList container not found.");
        return;
    }

    // Create the new address HTML
    const newAddressHTML = `
        <div id="address-card-${address._id}" 
             class="address-card modern-card ${address.isDefault ? 'selected' : ''}" 
             onclick="selectAddress('${address._id}')"> <!-- Add onclick event here -->
            <input type="radio" name="selectedAddress" value="${address._id}" 
                   id="addressRadio-${address._id}" class="hidden-radio" 
                   ${address.isDefault ? 'checked' : ''}>
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 id="fullName-${address._id}" class="mb-1">${address.fullName}</h6>
                    <p id="addressDetails-${address._id}" class="text-muted mb-0">
                        ${address.address}, ${address.city}, ${address.state}, ${address.pincode}
                    </p>
                    <small id="phone-${address._id}" class="text-muted">${address.phone}</small>
                </div>
                <div>
                    ${address.isDefault ? `<span id="defaultBadge-${address._id}" class="badge bg-success me-2">Default</span>` : ''}
                    <button id="editAddressBtn-${address._id}" class="btn btn-sm btn-outline-secondary"
                            data-bs-toggle="modal"
                            data-bs-target="#editAddressModal"
                            data-address-id="${address._id}">
                        Edit
                    </button>
                </div>
            </div>
        </div>
    `;

    // Append the new address to the container
    addressContainer.insertAdjacentHTML('beforeend', newAddressHTML);

    // Re-attach event listeners to the new "Edit" button
    const editButton = document.getElementById(`editAddressBtn-${address._id}`);
    if (editButton) {
        editButton.addEventListener('click', async () => {
            const addressId = editButton.dataset.addressId;
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
    }

    console.log("Debug: New address added to the DOM:", newAddressHTML);
}


// Function to select an address
function selectAddress(addressId) {
    try {
        if (!addressId) {
            throw new Error('Address ID is required.');
        }

        selectedAddressId = addressId;

        // Highlight the selected address card
        document.querySelectorAll('.address-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.getElementById(`address-card-${addressId}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            console.log('Address selected:', addressId);
        } else {
            throw new Error(`Address card with ID "address-card-${addressId}" not found.`);
        }
    } catch (error) {
        console.error('Error in selectAddress:', error);
        alert(`Error: ${error.message}`);
    }
}

// Function to select a payment method
function selectPayment(paymentMethod) {
    
    try {
        if (!paymentMethod) {
            throw new Error('Payment method is required.');
        }

        selectedPaymentMethod = paymentMethod;

        // Highlight the selected payment method card
        document.querySelectorAll('.payment-method').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedPaymentCard = document.getElementById(`payment-${paymentMethod}`);
        if (selectedPaymentCard) {
            selectedPaymentCard.classList.add('selected');
            console.log('Payment method selected:', paymentMethod);
        } else {
            throw new Error(`Payment method card with ID "payment-${paymentMethod}" not found.`);
        }
    } catch (error) {
        console.error('Error in selectPayment:', error);
        alert(`Error: ${error.message}`);
    }
}



// Function to place an order
async function placeOrder() {
    try {
        // Validate selected address
        if (!selectedAddressId) {
            throw new Error('Please select an address.');
        }

        // Validate selected payment method
        if (!selectedPaymentMethod) {
            throw new Error('Please select a payment method.');
        }

     

        // Prepare order data
        const orderData = {
            addressId: selectedAddressId,
            paymentMethod: selectedPaymentMethod,
        };

        console.log('📩 Sending Order Data:', orderData); // Debugging

        // Send order data to the server
        const response = await fetch('/user/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        console.log('📨 Server Response:', response); // Debugging

        // Handle server response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to place order.');
        }

        const result = await response.json();
        console.log('✅ Order placed successfully:', result); // Debugging

        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        successModal.show();

    } catch (error) {
        console.error('🚨 Error in placeOrder:', error.message); // Debugging
        alert(`Error: ${error.message}`);
    }
}
