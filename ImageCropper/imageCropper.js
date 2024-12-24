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



// put key={uploadedImage ? "uploaded" : "not-uploaded"} in case of same image upload to avoid modal not opening on choosing same click (helps in refreshing image input)


  {/* <input
  key={uploadedImage ? "uploaded" : "not-uploaded"}
  type="file"
  style={{ display: "none" }}
  accept=".png, .jpg, .jpeg"
  {...register("image")}
  /> */}



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


// *****************************************************************************************************

// In case of returning a Blob URL for uploads & previewing base64 URL for preview

// Assuming 'croppedBlob' is your Blob containing the cropped image
// const imageUrl = URL.createObjectURL(croppedBlob);

// Now you can use the imageUrl to display the image in an <img> tag
<img src={imageUrl} alt="Cropped Image" style={{ width: '100%', height: 'auto' }} />

// *****************************************************************************************************

// changes made in PARENT : 

//------------------------- SAMPLE CODE WITH CHANGE FOR URL CREATION ---------------------- 


// <Box className="flex flex-col">
// <InputLabel className="!text-[--barber-input-label] Poppins500 !gap-1 lg:!text-[16px] sm:!text-base !text-sm mb-1">
//   Upload Image
//   <RequiredFieldSymbol />
// </InputLabel>
// <label
//   className={cn(
//     "!rounded-lg !text-xs !w-[145px] !h-[145px] !items-center cursor-pointer !justify-center !gap-1 !whitespace-nowrap text-center !my-auto",
//     {
//       "border-2 !border-dashed border-[--input-color]":
//         !uploadedImage,
//     }
//   )}
//   style={{ textAlign: "center" }}
// >
//   <input
//     key={uploadedImage ? "uploaded" : "not-uploaded"}
//     type="file"
//     style={{ display: "none" }}
//     accept=".png, .jpg, .jpeg"
//     {...register("image")}
//   />
//   {uploadedImage ? (
//     <>
//       <span
//         className="bg-[--primary] rounded-full p-2 cursor-pointer"
//         style={{
//           position: "relative",
//           top: 4,
//           left: "44%",
//           right: 0,
//           zIndex: 1,
//         }}
//         onClick={(event) => {
//           event.preventDefault();
//           setUploadedImage(null);
//           setValue("image", []);
//         }}
//       >
//         <ClearIcon className="!w-5 !h-5 text-[--white-text] cursor-pointer" />
//       </span>
//       {/* eslint-disable-next-line @next/next/no-img-element */}



//         -------------------- T H I S  I S  ------------------
// -------------------- U R L  C R E A T I O N  C O D E  ---------------------
//       <img
//         src={
//           typeof uploadedImage === "string"
//             ? uploadedImage
//             : window.URL.createObjectURL(uploadedImage) //CREATES URL 
//         }
//         alt="Uploaded"
//         className="w-full h-full object-cover rounded-lg cursor-pointer -mt-3"
//       />

// ------------------------------------------------------------------------------
//     </>
//   ) : (
//     <>
//       <FileUploadRoundedIcon
//         className="!w-7 !h-7"
//         style={{
//           textAlign: "center",
//           position: "relative",
//           top: 50,
//         }}
//       />
//     </>
//   )}
// </label>






// *****************************************************************************************************


// ------------------------------------------------------------------------------------------------------- 
// ---------------------      A C T U A L  C O D E  O F  B L O B  C O M P O N E N T : --------------------------------------- 
// ------------------------------------------------------------------------------------------------------- 


import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

// Function to crop the image using canvas
const getCroppedImg = (imageSrc, pixelCrop, rotation = 0) => {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = pixelCrop.width;
      const height = pixelCrop.height;
      canvas.width = width;
      canvas.height = height;

      // Apply rotation to the canvas context
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

      // Return the cropped image as a base64
      // const croppedImage = canvas.toDataURL('image/jpeg');
      // resolve(croppedImage);  // Return the cropped image as a data URL
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob); // Return the cropped image as a Blob
        } else {
          reject("Error creating Blob");
        }
      }, "image/jpeg");
    };

    image.onerror = (err) => {
      reject(err, "Error loading image");
    };
  });
};

const EImageCropper = ({ uploadedImage, setUploadedImage, open, setOpen }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // const [open, setOpen] = useState(false); // Controls modal visibility
  const [error, setError] = useState(""); // Error message state
  // const [imageState, setImageState] = useState(false);

  // Reset states when the modal is closed
  const handleClose = () => {
    setCrop({ x: 0, y: 0 }); // Reset crop position
    setZoom(1); // Reset zoom
    setRotation(0); // Reset rotation
    setError(""); // Reset error message
    setOpen(false);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      // Get cropped image
      const croppedImage = await getCroppedImg(
        uploadedImage,
        croppedAreaPixels,
        rotation
      );
      console.log(croppedImage, "croppedImage croppedImage");
      setUploadedImage(croppedImage); // Set the cropped image
      handleClose(); // Close the modal
    } catch (e) {
      console.error("Error cropping the image:", e);
      setError("Error cropping the image. Please try again."); // Show error message
    }
  };
  // console.log(open ,">>>>>>>>>>>>>>>   open")
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
