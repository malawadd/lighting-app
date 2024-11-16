import {
  fileOpen as fileOpenDialog,
  fileSave as fileSaveDialog,
} from "browser-fs-access";
import { confirm } from "./components/confirm-dialog";
import { useAppStore } from "./store";
import OpenAI from "openai";
import { getImageDataUrl, exportImageAsFile } from "@dgmjs/export";
import { toast } from "sonner";
import systemPrompt from "./assets/prompt.md?raw";
import { geometry, macro, type Shape } from "@dgmjs/core";
import exampleJson from "./assets/example.json";

export async function fileNew() {
  const result = await confirm({
    title: "Are you sure to clear the canvas?",
    description:
      "This will clear your current canvas and any unsaved changes will be lost. Are you sure you want to continue?",
  });
  if (result) {
    const editor = window.editor;
    editor.selection.deselectAll();
    editor.newDoc();
    editor.repaint();
  }
}

export async function fileOpenExample() {
  const editor = window.editor;
  if (exampleJson) {
    editor.loadFromJSON(exampleJson);
  }
}

export async function fileOpenFromLocal() {
  const editor = window.editor;
  const data = localStorage.getItem("data");
  if (data) {
    editor.loadFromJSON(JSON.parse(data));
  }
}

export async function fileSaveToLocal() {
  const editor = window.editor;
  const data = JSON.stringify(editor.saveToJSON());
  if (data) {
    localStorage.setItem("data", data);
  }
}

export async function fileOpen() {
  const editor = window.editor;
  try {
    const fileHandle = await fileOpenDialog([
      {
        description: "DGM files",
        mimeTypes: ["application/json"],
        extensions: [".dgm"],
        multiple: false,
      },
    ]);
    if (fileHandle) {
      const data = await fileHandle.text();
      const json = JSON.parse(data);
      editor.loadFromJSON(json);
      editor.fitToScreen();
      editor.repaint();
    }
  } catch {
    // user canceled
    return;
  }
}

export async function fileSave() {
  const editor = window.editor;
  const data = JSON.stringify(editor.saveToJSON());
  const blob = new Blob([data], { type: "application/json" });
  try {
    await fileSaveDialog(blob, { extensions: [".dgm"] });
  } catch {
    // user cancelled
    return;
  }
}

export async function alignSendToBack() {
  const editor = window.editor;
  editor.actions.sendToBack();
}

export async function alignBringToFront() {
  const editor = window.editor;
  editor.actions.bringToFront();
}

export async function generateApp() {
  const editor = window.editor;
  const apiKey = useAppStore.getState().apiKey;

  if (!apiKey) {
    toast.error('API key is required');
    return;
  }

  const page = editor.getCurrentPage()!;

  if (!page) {
    toast.error('No page is currently open.');
    useAppStore.getState().setGenerating(false);
    return;
  }

  useAppStore.getState().setAppCode(null);
  useAppStore.getState().setGenerating(true);

  try {
    // Generate the image data URL in PNG format
    const base64 = await getImageDataUrl(editor.canvas, page, {
      scale: 1,
      dark: false,
      fillBackground: true,
      format: 'image/png', // Ensure it's PNG
    });
    const fileName = "exported_image.png";

    // await exportImageAsFile(editor.canvas, page,fileName, {
    //   scale: 1,
    //   dark: false,
    //   fillBackground: true,
    //   format: 'image/png', // Ensure it's PNG
    // }); 

    
    const dataUrl = base64; 

    // Create the request body matching the Python code
    const requestBody = {
      apiKey: apiKey,
      model: 'Llama-3.2-90B-Vision-Instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'what do you see here is an image',
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl, 
              },
            },
            {
              type: 'text',
              text: systemPrompt

            },
            {
              type: 'text',
              text: 'Please review the attached low-fidelity wireframe and develop a high-fidelity prototype following the instructions above.',
            },
          ],
        },
      ],
    };

    // Send the request to your serverless proxy
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error from proxy: ${errorData.error}`);
    }

    const data = await response.json();

    const responseText = data.choices[0]?.message?.content;

    // Handle the response as needed
    console.log('Response:', responseText);



      // Regex to match all HTML blocks
      const htmlRegex = /```html([\s\S]*?)```/g;

      let lastHtmlBlock = null;
      let match;

      // Iterate through all matches to find the last HTML block
      while ((match = htmlRegex.exec(responseText)) !== null) {
          lastHtmlBlock = match[1].trim(); 
      }

      if (lastHtmlBlock) {
          useAppStore.getState().setAppCode(lastHtmlBlock);
          toast.success('App generated successfully ', {
              action: {
                  label: 'dismiss',
                  onClick: () => toast.dismiss(),
              },
          });
      } else {
          useAppStore.getState().setAppCode(null);
          toast.error('Failed to generate app', {
              action: {
                  label: 'error',
                  onClick: () => toast.dismiss(),
              },
          });
      }
          useAppStore.getState().setGenerating(false);
        } catch (err) {
          console.error('Error:', err);
          useAppStore.getState().setGenerating(false);
          toast.error('Failed to generate app');
        }
 }


/**
 * Insert shape by cloning from a shape prototype
 */
export async function shapeInsert(shapePrototype: Shape, point?: number[]) {
  const editor = window.editor;
  const store = editor.store;
  const tr = editor.transform;
  const page = editor.getCurrentPage()!;
  const clone = store.instantiator.clone(shapePrototype) as Shape;
  clone.proto = false;
  const boundingRect = clone.getBoundingRect();
  const w = geometry.width(boundingRect);
  const h = geometry.height(boundingRect);
  if (!point) point = editor.getCenter();
  const dx = point[0] - (boundingRect[0][0] + w / 2);
  const dy = point[1] - (boundingRect[0][1] + h / 2);
  tr.startAction("add shape from prototype");
  tr.transact((tx) => {
    tx.appendObj(clone);
    macro.changeParent(tx, clone, page);
    macro.moveShapes(tx, page, [clone], dx, dy);
    macro.resolveAllConstraints(tx, page, editor.canvas);
  });
  tr.endAction();
  editor.selection.select([clone]);
}
