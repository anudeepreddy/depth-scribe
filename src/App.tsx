import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { segmentPerson } from '@/lib/segmentation'
import { LayeredCanvas, TextElement } from '@/lib/layeredcanvas'

const fontFamilies = [
    'Inter',
    'Playfair Display',
    'Dancing Script',
    'Oswald',
    'Merriweather',
    'Pacifico',
    "ABeeZee", "Abel", "Abril Fatface", "Acme", "Alata", "Albert Sans", "Alegreya", "Alegreya Sans",
    "Alegreya Sans SC", "Alfa Slab One", "Alice", "Almarai", "Amatic SC", "Amiri", "Antic Slab", "Anton",
    "Architects Daughter", "Archivo", "Archivo Black", "Archivo Narrow", "Arimo", "Arsenal", "Arvo", "Asap",
    "Asap Condensed", "Assistant", "Barlow", "Barlow Condensed", "Barlow Semi Condensed", "Be Vietnam Pro",
    "Bebas Neue", "Bitter", "Black Ops One", "Bodoni Moda", "Bree Serif", "Bungee", "Cabin", "Cairo", "Cantarell",
    "Cardo", "Catamaran", "Caveat", "Chakra Petch", "Changa", "Chivo", "Cinzel", "Comfortaa", "Commissioner",
    "Concert One", "Cookie", "Cormorant", "Cormorant Garamond", "Courgette", "Crete Round", "Crimson Pro",
    "Crimson Text", "Cuprum", "DM Sans", "DM Serif Display", "DM Serif Text", "Dancing Script", "Didact Gothic",
    "Domine", "Dosis", "EB Garamond", "Eczar", "El Messiri", "Electrolize", "Encode Sans", "Encode Sans Condensed",
    "Exo", "Exo 2", "Figtree", "Fira Sans", "Fira Sans Condensed", "Fjalla One", "Francois One", "Frank Ruhl Libre",
    "Fraunces", "Gelasio", "Gloria Hallelujah", "Gothic A1", "Great Vibes", "Gruppo", "Heebo", "Hind", "Hind Madurai",
    "Hind Siliguri", "IBM Plex Mono", "IBM Plex Sans", "IBM Plex Sans Arabic", "IBM Plex Sans Condensed", "IBM Plex Serif",
    "Inconsolata", "Indie Flower", "Inter", "Inter Tight", "Josefin Sans", "Josefin Slab", "Jost", "Kalam", "Kanit",
    "Karla", "Kaushan Script", "Khand", "Lato", "League Spartan", "Lexend", "Lexend Deca", "Libre Barcode 39",
    "Libre Baskerville", "Libre Caslon Text", "Libre Franklin", "Lilita One", "Lobster", "Lobster Two", "Lora",
    "Luckiest Guy", "M PLUS 1p", "M PLUS Rounded 1c", "Macondo", "Manrope", "Marcellus", "Martel", "Mate", "Mate SC",
    "Maven Pro", "Merienda", "Merriweather", "Merriweather Sans", "Montserrat", "Montserrat Alternates", "Mukta",
    "Mulish", "Nanum Gothic", "Nanum Gothic Coding", "Nanum Myeongjo", "Neuton", "Noticia Text", "Noto Color Emoji",
    "Noto Kufi Arabic", "Noto Naskh Arabic", "Noto Sans", "Noto Sans Arabic", "Noto Sans Bengali", "Noto Sans Display",
    "Noto Sans HK", "Noto Sans JP", "Noto Sans KR", "Noto Sans Mono", "Noto Sans SC", "Noto Sans TC", "Noto Sans Thai",
    "Noto Serif", "Noto Serif JP", "Noto Serif KR", "Noto Serif TC", "Nunito", "Nunito Sans", "Old Standard TT",
    "Oleo Script", "Open Sans", "Orbitron", "Oswald", "Outfit", "Overpass", "Oxygen", "PT Sans", "PT Sans Caption",
    "PT Sans Narrow", "PT Serif", "Pacifico", "Passion One", "Pathway Gothic One", "Patua One", "Paytone One",
    "Permanent Marker", "Philosopher", "Play", "Playfair Display", "Plus Jakarta Sans", "Poppins", "Prata", "Prompt",
    "Public Sans", "Quattrocento", "Quattrocento Sans", "Questrial", "Quicksand", "Rajdhani", "Raleway", "Readex Pro", "Red Hat Display", "Righteous",
    "Roboto", "Roboto Condensed", "Roboto Flex", "Roboto Mono", "Roboto Serif", "Roboto Slab",
    "Rokkitt", "Rowdies", "Rubik", "Rubik Bubbles", "Rubik Mono One", "Russo One",
    "Sacramento", "Saira", "Saira Condensed", "Sarabun", "Satisfy", "Sawarabi Gothic",
    "Sawarabi Mincho", "Sen", "Shadows Into Light", "Signika", "Signika Negative",
    "Silkscreen", "Six Caps", "Slabo 27px", "Sora", "Source Code Pro", "Source Sans 3",
    "Source Serif 4", "Space Grotesk", "Space Mono", "Special Elite", "Spectral",
    "Tajawal", "Tangerine", "Teko", "Tinos", "Titan One", "Titillium Web",
    "Ubuntu", "Ubuntu Condensed", "Ubuntu Mono", "Unbounded", "Unna", "Urbanist",
    "Varela Round", "Vollkorn", "Work Sans", "Yanone Kaffeesatz", "Yantramanav",
    "Yellowtail", "Yeseva One", "Zen Kaku Gothic New", "Zeyada", "Zilla Slab"
];

const fontStyles = ['normal', 'italic', 'oblique'];
const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

export default function PhotoEditor() {
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const subjectImageRef = useRef<HTMLImageElement | null>(null)
    const layeredCanvasRef = useRef<LayeredCanvas | null>(null)
    const [textElements, setTextElements] = useState<TextElement[]>([])
    const [selectedTextId, setSelectedTextId] = useState<number | null>(null)
    const [newText, setNewText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && image) {
            canvas.width = image.width;
            canvas.height = image.height;
            layeredCanvasRef.current = new LayeredCanvas(canvasRef.current);
            startSegmentation();
        }
    }, [image, canvasRef.current]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img)
                }
                img.src = e.target?.result as string
            }
            reader.readAsDataURL(file)
        }
    }

    const startSegmentation = async () => {
        setIsLoading(true)
        const segmentedImg = await segmentPerson(image!)
        subjectImageRef.current = segmentedImg
        drawImage()
        setIsLoading(false)
    }

    useEffect(() => {
        drawImage();
    }, [textElements])

    const drawImage = () => {
        const layeredCanvas = layeredCanvasRef.current
        const subjectImage = subjectImageRef.current
        if (!layeredCanvas || !image || !subjectImage) return;
        layeredCanvas.renderBackground(image)
        layeredCanvas.renderText(textElements)
        layeredCanvas.renderSubject(subjectImage)
    }

    const addTextElement = () => {
        if (newText.trim() === '' || !image) return
        const newElement: TextElement = {
            id: Date.now(),
            text: newText,
            fontSize: Math.max(12, Math.min(72, Math.floor(image.height / 20))),
            fontFamily: 'Arial',
            fontWeight: 400,
            fontStyle: 'normal',
            position: { x: image.width / 2, y: image.height / 2 },
            color: '#000000',
            rotation: 0,
            opacity: 1
        }
        setTextElements([...textElements, newElement])
        setNewText('')
        setSelectedTextId(newElement.id)
    }

    const updateTextElement = (id: number, updates: Partial<TextElement>) => {
        setTextElements(textElements.map(el =>
            el.id === id ? { ...el, ...updates } : el
        ))
    }

    const deleteTextElement = (id: number) => {
        setTextElements(textElements.filter(el => el.id !== id))
        if (selectedTextId === id) {
            setSelectedTextId(null)
        }
    }

    const saveImage = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const link = document.createElement('a')
        link.download = 'edited-image.png'
        link.href = canvas.toDataURL('image/png')

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const selectedText = textElements.find(el => el.id === selectedTextId)

    const getMaxFontSize = () => {
        return image ? Math.max(72, Math.floor(image.height / 5)) : 72
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">DepthScribe</h1>
            <div className="mb-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
            {isLoading && <p>Processing image...</p>}
            {image &&
                (
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <canvas ref={canvasRef} className="max-w-full h-auto border border-gray-300" />
                            <Button onClick={saveImage} className="mt-4">Save Image</Button>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[80vh]">
                            <div>
                                <Label htmlFor="new-text">Add New Text</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="new-text"
                                        value={newText}
                                        onChange={(e) => setNewText(e.target.value)}
                                        placeholder="Enter text"
                                    />
                                    <Button onClick={addTextElement}>Add</Button>
                                </div>
                            </div>
                            <div>
                                <Label>Text Elements</Label>
                                <Select value={selectedTextId?.toString()} onValueChange={(value) => setSelectedTextId(Number(value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select text to edit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {textElements.map(el => (
                                            <SelectItem key={el.id} value={el.id.toString()}>{el.text}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedText && (
                                <>
                                    <div>
                                        <Label htmlFor="edit-text">Edit Text</Label>
                                        <Input
                                            id="edit-text"
                                            value={selectedText.text}
                                            onChange={(e) => updateTextElement(selectedText.id, { text: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="font-size">Font Size</Label>
                                        <Slider
                                            id="font-size"
                                            min={12}
                                            max={getMaxFontSize()}
                                            step={1}
                                            value={[selectedText.fontSize]}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { fontSize: value[0] })}
                                        />
                                        <div className="text-sm text-gray-500 mt-1">
                                            {selectedText.fontSize}px
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="opacity">Opacity</Label>
                                        <Slider
                                            id="opacity"
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            value={[selectedText.opacity]}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { opacity: value[0] })}
                                        />
                                        <div className="text-sm text-gray-500 mt-1">
                                            {selectedText.opacity}
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="font-family">Font Family</Label>
                                        <Select
                                            value={selectedText.fontFamily}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { fontFamily: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontFamilies.map(font => (
                                                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>{font}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="font-weight">Font Weight</Label>
                                        <Select
                                            value={selectedText.fontWeight.toString()}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { fontWeight: parseInt(value) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select weight" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontWeights.map(weight => (
                                                    <SelectItem key={weight} value={weight.toString()}>{weight}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="font-style">Font Style</Label>
                                        <Select
                                            value={selectedText.fontStyle}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { fontStyle: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select style" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontStyles.map(style => (
                                                    <SelectItem key={style} value={style}>{style}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Text Position X</Label>
                                        <Slider
                                            min={0}
                                            max={image.width}
                                            step={1}
                                            value={[selectedText.position.x]}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { position: { ...selectedText.position, x: value[0] } })}
                                        />
                                        <div className="text-sm text-gray-500 mt-1">
                                            {selectedText.position.x}px
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Text Position Y</Label>
                                        <Slider
                                            min={0}
                                            max={image.height}
                                            step={1}
                                            value={[selectedText.position.y]}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { position: { ...selectedText.position, y: value[0] } })}
                                        />
                                        <div className="text-sm text-gray-500 mt-1">
                                            {selectedText.position.y}px
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Text Rotation</Label>
                                        <Slider
                                            min={0}
                                            max={360}
                                            step={1}
                                            value={[selectedText.rotation]}
                                            onValueChange={(value) => updateTextElement(selectedText.id, { rotation: value[0] })}
                                        />
                                        <div className="text-sm text-gray-500 mt-1">
                                            {selectedText.rotation}°
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="text-color">Text Color</Label>
                                        <Input
                                            id="text-color"
                                            type="color"
                                            value={selectedText.color}
                                            onChange={(e) => updateTextElement(selectedText.id, { color: e.target.value })}
                                        />
                                    </div>
                                    <Button variant="destructive" onClick={() => deleteTextElement(selectedText.id)}>
                                        Delete Text
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
        </div>
    )
}
