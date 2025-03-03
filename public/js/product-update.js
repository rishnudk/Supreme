let cropper;
let currentImageIndex;
const processedImages = new Map();
const originalPreviews = new Map();
const form = document.getElementById('productForm');

function showCropper(file, index) {
  console.log("Showing cropper modal for index:", index);
  const modal = document.getElementById('cropperModal');
  const cropperImage = document.getElementById('cropperImage');

  currentImageIndex = index;

  if (!file || !(file instanceof Blob)) {
    console.error("❌ Invalid file:", file);
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    console.log("Image loaded for cropping");
    modal.style.display = 'flex';
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

function cropImage() {
  console.log("Cropping image...");
  if (!cropper) return console.error("❌ Cropper not initialized");

  const existingImagesCount = document.querySelectorAll('input[name="existingImages[]"]').length;
  const isReplacement = document.getElementById(`preview${currentImageIndex}`).classList.contains('cropped');
  if (!isReplacement && processedImages.size >= (4 - existingImagesCount)) {
    console.error("❌ Cannot add more images; limit of 4 total images reached");
    Swal.fire({ title: "Error!", text: "Only 4 images allowed total", icon: "error" });
    return;
  }

  const canvas = cropper.getCroppedCanvas({ width: 600, height: 600 });
  if (!canvas) return console.error("❌ Canvas creation failed");

  canvas.toBlob(blob => {
    console.log("Image cropped and converted to blob:", blob.size);
    const previewElement = document.getElementById(`preview${currentImageIndex}`);
    const uploadLabel = previewElement.parentElement.nextElementSibling.querySelector('.prd-prod-upload-btn');
    const removeButton = previewElement.parentElement.nextElementSibling.querySelector('.prd-remove-image');
    const existingImageInput = previewElement.parentElement.nextElementSibling.querySelector('input[name="existingImages[]"]');

    processedImages.set(`image${currentImageIndex}`, blob);
    console.log("Stored processed image:", processedImages);

    previewElement.src = URL.createObjectURL(blob);
    previewElement.classList.add('cropped');
    previewElement.style.display = 'block';
    uploadLabel.textContent = 'Replace Image';
    removeButton.style.display = 'block';
    if (existingImageInput) existingImageInput.remove();

    document.getElementById('cropperModal').style.display = 'none';
    cropper.destroy();
    cropper = null;
  }, 'image/jpeg', 0.8);
}

function cancelCrop() {
  console.log("Cancel clicked");
  document.getElementById('cropperModal').style.display = 'none';
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

function removeImage(index) {
  console.log("Removing image for index:", index);
  const inputElement = document.getElementById(`image${index}`);
  const previewElement = document.getElementById(`preview${index}`);
  const uploadLabel = inputElement.parentElement.querySelector('.prd-prod-upload-btn');
  const removeButton = inputElement.parentElement.querySelector('.prd-remove-image');
  const existingImageInput = inputElement.parentElement.querySelector('input[name="existingImages[]"]');

  inputElement.value = '';
  previewElement.src = originalPreviews.get(`preview${index}`) || 'https://via.placeholder.com/150?text=No+Image';
  previewElement.classList.remove('cropped');
  uploadLabel.textContent = 'Add Image';
  removeButton.style.display = 'none';
  if (existingImageInput) existingImageInput.remove();
  processedImages.delete(`image${index}`);
}

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

  try {
    requiredFields.forEach(field => {
      const element = document.getElementById(field.id);
      if (!element) {
        console.error(`❌ Field ${field.name} (ID: ${field.id}) not found in DOM`);
        isValid = false;
        return;
      }
      const errorDiv = element.nextElementSibling;
      if (!errorDiv) {
        console.error(`❌ Error div missing for ${field.name} (ID: ${field.id})`);
        isValid = false;
        return;
      }
      if (!element.value.trim()) {
        console.log(`Validation error for field: ${field.name}`);
        errorDiv.textContent = `${field.name} is required`;
        isValid = false;
      } else {
        errorDiv.textContent = '';
      }
    });

    const price = document.getElementById('price');
    if (price && price.value && parseFloat(price.value) <= 0) {
      console.log("Validation error: Price must be greater than 0");
      if (price.nextElementSibling) price.nextElementSibling.textContent = 'Price must be greater than 0';
      isValid = false;
    }

    const stock = document.getElementById('stock');
    if (stock && stock.value && (isNaN(stock.value) || Number(stock.value) < 0)) {
      console.log("Validation error: Stock must be a non-negative number");
      if (stock.nextElementSibling) stock.nextElementSibling.textContent = 'Stock must be a non-negative number';
      isValid = false;
    }

    const imagesError = document.getElementById('images-error');
    if (!imagesError) {
      console.error("❌ Images error div missing");
      isValid = false;
    } else {
      const existingImagesCount = document.querySelectorAll('input[name="existingImages[]"]').length;
      const newImagesCount = processedImages.size;
      const totalImages = existingImagesCount + newImagesCount;
      if (totalImages !== 4) {
        console.log("Validation error: Exactly 4 product images required");
        imagesError.textContent = `Exactly 4 product images are required (currently ${totalImages})`;
        isValid = false;
      } else {
        imagesError.textContent = '';
      }
    }
  } catch (error) {
    console.error("❌ Validation Error:", error.message);
    isValid = false;
  }

  console.log("Validation result:", isValid ? "Passed" : "Failed");
  return isValid;
}

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

  let newImageCount = 0;
  const maxNewImages = 4 - document.querySelectorAll('input[name="existingImages[]"]').length;
  processedImages.forEach((blob, key) => {
    if (newImageCount < maxNewImages) {
      const fileName = `${key}.jpeg`;
      formData.append("images", blob, fileName);
      newImageCount++;
    }
  });

  document.querySelectorAll('input[name="existingImages[]"]').forEach(input => {
    formData.append('existingImages[]', input.value);
  });

  console.log("Final form data:", [...formData.entries()]);

  try {
    const response = await fetch(`/admin/products/update/${document.getElementById('productId').value}`, {
      method: "PUT",
      body: formData,
    });

    const result = await response.text();
    console.log("📥 Server Response:", result);

    if (response.ok) {
      console.log("✅ Product updated successfully");
      Swal.fire({
        title: "Success!",
        text: "Product updated successfully",
        icon: "success"
      }).then(() => window.location.href = "/admin/products");
    } else {
      console.error("❌ Server Error:", result);
      Swal.fire({ title: "Error!", text: "Server error: " + result, icon: "error" });
    }
  } catch (error) {
    console.error("❌ Fetch Error:", error.message);
    Swal.fire({ title: "Error!", text: "Fetch failed: " + error.message, icon: "error" });
  }
});

// Initialize original previews
document.querySelectorAll('.prd-prod-image-preview').forEach(img => {
  originalPreviews.set(img.id, img.src);
});