
# Lighting App

Lighting App is a dynamic, open-source platform designed for creatives and developers to bring their wireframe sketches to life. Built on **SambaNova AI's powerful infrastructure** and leveraging the **Llama 3.2 Vision 90B model**, it seamlessly converts low-fidelity sketches into high-fidelity, interactive prototypes.

## Features

- **Wireframe-to-Prototype Conversion**: Convert low-fidelity sketches into interactive and responsive web apps.
- **Customizable Styling**: Tailored designs using Tailwind CSS and React.
- **Powered by SambaNova AI**: Utilizes the cutting-edge Llama 3.2 Vision 90B model for accurate and high-performance AI processing.
- **Local Storage**: Save and load projects locally.
- **Export Tools**: Seamlessly export designs as images or HTML files.
- **Interactive Components**: Includes palettes, dialogs, and toolbars for a smooth design experience.

## How to Use

1. **Sketch Your Wireframe**: Draw your web app's low-fidelity design using the built-in editor.
2. **Apply Custom Styles**: Customize shapes, text, and layouts with the integrated palette.
3. **Add Your API Key**:
   - Visit [SambaNova Cloud APIs](https://cloud.sambanova.ai/apis) and sign in to get your API key.
   - Once you have your API key, add it to the app by clicking on ``Your api box`` .
4. **Generate Prototypes**: Click on the *Generate* button to convert your sketch into a fully functional web app using SambaNova AI.
5. **Export Your Design**: Save your project locally or export it as an image or HTML file.

## Installation

Follow these steps to install the Lighting App locally:

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn package manager

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/malawadd/lighting-app.git
   cd lighting-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4321
   ```

5. To build for production:
   ```bash
   npm run build
   ```

## Technologies Used

- **AI Infrastructure**: SambaNova AI with Llama 3.2 Vision 90B model
- **Frameworks**: Astro, React
- **Styling**: Tailwind CSS
- **UI Library**: ShadCN/UI
- **Storage**: Local Storage and Cloudflare adapter


## License

This project is licensed under the [GNU General Public License v3.0](./LICENSE.md).

