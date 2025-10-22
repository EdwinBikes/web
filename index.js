import { GoogleGenAI, Modality } from "@google/genai";

// --- CONFIGURACIÓN DE LA API DE GEMINI ---
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SERVICIOS DE IA ---

const editImageWithAI = async (base64ImageData, mimeType, prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    console.warn("La respuesta de la IA no contenía una parte de imagen.", response);
    return null;
  } catch (error) {
    console.error("Error al editar la imagen con IA:", error);
    throw new Error("Fallo al comunicarse con el servicio de IA. Inténtalo de nuevo más tarde.");
  }
};

const generateVideoFromImage = async (base64ImageData, mimeType, prompt) => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: { imageBytes: base64ImageData, mimeType: mimeType },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' },
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      console.warn("La respuesta de la IA no contenía un URI de video.", operation);
      return null;
    }
    return downloadLink;
  } catch (error) {
    console.error("Error al generar el video con IA:", error);
    throw new Error("Fallo al comunicarse con el servicio de video de IA. Inténtalo de nuevo más tarde.");
  }
};


// --- LÓGICA DE LA APLICACIÓN ---

document.addEventListener('DOMContentLoaded', () => {

  // --- NAVEGACIÓN Y VISTAS ---
  const navButtons = {
    portfolio: document.getElementById('nav-portfolio'),
    aiEditor: document.getElementById('nav-ai-editor'),
    aiVideo: document.getElementById('nav-ai-video'),
  };
  const views = {
    portfolio: document.getElementById('portfolio-view'),
    aiEditor: document.getElementById('ai-editor-view'),
    aiVideo: document.getElementById('ai-video-view'),
  };

  const switchView = (targetView) => {
    Object.keys(views).forEach(key => {
      const view = views[key];
      const button = navButtons[key];
      if (key === targetView) {
        view.classList.remove('hidden');
        button.classList.add('bg-gray-700', 'text-white');
        button.classList.remove('text-gray-400', 'hover:bg-gray-800');
      } else {
        view.classList.add('hidden');
        button.classList.remove('bg-gray-700', 'text-white');
        button.classList.add('text-gray-400', 'hover:bg-gray-800');
      }
    });
  };

  navButtons.portfolio.addEventListener('click', () => switchView('portfolio'));
  navButtons.aiEditor.addEventListener('click', () => switchView('aiEditor'));
  navButtons.aiVideo.addEventListener('click', () => switchView('aiVideo'));

  // --- PORTAFOLIO ---
  const mediaItems = [
    { id: 1, type: 'image', src: 'https://picsum.photos/seed/filmmaker1/800/600', title: 'Amanecer en las montañas', description: 'Una toma matutina capturando la primera luz.' },
    { id: 2, type: 'video', src: 'https://picsum.photos/seed/filmmaker2/800/600', title: 'El Aliento del Océano', description: 'Captura en cámara lenta de las olas rompiendo en la orilla.' },
    { id: 3, type: 'image', src: 'https://picsum.photos/seed/filmmaker3/800/600', title: 'Jungla Urbana', description: 'Una larga exposición del tráfico de la ciudad por la noche.' },
    { id: 4, type: 'image', src: 'https://picsum.photos/seed/filmmaker4/800/600', title: 'Quietud del Bosque', description: 'Rayos de sol atravesando el denso dosel del bosque.' },
    { id: 5, type: 'video', src: 'https://picsum.photos/seed/filmmaker5/800/600', title: 'Espejismo del Desierto', description: 'Ondas de calor que se elevan desde el suelo del desierto.' },
    { id: 6, type: 'image', src: 'https://picsum.photos/seed/filmmaker6/800/600', title: 'Retrato de un Desconocido', description: 'Una foto espontánea de fotografía callejera.' },
    { id: 7, type: 'image', src: 'https://picsum.photos/seed/filmmaker7/800/600', title: 'Líneas Arquitectónicas', description: 'Vista abstracta de un edificio moderno.' },
    { id: 8, type: 'video', src: 'https://picsum.photos/seed/filmmaker8/800/600', title: 'Noche Estrellada', description: 'Un timelapse de la vía láctea.' },
    { id: 9, type: 'image', src: 'https://picsum.photos/seed/filmmaker9/800/600', title: 'Reflejos de Neón', description: 'Luces de la ciudad reflejadas en un charco después de la lluvia.' },
    { id: 10, type: 'video', src: 'https://picsum.photos/seed/filmmaker10/800/600', title: 'Vuelo del Águila', description: 'Toma aérea siguiendo a un águila en su vuelo majestuoso.' },
    { id: 11, type: 'image', src: 'https://picsum.photos/seed/filmmaker11/800/600', title: 'Mercado Vibrante', description: 'Escena colorida de un bullicioso mercado local.' },
    { id: 12, type: 'image', src: 'https://picsum.photos/seed/filmmaker12/800/600', title: 'Caminos Helados', description: 'Un paisaje invernal con un río congelado.' }
  ];
  
  const portfolioGrid = document.querySelector('#portfolio-section .grid');
  mediaItems.forEach(item => {
    const div = document.createElement('div');
    div.className = "group relative overflow-hidden rounded-lg shadow-lg bg-gray-800";
    div.innerHTML = `
        <img src="${item.src}" alt="${item.title}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
        ${item.type === 'video' ? `
          <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <svg class="w-16 h-16 text-white opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </div>` : ''}
        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div class="absolute bottom-0 left-0 p-4">
            <h3 class="text-xl font-bold text-white">${item.title}</h3>
            <p class="text-sm text-gray-300">${item.description}</p>
          </div>
        </div>
    `;
    portfolioGrid.appendChild(div);
  });

  // --- EDITOR DE IA ---
  const editor = {
    fileInput: document.getElementById('editor-file-input'),
    previewContainer: document.getElementById('editor-preview-container'),
    previewImg: document.getElementById('editor-preview-img'),
    uploadPrompt: document.getElementById('editor-upload-prompt'),
    prompt: document.getElementById('editor-prompt'),
    generateBtn: document.getElementById('editor-generate-btn'),
    btnText: document.getElementById('editor-btn-text'),
    outputContainer: document.getElementById('editor-output-container'),
  };
  let editorFile = null;

  editor.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      editorFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.previewImg.src = event.target.result;
        editor.previewContainer.classList.remove('hidden');
        editor.uploadPrompt.classList.add('hidden');
        editor.generateBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  editor.generateBtn.addEventListener('click', async () => {
    if (!editorFile || !editor.prompt.value) {
      showError(editor.outputContainer, 'Por favor, sube una imagen y proporciona una instrucción.');
      return;
    }
    setLoading(editor, true, 'Editando...');
    try {
      const base64Data = await fileToBase64(editorFile);
      const resultUrl = await editImageWithAI(base64Data, editorFile.type, editor.prompt.value);
      if (resultUrl) {
        showImageResult(editor.outputContainer, resultUrl, 'Resultado editado');
      } else {
        showError(editor.outputContainer, 'La IA no pudo generar una imagen. Intenta con una instrucción diferente.');
      }
    } catch (err) {
      showError(editor.outputContainer, err.message);
    } finally {
      setLoading(editor, false, 'Generar Edición');
    }
  });

  // --- GENERADOR DE VIDEO IA ---
  const video = {
    fileInput: document.getElementById('video-file-input'),
    previewContainer: document.getElementById('video-preview-container'),
    previewImg: document.getElementById('video-preview-img'),
    uploadPrompt: document.getElementById('video-upload-prompt'),
    prompt: document.getElementById('video-prompt'),
    generateBtn: document.getElementById('video-generate-btn'),
    btnText: document.getElementById('video-btn-text'),
    outputContainer: document.getElementById('video-output-container'),
  };
  let videoFile = null;
  let messageInterval = null;
  
  const loadingMessages = [
    "Contactando al director de IA...", "El storyboard está en progreso...", "La IA está preparando la cámara...",
    "Renderizando los primeros fotogramas...", "Añadiendo efectos especiales...",
    "Esto puede tardar unos minutos...", "Finalizando el video...",
  ];

  video.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      videoFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        video.previewImg.src = event.target.result;
        video.previewContainer.classList.remove('hidden');
        video.uploadPrompt.classList.add('hidden');
        video.generateBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  video.generateBtn.addEventListener('click', async () => {
    if (!videoFile || !video.prompt.value) {
      showError(video.outputContainer, 'Por favor, sube una imagen y proporciona una instrucción.');
      return;
    }

    setLoading(video, true, 'Generando...');
    showSpinner(video.outputContainer, loadingMessages[0]);
    let msgIndex = 0;
    messageInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        document.querySelector('#video-output-container .loading-message').textContent = loadingMessages[msgIndex];
    }, 5000);

    try {
      const base64Data = await fileToBase64(videoFile);
      const downloadLink = await generateVideoFromImage(base64Data, videoFile.type, video.prompt.value);
      if (downloadLink) {
        document.querySelector('#video-output-container .loading-message').textContent = "¡Casi listo! Descargando video...";
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error(`Error al descargar el video: ${response.statusText}`);
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        showVideoResult(video.outputContainer, videoUrl);
      } else {
        showError(video.outputContainer, 'La IA no pudo generar un video. Intenta con una instrucción o imagen diferente.');
      }
    } catch (err) {
      showError(video.outputContainer, err.message);
    } finally {
      clearInterval(messageInterval);
      setLoading(video, false, 'Generar Video');
    }
  });

  // --- FUNCIONES DE UTILIDAD ---
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
  
  const spinnerHTML = (large, message = '') => `
    <div class="text-center">
        <svg class="animate-spin ${large ? 'h-10 w-10' : 'h-5 w-5'} text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        ${message ? `<p class="mt-4 text-amber-400 loading-message">${message}</p>` : ''}
    </div>`;

  const setLoading = (ui, isLoading, btnText) => {
    ui.generateBtn.disabled = isLoading;
    ui.btnText.innerHTML = isLoading ? spinnerHTML(false) + btnText : btnText;
  };
  
  const showSpinner = (container, message = '') => {
    container.innerHTML = spinnerHTML(true, message);
  }

  const showError = (container, message) => {
    container.innerHTML = `<p class="text-red-400 text-center p-4">${message}</p>`;
  };

  const showImageResult = (container, src, alt) => {
    container.innerHTML = `<img src="${src}" alt="${alt}" class="max-w-full max-h-full object-contain rounded-md" />`;
  };

  const showVideoResult = (container, src) => {
    container.innerHTML = `<video src="${src}" controls autoPlay loop class="max-w-full max-h-full object-contain rounded-md"></video>`;
  };

});