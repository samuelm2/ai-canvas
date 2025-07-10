/**
 * TYPE DEFINITIONS
 * 
 * @fileoverview Central type definitions for the AI Canvas application.
 * Contains all TypeScript interfaces and type definitions used throughout
 * the application for type safety and documentation.
 */

/**
 * Display states for canvas images during their lifecycle
 * 
 * @typedef {string} ImageDisplayState
 * @description Represents the current display state of an image on the canvas
 * - `loading`: Image is being generated or loaded for the first time
 * - `updating`: Image is being regenerated while showing the previous version
 * - `ready`: Image has loaded successfully and is ready for display
 * - `failed`: Image generation or loading failed
 */
export type ImageDisplayState = 'loading' | 'updating' | 'ready' | 'failed';

/**
 * Complete canvas image object with UI state
 * 
 * @interface CanvasImage
 * @description Represents a complete image tile on the canvas with all properties
 * needed for rendering, positioning, and interaction. Includes both persistent
 * data (saved to database) and temporary UI state (not saved).
 * 
 * @example
 * const image: CanvasImage = {
 *   id: "img_123",
 *   src: "https://example.com/image.jpg",
 *   x: 100,
 *   y: 200,
 *   width: 256,
 *   height: 256,
 *   prompt: "A beautiful sunset",
 *   selected: false,
 *   displayState: "ready",
 *   zIndex: 5
 * };
 */
export interface CanvasImage {
  /** Unique identifier for the image */
  id: string;
  /** URL or data URI of the image source */
  src: string;
  /** X position on the canvas in pixels */
  x: number;
  /** Y position on the canvas in pixels */
  y: number;
  /** Width of the image in pixels */
  width: number;
  /** Height of the image in pixels */
  height: number;
  /** Optional text prompt used to generate the image */
  prompt?: string;
  /** Whether the image is currently selected (UI state) */
  selected?: boolean;
  /** Current display/loading state of the image (UI state) */
  displayState?: ImageDisplayState;
  /** Z-index for layering images on the canvas */
  zIndex?: number;
}

/**
 * Serialized canvas image for database storage
 * 
 * @interface SerializedCanvasImage
 * @description A stripped-down version of CanvasImage that contains only the
 * persistent data needed for database storage. Excludes UI-specific properties
 * like selection state and display state.
 * 
 * @example
 * const serializedImage: SerializedCanvasImage = {
 *   id: "img_123",
 *   src: "https://example.com/image.jpg",
 *   x: 100,
 *   y: 200,
 *   width: 256,
 *   height: 256,
 *   prompt: "A beautiful sunset",
 *   zIndex: 5
 * };
 */
export interface SerializedCanvasImage {
  /** Unique identifier for the image */
  id: string;
  /** URL or data URI of the image source */
  src: string;
  /** X position on the canvas in pixels */
  x: number;
  /** Y position on the canvas in pixels */
  y: number;
  /** Width of the image in pixels */
  width: number;
  /** Height of the image in pixels */
  height: number;
  /** Optional text prompt used to generate the image */
  prompt?: string;
  /** Z-index for layering images on the canvas */
  zIndex: number;
}

/**
 * Configuration for grid layout organization
 * 
 * @interface GridConfig
 * @description Defines the parameters for organizing images in a grid layout,
 * including spacing and starting position.
 */
export interface GridConfig {
  /** Gap between grid items in pixels */
  gap: number;
  /** Starting X position for the grid */
  startX: number;
  /** Starting Y position for the grid */
  startY: number;
}

/**
 * Response from AI image generation service
 * 
 * @interface AIImageResponse
 * @description Standardized response format for AI image generation operations.
 * Contains either a successful result with image URL or an error message.
 * 
 * @example
 * // Successful response
 * const response: AIImageResponse = {
 *   success: true,
 *   imageUrl: "https://example.com/generated-image.jpg"
 * };
 * 
 * // Error response
 * const errorResponse: AIImageResponse = {
 *   success: false,
 *   error: "Failed to generate image"
 * };
 */
export interface AIImageResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** URL of the generated image (present when success is true) */
  imageUrl?: string;
  /** Error message (present when success is false) */
  error?: string;
}

/**
 * Canvas document with metadata
 * 
 * @interface CanvasDocument
 * @description Represents a complete canvas document as stored in the database,
 * including metadata like creation/update timestamps and the serialized images.
 * 
 * @example
 * const document: CanvasDocument = {
 *   id: "doc_123",
 *   title: "My Beautiful Canvas",
 *   images: [serializedImage1, serializedImage2],
 *   createdAt: new Date("2023-01-01"),
 *   updatedAt: new Date("2023-01-02")
 * };
 */
export interface CanvasDocument {
  /** Unique UUID identifier for the document */
  id: string;
  /** Optional title for the document */
  title?: string;
  /** Array of serialized images in the document */
  images: SerializedCanvasImage[];
  /** Timestamp when the document was created */
  createdAt: Date;
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

/**
 * Request payload for saving a canvas document
 * 
 * @interface SaveDocumentRequest
 * @description The data structure sent to the API when saving a new canvas document.
 * Contains the optional title and the array of images to save.
 * 
 * @example
 * const request: SaveDocumentRequest = {
 *   title: "My Canvas",
 *   images: [serializedImage1, serializedImage2]
 * };
 */
export interface SaveDocumentRequest {
  /** Optional title for the document */
  title?: string;
  /** Array of serialized images to save */
  images: SerializedCanvasImage[];
}

/**
 * Response from document save operations
 * 
 * @interface SaveDocumentResponse
 * @description Standardized response format for document saving operations.
 * Contains either a successful result with document ID or an error message.
 * 
 * @example
 * // Successful save
 * const response: SaveDocumentResponse = {
 *   success: true,
 *   documentId: "doc_123"
 * };
 * 
 * // Failed save
 * const errorResponse: SaveDocumentResponse = {
 *   success: false,
 *   error: "Failed to save document"
 * };
 */
export interface SaveDocumentResponse {
  /** Whether the save operation was successful */
  success: boolean;
  /** UUID of the saved document (present when success is true) */
  documentId?: string;
  /** Error message (present when success is false) */
  error?: string;
}

/**
 * Response from document load operations
 * 
 * @interface LoadDocumentResponse
 * @description Standardized response format for document loading operations.
 * Contains either a successful result with document data or an error message.
 * 
 * @example
 * // Successful load
 * const response: LoadDocumentResponse = {
 *   success: true,
 *   document: canvasDocument
 * };
 * 
 * // Failed load
 * const errorResponse: LoadDocumentResponse = {
 *   success: false,
 *   error: "Document not found"
 * };
 */
export interface LoadDocumentResponse {
  /** Whether the load operation was successful */
  success: boolean;
  /** The loaded document data (present when success is true) */
  document?: CanvasDocument;
  /** Error message (present when success is false) */
  error?: string;
}

/**
 * Response from prompt variation generation
 * 
 * @interface PromptVariationsResponse
 * @description Standardized response format for prompt variation generation.
 * Contains either successful variations or an error message.
 * 
 * @example
 * // Successful generation
 * const response: PromptVariationsResponse = {
 *   success: true,
 *   variations: [
 *     "A cat, oil painting style",
 *     "A cat, cyberpunk aesthetic",
 *     "A cat, watercolor illustration",
 *     "A cat, minimalist photography"
 *   ]
 * };
 */
export interface PromptVariationsResponse {
  /** Whether the generation was successful */
  success: boolean;
  /** Array of 4 prompt variations (present when success is true) */
  variations?: string[];
  /** Error message (present when success is false) */
  error?: string;
}

/**
 * Status states for file menu operations
 * 
 * @typedef {string} FileMenuStatus
 * @description Represents the current status of file operations in the UI
 * - `idle`: No operation in progress
 * - `saving`: Currently saving the document
 * - `savingNewCopy`: Currently saving a new copy of the document
 * - `saved`: Document has been saved successfully (temporary state)
 * - `copied`: Share URL has been copied to clipboard (temporary state)
 */
export type FileMenuStatus = 'idle' | 'saving' | 'savingNewCopy' | 'saved' | 'copied'; 