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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

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

const fontStyles = ['normal', 'italic'];
const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

export default function PhotoEditor() {
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [saving, setSaving] = useState(false)
    const subjectImageRef = useRef<HTMLImageElement | null>(null)
    const layeredCanvasRef = useRef<LayeredCanvas | null>(null)
    const [textElements, setTextElements] = useState<TextElement[]>([])
    const [selectedTextId, setSelectedTextId] = useState<number | null>(null)
    const [newText, setNewText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && image) {
            canvas.width = image.width;
            canvas.height = image.height;
            layeredCanvasRef.current = new LayeredCanvas(canvasRef.current);
            layeredCanvasRef.current?.renderBackground(image)
            startSegmentation();
        }
    }, [image, canvasRef.current]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true)
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
            fontSize: Math.max(12, Math.max(72, Math.floor(image.height / 5))),
            fontFamily: 'Inter',
            fontWeight: 800,
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
        setSaving(true);
        const canvas = canvasRef.current
        if (!canvas) return

        const link = document.createElement('a')
        link.download = 'edited-image.png'
        link.href = canvas.toDataURL('image/png')

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setSaving(false);
    }

    const selectedText = textElements.find(el => el.id === selectedTextId)

    const getMaxFontSize = () => {
        return image ? Math.max(72, Math.floor(image.height)) : 72
    }

    const handleRemoveFile = () => {
        setImage(null)
        setIsLoading(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>DepthScribe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center space-x-2">
                            <Input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
                            {image && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRemoveFile}
                                    aria-label="Remove file"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Dialog open={isLoading || saving}>
                            <DialogContent className="bg-background/80 backdrop-blur-sm border-none shadow-none flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </DialogContent>
                        </Dialog>
                        {image && (
                            <div className="relative">
                                <canvas ref={canvasRef} className="max-w-full h-auto border border-gray-300" />
                                <div className="absolute top-2 right-2 flex space-x-2">
                                    <Button onClick={saveImage} variant="default">Save Image</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Text Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newText}
                                    onChange={(e) => setNewText(e.target.value)}
                                    placeholder="Enter new text"
                                    className="flex-grow"
                                />
                                <Button onClick={addTextElement} variant="secondary">
                                    Add Text
                                </Button>
                            </div>
                            <Select
                                value={selectedTextId?.toString() || ''}
                                onValueChange={(value) => setSelectedTextId(Number(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select text to edit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {textElements.map(el => (
                                        <SelectItem key={el.id} value={el.id.toString()}>
                                            {el.text}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedText && (
                                <Tabs defaultValue="styling" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="styling">Styling</TabsTrigger>
                                        <TabsTrigger value="position">Position</TabsTrigger>
                                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="styling">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Font Family</Label>
                                                <Select
                                                    value={selectedText.fontFamily}
                                                    onValueChange={(value) => updateTextElement(selectedText.id, { fontFamily: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select font" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontFamilies.map(font => (
                                                            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                                                {font}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Font Size</Label>
                                                <Slider
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
                                                <Label>Color</Label>
                                                <Input
                                                    type="color"
                                                    value={selectedText.color}
                                                    onChange={(e) => updateTextElement(selectedText.id, { color: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="position">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Position X</Label>
                                                <Slider
                                                    min={0}
                                                    max={image ? image.width : 100}
                                                    step={1}
                                                    value={[selectedText.position.x]}
                                                    onValueChange={(value) => updateTextElement(selectedText.id, { position: { ...selectedText.position, x: value[0] } })}
                                                />
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {selectedText.position.x}px
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Position Y</Label>
                                                <Slider
                                                    min={0}
                                                    max={image ? image.height : 100}
                                                    step={1}
                                                    value={[selectedText.position.y]}
                                                    onValueChange={(value) => updateTextElement(selectedText.id, { position: { ...selectedText.position, y: value[0] } })}
                                                />
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {selectedText.position.y}px
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Rotation</Label>
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
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="advanced">
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Opacity</Label>
                                                <Slider
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
                                                <Label>Font Weight</Label>
                                                <Select
                                                    value={selectedText.fontWeight.toString()}
                                                    onValueChange={(value) => updateTextElement(selectedText.id, { fontWeight: parseInt(value) })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select weight" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontWeights.map(weight => (
                                                            <SelectItem key={weight} value={weight.toString()}>
                                                                {weight}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Font Style</Label>
                                                <Select
                                                    value={selectedText.fontStyle}
                                                    onValueChange={(value) => updateTextElement(selectedText.id, { fontStyle: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select style" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {fontStyles.map(style => (
                                                            <SelectItem key={style} value={style}>
                                                                {style}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                onClick={() => deleteTextElement(selectedText.id)}
                                                className="w-full mt-4"
                                            >
                                                Delete Text
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
