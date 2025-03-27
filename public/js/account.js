


async function fetchOrders() {
    try {
      const response = await fetch("/api/user-orders");
      const result = await response.json();
  
      if (!result.success) {
        document.getElementById("ordersContainer").innerHTML = "<p>No orders found.</p>";
        return;
      }
  
      const orders = result.orders;
      let ordersHTML = "";
  
      orders.forEach((order) => {
        order.products.forEach((product) => {
          ordersHTML += `
            <div class="row order-item">
              <div class="col-4">
                <img src="${product.image}" alt="${product.name}" class="order-image">
              </div>
              <div class="col-8">
                <div class="order-details">
                  <p class="order-product">${product.name}</p>
                  <p>Placed on: ${new Date(order.orderDate).toDateString()}</p>
                  <p>Order Status: ${order.orderStatus}</p>
                  <p class="order-price">$${product.price.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <hr>
          `;
        });
      });
  
      document.getElementById("ordersContainer").innerHTML = ordersHTML;
    } catch (error) {
      console.error("Error fetching orders:", error);
      document.getElementById("ordersContainer").innerHTML = "<p>Something went wrong. Try again later!</p>";
    }
  }
  
  // Call the function when the page loads
  document.addEventListener("DOMContentLoaded", fetchOrders);
  



  document.addEventListener("DOMContentLoaded", function () {
    let currentOrderId = null; // Store selected order ID globally

    // Get modal elements
    const cancelOrderModal = document.getElementById("cancelOrderModal");
    const confirmCancelModal = document.getElementById("confirmCancelModal");
    const successModal = document.getElementById("successModal");

    // Get form elements
    const cancelReasonSelect = document.getElementById("cancelReason");
    const otherReasonContainer = document.getElementById("otherReasonContainer");
    const otherReasonTextarea = document.getElementById("otherReason");
    const selectedReasonSpan = document.getElementById("selectedReason");

    // Get buttons
    const confirmCancelBtn = document.getElementById("confirmCancelBtn");
    const finalConfirmBtn = document.getElementById("finalConfirmBtn");

    // Initialize Bootstrap modals
    const cancelModal = new bootstrap.Modal(cancelOrderModal);
    const confirmModal = new bootstrap.Modal(confirmCancelModal);
    const successModalInstance = new bootstrap.Modal(successModal);

    // Show/hide the "Other reason" textarea based on selection
    cancelReasonSelect.addEventListener("change", function () {
        if (this.value === "other") {
            otherReasonContainer.classList.remove("d-none");
            otherReasonTextarea.setAttribute("required", "");
        } else {
            otherReasonContainer.classList.add("d-none");
            otherReasonTextarea.removeAttribute("required");
        }
    });

    // Handle "Cancel Order" button click
    document.querySelectorAll(".cancel-order-btn").forEach(button => {
        button.addEventListener("click", function () {
            currentOrderId = this.getAttribute("data-order-id"); // Get order ID
            console.log("Selected Order ID:", currentOrderId); // Debugging log
        });
    });

    // Handle "Confirm Cancel" button click
    confirmCancelBtn.addEventListener("click", function () {
    

        // Validate form
        if (!cancelReasonSelect.value) {
            cancelReasonSelect.classList.add("is-invalid");
            return;
        }

        if (cancelReasonSelect.value === "other" && !otherReasonTextarea.value.trim()) {
            otherReasonTextarea.classList.add("is-invalid");
            return;
        }

        // Update the reason text in confirmation modal
        selectedReasonSpan.textContent =
            cancelReasonSelect.value === "other" ? otherReasonTextarea.value : cancelReasonSelect.options[cancelReasonSelect.selectedIndex].textContent;

        // Hide first modal and show confirmation modal
        cancelModal.hide();
        confirmModal.show();
    });

    // Handle final confirmation button click
    finalConfirmBtn.addEventListener("click", async function () {
        if (!currentOrderId) {
            console.error("Order ID is missing!");
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Order ID is missing. Please try again.",
                confirmButtonText: "OK"
            });
            return;
        }
        const confirmCancelModal = document.getElementById("confirmCancelModal");
        const confirmModal = new bootstrap.Modal(confirmCancelModal);

        const cancelReason = document.getElementById("selectedReason").textContent;

        try {
            const response = await fetch(`/user/order/cancel/${currentOrderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: currentOrderId, cancelReason })
            });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Order Cancelled",
                    text: "Your order has been successfully cancelled.",
                    confirmButtonText: "OK"
                }).then(() => {
                    confirmModal.hide()
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Cancellation Failed",
                    text: "Something went wrong. Please try again.",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to connect to the server. Please try again later.",
                confirmButtonText: "OK"
            });
        }
    });

    // Reset the form when cancel modal is closed
    cancelOrderModal.addEventListener("hidden.bs.modal", function () {
        document.getElementById("cancelForm").reset();
        otherReasonContainer.classList.add("d-none");
        cancelReasonSelect.classList.remove("is-invalid");
        otherReasonTextarea.classList.remove("is-invalid");
    });

});












document.addEventListener("DOMContentLoaded", function () {
    let currentOrderId = null;
    let currentProductId = null;

    // Get modal elements
    const cancelOrderModal = document.getElementById("cancelOrderModal");
    const confirmCancelModal = document.getElementById("confirmCancelModal");
    const successModal = document.getElementById("successModal");

    // Get form elements
    const cancelReasonSelect = document.getElementById("cancelReason");
    const otherReasonContainer = document.getElementById("otherReasonContainer");
    const otherReasonTextarea = document.getElementById("otherReason");
    const selectedReasonSpan = document.getElementById("selectedReason");

    // Get buttons
    const confirmCancelBtn = document.getElementById("confirmCancelBtn");
    const finalConfirmBtn = document.getElementById("finalConfirmBtn");

    // Initialize Bootstrap modals
    const cancelModal = new bootstrap.Modal(cancelOrderModal);
    const confirmModal = new bootstrap.Modal(confirmCancelModal);
    const successModalInstance = new bootstrap.Modal(successModal);

    // Show/hide the "Other reason" textarea based on selection
    cancelReasonSelect.addEventListener("change", function () {
        if (this.value === "other") {
            otherReasonContainer.classList.remove("d-none");
            otherReasonTextarea.setAttribute("required", "");
        } else {
            otherReasonContainer.classList.add("d-none");
            otherReasonTextarea.removeAttribute("required");
        }
    });



    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("cancel-product-btn")) {
            currentOrderId = event.target.getAttribute("data-order-id");
            currentProductId = event.target.getAttribute("data-product-id");
            console.log("Selected Order ID:", currentOrderId);
            console.log("Selected Product ID:", currentProductId);
        }
    });
    

    // Handle "Confirm Cancel" button click for a single product
    confirmCancelBtn.addEventListener("click", function () {


        console.log("🛑 Inside Confirm Cancel Click");
        console.log("Current Order ID before check:", currentOrderId);
        console.log("Current Product ID before check:", currentProductId);


 

        // Validate form
        if (!cancelReasonSelect.value) {
            cancelReasonSelect.classList.add("is-invalid");
            return;
        }

        if (cancelReasonSelect.value === "other" && !otherReasonTextarea.value.trim()) {
            otherReasonTextarea.classList.add("is-invalid");
            return;
        }

        // Update the reason text in confirmation modal
        selectedReasonSpan.textContent =
            cancelReasonSelect.value === "other" ? otherReasonTextarea.value : cancelReasonSelect.options[cancelReasonSelect.selectedIndex].textContent;

        // Hide first modal and show confirmation modal
        cancelModal.hide();
        confirmModal.show();
    });

    // Handle final confirmation button click
    finalConfirmBtn.addEventListener("click", async function () {
        console.log("Selected Order ID:", currentOrderId);
        console.log("Selected Product ID:", currentProductId);
        const confirmCancelModal = document.getElementById("confirmCancelModal");
        const confirmModal = new bootstrap.Modal(confirmCancelModal);

        const cancelReason = document.getElementById("selectedReason").textContent;


        try {
            const response = await fetch(`/user/order/cancel-product/${currentOrderId}/${currentProductId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: currentOrderId, productId: currentProductId, cancelReason })
            });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Product Cancelled",
                    text: "The selected product has been successfully cancelled.",
                    confirmButtonText: "OK"
                }).then(() => {
                    confirmModal.hide();
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Cancellation Failed",
                    text: "Something went wrong. Please try again.",
                    confirmButtonText: "OK"
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to connect to the server. Please try again later.",
                confirmButtonText: "OK"
            });
        }
    });

    
    cancelOrderModal.addEventListener("hidden.bs.modal", function () {
        document.getElementById("cancelForm").reset();
        otherReasonContainer.classList.add("d-none");
        cancelReasonSelect.classList.remove("is-invalid");
        otherReasonTextarea.classList.remove("is-invalid");
    });

});















document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".view-details").forEach(button => {
        button.addEventListener("click", function () {
            const orderId = this.getAttribute("data-order-id");
            console.log("Button clicked! Order ID:", orderId); // Debug log

            fetch(`/user/orders/details/${orderId}`)
                .then(response => {
                    console.log("Fetch request sent! Response status:", response.status);
                    return response.json();
                })
                .then(order => {
                    console.log("Order details received:", order); // Debug log
                })
                .catch(error => console.error("Error fetching order details:", error));
        });
    });
});








document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".view-details").forEach(button => {
      button.addEventListener("click", function () {
        const orderId = this.getAttribute("data-order-id");

        if (!orderId) {
          console.error("Order ID not found!");
          return;
        }

        // Fetch order details from backend
        fetch(`/user/details/${orderId}`)
          .then(response => response.json())
          .then(order => {
            if (order) {
              // Populate modal with order details
              document.getElementById("modalOrderId").innerText = order._id;
              document.getElementById("modalOrderDate").innerText = new Date(order.createdAt).toDateString();
              document.getElementById("modalTotalAmount").innerText = `₹${order.totalAmount}`;

              const productList = document.getElementById("modalProducts");
              productList.innerHTML = ""; // Clear previous data

              order.products.forEach(product => {
                const item = document.createElement("li");
                item.className = "list-group-item";
                item.innerHTML = `
                  <img src="${product.image}" width="50"> 
                  ${product.name} - ₹${product.price} x ${product.quantity}
                `;
                productList.appendChild(item);
              });

              document.getElementById("modalShipping").innerText =
                `${order.shippingAddress.fullName}, ${order.shippingAddress.address}, 
                ${order.shippingAddress.city}, ${order.shippingAddress.pincode}`;

              document.getElementById("modalOrderStatus").innerText = order.orderStatus;

              // Show the modal
              new bootstrap.Modal(document.getElementById("orderDetailsModal")).show();
            }
          })
          .catch(error => console.error("Error fetching order details:", error));
      });
    });
  });
                                           