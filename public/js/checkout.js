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







    editAddressForm?.addEventListener("submit", async function (event) {
        event.preventDefault();
    
        if (!validateForm(editAddressForm)) {
            editAddressModal.show();
            return;
        }
    
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
    
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update address');
            }
    
            // Use server response to update UI
            updateAddressOnPage(addressId, result.address);
    
            // Hide the modal
            editAddressModal.hide();
    
            // Show success alert
            Swal.fire({
                icon: 'success',
                title: 'Address Updated',
                text: 'Your address has been updated successfully!',
                timer: 1500,
                showConfirmButton: false,
            });
    
        } catch (error) {
            console.error("Debug: Update error:", { message: error.message, stack: error.stack });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to update address',
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



function updateAddressOnPage(addressId, data) {
    try {
        if (!addressId || !data) {
            throw new Error('Address ID and data are required.');
        }

        const addressElement = document.getElementById(`address-card-${addressId}`);
        if (!addressElement) {
            throw new Error(`No address element found for ID: ${addressId}`);
        }

        console.log(`Debug: Updating address ID ${addressId} with data:`, data);

        // Replace entire content with updated address
        addressElement.innerHTML = `
            ${data.isDefault ? '<span class="badge bg-success me-2">Default</span>' : ''}
            <span class="full-name">${data.fullName || 'N/A'}</span><br>
            <span class="address-details">${data.address || ''}, ${data.city || ''}, ${data.state || ''}, ${data.pincode || ''}</span><br>
            <span class="phone">${data.phone || 'N/A'}</span>
        `.trim();

        console.log("Debug: Address updated successfully in the DOM.");
    } catch (error) {
        console.error("Debug: Error updating address on page:", error.message);
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






let selectedPaymentMethod = null;
let selectedAddressId = null // Set this appropriately
let cartTotal = 0;

// Function to fetch and display cart total


async function fetchCartTotal() {
    try {
        const response = await fetch("/user/cart/total", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        cartTotal = data.total || 0; // Includes shipping
        document.getElementById("cart-total").innerText = `Total: ₹${cartTotal.toFixed(2)}`;
        console.log("Cart total fetched (with shipping):", cartTotal);
    } catch (error) {
        console.error("Error fetching cart total:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchCartTotal);






// async function placeOrder() {
//     try {
//         console.log(`1 - Starting placeOrder`);
//         console.log(`2 - Current selectedAddressId: ${selectedAddressId}`);
//         console.log(`3 - Current selectedPaymentMethod: ${selectedPaymentMethod}`);

//         if (!selectedAddressId) throw new Error("Please select an address.");
//         if (!selectedPaymentMethod) throw new Error("Please select a payment method.");

//         const orderData = {
//             addressId: selectedAddressId,
//             paymentMethod: selectedPaymentMethod,
//         };
//         console.log(`4 - Sending Order Data:`, orderData);

//         const response = await fetch("/user/place-order", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(orderData),
//         });

//         const result = await response.json();
//         console.log(`5 - place-order response:`, result);

//         if (!response.ok || !result.success) {
//             // Handle specific errors with SweetAlert
//             Swal.fire({
//                 icon: "error",
//                 title: "Order Failed",
//                 text: result.error || "Failed to place order",
//                 confirmButtonText: "OK",
//             });
//             return;
//         }

//         if (selectedPaymentMethod === "razorpay") {
//             console.log(`6 - Initiating Razorpay payment for order: ${result.orderId}`);
//             const razorpayResponse = await fetch("/user/create-order", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     orderId: result.orderId,
//                     totalAmount: result.totalAmount,
//                 }),
//             });

//             const razorpayResult = await razorpayResponse.json();
//             console.log(`7 - Razorpay create-order response:`, razorpayResult);

//             if (!razorpayResponse.ok || !razorpayResult.success) {
//                 Swal.fire({
//                     icon: "error",
//                     title: "Payment Initiation Failed",
//                     text: razorpayResult.message || "Failed to create Razorpay order",
//                 });
//                 return;
//             }

//             console.log(`8 - Opening Razorpay checkout with:`, razorpayResult);
//             const options = {
//                 key: razorpayResult.key,
//                 amount: razorpayResult.amount,
//                 currency: razorpayResult.currency,
//                 order_id: razorpayResult.orderId,
//                 name: "Supreme",
//                 description: "Order Payment",
//                 handler: async function (response) {
//                     console.log(`9 - Razorpay payment response:`, response);
//                     const verifyResponse = await fetch("/user/verify-payment", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             razorpay_order_id: response.razorpay_order_id,
//                             razorpay_payment_id: response.razorpay_payment_id,
//                             razorpay_signature: response.razorpay_signature,
//                             orderId: result.orderId,
//                         }),
//                     });

//                     const verifyResult = await verifyResponse.json();
//                     console.log(`10 - Payment verification result:`, verifyResult);

//                     if (verifyResult.success) {
//                         console.log(`11 - Payment verified successfully`);
//                         // Show success message and redirect
//                         await Swal.fire({
//                             icon: "success",
//                             title: "Payment Successful",
//                             text: "Your order has been placed!",
//                             timer: 2000,
//                             showConfirmButton: false,
//                         });
//                         window.location.href = `/user/order-success/${result.orderId}`;
//                     } else {
//                         throw new Error(verifyResult.message || "Payment verification failed");
//                     }
//                 },
//                 modal: {
//                     ondismiss: function () {
//                         console.log(`12 - Razorpay modal dismissed`);
//                         window.location.href = `/user/order-failure/${result.orderId}?addressId=${selectedAddressId}&error=Payment%20cancelled%20by%20user`;
//                     },
//                 },
//                 prefill: { name: "Customer Name", email: "customer@example.com", contact: "9999999999" },
//                 theme: { color: "#3399cc" },
//             };

//             const rzp = new Razorpay(options);
//             rzp.on("payment.failed", function (response) {
//                 console.log(`13 - Razorpay payment failed:`, response.error);
//                 Swal.fire({
//                     icon: "error",
//                     title: "Payment Failed",
//                     text: response.error.description || "Payment processing failed",
//                 }).then(() => {
//                     window.location.href = `/user/order-failure/${result.orderId}?addressId=${selectedAddressId}&error=${encodeURIComponent(response.error.description)}`;
//                 });
//             });
//             rzp.open();
//         } else if (selectedPaymentMethod === "cod") {
//             console.log(`14 - COD order placed successfully: ${result.orderId}`);
//             await Swal.fire({
//                 icon: "success",
//                 title: "Order Placed",
//                 text: "Your COD order has been successfully placed!",
//                 timer: 2000,
//                 showConfirmButton: false,
//             });
//             window.location.href = `/user/order-success/${result.orderId}`;
//         } else {
//             throw new Error("Unsupported payment method");
//         }
//     } catch (error) {
//         console.error(`15 - Error in placeOrder: ${error.message}`, error);
//         Swal.fire({
//             icon: "error",
//             title: "Error",
//             text: error.message || "An unexpected error occurred",
//         });
//     }
// }








async function placeOrder() {
    try {
        console.log(`1 - Starting placeOrder`);
        console.log(`2 - Current selectedAddressId: ${selectedAddressId}`);
        console.log(`3 - Current selectedPaymentMethod: ${selectedPaymentMethod}`);

        if (!selectedAddressId) throw new Error("Please select an address.");
        if (!selectedPaymentMethod) throw new Error("Please select a payment method.");

        const orderData = {
            addressId: selectedAddressId,
            paymentMethod: selectedPaymentMethod,
        };
        console.log(`4 - Sending Order Data:`, orderData);

        const response = await fetch("/user/place-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });

        const result = await response.json();
        console.log(`5 - place-order response:`, result);

        if (!response.ok || !result.success) {
            if (result.error === "Insufficient wallet balance") {
                Swal.fire({
                    icon: "error",
                    title: "Insufficient Wallet Balance",
                    html: `Required: ₹${result.requiredAmount}<br>Current Balance: ₹${result.currentBalance}<br>Please add funds to your wallet.`,
                    confirmButtonText: "Add Funds",
                    showCancelButton: true,
                    cancelButtonText: "Cancel"
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/user/wallet/add-funds";
                    }
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Order Failed",
                    text: result.error || "Failed to place order",
                    confirmButtonText: "OK",
                });
            }
            return;
        }

        if (selectedPaymentMethod === "razorpay") {
            console.log(`6 - Initiating Razorpay payment for order: ${result.orderId}`);
            const razorpayResponse = await fetch("/user/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: result.orderId,
                    totalAmount: result.totalAmount,
                }),
            });

            const razorpayResult = await razorpayResponse.json();
            console.log(`7 - Razorpay create-order response:`, razorpayResult);

            if (!razorpayResponse.ok || !razorpayResult.success) {
                Swal.fire({
                    icon: "error",
                    title: "Payment Initiation Failed",
                    text: razorpayResult.message || "Failed to create Razorpay order",
                });
                return;
            }

            console.log(`8 - Opening Razorpay checkout with:`, razorpayResult);
            const options = {
                key: razorpayResult.key,
                amount: razorpayResult.amount,
                currency: razorpayResult.currency,
                order_id: razorpayResult.orderId,
                name: "Supreme",
                description: "Order Payment",
                handler: async function (response) {
                    console.log(`9 - Razorpay payment response:`, response);
                    const verifyResponse = await fetch("/user/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: result.orderId,
                        }),
                    });

                    const verifyResult = await verifyResponse.json();
                    console.log(`10 - Payment verification result:`, verifyResult);

                    if (verifyResult.success) {
                        console.log(`11 - Payment verified successfully`);
                        await Swal.fire({
                            icon: "success",
                            title: "Payment Successful",
                            text: "Your order has been placed!",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                        window.location.href = `/user/order-success/${result.orderId}`;
                    } else {
                        throw new Error(verifyResult.message || "Payment verification failed");
                    }
                },
                modal: {
                    ondismiss: function () {
                        console.log(`12 - Razorpay modal dismissed`);
                        window.location.href = `/user/order-failure/${result.orderId}?addressId=${selectedAddressId}&error=Payment%20cancelled%20by%20user`;
                    },
                },
                prefill: { name: "Customer Name", email: "customer@example.com", contact: "9999999999" },
                theme: { color: "#3399cc" },
            };

            const rzp = new Razorpay(options);
            rzp.on("payment.failed", function (response) {
                console.log(`13 - Razorpay payment failed:`, response.error);
                Swal.fire({
                    icon: "error",
                    title: "Payment Failed",
                    text: response.error.description || "Payment processing failed",
                }).then(() => {
                    window.location.href = `/user/order-failure/${result.orderId}?addressId=${selectedAddressId}&error=${encodeURIComponent(response.error.description)}`;
                });
            });
            rzp.open();
        } else if (selectedPaymentMethod === "cod") {
            console.log(`14 - COD order placed successfully: ${result.orderId}`);
            await Swal.fire({
                icon: "success",
                title: "Order Placed",
                text: "Your COD order has been successfully placed!",
                timer: 2000,
                showConfirmButton: false,
            });
            window.location.href = `/user/order-success/${result.orderId}`;
        } else if (selectedPaymentMethod === "wallet") {
            console.log(`14 - Wallet order placed successfully: ${result.orderId}`);
            await Swal.fire({
                icon: "success",
                title: "Order Placed",
                text: "Your order has been paid with wallet balance!",
                timer: 2000,
                showConfirmButton: false,
            });
            window.location.href = `/user/order-success/${result.orderId}`;
        } else {
            throw new Error("Unsupported payment method");
        }
    } catch (error) {
        console.error(`15 - Error in placeOrder: ${error.message}`, error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "An unexpected error occurred",
        });
    }
}