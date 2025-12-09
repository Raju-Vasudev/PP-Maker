Based on the entire conversation, here is a complete list of **business functionalities** (user-facing features) that you can provide as a prompt to an Agent AI for building the application. This list is organized by the application's workflow.

## **📋 Business Functionality List for Agent AI Prompt**

The application's core business function is to transform a single digital image into a high-quality, printable sheet of standardized passport photos, operating entirely within the user's browser (PWA).

### **I. Image Input and Upload Functionalities**

| ID | Feature Description | User Interaction | Business Requirement |
| :---- | :---- | :---- | :---- |
| **BF-1.1** | **File Selection & Drop Zone** | User can drag-and-drop or use a file picker to select a source image (.jpg, .png). | Must handle file loading and initial validation (e.g., file type, basic size check). |
| **BF-1.2** | **In-Memory Loading** | Application loads the image data into browser memory (not external storage). | Enforces the "No Server/Storage" constraint. |

### ---

**II. Standardization and Cropping Functionalities**

| ID | Feature Description | User Interaction | Business Requirement |
| :---- | :---- | :---- | :---- |
| **BF-2.1** | **Standard Preset Selection** | User selects a target standard (e.g., "US Passport $2 \\times 2$ in", "Schengen $35 \\times 45$ mm"). | Automatically sets the crop aspect ratio and defines the high-DPI target pixel size (e.g., $\\mathbf{300}$ **DPI**). |
| **BF-2.2** | **Interactive Cropping UI** | User is provided with a resizable/draggable bounding box to frame the face correctly according to standards. | Must output precise $sX, sY, sWidth, sHeight$ coordinates relative to the original image. |
| **BF-2.3** | **Cropping Confirmation** | User finalizes the cropped area. | Triggers the creation of the standardized single photo image onto **Canvas 1**. |

### ---

**III. Print Layout and Composition Functionalities**

| ID | Feature Description | User Interaction | Business Requirement |
| :---- | :---- | :---- | :---- |
| **BF-3.1** | **Paper Size Selection** | User selects the desired physical print size for the sheet (e.g., "4x6 inches", "A4"). | Defines the dimensions of the final composition **Canvas 2**. |
| **BF-3.2** | **Copies Count Input** | User specifies the number of passport photos needed. | Drives the layout logic for the final grid arrangement. |
| **BF-3.3** | **Automated Grid Layout** | Application calculates and arranges the standardized photo copies onto the selected paper size. | Must ensure optimal fit and spacing without overlapping. |

### ---

**IV. Output and Quality Assurance Functionalities**

| ID | Feature Description | User Interaction | Business Requirement |
| :---- | :---- | :---- | :---- |
| **BF-4.1** | **Real-time Preview** | User views the final, composed sheet before saving or printing. | Reflects all cropping and layout choices instantly (via rendering **Canvas 2**). |
| **BF-4.2** | **High-Quality Download** | User clicks a button to save the sheet as a file. | Must use canvas.toBlob() or toDataURL with $\\mathbf{100\\%}$ **quality** (JPEG 1.0) to meet the "No Quality Loss" requirement. |
| **BF-4.3** | **Direct Browser Print** | User clicks a button to print the sheet. | Must trigger the native browser print dialog, utilizing a print stylesheet to hide the UI and only show the final image sheet. |
| **BF-4.4** | **Quality Confirmation Display** | Text displayed on screen confirming the output resolution. | Provides user reassurance (e.g., "300 DPI, 100% Quality Output"). |

### ---

**V. Technical (PWA) Functionalities**

| ID | Feature Description | User Interaction | Business Requirement |
| :---- | :---- | :---- | :---- |
| **BF-5.1** | **Offline Operation** | The application loads and functions fully even without an internet connection after the first visit. | Achieved via **Service Worker** caching of all static assets. |
| **BF-5.2** | **App Installability** | Mobile browsers prompt the user to "Add to Home Screen." | Requires correctly configured **Web App Manifest** and deployment over **HTTPS**. |

