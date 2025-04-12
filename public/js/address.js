document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, jQuery available:", typeof $ !== "undefined");

  // Load Address Data into Edit Modal
  window.loadAddressData = function (apiPath) {
    console.log("Loading address from:", apiPath);
    $.ajax({
      url: apiPath,
      type: "GET",
      dataType: "json",
      success: function (response) {
        console.log("Load response:", response);
        if (response.address) {
          $("#editAddressModal").data("addressId", response.address._id);
          console.log("Set addressId:", response.address._id);
          $("#editFullName").val(response.address.fullName || "");
          $("#editPhone").val(response.address.phone || "");
          $("#editAddress").val(response.address.address || "");
          $("#editCity").val(response.address.city || "");
          $("#editState").val(response.address.state || "");
          $("#editCountry").val(response.address.country || "");
          $("#editPincode").val(response.address.pincode || "");
          $("#editAddressType").val(response.address.addressType || "");
          $("#editSetDefault").prop(
            "checked",
            response.address.isDefault || false
          );
        } else {
          console.error("No address data in response:", response);
          Swal.fire("Error", "Failed to load address data.", "error");
        }
      },
      error: function (xhr) {
        console.error(
          "Load error:",
          xhr.status,
          xhr.statusText,
          xhr.responseText
        );
        Swal.fire(
          "Error",
          "Failed to load address: " + xhr.status + " " + xhr.statusText,
          "error"
        );
      },
    });
  };

  // Update Address
  $("#updateAddressBtn").click(function (event) {
    event.preventDefault();
    console.log("Update button clicked");

    let addressId = $("#editAddressModal").data("addressId");
    console.log("Address ID for update:", addressId);

    let fullName = $("#editFullName").val().trim();
    let phone = $("#editPhone").val().trim();
    let address = $("#editAddress").val().trim();
    let city = $("#editCity").val().trim();
    let state = $("#editState").val().trim();
    let country = $("#editCountry").val().trim();
    let pincode = $("#editPincode").val().trim();
    let addressType = $("#editAddressType").val();
    let isDefault = $("#editSetDefault").is(":checked");

    // Validation
    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode ||
      !addressType
    ) {
      Swal.fire(
        "Validation Error",
        "Please fill in all required fields.",
        "warning"
      );
      return;
    }

    // Name validation
if (!/^(?=[A-Za-z]{5}[A-Za-z0-9]*$)[A-Za-z0-9]{5,12}$/.test(fullName)) {
    Swal.fire(
        "Validation Error",
        "Name must have exactly 5 letters, optional numbers, up to 12 characters total, no spaces or special characters.",
        "warning"
    );
    return;
}

// Phone validation
let phonePattern = /^[789]\d{9}$/;
if (!phonePattern.test(phone)) {
    Swal.fire(
        "Validation Error",
        "Phone number must be exactly 10 digits and start with 7, 8, or 9.",
        "warning"
    );
    return;
}

    if (address.length < 5) {
      Swal.fire(
        "Validation Error",
        "Address must be at least 5 characters.",
        "warning"
      );
      return;
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(city)) {
      Swal.fire(
        "Validation Error",
        "City must be at least 2 characters and contain only letters and spaces.",
        "warning"
      );
      return;
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(state)) {
      Swal.fire(
        "Validation Error",
        "State must be at least 2 characters and contain only letters and spaces.",
        "warning"
      );
      return;
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(country)) {
      Swal.fire(
        "Validation Error",
        "Country must be at least 2 characters and contain only letters and spaces.",
        "warning"
      );
      return;
    }

    if (!/^\d{4,10}$/.test(pincode)) {
      Swal.fire("Validation Error", "Pincode must be 4-10 digits.", "warning");
      return;
    }

    let payload = {
      fullName,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      addressType,
      isDefault,
    };
    console.log("Update payload:", payload);

    $.ajax({
      url: `/user/edit/${addressId}`,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function (response) {
        console.log("Update success:", response);
        Swal.fire("Success", "Address updated successfully!", "success");
        $("#editAddressModal").modal("hide");
        location.reload();
      },
      error: function (xhr) {
        console.error(
          "Update error:",
          xhr.status,
          xhr.statusText,
          xhr.responseText
        );
        Swal.fire(
          "Error",
          "Failed to update: " + xhr.status + " " + xhr.statusText,
          "error"
        );
      },
    });
  });

  // Save New Address
  $("#saveAddressBtn").click(function (event) {
    event.preventDefault();
    console.log("Save button clicked");

    let fullName = $("#fullName").val().trim();
    let phone = $("#phone").val().trim();
    let address = $("#address").val().trim();
    let city = $("#city").val().trim();
    let state = $("#state").val().trim();
    let country = $("#country").val().trim();
    let pincode = $("#pincode").val().trim();
    let addressType = $("#addressType").val();
    let isDefault = $("#setDefault").is(":checked");

    // Validation
    if (
      !fullName ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode ||
      !addressType
    ) {
      Swal.fire(
        "Validation Error",
        "Please fill in all required fields.",
        "warning"
      );
      return;
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(fullName)) {
      Swal.fire(
        "Validation Error",
        "Full Name must be at least 2 characters and contain only letters and spaces.",
        "warning"
      );
      return;
    }

    let phonePattern = /^\+?[0-9\s\-\(\)]{7,15}$/;
    if (!phonePattern.test(phone)) {
      Swal.fire(
        "Validation Error",
        "Phone must be 7-15 digits, optionally with +, spaces, or hyphens.",
        "warning"
      );
      return;
    }

    if (address.length < 5) {
      Swal.fire(
        "Validation Error",
        "Address must be at least 5 characters.",
        "warning"
      );
      return;
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(city)) {
      Swal.fire(
        "Validation Error",
        "City must be at least 2 characters and contain only letters and spaces.",
        "warning"
      );
      return;
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(state)) {
      Swal.fire(
        "Validation Error",
        "State must be at least 2 characters and contain only letters and spaces.",
        "warning"
      );
      return;
    }

    if (!/^[a-zA-Z\s]{2,}$/.test(country)) {
      Swal.fire(
        "Validation Error",
        "Country must be at least 2 characters and contain only letters and spaces.",
        "warning"
      );
      return;
    }

    if (!/^\d{4,10}$/.test(pincode)) {
      Swal.fire("Validation Error", "Pincode must be 4-10 digits.", "warning");
      return;
    }

    let payload = {
      fullName,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      addressType,
      isDefault,
    };
    console.log("Save payload:", payload);

    $.ajax({
      url: "/user/address",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function (response) {
        console.log("Save success:", response);
        Swal.fire("Success", "Address added successfully!", "success");
        $("#addAddressModal").modal("hide");
        location.reload();
      },
      error: function (xhr) {
        console.error(
          "Save error:",
          xhr.status,
          xhr.statusText,
          xhr.responseText
        );
        Swal.fire(
          "Error",
          "Failed to save: " + xhr.status + " " + xhr.statusText,
          "error"
        );
      },
    });
  });

  // Delete Address
  window.deleteAddress = function () {
    console.log("Delete button clicked");

    let addressId = $("#deleteAddressModal").data("addressId");
    console.log("Address ID for delete:", addressId);

    if (!addressId) {
      console.error("No addressId found for deletion");
      Swal.fire("Error", "No address ID found.", "error");
      return;
    }

    $.ajax({
      url: `/user/address/${addressId}`,
      type: "DELETE",
      success: function (response) {
        console.log("Delete success:", response);
        Swal.fire("Success", "Address deleted successfully!", "success").then(
          () => {
            location.reload();
          }
        );
        $("#deleteAddressModal").modal("hide");
      },
      error: function (xhr) {
        console.error(
          "Delete error:",
          xhr.status,
          xhr.statusText,
          xhr.responseText
        );
        Swal.fire(
          "Error",
          "Failed to delete: " + xhr.status + " " + xhr.statusText,
          "error"
        );
      },
    });
  };
});
