export const getCloudinaryUrl = (
  publicId: string,
  options = "w_600,q_auto,f_auto"
) => {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/${options}/${publicId}.webp`;
};
