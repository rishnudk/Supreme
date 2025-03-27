// async function updateQuantity(productId, action) {
//     try {
//         const response = await fetch('/user/cart/update-quantity', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ productId, action })
//         });

//         const data = await response.json();
//         if (data.success) {
//             const quantityInput = document.getElementById(`quantity-${productId}`);
//             if (quantityInput) quantityInput.value = data.quantity;

//             // Update individual item price dynamically
//             const itemTotalElement = document.querySelector(`#item-total-${productId}`);
//             const originalPrice = data.productPrice * data.quantity;
//             let discountedPrice = originalPrice;
//             let offerPercentage = 0;

//             // Assuming server returns per-item discount info; if not, fetch it separately
//             // For simplicity, we'll rely on the total offerDiscount for now
//             if (itemTotalElement) {
//                 itemTotalElement.innerHTML = data.offerDiscount > 0 && originalPrice > discountedPrice 
//                     ? `<s>₹${originalPrice.toFixed(2)}</s> ₹${discountedPrice.toFixed(2)} (${offerPercentage}% off)`
//                     : `₹${originalPrice.toFixed(2)}`;
//             }

//             updateOrderSummary(data.subtotal, data.shippingCost, data.offerDiscount, data.total);
//         } else {
//             alert(data.message || 'Could not update quantity');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred');
//     }
// }






// async function updateQuantity(productId, action) {
//     try {
//         console.log(`Sending request: productId=${productId}, action=${action}`);
//         const response = await fetch('/user/cart/update-quantity', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ productId, action })
//         });

//         console.log(`Response status: ${response.status}`);
//         const data = await response.json();
//         console.log('Response data:', data);

//         if (data.success) {
//             document.getElementById(`quantity-${productId}`).value = data.quantity;
//             // Update totals only if elements exist
//             const subtotalEl = document.getElementById('subtotal');
//             const shippingEl = document.getElementById('shipping');
//             const discountEl = document.getElementById('discount');
//             const totalEl = document.getElementById('total');
//             if (subtotalEl) subtotalEl.textContent = `₹${data.subtotal}`;
//             if (shippingEl) shippingEl.textContent = `₹${data.shippingCost}`;
//             if (discountEl) discountEl.textContent = `₹${data.offerDiscount}`;
//             if (totalEl) totalEl.textContent = `₹${data.total}`;
//         } else {
//             if (data.message === "Maximum quantity (3) reached") {
//                 Swal.fire({
//                     title: "Max Limit Reached",
//                     text: "You’ve hit the maximum quantity of 3 for this item.",
//                     icon: "info",
//                     confirmButtonText: "Got it",
//                     customClass: {
//                         popup: 'swal-custom',
//                         title: 'swal-title-custom',
//                         content: 'swal-text-custom',
//                         confirmButton: 'swal-confirm-custom'
//                     },
//                     backdrop: `rgba(0, 0, 0, 0.5)`,
//                     timer: 3000,
//                     timerProgressBar: true
//                 });
//             } else if (data.lowStock) {
//                 Swal.fire({
//                     title: "Low Stock Alert",
//                     text: `${data.productName}: Only ${data.stockLeft} left in stock!`,
//                     icon: "warning",
//                     confirmButtonText: "OK",
//                     customClass: {
//                         popup: 'swal-custom',
//                         title: 'swal-title-custom',
//                         content: 'swal-text-custom',
//                         confirmButton: 'swal-confirm-custom'
//                     },
//                     backdrop: `rgba(0, 0, 0, 0.5)`,
//                     timer: 3000,
//                     timerProgressBar: true
//                 });
//             } else {
//                 Swal.fire({
//                     title: "Oops!",
//                     text: data.message,
//                     icon: "error",
//                     confirmButtonText: "OK",
//                     customClass: {
//                         popup: 'swal-custom',
//                         title: 'swal-title-custom',
//                         content: 'swal-text-custom',
//                         confirmButton: 'swal-confirm-custom'
//                     },
//                     backdrop: `rgba(0, 0, 0, 0.5)`
//                 });
//             }
//         }
//     } catch (error) {
//         console.error("Error updating quantity:", error.message, error.stack);
//         Swal.fire({
//             title: "Error",
//             text: "Something went wrong. Please try again.",
//             icon: "error",
//             confirmButtonText: "OK",
//             customClass: {
//                 popup: 'swal-custom',
//                 title: 'swal-title-custom',
//                 content: 'swal-text-custom',
//                 confirmButton: 'swal-confirm-custom'
//             },
//             backdrop: `rgba(0, 0, 0, 0.5)`
//         });
//     }
// }





async function updateQuantity(productId, action) {
    try {
        console.log(`Sending request: productId=${productId}, action=${action}`);
        const response = await fetch('/user/cart/update-quantity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, action })
        });

        console.log(`Response status: ${response.status}`);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            // Update quantity
            document.getElementById(`quantity-${productId}`).value = data.quantity;

            // Update entire price container
            const priceContainer = document.querySelector(`#price-container-${productId}`);
            if (priceContainer) {
                const originalPrice = data.productPrice * data.quantity;
                if (data.offerPercentage > 0 && data.discountedPrice !== undefined) {
                    priceContainer.innerHTML = `
                        <s>₹${originalPrice.toFixed(2)}</s>
                        <h5 class="text-success" id="price-${productId}">₹${data.discountedPrice.toFixed(2)} (${data.offerPercentage}% off)</h5>
                    `;
                } else {
                    priceContainer.innerHTML = `
                        <h5 id="price-${productId}">₹${originalPrice.toFixed(2)}</h5>
                    `;
                }
                // Force reflow
                priceContainer.style.display = 'none';
                void priceContainer.offsetHeight;
                priceContainer.style.display = '';
                console.log(`Updated price container for ${productId} to: ${priceContainer.innerHTML}`);
            } else {
                console.log(`Price container for ${productId} not found`);
            }

            // Update order summary
            console.log('Calling updateOrderSummary');
            updateOrderSummary(data.subtotal, data.shippingCost, data.offerDiscount, data.total);

            // Success toast
            Swal.fire({
                icon: "success",
                title: `Quantity ${action === "increase" ? "Increased" : "Decreased"}!`,
                text: `Item quantity updated to ${data.quantity}.`,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 1000,
                customClass: {
                    popup: 'swal-custom-toast',
                    title: 'swal-title-toast',
                    content: 'swal-text-toast'
                },
                background: '#F4F7F7', // Light gray background
                timerProgressBar: true,
                iconColor: '#28A745' // Green for success
            });
        } else {
            if (data.message === "Maximum quantity (3) reached") {
                Swal.fire({
                    icon: "info",
                    title: "Max Limit Reached",
                    text: "You’ve hit the maximum quantity of 3 for this item.",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'swal-custom-toast',
                        title: 'swal-title-toast',
                        content: 'swal-text-toast'
                    },
                    background: '#F4F7F7',
                    timerProgressBar: true,
                    iconColor: '#17A2B8' // Teal for info
                });
            } else if (data.message.includes("Insufficient stock")) {
                Swal.fire({
                    icon: "warning",
                    title: "Low Stock Alert",
                    text: data.message,
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'swal-custom-toast',
                        title: 'swal-title-toast',
                        content: 'swal-text-toast'
                    },
                    background: '#F4F7F7',
                    timerProgressBar: true,
                    iconColor: '#FFC107' // Yellow for warning
                });
            } else if (data.message === "Minimum quantity (1) reached") {
                Swal.fire({
                    icon: "info",
                    title: "Min Limit Reached",
                    text: "You’ve hit the minimum quantity of 1 for this item.",
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'swal-custom-toast',
                        title: 'swal-title-toast',
                        content: 'swal-text-toast'
                    },
                    background: '#F4F7F7',
                    timerProgressBar: true,
                    iconColor: '#17A2B8' // Teal for info
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops!",
                    text: data.message,
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'swal-custom-toast',
                        title: 'swal-title-toast',
                        content: 'swal-text-toast'
                    },
                    background: '#F4F7F7',
                    timerProgressBar: true,
                    iconColor: '#DC3545' // Red for error
                });
            }
        }
    } catch (error) {
        console.error("Error updating quantity:", error.message, error.stack);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again.",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
            customClass: {
                popup: 'swal-custom-toast',
                title: 'swal-title-toast',
                content: 'swal-text-toast'
            },
            background: '#F4F7F7',
            timerProgressBar: true,
            iconColor: '#DC3545' // Red for error
        });
    }
}







function updateOrderSummary(subtotal, shippingCost, offerDiscount, total) {
    const subtotalElement = document.querySelector('#subtotal-value');
    const shippingElement = document.querySelector('#shipping-value');
    const offerDiscountElement = document.querySelector('#offer-discount-value');
    const totalElement = document.querySelector('#total-value');

    console.log('Elements found:', {
        subtotalElement: !!subtotalElement,
        shippingElement: !!shippingElement,
        offerDiscountElement: !!offerDiscountElement,
        totalElement: !!totalElement
    });

    if (subtotalElement) {
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        console.log(`Updated subtotal-value to ₹${subtotal.toFixed(2)}`);
    } else {
        console.log('subtotal-value element not found');
    }
    if (shippingElement) {
        shippingElement.textContent = `₹${shippingCost.toFixed(2)}`;
        console.log(`Updated shipping-value to ₹${shippingCost.toFixed(2)}`);
    } else {
        console.log('shipping-value element not found');
    }
    if (offerDiscountElement) {
        if (offerDiscount > 0) {
            offerDiscountElement.textContent = `-₹${offerDiscount.toFixed(2)}`;
            offerDiscountElement.parentElement.style.display = 'flex';
            console.log(`Updated offer-discount-value to -₹${offerDiscount.toFixed(2)}`);
        } else {
            offerDiscountElement.parentElement.style.display = 'none';
            console.log('Hid offer-discount-value (no discount)');
        }
    } else {
        console.log('offer-discount-value element not found');
    }
    if (totalElement) {
        totalElement.textContent = `₹${total.toFixed(2)}`;
        console.log(`Updated total-value to ₹${total.toFixed(2)}`);
    } else {
        console.log('total-value element not found');
    }

    // Force a reflow to ensure UI updates
    const summaryCard = document.querySelector('.summary-card');
    if (summaryCard) {
        summaryCard.style.display = 'none';
        void summaryCard.offsetHeight; // Trigger reflow
        summaryCard.style.display = 'block';
        console.log('Forced reflow on summary-card');
    }
}
// // Remove from cart (unchanged for now, but can be updated similarly)
// async function removeFromCart(productId) {
//     try {
//         const response = await fetch('/user/cart/remove', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ productId })
//         });

//         const data = await response.json();
//         if (data.success) {
//             window.location.reload(); // Can be made dynamic too
//         } else {
//             alert('Could not remove item');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('An error occurred');
//     }
// }

async function removeFromCart(productId) {
    try {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: "Are You Sure?",
            text: "Do you really want to remove this item from your cart?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Remove",
            cancelButtonText: "No, Keep",
            customClass: {
                popup: 'swal-custom',
                title: 'swal-title-custom',
                content: 'swal-text-custom',
                confirmButton: 'swal-confirm-custom',
                cancelButton: 'swal-cancel-custom'
            },
            backdrop: `rgba(0, 0, 0, 0.5)`, // Slightly lighter backdrop
            buttonsStyling: false // Use custom classes
        });

        if (!result.isConfirmed) {
            return;
        }

        // Proceed with removal
        const response = await fetch('/user/cart/remove', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId })
        });

        const data = await response.json();
        if (data.success) {
            await Swal.fire({
                title: "Item Removed",
                text: "The item has been removed from your cart.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                    popup: 'swal-custom',
                    title: 'swal-title-custom',
                    content: 'swal-text-custom',
                    confirmButton: 'swal-confirm-custom'
                },
                backdrop: `rgba(0, 0, 0, 0.5)`,
                timer: 2000,
                timerProgressBar: true
            });
            window.location.reload();
        } else {
            Swal.fire({
                title: "Oops!",
                text: "Could not remove item from cart.",
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                    popup: 'swal-custom',
                    title: 'swal-title-custom',
                    content: 'swal-text-custom',
                    confirmButton: 'swal-confirm-custom'
                },
                backdrop: `rgba(0, 0, 0, 0.5)`
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: "Error",
            text: "An error occurred while removing the item.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
                popup: 'swal-custom',
                title: 'swal-title-custom',
                content: 'swal-text-custom',
                confirmButton: 'swal-confirm-custom'
            },
            backdrop: `rgba(0, 0, 0, 0.5)`
        });
    }
}


