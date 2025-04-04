const cloudinary = require('cloudinary').v2;




async function uploadImageToCloudinary(imagePath) {
    // Configure Cloudinary
cloudinary.config({
    cloud_name: 'dfm9b5jpx',
    api_key: '732623928637278',
    api_secret: '_tgjISFg6oR452QY8Lda_YcVwLw'
  });
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'curriculum_images' // Optional folder for organization
    });
    console.log('Image uploaded successfully:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Example usage
// const imagePath = './image.jpg';
// uploadImageToCloudinary(imagePath)
//   .then(url => console.log('Uploaded Image URL:', url))
//   .catch(err => console.error(err));

module.exports = {uploadImageToCloudinary}