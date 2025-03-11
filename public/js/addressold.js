


// //save address


// document.getElementById("saveAddressBtn").addEventListener("click", async function () {
//     const addressData = {
//         fullName: document.getElementById("fullName").value,
//         phone: document.getElementById("phone").value,
//         address: document.getElementById("address").value,
//         city: document.getElementById("city").value,
//         state: document.getElementById("state").value,
//         country: document.getElementById("country").value,
//         pincode: document.getElementById("pincode").value,
//         addressType: document.getElementById("addressType").value,
//         isDefault: document.getElementById("setDefault").checked, // Checkbox value
//     };

//     try {
//         const response = await fetch("/user/address", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(addressData)
//         });

//         const result = await response.json();

//         if (response.ok) {
//             alert("Address added successfully!");
//             window.location.reload(); // Reload to update the UI
//         } else {
//             alert(result.message || "Error adding address");
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         alert("Something went wrong!");
//     }
// });


// //ajax update request
// document.addEventListener('DOMContentLoaded', function() {
//     // Load Address Data into Edit Modal
//     window.loadAddressData = function(apiPath) {
//         $.ajax({
//             url: apiPath,
//             type: "GET",
//             dataType: "json",
//             success: function(response) {
//                 if (response.address) {
//                     $("#editAddressModal").data('addressId', response.address._id);
//                     $("#editFullName").val(response.address.fullName || '');
//                     $("#editPhone").val(response.address.phone || '');
//                     $("#editAddress").val(response.address.address || '');
//                     $("#editCity").val(response.address.city || '');
//                     $("#editState").val(response.address.state || '');
//                     $("#editCountry").val(response.address.country || '');
//                     $("#editPincode").val(response.address.pincode || '');
//                     $("#editAddressType").val(response.address.addressType || '');
//                     $("#editSetDefault").prop("checked", response.address.setDefault || false);
//                 } else {
//                     console.error('No address data in response:', response);
//                     alert("Failed to load address data.");
//                 }
//             },
//             error: function(xhr) {
//                 console.error('Error loading address:', xhr);
//                 alert("Failed to load address. Please try again.");
//             }
//         });
//     };

//     // Update Address (Edit Modal)
//     $("#updateAddressBtn").click(function(event) {
//         event.preventDefault();

//         let fullName = $("#editFullName").val().trim();
//         let phone = $("#editPhone").val().trim();
//         let address = $("#editAddress").val().trim();
//         let city = $("#editCity").val().trim();
//         let state = $("#editState").val().trim();
//         let country = $("#editCountry").val().trim();
//         let pincode = $("#editPincode").val().trim();
//         let addressType = $("#editAddressType").val();
//         let setDefault = $("#editSetDefault").is(":checked");

//         if (!fullName || !phone || !address || !city || !state || !country || !pincode) {
//             alert("Please fill in all required fields.");
//             return;
//         }

//         let phonePattern = /^\+?[0-9\s\-\(\)]{7,15}$/;
//         if (!phonePattern.test(phone)) {
//             alert("Please enter a valid phone number.");
//             return;
//         }

//         if (!/^\d{4,10}$/.test(pincode)) {
//             alert("Please enter a valid postal/zip code.");
//             return;
//         }

//         let addressId = $('#editAddressModal').data('addressId');
//         if (!addressId) {
//             alert("No address ID found. Please try again.");
//             return;
//         }

//         $.ajax({
//             url: `/user/edit/${addressId}`,
//             type: "PUT",
//             contentType: "application/json",
//             data: JSON.stringify({
//                 fullName,
//                 phone,
//                 address,
//                 city,
//                 state,
//                 country,
//                 pincode,
//                 addressType,
//                 setDefault
//             }),
//             success: function(response) {
//                 alert("Address updated successfully!");
//                 $("#editAddressModal").modal("hide");
//                 location.reload();
//             },
//             error: function(xhr) {
//                 console.error('Error updating address:', xhr);
//                 alert("Failed to update address: " + (xhr.responseJSON?.message || "Server error"));
//             }
//         });
//     });

//     // Save New Address (Add Modal)
//     $("#saveAddressBtn").click(function(event) {
//         event.preventDefault();

//         let fullName = $("#fullName").val().trim();
//         let phone = $("#phone").val().trim();
//         let address = $("#address").val().trim();
//         let city = $("#city").val().trim();
//         let state = $("#state").val().trim();
//         let country = $("#country").val().trim();
//         let pincode = $("#pincode").val().trim();
//         let addressType = $("#addressType").val();
//         let setDefault = $("#setDefault").is(":checked");

//         if (!fullName || !phone || !address || !city || !state || !country || !pincode) {
//             alert("Please fill in all required fields.");
//             return;
//         }

//         let phonePattern = /^\+?[0-9\s\-\(\)]{7,15}$/;
//         if (!phonePattern.test(phone)) {
//             alert("Please enter a valid phone number.");
//             return;
//         }

//         if (!/^\d{4,10}$/.test(pincode)) {
//             alert("Please enter a valid postal/zip code.");
//             return;
//         }

//         $.ajax({
//             url: "/address",
//             type: "POST",
//             contentType: "application/json",
//             data: JSON.stringify({
//                 fullName,
//                 phone,
//                 address,
//                 city,
//                 state,
//                 country,
//                 pincode,
//                 addressType,
//                 setDefault
//             }),
//             success: function(response) {
//                 alert("Address added successfully!");
//                 $("#addAddressModal").modal("hide");
//                 location.reload();
//             },
//             error: function(xhr) {
//                 console.error('Error adding address:', xhr);
//                 alert("Failed to add address: " + (xhr.responseJSON?.message || "Server error"));
//             }
//         });
//     });
// });




document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, jQuery available:', typeof $ !== 'undefined');

    // Load Address Data into Edit Modal
    window.loadAddressData = function(apiPath) {
        console.log('Loading address from:', apiPath);
        $.ajax({
            url: apiPath,
            type: "GET",
            dataType: "json",
            success: function(response) {
                console.log('Load response:', response);
                if (response.address) {
                    $("#editAddressModal").data('addressId', response.address._id);
                    console.log('Set addressId:', response.address._id);
                    $("#editFullName").val(response.address.fullName || '');
                    $("#editPhone").val(response.address.phone || '');
                    $("#editAddress").val(response.address.address || '');
                    $("#editCity").val(response.address.city || '');
                    $("#editState").val(response.address.state || '');
                    $("#editCountry").val(response.address.country || '');
                    $("#editPincode").val(response.address.pincode || '');
                    $("#editAddressType").val(response.address.addressType || '');
                    $("#editSetDefault").prop("checked", response.address.isDefault || false);
                } else {
                    console.error('No address data in response:', response);
                    alert("Failed to load address data.");
                }
            },
            error: function(xhr) {
                console.error('Load error:', xhr.status, xhr.statusText, xhr.responseText);
                alert("Failed to load address: " + xhr.status + " " + xhr.statusText);
            }
        });
    };

    // Update Address
    $("#updateAddressBtn").click(function(event) {
        event.preventDefault();
        console.log('Update button clicked');
        
        let addressId = $('#editAddressModal').data('addressId');
        console.log('Address ID for update:', addressId);
        
        let fullName = $("#editFullName").val().trim();
        let phone = $("#editPhone").val().trim();
        let address = $("#editAddress").val().trim();
        let city = $("#editCity").val().trim();
        let state = $("#editState").val().trim();
        let country = $("#editCountry").val().trim();
        let pincode = $("#editPincode").val().trim();
        let addressType = $("#editAddressType").val();
        let isDefault = $("#editSetDefault").is(":checked");

        if (!addressId) {
            console.error('No addressId found');
            alert("No address ID found.");
            return;
        }

        let payload = { fullName, phone, address, city, state, country, pincode, addressType, isDefault };
        console.log('Update payload:', payload);

        $.ajax({
            url: `/user/edit/${addressId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function(response) {
                console.log('Update success:', response);
                alert("Address updated successfully!");
                $("#editAddressModal").modal("hide");
                location.reload();
            },
            error: function(xhr) {
                console.error('Update error:', xhr.status, xhr.statusText, xhr.responseText);
                alert("Failed to update: " + xhr.status + " " + xhr.statusText);
            }
        });
    });

    // Save New Address
    $("#saveAddressBtn").click(function(event) {
        event.preventDefault();
        console.log('Save button clicked');

        let fullName = $("#fullName").val().trim();
        let phone = $("#phone").val().trim();
        let address = $("#address").val().trim();
        let city = $("#city").val().trim();
        let state = $("#state").val().trim();
        let country = $("#country").val().trim();
        let pincode = $("#pincode").val().trim();
        let addressType = $("#addressType").val();
        let isDefault = $("#setDefault").is(":checked");

        let payload = { fullName, phone, address, city, state, country, pincode, addressType, isDefault };
        console.log('Save payload:', payload);

        $.ajax({
            url: "/user/address",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function(response) {
                console.log('Save success:', response);
                alert("Address added successfully!");
                $("#addAddressModal").modal("hide");
                location.reload();
            },
            error: function(xhr) {
                console.error('Save error:', xhr.status, xhr.statusText, xhr.responseText);
                alert("Failed to save: " + xhr.status + " " + xhr.statusText);
            }
        });
    });
});