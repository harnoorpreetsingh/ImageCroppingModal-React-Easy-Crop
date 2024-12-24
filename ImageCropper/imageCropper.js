// *****************************************************************************************************
// A modal that opens image, can perform operations like Cropping, Rotating the image & then save/return cropped URL .
// *****************************************************************************************************



//in Parent component, create state that handles 
// const [open, setOpen] = useState(false); // Controls modal visibility

// in Parent component, which handles the Image Upload, give control to open Modal 
// useEffect(() => {
//     if (uploadedImages.length > 0) {
//       const file = uploadedImages[0];
//       const blobUrl = URL.createObjectURL(file);
//       setUploadedImage(blobUrl);
//       setOpen(true) // Opens the Modal on Upload
//     }
//   }, [uploadedImages]);


//Passing props to this component

{/* <EImageCropper
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
              open={open}
              setOpen={setOpen}
              
            /> */}


// ******************************************************************************************************

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

// Function to crop the image using canvas
const getCroppedImg = (imageSrc, pixelCrop, rotation = 0) => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = pixelCrop.width;
      const height = pixelCrop.height;
      canvas.width = width;
      canvas.height = height;

      // Apply rotation to the canvas context
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, width, height, -width / 2, -height / 2, width, height);

      // Return the cropped image as a base64
      const croppedImage = canvas.toDataURL('image/jpeg');
      resolve(croppedImage);  // Return the cropped image as a data URL
    };

    image.onerror = (err) => {
      reject(err, 'Error loading image');
    };
  });
};

const EImageCropper = ({ uploadedImage, setUploadedImage, open,setOpen  }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // const [open, setOpen] = useState(false); // Controls modal visibility
  const [error, setError] = useState(''); // Error message state

 

  // Reset states when the modal is closed
  const handleClose = () => {
    setCrop({ x: 0, y: 0 });  // Reset crop position
    setZoom(1);  // Reset zoom
    setRotation(0);  // Reset rotation
    setError(''); // Reset error message
    setOpen(false);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      // Get cropped image
      const croppedImage = await getCroppedImg(uploadedImage, croppedAreaPixels, rotation);
      setUploadedImage(croppedImage);  // Set the cropped image
      console.log(uploadedImage, "uploaded Image Link?????")
      handleClose(); // Close the modal
    } catch (e) {
      console.error('Error cropping the image:', e);
      setError('Error cropping the image. Please try again.'); // Show error message
    }
  };
// console.log(open ,">>>>>>>>>>>>>>>   open")
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Crop Your Image</DialogTitle>
      <DialogContent>
        <div style={{ position: 'relative', width: '100%', height: 400 }}>
          <Cropper
            image={uploadedImage}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {error && (
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
        )}

        <div style={{ marginTop: '20px' }}>
          <Typography variant="overline" gutterBottom>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e, newZoom) => setZoom(newZoom)}
            valueLabelDisplay="auto"
            aria-labelledby="zoom-slider"
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <Typography variant="overline" gutterBottom>
            Rotation
          </Typography>
          <Slider
            value={rotation}
            min={0}
            max={360}
            step={1}
            onChange={(e, newRotation) => setRotation(newRotation)}
            valueLabelDisplay="auto"
            aria-labelledby="rotation-slider"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button  onClick={handleClose} color="secondary">
        </Button>
        <Button onClick={showCroppedImage}  color="primary">
          Save Cropped Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EImageCropper;