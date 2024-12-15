import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as bodyPix from "@tensorflow-models/body-pix";

let model: bodyPix.BodyPix | null = null;

export async function loadSegmentationModel() {
  if (!model) {
    await tf.ready();
    model = await bodyPix.load({
      architecture: "MobileNetV1",
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
    });
  }
  return model;
}

export async function segmentPerson(
  imageElement: HTMLImageElement
): Promise<HTMLImageElement> {
  const segmentationModel = await loadSegmentationModel();
  const segmentation = await segmentationModel.segmentPerson(imageElement);

  const canvas = document.createElement("canvas");
  canvas.width = imageElement.width;
  canvas.height = imageElement.height;
  const ctx = canvas.getContext("2d");

  const subjectCanvas = document.createElement("canvas");
  subjectCanvas.width = imageElement.width;
  subjectCanvas.height = imageElement.height;
  const subjectCtx = subjectCanvas.getContext("2d");

  if (ctx) {
    ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);
    const subjectImageData = ctx.createImageData(canvas.width, canvas.height);
    const imageData = ctx.getImageData(
      0,
      0,
      imageElement.width,
      imageElement.height
    );

    for (let i = 0; i < segmentation.data.length; i++) {
      const pixelIndex = i * 4;

      // Apply a more aggressive segmentation mask
      const segmentationValue = segmentation.data[i];
      const isSubject = segmentationValue > 0.8; // Higher threshold for cleaner extraction

      // Copy pixel data
      subjectImageData.data[pixelIndex] = imageData.data[pixelIndex]; // Red
      subjectImageData.data[pixelIndex + 1] = imageData.data[pixelIndex + 1]; // Green
      subjectImageData.data[pixelIndex + 2] = imageData.data[pixelIndex + 2]; // Blue

      // Refined transparency
      if (isSubject) {
        // Full opacity for definitely segmented areas
        subjectImageData.data[pixelIndex + 3] = 255;
      } else if (segmentationValue > 0.5) {
        // Partial transparency for edge areas
        subjectImageData.data[pixelIndex + 3] = Math.floor(
          segmentationValue * 255
        );
      } else {
        // Full transparency for background
        subjectImageData.data[pixelIndex + 3] = 0;
      }
    }
    subjectCtx?.putImageData(subjectImageData, 0, 0);

    const image = new Image();
    image.src = subjectCanvas.toDataURL();
    return new Promise((resolve) => {
      image.onload = () => {
        resolve(image);
      }
    })
  }

  throw new Error("Could not create canvas context");
}
