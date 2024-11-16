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

// export async function generateApp() {
//   const editor = window.editor;
//   const apiKey = useAppStore.getState().apiKey;
//   if (apiKey) {
//     const page = editor.getCurrentPage()!;
//     const base64 = await getImageDataUrl(editor.canvas, page, {
//       scale: 1,
//       dark: false,
//       fillBackground: true,
//       format: "image/png",
//     });
//     useAppStore.getState().setAppCode(null);
//     useAppStore.getState().setGenerating(true);
//     try {
//       const openai = new OpenAI({
//         apiKey: apiKey,
//         // baseURL: "https://api.sambanova.ai/v1",
//         dangerouslyAllowBrowser: true,
//       });
//       const stream = await openai.chat.completions.create({
//         messages: [
//           {
//             role: "system",
//             content: systemPrompt,
//           },
//           {
//             role: "user",
//             content: [{ type: "image_url", image_url: { url: base64 as any } }],
//           },
//         ],
//         model: "gpt-4o",
//         stream: true,
//         max_tokens: 3000,
//       });
//       let response = "";

//       // Read the stream
//       for await (const chunk of stream) {
//         const chunkText = chunk.choices[0]?.delta?.content || "";
//         console.log("[chunk]", chunkText);
//         response += chunkText;
//         const finishReason = chunk.choices[0]?.finish_reason;
//         if (finishReason) {
//           useAppStore.getState().setGenerating(false);
//           if (finishReason !== "stop") {
//             toast.error(
//               `Failed to generate app (finish_reaseon=${finishReason})`
//             );
//             return;
//           }
//         }
//       }

//       // Extract HTML code from the response
//       const regex = /```html([\s\S]*?)```/g;
//       const match = regex.exec(response);
//       if (match && match.length > 0) {
//         useAppStore.getState().setAppCode(match[1].trim());
//         toast.success("App generated successfully");
//       } else {
//         useAppStore.getState().setAppCode(null);
//         toast.error("Failed to generate app");
//       }
//     } catch (err) {
//       console.error(err);
//       useAppStore.getState().setGenerating(false);
//     }
//   }
// }

export async function test() {
  }



// export async function generateApp() {
//   const editor = window.editor;
//   const apiKey = useAppStore.getState().apiKey;

//   if (!apiKey) {
//     toast.error('API key is required');
//     return;
//   }
//   const page = editor.getCurrentPage()!;
//   const base64 = await getImageDataUrl(editor.canvas, page, {
//     scale: 1,
//     dark: false,
//     fillBackground: true,
//     format: 'image/png',
//   });

//   console.log('Data URL Prefix:', base64.slice(0, 30));

//   useAppStore.getState().setAppCode(null);
//   useAppStore.getState().setGenerating(true);
//   try {
//     const response = await fetch('/api/proxy', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         apiKey: apiKey,
//         messages: [
          // {
          //   role: 'system',
          //   content: [
          //     {
          //       type: 'text',
          //       text: systemPrompt,
          //     },
          //   ],
          // },
//           {
//             role: 'user',
//             content: [
//               {
//                 type: 'text',
//                 text: "turn whats in the image into a website",
//               },
//               {
//                 type: 'image_url',
//                 image_url: {
//                   url: base64,
//                 },
//               },
//             ],
//           },
//         ],
//         model: 'Llama-3.2-90B-Vision-Instruct',
//         max_tokens: 3000,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Error from proxy: ${errorData.error}`);
//     }

//     const data = await response.json();

//     const responseText = data.choices[0]?.message?.content;

//     // Extract HTML code from the response
    // const regex = /```html([\s\S]*?)```/g;
    // const match = regex.exec(responseText);
    // if (match && match.length > 0) {
    //   useAppStore.getState().setAppCode(match[1].trim());
    //   toast.success('App generated successfully');
    // } else {
    //   useAppStore.getState().setAppCode(null);
    //   toast.error('Failed to generate app');
    // }

//     useAppStore.getState().setGenerating(false);
//   } catch (err) {
//     console.error(err);
//     useAppStore.getState().setGenerating(false);
//     toast.error('Failed to generate app');
//   }
// }

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

    // Use the data URL as is (includes the prefix)
    const dataUrl = base64; // Should start with 'data:image/png;base64,'

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
                url: dataUrl, // Include the full data URL
              },
            },
            {
              type: 'text',
              text: ' Act as an expert web developer specializing in converting low-fidelity wireframes into high-fidelity, interactive, and responsive prototypes. Your task is to analyze the provided design and generate a comprehensive HTML file that adheres to the following guidelines:\n\n- **Styling:** Utilize Tailwind CSSby including the following script tag within the `<head>` section of your HTML document:\n  ```html\n  <script src="https://cdn.tailwindcss.com"></script>\n  ```\n- **JavaScript:** Include any JavaScript within a `<script>` tag with `type="module"`.\n- **Dependencies:** Import necessary JavaScript dependencies using unpkg or skypack.\n- **Fonts:** Source open-source fonts from Google Fonts as required.\n- **Images:** For image content, use Unsplash or solid-colored rectangles as placeholders.\n- **Icons:** Create custom SVGs for any icons needed.\n\n**Design Elements:** The provided design may include various elements such as flow charts, diagrams, labels, arrows, sticky notes, screenshots of other applications, or previous designs. Treat these components as references for your prototype. Structural elements like boxes representing buttons or content may also contain annotations or figures describing interactions, behavior, or appearance. Use your expertise to distinguish annotations (commonly in red) from design elements and exclude annotations from the final prototype.\n\n**Assumptions:** If certain features are not specified, apply your knowledge of user experience and design patterns to fill in the gaps. It is preferable to make informed assumptions rather than leaving components incomplete. Your goal is to ensure the prototype is as complete, advanced, and polished as possible.\n\n**Evaluation Criteria:** Your prototype will be assessed based on:\n1. Resemblance to the provided designs.\n2. Interactivity and responsiveness.\n3. Overall completeness and impressiveness.',

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

    // If you need to extract HTML code, adjust accordingly
    // For example:
    const regex = /```html([\s\S]*?)```/g;
    const match = regex.exec(responseText);
    if (match && match.length > 0) {
      useAppStore.getState().setAppCode(match[1].trim());
      toast.success('App generated successfully', {
        action: {
          label: 'success',
          onClick: () => toast.dismiss()
        },
      })

    } else {
      useAppStore.getState().setAppCode(null);
      toast.error('Failed to generate app', {
        action: {
          label: 'error',
          onClick: () => toast.dismiss()
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
