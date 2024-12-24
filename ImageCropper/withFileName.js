// In case your API demands fileName with image as when we upload image from base64/blob, it doesnot give a filename. So, have generate it here.

// EImageCropper component: Allows users to crop, zoom, and rotate an image interactively. 
// It uses `react-easy-crop` for cropping and Material UI for UI elements like sliders and dialogs. 
// The component generates a unique file name for the cropped image and converts the cropped area to a data URL. 
// This data URL is then transformed into a `File` object for further processing or saving. 
// It manages state for crop position, zoom, rotation, and handles error messages related to cropping.




import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const generateFileName = () => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, ""); // Get a unique timestamp
  return `image_${timestamp}_${crypto.randomUUID()}.jpg`; // Generate the file name
};

function urltoFile(url, filename, mimeType) {
  if (url.startsWith("data:")) {
    var arr = url.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var file = new File([u8arr], filename, { type: mime || mimeType });
    return Promise.resolve(file);
  }
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: mimeType }));
}

// Function to crop the image using canvas
const getCroppedImg = (imageSrc, pixelCrop, rotation = 0) => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = pixelCrop.width;
      const height = pixelCrop.height;
      canvas.width = width;
      canvas.height = height;

      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        width,
        height,
        -width / 2,
        -height / 2,
        width,
        height
      );

      const dataUrl = canvas.toDataURL("image/jpeg");
      const fileObject = await urltoFile(dataUrl, generateFileName(), "image/jpeg");
      resolve(fileObject);
    };

    image.onerror = (err) => {
      reject("Error loading image.");
    };
  });
};

const EImageCropper = ({ uploadedImage, setUploadedImage, open, setOpen }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setError("");
    setOpen(false);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    if (!croppedAreaPixels) {
      setError("Please select a crop area.");
      return;
    }

    try {
      const croppedImage = await getCroppedImg(
        uploadedImage,
        croppedAreaPixels,
        rotation
      );
      setUploadedImage(croppedImage);
      handleClose();
    } catch (e) {
      console.error("Error cropping the image:", e);
      setError("Error cropping the image. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Crop Your Image</DialogTitle>
      <DialogContent>
        <div style={{ position: "relative", width: "100%", height: 400 }}>
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

        <div style={{ marginTop: "20px" }}>
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

        <div style={{ marginTop: "20px" }}>
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
        <Button onClick={handleClose} color="secondary">
          Auto-Crop
        </Button>
        <Button onClick={showCroppedImage} color="primary">
          Save Cropped Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EImageCropper;


// ---------------------------------- WITH COMMENTS ----------------------------------
// ---------------------------------- WITH COMMENTS ----------------------------------

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// Generates a unique file name based on timestamp and random UUID
const generateFileName = () => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, ""); // Get a unique timestamp
  return `image_${timestamp}_${crypto.randomUUID()}.jpg`; // Generate the file name
};

// Converts data URL to File object for further processing or saving
function urltoFile(url, filename, mimeType) {
  if (url.startsWith("data:")) {
    var arr = url.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]), // Decode the base64 string
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n); // Convert base64 string to byte array
    }
    var file = new File([u8arr], filename, { type: mime || mimeType });
    return Promise.resolve(file); // Return the file as a Promise
  }
  return fetch(url)
    .then((res) => res.arrayBuffer()) // Fetch the image as an array buffer
    .then((buf) => new File([buf], filename, { type: mimeType })); // Convert buffer to File object
}

// Function to crop the image using canvas and apply rotation
const getCroppedImg = (imageSrc, pixelCrop, rotation = 0) => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = pixelCrop.width;
      const height = pixelCrop.height;
      canvas.width = width;
      canvas.height = height;

      ctx.translate(width / 2, height / 2); // Set rotation center
      ctx.rotate((rotation * Math.PI) / 180); // Rotate image
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        width,
        height,
        -width / 2,
        -height / 2,
        width,
        height
      ); // Draw cropped and rotated image on canvas

      const dataUrl = canvas.toDataURL("image/jpeg"); // Convert canvas to data URL
      const fileObject = await urltoFile(dataUrl, generateFileName(), "image/jpeg"); // Convert data URL to File object
      resolve(fileObject); // Resolve with the cropped image file
    };

    image.onerror = (err) => {
      reject("Error loading image."); // Handle image loading error
    };
  });
};

// EImageCropper component: Allows users to crop, zoom, and rotate an image interactively.
// Uses `react-easy-crop` for cropping and Material UI for UI components like sliders and dialogs.
// It generates a unique file name for the cropped image, converts the cropped area to a data URL, 
// and transforms it into a `File` object for further processing or saving. 
const EImageCropper = ({ uploadedImage, setUploadedImage, open, setOpen }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");

  // Close the cropper and reset states
  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setError("");
    setOpen(false);
  };

  // Callback to handle crop area completion
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels); // Save cropped area pixel data
  }, []);

  // Show cropped image and save it after adjustments
  const showCroppedImage = async () => {
    if (!croppedAreaPixels) {
      setError("Please select a crop area."); // Error if no crop area is selected
      return;
    }

    try {
      const croppedImage = await getCroppedImg(
        uploadedImage,
        croppedAreaPixels,
        rotation
      ); // Get cropped image file
      setUploadedImage(croppedImage); // Update the uploaded image state
      handleClose(); // Close the dialog
    } catch (e) {
      console.error("Error cropping the image:", e); // Log error
      setError("Error cropping the image. Please try again."); // Display error
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Crop Your Image</DialogTitle>
      <DialogContent>
        {/* Image cropping area */}
        <div style={{ position: "relative", width: "100%", height: 400 }}>
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

        {/* Display error message if any */}
        {error && (
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
        )}

        {/* Zoom control slider */}
        <div style={{ marginTop: "20px" }}>
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

        {/* Rotation control slider */}
        <div style={{ marginTop: "20px" }}>
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
        {/* Close button */}
        <Button onClick={handleClose} color="secondary">
          Auto-Crop
        </Button>
        {/* Save cropped image button */}
        <Button onClick={showCroppedImage} color="primary">
          Save Cropped Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EImageCropper;
