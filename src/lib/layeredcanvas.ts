export interface Layer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export interface TextElement {
  id: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  fontStyle: string;
  position: { x: number; y: number };
  color: string;
  rotation: number;
  opacity: number;
}

export class LayeredCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  layers: {
    background: Layer;
    text: Layer;
    subject: Layer;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Create layer canvases
    this.layers = {
      background: this.createLayer(),
      text: this.createLayer(),
      subject: this.createLayer()
    };
  }

  createLayer(): Layer {
    const layerCanvas = document.createElement('canvas');
    layerCanvas.width = this.canvas.width;
    layerCanvas.height = this.canvas.height;
    return {
      canvas: layerCanvas,
      ctx: layerCanvas.getContext('2d')!
    };
  }

  renderBackground(backgroundImage: HTMLImageElement | null) {
    const { ctx } = this.layers.background;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.compositeLayers();
  }

  renderText(textElements: TextElement[]) {
    const { ctx } = this.layers.text;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    textElements.forEach(({ text, fontSize, fontFamily, fontWeight, fontStyle, opacity, position, color, rotation }) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.translate(position.x, position.y)
      ctx.rotate(rotation * Math.PI / 180)
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = color
      ctx.fillText(text, 0, 0)
      

      ctx.restore()
    })

    this.compositeLayers();
  }

  renderSubject(extractedSubject: HTMLImageElement) {
    const { ctx } = this.layers.subject;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.drawImage(extractedSubject, 0, 0, this.canvas.width, this.canvas.height);
    this.compositeLayers();
  }

  compositeLayers() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Composite each layer
    Object.values(this.layers).forEach(layer => {
      this.ctx.drawImage(layer.canvas, 0, 0, this.canvas.width, this.canvas.height);
    });
  }
}


// // Usage
// const layeredCanvas = new LayeredCanvas(canvasRef.current as HTMLCanvasElement);

// // Update individual layers without full redraw
// layeredCanvas.renderBackground(backgroundImage);
// layeredCanvas.renderText([
//   { text: textOverlay1, style: textStyle1 },
//   { text: textOverlay2, style: textStyle2 }
// ]);
// layeredCanvas.renderSubject(extractedSubject);

// // Later, update just the text position
// layeredCanvas.renderText([
//   { text: textOverlay1, style: { ...textStyle1, position: { x: newX1, y: newY1 } } },
//   { text: textOverlay2, style: { ...textStyle2, position: { x: newX2, y: newY2 } } }
// ]);