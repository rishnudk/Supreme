
// Search function
document.getElementById("search-input").addEventListener("keyup", function () {
    const searchValue = this.value.trim();
    window.location.href = `/admin/orders?page=1&limit=10&search=${encodeURIComponent(searchValue)}`;
});

// Reset search
function resetSearch() {
    window.location.href = '/admin/orders?page=1&limit=10';
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            Swal.fire("Success!", "Order status updated successfully.", "success").then(() => {
                window.location.reload(); // Reload to reflect stock changes
            });
        } else {
            Swal.fire("Error!", "Failed to update order status.", "error");
        }
    } catch (error) {
        Swal.fire("Error!", "Something went wrong: " + error.message, "error");
    }
}

// Cancel order
async function cancelOrder(orderId) {
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to cancel this order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/admin/orders/${orderId}/cancel`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    Swal.fire("Cancelled!", "The order has been cancelled.", "success").then(() => {
                        window.location.reload(); // Reload to update stock
                    });
                } else {
                    Swal.fire("Error!", "Failed to cancel the order.", "error");
                }
            } catch (error) {
                Swal.fire("Error!", "Something went wrong: " + error.message, "error");
            }
        }
    });
}

// Ensure sidebar toggle works (assuming adminSidebar.js exists)
document.addEventListener("DOMContentLoaded", function () {
    const toggler = document.getElementById("adminToggler");
    if (toggler) {
        toggler.addEventListener("click", function () {
            document.getElementById("admin-sidebar").classList.toggle("show");
        });
    }
});




