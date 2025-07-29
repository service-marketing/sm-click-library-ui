import { Filesystem, Directory } from "@capacitor/filesystem";
import { Media } from "@capacitor-community/media";
import { Share } from "@capacitor/share";
import { notify } from "notiwind";

export async function downloadFilesMobile(
  file = { url, type, title },
  name = "",
  typeDevice
) {
  try {
    console.log("funcionou");
    const response = await fetch(file.url);
    if (!response.ok) throw new Error("Falha ao buscar o arquivo");

    const blob = await response.blob();
    const base64Data = await convertBlobToBase64(blob);
    const type =
      typeof file.type === "string" && file.type.includes("/")
        ? file.type.split("/")[1]
        : file.type || "unknown";
    const fileId = hashString(file.url);
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
  } catch (error) {
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
