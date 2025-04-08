


let cropper;
let currentImageInput;
const processedImages = new Map();
const originalPreviews = new Map();
const form = document.getElementById('productForm');

// Function: showCropper
function showCropper(file, index) {
    console.log("Showing cropper modal for index:", index);
    const modal = document.getElementById('cropperModal');
    const cropperImage = document.getElementById('cropperImage');

    currentImageInput = document.getElementById(`image${index}`);

    if (!file || !(file instanceof Blob)) {
        console.error("❌ Invalid file:", file);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        console.log("Image loaded for cropping");
        modal.style.display = 'block';
        cropperImage.src = e.target.result;

        if (cropper) cropper.destroy();
        cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 2,
            autoCropArea: 1,
            responsive: true,
            ready: () => console.log("✅ Cropper ready")
        });
    };
    reader.readAsDataURL(file);
}

// Function: cropImage
function cropImage() {
    console.log("Cropping image...");
    if (!cropper) return console.error("❌ Cropper not initialized");

    const canvas = cropper.getCroppedCanvas({ width: 600, height: 600 });
    if (!canvas) return console.error("❌ Canvas creation failed");

    canvas.toBlob(blob => {
        console.log("Image cropped and converted to blob:", blob.size);
        const index = currentImageInput.id.replace('image', '');
        const previewElement = document.getElementById(`preview${index}`);
        const uploadLabel = currentImageInput.parentElement;
        const removeButton = uploadLabel.parentElement.querySelector('.remove-image');

        processedImages.set(currentImageInput.id, blob);
        console.log("Stored processed image:", processedImages);

        previewElement.src = URL.createObjectURL(blob);
        previewElement.classList.add('cropped');
        previewElement.style.display = 'block';
        uploadLabel.style.display = 'none';
        removeButton.style.display = 'block';

        document.getElementById('cropperModal').style.display = 'none';
        cropper.destroy();
        cropper = null;
    }, 'image/jpeg', 0.8);
}

// Function: cancelCrop
function cancelCrop() {
    console.log("Cancel clicked");
    if (currentImageInput) {
        const index = currentImageInput.id.replace('image', '');
        const previewElement = document.getElementById(`preview${index}`);
        const uploadLabel = currentImageInput.parentElement;
        const removeButton = uploadLabel.parentElement.querySelector('.remove-image');

        currentImageInput.value = '';
        previewElement.src = originalPreviews.get(`preview${index}`) || 'https://via.placeholder.com/150?text=No+Image';
        previewElement.classList.remove('cropped');
        uploadLabel.style.display = 'block';
        removeButton.style.display = 'none';
        processedImages.delete(currentImageInput.id);
    }
    document.getElementById('cropperModal').style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
}

// Function: removeImage
function removeImage(index) {
    console.log("Removing image for index:", index);
    const inputElement = document.getElementById(`image${index}`);
    const previewElement = document.getElementById(`preview${index}`);
    const uploadLabel = inputElement.parentElement;
    const removeButton = uploadLabel.parentElement.querySelector('.remove-image');

    inputElement.value = '';
    previewElement.classList.remove('cropped');
    previewElement.src = originalPreviews.get(`preview${index}`) || 'https://via.placeholder.com/150?text=No+Image';
    uploadLabel.style.display = 'block';
    removeButton.style.display = 'none';
    processedImages.delete(inputElement.id);
}

// Function: validateForm (Debug Version)
function validateForm() {
    console.log("Validating form...");
    let isValid = true;
    const requiredFields = [
        { id: 'name', name: 'Name' },
        { id: 'brand', name: 'Brand' },
        { id: 'price', name: 'Price' },
        { id: 'description', name: 'Description' },
        { id: 'category', name: 'Category' },
        { id: 'status', name: 'Status' },
        { id: 'color', name: 'Color' },
        { id: 'stock', name: 'Stock' }
    ];

    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const errorDiv = element ? element.nextElementSibling : null;

        console.log(`🔍 Debugging ${field.name}:`, {
            elementExists: !!element,
            elementValue: element ? element.value : 'N/A',
            errorDivExists: !!errorDiv,
            errorDivId: errorDiv ? errorDiv.id : 'N/A'
        });

        if (!element) {
            console.error(`❌ Field ${field.name} (ID: ${field.id}) not found in DOM`);
            isValid = false;
            return;
        }

        if (!element.value.trim()) {
            console.log(`Validation error for field: ${field.name}`);
            if (errorDiv) {
                errorDiv.textContent = `${field.name} is required`;
            } else {
                console.error(`❌ Error div for ${field.name} (ID: ${field.id}) is null`);
            }
            isValid = false;
        } else if (errorDiv) {
            errorDiv.textContent = '';
        }
    });

    const price = document.getElementById('price');
    if (price && price.value && parseFloat(price.value) <= 0) {
        console.log("Validation error: Price must be greater than 0");
        if (price.nextElementSibling) {
            price.nextElementSibling.textContent = 'Price must be greater than 0';
        }
        isValid = false;
    }

    const stock = document.getElementById('stock');
    if (stock && stock.value && (isNaN(stock.value) || Number(stock.value) < 0)) {
        console.log("Validation error: Stock must be a non-negative number");
        if (stock.nextElementSibling) {
            stock.nextElementSibling.textContent = 'Stock must be a non-negative number';
        }
        isValid = false;
    }

    const productImages = Array.from(processedImages.keys()).filter(key => key.startsWith('image'));
    const imagesError = document.getElementById('images-error');
    if (productImages.length !== 4) {
        console.log("Validation error: Exactly 4 product images required");
        if (imagesError) {
            imagesError.textContent = 'Exactly 4 product images are required';
        }
        isValid = false;
    } else if (imagesError) {
        imagesError.textContent = '';
    }

    console.log("Validation result:", isValid ? "Passed" : "Failed");
    return isValid;
}

// Function: submitForm
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log("Form submission triggered");

    if (!validateForm()) {
        console.log("Form validation failed");
        return;
    }

    console.log("✅ Form validation passed");
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('brand', document.getElementById('brand').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('status', document.getElementById('status').value);
    formData.append('color', document.getElementById('color').value);
    formData.append('stock', document.getElementById('stock').value);

    processedImages.forEach((blob, key) => {
        const fileName = `${key}.jpeg`;
        formData.append("images", blob, fileName);
    });

    console.log("Final form data:", [...formData.entries()]);

    try {
        const response = await fetch("/admin/products/add", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        console.log("📥 Server Response:", result);

        if (response.ok) {
            console.log("✅ Product saved successfully");
            form.reset();
            processedImages.clear();
            document.querySelectorAll('.image-preview').forEach(img => {
                img.classList.remove('cropped');
                img.src = originalPreviews.get(img.id) || 'https://via.placeholder.com/150?text=No+Image';
                img.parentElement.querySelector('.upload-label').style.display = 'block';
                img.parentElement.querySelector('.remove-image').style.display = 'none';
            });
            Swal.fire({
                title: "Success!",
                text: "Product saved successfully",
                icon: "success"
            }).then(() => window.location.href = "/admin/products");
        } else {
            console.error("❌ Server Error:", result.error || response.statusText);
            Swal.fire({ title: "Error!", text: result.error || "Server error", icon: "error" });
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error.message);
        Swal.fire({ title: "Error!", text: "Fetch failed: " + error.message, icon: "error" });
    }
});

// Initialize original previews
document.querySelectorAll('.image-preview').forEach(img => {
    originalPreviews.set(img.id, img.src);
});

// Debug Button (Add this to your HTML and script)
document.getElementById('debugButton') && document.getElementById('debugButton').addEventListener('click', () => {
    console.log("🛠️ Debug Validation Triggered");
    validateForm();
});