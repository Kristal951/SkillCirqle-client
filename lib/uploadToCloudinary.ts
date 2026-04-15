import axios from "axios";

const CLOUD_NAME = "dgvk232bh";
const UPLOAD_PRESET = "SkillCirqle";

export const uploadToCloudinary = async (
  file: File,
  onProgress: (progress: number) => void
) => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await axios.post(url, formData, {
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    },
  });

  return res.data; 
};


export const optimizeCloudinaryUrl = (url: string) => {
  if (!url) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};