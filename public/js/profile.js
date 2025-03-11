        // function togglePassword(fieldId) {
        //     const field = document.getElementById(fieldId);
        //     const icon = field.nextElementSibling.querySelector('i');
            
        //     if (field.type === 'password') {
        //         field.type = 'text';
        //         icon.classList.remove('fa-eye');
        //         icon.classList.add('fa-eye-slash');
        //     } else {
        //         field.type = 'password';
        //         icon.classList.remove('fa-eye-slash');
        //         icon.classList.add('fa-eye');
        //     }
        // }
       

        
        function updatePreview() {
            // Update preview section with form values
            document.getElementById('preview-name').textContent = document.getElementById('fullName').value;
            document.getElementById('preview-email').textContent = document.getElementById('email').value;
            document.getElementById('preview-phone').textContent = document.getElementById('phone').value;
            
            // Format date for display
            const birthdate = new Date(document.getElementById('birthdate').value);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('preview-birthdate').textContent = birthdate.toLocaleDateString('en-US', options);
            
            // Get gender value
            const genderSelect = document.getElementById('gender');
            const selectedGender = genderSelect.options[genderSelect.selectedIndex].text;
            document.getElementById('preview-gender').textContent = selectedGender;
            
            // Show success message
            const form = document.getElementById('profileForm');
            
            // Check if success alert already exists
            const existingAlert = form.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }
            
            // Create and add success alert
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success mt-3';
            successAlert.role = 'alert';
            successAlert.textContent = 'Profile updated successfully!';
            
            // Add close button
            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'btn-close';
            closeButton.setAttribute('data-bs-dismiss', 'alert');
            closeButton.setAttribute('aria-label', 'Close');
            successAlert.appendChild(closeButton);
            
            form.appendChild(successAlert);
            
            // Auto close after 3 seconds
            setTimeout(() => {
                successAlert.remove();
            }, 3000);
        }


        function validatePassword(password) {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return regex.test(password);
        }
        document.addEventListener("DOMContentLoaded", function () {
            console.log("JS Loaded ✅"); // Debugging step 1
        
            const updateBtn = document.getElementById("updatePasswordBtn");
            if (!updateBtn) {
                console.error("Update Password Button Not Found ❌");
                return;
            }
        
            updateBtn.addEventListener("click", async function () {
                console.log("Button Clicked ✅"); // Debugging step 2
        
                const currentPassword = document.getElementById("currentPassword").value.trim();
                const newPassword = document.getElementById("newPassword").value.trim();
                const confirmPassword = document.getElementById("confirmPassword").value.trim();
                console.log("Current:", currentPassword, "New:", newPassword, "Confirm:", confirmPassword); // Debugging step 3
                
                // Client-side validation
                if (!currentPassword || !newPassword || !confirmPassword) {
                    Swal.fire("Error", "All fields are required!", "error");
                    return;
                }
        
                if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[@$!%*?&]/.test(newPassword)) {
                    Swal.fire("Error", "New password does not meet requirements!", "error");
                    return;
                }
        
                if (newPassword !== confirmPassword) {
                    Swal.fire("Error", "New passwords do not match!", "error");
                    return;
                }
        
                // Send request to backend (RESET PASSWORD ROUTE)
                try {
                    const response = await fetch('/user/change-password', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ currentPassword, newPassword,confirmPassword})
                    });
        
                    const data = await response.json();
                    console.log("Response:", data); // Debugging step 4
        
                    if (data.success) {
                        Swal.fire("Success", data.message, "success");
                        document.getElementById("currentPassword").value = "";
                        document.getElementById("newPassword").value = "";
                        document.getElementById("confirmPassword").value = "";
                    } else {
                        Swal.fire("Error", data.message, "error");
                    }
                } catch (error) {
                    console.error("Fetch Error:", error); // Debugging step 5
                    Swal.fire("Error", "Something went wrong!", "error");
                }
            });
        });
        
        
        // Toggle password visibility
        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            field.type = field.type === "password" ? "text" : "password";
        }
        

        async function updatePreview() {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const phone = document.getElementById("phone").value;
          
            const data = { name, email, phone };
          
            try {
              const response = await fetch("/user/update-profile", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              });
          
              const result = await response.json();
              if (result.success) {
                alert("Profile updated successfully!");
                window.location.reload(); // Reload page after update
              } else {
                alert(result.message);
              }
            } catch (error) {
              console.error("Error updating profile:", error);
              alert("Something went wrong. Please try again!");
            }
          }
        