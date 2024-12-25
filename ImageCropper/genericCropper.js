This is made Generic, meaning that can be used with every component.


Just do this:

1. Create state: 
const [cropOpen, setCropOpen] = useState(false); // Controls modal visibility


2. Pass props from Parent Component :


{cropOpen && (
    <EImageCropper
      uploadedImage={uploadedImage}
      setUploadedImage={setUploadedImage}
      cropOpen={cropOpen}
      setCropOpen={setCropOpen}
    />
  )}


  Here, uploadedImage = image chosen via input to crop
  setUploadedImage =  to set Cropped Image back to Parent


{/* ******************* Sample Code ********* Image Box ****************************** */}

          <Box className="flex !flex-col gap-2 sm:!mb-1 !mb-4 !mt-0">
          {/* /////////////////////////// */}
          <EImageCropper
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            cropOpen={cropOpen}
            setCropOpen={setCropOpen}
          />

          {/* /////////////////////////// */}

          <Box className="flex flex-col">
            <InputLabel className="!text-[--barber-input-label] Poppins500 !gap-1 lg:!text-[16px] sm:!text-base !text-sm mb-1">
              Upload Image
              <RequiredFieldSymbol />
            </InputLabel>
            <label
              className={cn(
                "!rounded-lg !text-xs !w-[145px] !h-[145px] !items-center cursor-pointer !justify-center !gap-1 !whitespace-nowrap text-center !my-auto",
                {
                  "border-2 !border-dashed border-[--input-color]":
                    !uploadedImage,
                }
              )}
              style={{ textAlign: "center" }}
            >
              <input
                key={uploadedImage ? "uploaded" : "not-uploaded"}
                type="file"
                style={{ display: "none" }}
                accept=".png, .jpg, .jpeg"
                {...register("image")}
              />
              {uploadedImage ? (
                <>
                  <span
                    className="bg-[--primary] rounded-full p-2 cursor-pointer"
                    style={{
                      position: "relative",
                      top: 4,
                      left: "44%",
                      right: 0,
                      zIndex: 1,
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      setUploadedImage(null);
                      setValue("image", []);
                    }}
                  >
                    <ClearIcon className="!w-5 !h-5 text-[--white-text] cursor-pointer" />
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      typeof uploadedImage === "string"
                        ? uploadedImage
                        : window.URL.createObjectURL(uploadedImage)
                    }
                    alt="Uploaded"
                    className="w-full h-full object-cover rounded-lg cursor-pointer -mt-3"
                  />
                </>
              ) : (
                <>
                  <FileUploadRoundedIcon
                    className="!w-7 !h-7"
                    style={{
                      textAlign: "center",
                      position: "relative",
                      top: 50,
                    }}
                  />
                </>
              )}
            </label>
            {uploadedImage ? (
              <Box className="buttonWidth"></Box>
            ) : (
              <Typography 
                variant="h6"
                component="h6"
                className="Poppins500 !text-base !ml-2 !pt-0 !pl-1 text-[--primary]"
              >
                Click to Upload
              </Typography>
            )}
            <Typography className="Poppins500 !text-xs !text-[--error-message] !mt-2">
              {errors.image?.message}
            </Typography>
          </Box>
        </Box>

{/* ************************************* IMAGE BOX ENDS HERE *********************************** */}




Key Adjustments:


Handling imageSrc when no image is uploaded: If no image is provided (e.g., uploadedImage is null, undefined, or an empty string), the component will now show a message "No image selected" and will not attempt to crop. You can replace this placeholder message with an option to upload an image if needed.

Handling uploads: If uploadedImage is passed as a File object, the code will convert it to an object URL to pass to the Cropper component. If uploadedImage is a string (i.e., a URL), it is used directly.

Revoke Object URL: After the crop operation is done, we ensure that the object URL is revoked if the image was uploaded via file input, to avoid memory leaks.

Future Considerations:
If you'd like to allow users to upload a new image when none is present, you could add a file input (<input type="file" />) above the Cropper to let users select a new image. Once an image is selected, you can update the uploadedImage state and trigger the cropper to show up.
This makes the component more flexible and adaptable to cases where no image is provided by default.





// --------------------------------------- COMPONENT  S T A R T S ------------------------------------------



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

const EImageCropper = ({ uploadedImage, setUploadedImage, cropOpen, setCropOpen }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState("");

  // *******************************************************
  // Conditionally handle the image source, default to empty if not provided
  const imageSrc = useMemo(() => {
    if (typeof uploadedImage === "string") {
      return uploadedImage; // If it's a URL string, use it directly
    }
    if (uploadedImage instanceof File) {
      return URL.createObjectURL(uploadedImage); // If it's a file, convert to object URL
    }
    return ""; // If no image, return empty string or placeholder
  }, [uploadedImage]);

  // *******************************************************

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
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      setUploadedImage(croppedImage);
      handleClose();
    } catch (e) {
      console.error("Error cropping the image:", e);
      setError("Error cropping the image. Please try again.");
    }
  };

  useEffect(() => {
    if (typeof uploadedImage !== "string" && uploadedImage instanceof File) {
      return () => {
        URL.revokeObjectURL(imageSrc); // Revoke the object URL when image changes
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
              key={imageSrc} // Use the imageSrc as key to force re-render when image changes
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
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={showCroppedImage} color="primary">
          Save Cropped Image
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EImageCropper;
