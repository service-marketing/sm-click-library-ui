import { Filesystem, Directory } from "@capacitor/filesystem";
import { Media } from "@capacitor-community/media";
import { Share } from "@capacitor/share";
import { notify } from "notiwind";

function convertBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString();
}

export async function downloadFilesMobile(file, name = "", typeDevice) {
  try {
    console.log("funcionou");
    console.log(file, name, typeDevice);

    const response = await fetch(file.url);
    if (!response.ok)
      throw new Error("Falha ao buscar o arquivo", JSON.stringify(response.ok));

    const blob = await response.blob();
    const base64Data = await convertBlobToBase64(blob);
    const type =
      typeof file.type === "string" && file.type.includes("/")
        ? file.type.split("/")[1]
        : file.type || "unknown";
    const fileId = hashString(file);
    const fileName =
      file.title ||
      `${name === "file" ? `smclick-${type}` : name}-${fileId}.${type}`;

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    });

    if (typeDevice === "ios") {
      if (type === "jpeg") {
        await Media.savePhoto({
          path: savedFile.uri,
          album: "MyApp",
        });
      } else if (["pdf", "mpeg"].includes(type)) {
        console.log("share func");
        await Share.share({
          title: fileName,
          url: savedFile.uri,
        });
        return;
      }
    }

    const fileMap = {
      mpeg: "Áudio",
      jpeg: "Imagem",
      pdf: "PDF",
    };

    const fileType = fileMap[type] || "Arquivo";

    notify(
      {
        group: "success",
        title: "Sucesso",
        text: `${fileType} ${
          fileType === "Imagem" ? "salva" : "salvo"
        } com sucesso`,
      },
      2000
    );
    console.log("uhu");
  } catch (error) {
    console.error({
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...error,
    });

    console.error(JSON.stringify(error));
    if (error.errorMessage === "Share canceled") return;
    notify(
      {
        group: "error",
        title: "Erro",
        text: "Erro ao salvar imagem no dispositivo",
      },
      2000
    );
  }
}
