# Image Cropper Modal Component

This repository contains a React component for an image modal that allows users to upload, crop, rotate, and save images. The modal allows users to preview images, perform image manipulations like cropping and rotating, and return the cropped image's URL for further use.

## Features

- **Upload Image**: The component allows image uploads from the user's device.
- **Crop Image**: After uploading, users can crop the image according to their needs.
- **Rotate Image**: Users can rotate the image as needed.
- **Save Image**: After performing the desired operations, the cropped image URL can be saved or returned to the parent component.
- **Modal Control**: The modal can be opened or closed based on the state in the parent component.
- **Blob URL for Upload**: Returns a Blob URL for the uploaded image, which can be used for saving or further processing.
- **Base64 URL for Preview**: The image preview is displayed using the Base64 encoded URL for immediate previewing.

- **Install Required Dependencies**:
   Install `react-easy-crop` for cropping functionality.

   ```bash
   npm install react-easy-crop
   ```

## Components

### 1. Parent Component

The parent component is responsible for handling the state of the uploaded image, controlling the modal visibility, and passing necessary props to the `EImageCropper` component.

#### Example of Parent Component Code

```jsx
import React, { useState, useEffect } from 'react';
import EImageCropper from './EImageCropper';

const ParentComponent = () => {
  const [open, setOpen] = useState(false); // Controls modal visibility
  const [uploadedImage, setUploadedImage] = useState(null); // Stores uploaded image URL
  const [uploadedImages, setUploadedImages] = useState([]); // Stores uploaded images

  // Handle image upload
  useEffect(() => {
    if (uploadedImages.length > 0) {
      const file = uploadedImages[0];
      const blobUrl = URL.createObjectURL(file);
      setUploadedImage(blobUrl);
      setOpen(true); // Opens the modal on upload
    }
  }, [uploadedImages]);

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setUploadedImages(e.target.files)}
      />
      <EImageCropper
        uploadedImage={uploadedImage}
        setUploadedImage={setUploadedImage}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

export default ParentComponent;
```


### Key Changes:

- **Added Installation Instructions**: The command to install `react-easy-crop` has been added.
- **Code**: Again, The example code  uses `react-easy-crop` for the cropping functionality.

This should now be ready for a smooth setup and usage with `react-easy-crop`.
