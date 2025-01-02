const cloudinary = {
  urlById: (imagePublicId: string) => {
    const clodinaryName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME || 'dwdd39xw8'
    return `http://res.cloudinary.com/${clodinaryName}/image/upload/v1637220535/${imagePublicId}`
  },
  resize: (cloudinaryUrl: string, width = 300) => {
    const arr = cloudinaryUrl.split('/')
    const uploadIndex = arr.indexOf('upload')

    const resizeParam = `w_${width},c_scale`

    const resizedCloudinaryUrl = [
      ...arr.slice(0, uploadIndex + 1),
      resizeParam,
      ...arr.slice(uploadIndex + 1),
    ]

    return resizedCloudinaryUrl.join('/')
  },
}

export default cloudinary
