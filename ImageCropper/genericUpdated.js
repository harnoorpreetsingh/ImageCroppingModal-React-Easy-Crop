if your component is uploading an image by default, before cropping, it means that it is directly setting image in state. 
To prevent this, use this component that stores uploaded image in temporary state & sets image 
only when image is set using button in Modal else, image will stay empty/null as supposed. 

// *****************************************************************************************************

const [tempUploadedImage, setTempUploadedImage] = useState(null); // Temporary image for cropping

useEffect(() => {
    if (!uploadedImage) {
    }
  }, [uploadedImage, cropOpen]);

  const watchPrice = watch("price");
  const watchName = watch("name");


  const handleImageRemove = () => {
    setUploadedImage(null); // Clear the final uploaded image
    setTempUploadedImage(null); // Reset the temporary image
    setCropOpen(false); // Close the crop modal
  };


  const handleImageUpload = (newImage) => {
    console.log("Updated Image in Parent:", newImage); // Log the updated image
    setUploadedImage(newImage);
  };


  const handleImageChange = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      setTempUploadedImage(URL.createObjectURL(file)); // Store the temporary image URL
      setCropOpen(true); // Open the crop modal
    }
  };

  
  const handleSaveCroppedImage = () => {
    setUploadedImage(tempUploadedImage); // Save the cropped image
    setCropOpen(false); // Close the crop modal
  };


  pass like:
  
  <EImageCropper
  uploadedImage={tempUploadedImage} // The image to crop
  setUploadedImage={handleImageUpload} // Function to update the parent state after cropping
  cropOpen={cropOpen} // Whether the crop dialog is open
  setCropOpen={setCropOpen} // Function to control crop dialog visibility
/>


// -------------------- C O M P O N E N T   S T A R T S:  ------------------------
// -------------------- C O M P O N E N T   S T A R T S:  ------------------------



import React, { useState, useMemo, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const generateFileName = () => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  return `image_${timestamp}_${crypto.randomUUID()}.jpg`;
};

async function urltoFile(url, filename, mimeType) {
  if (url.startsWith("data:")) {
    var arr = url.split(",");
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[arr.length - 1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var file = new File([u8arr], filename, { type: mime || mimeType });
    return Promise.resolve(file);
  }
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new File([buf], filename, { type: mimeType });
}

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

const EImageCropper = ({
  uploadedImage,
  setUploadedImage,
  cropOpen,
  setCropOpen,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");

  const imageSrc = useMemo(() => {
    if (typeof uploadedImage === "string") {
      return uploadedImage;
    }
    if (uploadedImage instanceof File) {
      return URL.createObjectURL(uploadedImage);
    }
    return "";
  }, [uploadedImage]);

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setError("");
    setCropOpen(false);
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
      console.log("Cropping image...");
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      
      // Debugging: Log the cropped image
      console.log("Cropped Image:", croppedImage);
      
      setUploadedImage(croppedImage); // Set the cropped image
      handleClose(); // Close the modal after setting the image
      console.log("Image updated in parent component.");
    } catch (e) {
      console.error("Error cropping the image:", e);
      setError("Error cropping the image. Please try again.");
    }
  };

  useEffect(() => {
    if (typeof uploadedImage !== "string" && uploadedImage instanceof File) {
      return () => {
        URL.revokeObjectURL(imageSrc);
      };
    }
  }, [uploadedImage, imageSrc]);

  return (
    <Dialog open={cropOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Crop Your Image</DialogTitle>
      <DialogContent>
        <div style={{ position: "relative", width: "100%", height: 400 }}>
          {imageSrc ? (
            <Cropper
              key={imageSrc}
              image={imageSrc}
              crop={crop}
              rotation={rotation}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          ) : (
            <Typography variant="h6" color="textSecondary">
              No image selected
            </Typography>
          )}
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={showCroppedImage}>Save Cropped Image</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EImageCropper;
